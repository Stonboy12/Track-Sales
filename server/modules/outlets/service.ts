import { Errors } from "../../core/errors";
import { activityLogger } from "../../core/logger";
import { db } from "../../db";
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
  async list(q: OutletListQuery) {
    const opts = {
      where: {
        ...(q.area ? { area: q.area } : {}),
        ...(q.segment ? { segment: q.segment } : {}),
        ...(q.priority ? { priority: q.priority } : {}),
        ...(q.status ? { status: q.status } : {}),
        ...(q.assignedSalesId ? { assigned_sales_id: q.assignedSalesId } : {}),
      },
      ilike: q.search
        ? { name: `%${q.search}%` }
        : undefined,
      order: [{ column: "created_at", ascending: false }],
      limit: q.limit,
      offset: (q.page - 1) * q.limit,
    };
    const { items, total } = await db.outlets.listWithCount(opts);
    return { items, total, page: q.page, limit: q.limit };
  },

  async get(id: string): Promise<Outlet> {
    const found = await db.outlets.findById(id);
    if (!found) throw Errors.notFound("Outlet");
    return found;
  },

  async getDetail(id: string) {
    const outlet = await this.get(id);
    const [visits, complaints] = await Promise.all([
      db.visits.findAll({ where: { outlet_id: id } }),
      db.complaints.findAll({ where: { outlet_id: id } }),
    ]);
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

  async create(input: OutletCreateInput, actor: Actor): Promise<Outlet> {
    const dup = await db.outlets.findOne({ where: { code: input.code } });
    if (dup) throw Errors.conflict("Kode outlet sudah dipakai.");
    const created = await db.outlets.create(input);
    await activityLogger.record({
      actorId: actor.id,
      actorName: actor.name,
      action: "outlet.create",
      entity: "outlet",
      entityId: created.id,
      meta: { code: created.code, name: created.name },
    });
    return created;
  },

  async update(id: string, patch: OutletUpdateInput, actor: Actor): Promise<Outlet> {
    await this.get(id);
    if (patch.code) {
      const dup = await db.outlets.findOne({ where: { code: patch.code } });
      if (dup && dup.id !== id) throw Errors.conflict("Kode outlet sudah dipakai.");
    }
    const updated = await db.outlets.update(id, patch);
    await activityLogger.record({
      actorId: actor.id,
      actorName: actor.name,
      action: "outlet.update",
      entity: "outlet",
      entityId: id,
      meta: patch,
    });
    return updated;
  },

  async remove(id: string, actor: Actor) {
    await this.get(id);
    await db.outlets.delete(id);
    await activityLogger.record({
      actorId: actor.id,
      actorName: actor.name,
      action: "outlet.delete",
      entity: "outlet",
      entityId: id,
    });
  },

  async performanceSummary(area?: string) {
    const outlets = await db.outlets.findAll(area ? { where: { area } } : undefined);
    const visits = await db.visits.findAll();
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
