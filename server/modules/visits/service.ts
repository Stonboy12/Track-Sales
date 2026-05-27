import { Errors } from "../../core/errors";
import { activityLogger } from "../../core/logger";
import { db } from "../../db/memory";
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
  list(q: VisitListQuery) {
    const all = db.visits.findAll((v) => {
      if (q.outletId && v.outletId !== q.outletId) return false;
      if (q.salesId && v.salesId !== q.salesId) return false;
      if (q.outcome && v.outcome !== q.outcome) return false;
      if (q.from && v.visitDate < q.from) return false;
      if (q.to && v.visitDate > q.to) return false;
      return true;
    });
    all.sort((a, b) => b.visitDate.localeCompare(a.visitDate));
    const total = all.length;
    const start = (q.page - 1) * q.limit;
    return {
      items: all.slice(start, start + q.limit),
      total,
      page: q.page,
      limit: q.limit,
    };
  },

  get(id: string): Visit {
    const v = db.visits.findById(id);
    if (!v) throw Errors.notFound("Visit");
    return v;
  },

  create(input: VisitCreateInput, actor: Actor): Visit {
    const outlet = db.outlets.findById(input.outletId);
    if (!outlet) throw Errors.notFound("Outlet");
    const created = db.visits.create({
      outletId: input.outletId,
      salesId: input.salesId ?? actor.id,
      visitDate: input.visitDate,
      outcome: input.outcome,
      orderValue: input.orderValue,
      notes: input.notes,
    });
    activityLogger.record({
      actorId: actor.id,
      actorName: actor.name,
      action: "visit.create",
      entity: "visit",
      entityId: created.id,
      meta: { outlet: outlet.name, outcome: created.outcome },
    });
    return created;
  },

  update(id: string, patch: VisitUpdateInput, actor: Actor): Visit {
    this.get(id);
    const u = db.visits.update(id, patch);
    activityLogger.record({
      actorId: actor.id,
      actorName: actor.name,
      action: "visit.update",
      entity: "visit",
      entityId: id,
    });
    return u;
  },

  /** Histori kunjungan untuk satu outlet (paling baru duluan). */
  byOutlet(outletId: string) {
    return db.visits
      .findAll((v) => v.outletId === outletId)
      .sort((a, b) => b.visitDate.localeCompare(a.visitDate));
  },
};
