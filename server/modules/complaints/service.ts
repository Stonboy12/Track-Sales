import { Errors } from "../../core/errors";
import { activityLogger } from "../../core/logger";
import { db } from "../../db";
import type { Complaint } from "../../db/types";
import type {
  ComplaintCreateInput,
  ComplaintListQuery,
  ComplaintTimelineInput,
  ComplaintUpdateInput,
} from "./schemas";

interface Actor {
  id: string;
  name: string;
}

async function nextCode(): Promise<string> {
  const all = await db.complaints.findAll();
  const max = all.reduce((m, c) => {
    const n = parseInt(c.code.replace("CMP-", ""), 10);
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 1000);
  return `CMP-${max + 1}`;
}

export const complaintService = {
  async list(q: ComplaintListQuery): Promise<Complaint[]> {
    const all = await db.complaints.findAll({
      where: {
        ...(q.status ? { status: q.status } : {}),
        ...(q.priority ? { priority: q.priority } : {}),
        ...(q.category ? { category: q.category } : {}),
        ...(q.outletId ? { outlet_id: q.outletId } : {}),
      },
      order: [{ column: "created_at", ascending: false }],
    });
    if (!q.search) return all;
    const term = q.search.toLowerCase();
    return all.filter((c) =>
      `${c.code} ${c.outletName} ${c.productName} ${c.description}`
        .toLowerCase()
        .includes(term)
    );
  },

  async get(id: string): Promise<Complaint> {
    const c = await db.complaints.findById(id);
    if (!c) throw Errors.notFound("Complaint");
    return c;
  },

  async create(input: ComplaintCreateInput, actor: Actor): Promise<Complaint> {
    const outlet = await db.outlets.findById(input.outletId);
    if (!outlet) throw Errors.notFound("Outlet");
    const code = await nextCode();
    const created = await db.complaints.create({
      code,
      outletId: outlet.id,
      outletName: outlet.name,
      area: outlet.area,
      productName: input.productName,
      category: input.category,
      status: "open",
      priority: input.priority,
      reportedById: actor.id,
      reportedByName: actor.name,
      description: input.description,
      timeline: [
        {
          at: new Date().toISOString(),
          actorId: actor.id,
          actorName: actor.name,
          note:
            input.attachmentUrls && input.attachmentUrls.length > 0
              ? `Komplain dibuat (${input.attachmentUrls.length} foto)`
              : "Komplain dibuat",
        },
      ],
      attachmentUrls: input.attachmentUrls ?? [],
    });
    await activityLogger.record({
      actorId: actor.id,
      actorName: actor.name,
      action: "complaint.create",
      entity: "complaint",
      entityId: created.id,
      meta: { code, outlet: outlet.name },
    });
    return created;
  },

  async update(id: string, patch: ComplaintUpdateInput, actor: Actor): Promise<Complaint> {
    const existing = await this.get(id);
    const timeline = [...existing.timeline];
    if (patch.status && patch.status !== existing.status) {
      timeline.push({
        at: new Date().toISOString(),
        actorId: actor.id,
        actorName: actor.name,
        note: `Status diubah ke ${patch.status}`,
        statusFrom: existing.status,
        statusTo: patch.status,
      });
    }
    const updated = await db.complaints.update(id, { ...patch, timeline });
    await activityLogger.record({
      actorId: actor.id,
      actorName: actor.name,
      action: "complaint.update",
      entity: "complaint",
      entityId: id,
      meta: patch,
    });
    return updated;
  },

  async appendTimeline(id: string, input: ComplaintTimelineInput, actor: Actor): Promise<Complaint> {
    const existing = await this.get(id);
    const entry = {
      at: new Date().toISOString(),
      actorId: actor.id,
      actorName: actor.name,
      note: input.note,
      statusFrom: existing.status,
      statusTo: input.status ?? existing.status,
    };
    const timeline = [...existing.timeline, entry];
    const updated = await db.complaints.update(id, {
      status: input.status ?? existing.status,
      timeline,
    });
    await activityLogger.record({
      actorId: actor.id,
      actorName: actor.name,
      action: "complaint.timeline",
      entity: "complaint",
      entityId: id,
      meta: { note: input.note },
    });
    return updated;
  },
};
