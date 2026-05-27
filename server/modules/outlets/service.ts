import { Errors } from "../../core/errors";
import { activityLogger } from "../../core/logger";
import { db } from "../../db/memory";
import type { Outlet } from "../../db/types";
import type {
  OutletCreateInput,
  OutletListQuery,
  OutletUpdateInput,
} from "./schemas";

interface Actor {
  id: string;
  name: string;
}

export const outletService = {
  list(q: OutletListQuery) {
    const filtered = db.outlets.findAll((o) => {
      if (q.search && !`${o.name} ${o.code} ${o.ownerName}`.toLowerCase().includes(q.search.toLowerCase()))
        return false;
      if (q.area && o.area !== q.area) return false;
      if (q.segment && o.segment !== q.segment) return false;
      if (q.priority && o.priority !== q.priority) return false;
      if (q.status && o.status !== q.status) return false;
      if (q.assignedSalesId && o.assignedSalesId !== q.assignedSalesId) return false;
      return true;
    });
    const total = filtered.length;
    const start = (q.page - 1) * q.limit;
    return {
      items: filtered.slice(start, start + q.limit),
      total,
      page: q.page,
      limit: q.limit,
    };
  },

  get(id: string): Outlet {
    const found = db.outlets.findById(id);
    if (!found) throw Errors.notFound("Outlet");
    return found;
  },

  /** Detail outlet + ringkasan visit & komplain. Dipakai halaman performance. */
  getDetail(id: string) {
    const outlet = this.get(id);
    const visits = db.visits.findAll((v) => v.outletId === id);
    const complaints = db.complaints.findAll((c) => c.outletId === id);
    const orderedVisits = [...visits].sort((a, b) =>
      b.visitDate.localeCompare(a.visitDate)
    );
    const totalRevenue = visits.reduce((s, v) => s + v.orderValue, 0);
    return {
      outlet,
      stats: {
        visitCount: visits.length,
        totalRevenue,
        lastVisit: orderedVisits[0]?.visitDate ?? null,
        openComplaints: complaints.filter((c) => c.status !== "resolved").length,
      },
      recentVisits: orderedVisits.slice(0, 5),
    };
  },

  create(input: OutletCreateInput, actor: Actor): Outlet {
    if (db.outlets.findOne((o) => o.code === input.code)) {
      throw Errors.conflict("Kode outlet sudah dipakai.");
    }
    const created = db.outlets.create(input);
    activityLogger.record({
      actorId: actor.id,
      actorName: actor.name,
      action: "outlet.create",
      entity: "outlet",
      entityId: created.id,
      meta: { code: created.code, name: created.name },
    });
    return created;
  },

  update(id: string, patch: OutletUpdateInput, actor: Actor): Outlet {
    this.get(id); // ensure exists
    if (patch.code) {
      const dup = db.outlets.findOne((o) => o.code === patch.code && o.id !== id);
      if (dup) throw Errors.conflict("Kode outlet sudah dipakai.");
    }
    const updated = db.outlets.update(id, patch);
    activityLogger.record({
      actorId: actor.id,
      actorName: actor.name,
      action: "outlet.update",
      entity: "outlet",
      entityId: id,
      meta: patch,
    });
    return updated;
  },

  remove(id: string, actor: Actor) {
    this.get(id);
    db.outlets.delete(id);
    activityLogger.record({
      actorId: actor.id,
      actorName: actor.name,
      action: "outlet.delete",
      entity: "outlet",
      entityId: id,
    });
  },

  /** Performance summary lintas outlet (untuk Outlet Performance Dashboard). */
  performanceSummary(area?: string) {
    const outlets = db.outlets.findAll((o) => (area ? o.area === area : true));
    const visits = db.visits.findAll();
    const grouped = outlets.map((o) => {
      const ov = visits.filter((v) => v.outletId === o.id);
      const revenue = ov.reduce((s, v) => s + v.orderValue, 0);
      return {
        outletId: o.id,
        name: o.name,
        area: o.area,
        segment: o.segment,
        revenue,
        visits: ov.length,
      };
    });
    const segmentCount = { A: 0, B: 0, C: 0 } as Record<"A" | "B" | "C", number>;
    for (const o of outlets) segmentCount[o.segment]++;
    return {
      totalOutlets: outlets.length,
      totalRevenue: grouped.reduce((s, g) => s + g.revenue, 0),
      segmentCount,
      perOutlet: grouped.sort((a, b) => b.revenue - a.revenue),
    };
  },
};
