import { Errors } from "../../core/errors";
import { activityLogger } from "../../core/logger";
import { db } from "../../db/memory";
import type { Outlet, Priority, RoutePlan } from "../../db/types";
import type { RouteOptimizeInput, RouteSaveInput } from "./schemas";

interface Actor {
  id: string;
  name: string;
}

const PRIORITY_RANK: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

export const routePlanService = {
  /**
   * Algoritma optimasi sederhana — bukan VRP solver beneran, tapi cukup untuk
   * mock backend. Endpoint ini bisa diganti panggilan ke service eksternal
   * (Mapbox / OSRM / ML) tanpa ubah controller.
   */
  optimize(input: RouteOptimizeInput) {
    const outlets = input.outletIds
      .map((id) => db.outlets.findById(id))
      .filter((o): o is Outlet => o !== null);
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
        // Skor gabungan: prioritas + outlet aktif duluan + area dikelompokkan
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
      estimatedDistanceKm: ordered.length * 4.2, // mock heuristic
    };
  },

  list(salesId?: string): RoutePlan[] {
    return db.routePlans
      .findAll((r) => (salesId ? r.salesId === salesId : true))
      .sort((a, b) => b.date.localeCompare(a.date));
  },

  get(id: string): RoutePlan {
    const r = db.routePlans.findById(id);
    if (!r) throw Errors.notFound("Route Plan");
    return r;
  },

  save(input: RouteSaveInput, actor: Actor): RoutePlan {
    // Validasi: semua outlet harus ada
    for (const id of input.outletIds) {
      if (!db.outlets.findById(id)) throw Errors.notFound(`Outlet ${id}`);
    }
    const created = db.routePlans.create({
      salesId: actor.id,
      date: input.date,
      outletIds: input.outletIds,
      name: input.name,
    });
    activityLogger.record({
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
