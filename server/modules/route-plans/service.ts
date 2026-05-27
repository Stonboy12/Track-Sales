import { Errors } from "../../core/errors";
import { activityLogger } from "../../core/logger";
import { db } from "../../db";
import type { Outlet, Priority, RoutePlan } from "../../db/types";
import type { RouteOptimizeInput, RouteSaveInput } from "./schemas";

interface Actor {
  id: string;
  name: string;
}

const PRIORITY_RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export const routePlanService = {
  async optimize(input: RouteOptimizeInput) {
    const all = await db.outlets.findAll({ in: { id: input.outletIds } });
    const byId = new Map(all.map((o) => [o.id, o]));
    const outlets = input.outletIds
      .map((id) => byId.get(id))
      .filter((o): o is Outlet => Boolean(o));
    if (outlets.length === 0) throw Errors.notFound("Outlet");

    let ordered: Outlet[];
    switch (input.strategy) {
      case "priority":
        ordered = [...outlets].sort(
          (a, b) =>
            PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
            a.area.localeCompare(b.area)
        );
        break;
      case "area":
        ordered = [...outlets].sort(
          (a, b) =>
            a.area.localeCompare(b.area) ||
            PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority]
        );
        break;
      case "balanced":
        ordered = [...outlets].sort((a, b) => {
          const pa = PRIORITY_RANK[a.priority] + (a.status === "active" ? 0 : 1);
          const pb = PRIORITY_RANK[b.priority] + (b.status === "active" ? 0 : 1);
          return pa - pb || a.area.localeCompare(b.area);
        });
        break;
    }

    const estimatedDurationMin = ordered.length * 45;
    return {
      strategy: input.strategy,
      stops: ordered.map((o, idx) => ({
        order: idx + 1,
        outletId: o.id,
        outletName: o.name,
        area: o.area,
        priority: o.priority,
      })),
      estimatedDurationMin,
      estimatedDistanceKm: Math.round(ordered.length * 4.2 * 10) / 10,
    };
  },

  async list(salesId?: string): Promise<RoutePlan[]> {
    return db.routePlans.findAll({
      where: salesId ? { sales_id: salesId } : undefined,
      order: [{ column: "date", ascending: false }],
    });
  },

  async save(input: RouteSaveInput, actor: Actor): Promise<RoutePlan> {
    for (const id of input.outletIds) {
      const o = await db.outlets.findById(id);
      if (!o) throw Errors.notFound(`Outlet ${id}`);
    }
    const created = await db.routePlans.create({
      salesId: actor.id,
      date: input.date,
      outletIds: input.outletIds,
      name: input.name,
    });
    await activityLogger.record({
      actorId: actor.id,
      actorName: actor.name,
      action: "route.save",
      entity: "route_plan",
      entityId: created.id,
      meta: { stops: created.outletIds.length, date: created.date },
    });
    return created;
  },
};
