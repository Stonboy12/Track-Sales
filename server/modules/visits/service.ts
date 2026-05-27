import { Errors } from "../../core/errors";
import { activityLogger } from "../../core/logger";
import { db } from "../../db";
import type { Visit } from "../../db/types";
import type {
  VisitCreateInput,
  VisitListQuery,
  VisitUpdateInput,
} from "./schemas";

interface Actor {
  id: string;
  name: string;
}

export const visitService = {
  async list(q: VisitListQuery) {
    const opts = {
      where: {
        ...(q.outletId ? { outlet_id: q.outletId } : {}),
        ...(q.salesId ? { sales_id: q.salesId } : {}),
        ...(q.outcome ? { outcome: q.outcome } : {}),
      },
      gte: q.from ? { visit_date: q.from } : undefined,
      lte: q.to ? { visit_date: q.to } : undefined,
      order: [{ column: "visit_date", ascending: false }],
      limit: q.limit,
      offset: (q.page - 1) * q.limit,
    };
    const { items, total } = await db.visits.listWithCount(opts);
    return { items, total, page: q.page, limit: q.limit };
  },

  async get(id: string): Promise<Visit> {
    const v = await db.visits.findById(id);
    if (!v) throw Errors.notFound("Visit");
    return v;
  },

  async create(input: VisitCreateInput, actor: Actor): Promise<Visit> {
    const outlet = await db.outlets.findById(input.outletId);
    if (!outlet) throw Errors.notFound("Outlet");
    const created = await db.visits.create({
      outletId: input.outletId,
      salesId: input.salesId ?? actor.id,
      visitDate: input.visitDate,
      outcome: input.outcome,
      orderValue: input.orderValue,
      notes: input.notes,
    });
    await activityLogger.record({
      actorId: actor.id,
      actorName: actor.name,
      action: "visit.create",
      entity: "visit",
      entityId: created.id,
      meta: { outlet: outlet.name, outcome: created.outcome },
    });
    return created;
  },

  async update(id: string, patch: VisitUpdateInput, actor: Actor): Promise<Visit> {
    await this.get(id);
    const u = await db.visits.update(id, patch);
    await activityLogger.record({
      actorId: actor.id,
      actorName: actor.name,
      action: "visit.update",
      entity: "visit",
      entityId: id,
    });
    return u;
  },

  async byOutlet(outletId: string) {
    const all = await db.visits.findAll({
      where: { outlet_id: outletId },
      order: [{ column: "visit_date", ascending: false }],
    });
    return all;
  },
};
