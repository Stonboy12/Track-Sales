import { Errors } from "../../core/errors";
import { activityLogger } from "../../core/logger";
import { db } from "../../db/memory";
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

function nextCode() {
  const all = db.complaints.findAll();
  const max = all.reduce((m, c) => {
    const n = parseInt(c.code.replace("CMP-", ""), 10);
    return Number.isFinite(n) ? Math.max(m, n) : m;
  }, 1000);
  return `CMP-${max + 1}`;
}

export const complaintService = {
  list(q: ComplaintListQuery): Complaint[] {
    return db.complaints
      .findAll((c) => {
        if (q.status && c.status !== q.status) return false;
        if (q.priority && c.priority !== q.priority) return false;
        if (q.category && c.category !== q.category) return false;
        if (q.outletId && c.outletId !== q.outletId) return false;
        if (
          q.search &&
          !`${c.code} ${c.outletName} ${c.productName} ${c.description}`
            .toLowerCase()
            .includes(q.search.toLowerCase())
        )
          return false;
        return true;
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  },

  get(id: string): Complaint {
    const c = db.complaints.findById(id);
    if (!c) throw Errors.notFound("Complaint");
    return c;
  },

  create(input: ComplaintCreateInput, actor: Actor): Complaint {
    const outlet = db.outlets.findById(input.outletId);
    if (!outlet) throw Errors.notFound("Outlet");
    const code = nextCode();
    const created = db.complaints.create({
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
          note: "Komplain dibuat",
        },
      ],
    });
    activityLogger.record({
      actorId: actor.id,
      actorName: actor.name,
      action: "complaint.create",
      entity: "complaint",
      entityId: created.id,
      meta: { code, outlet: outlet.name },
    });
    return created;
  },

  update(id: string, patch: ComplaintUpdateInput, actor: Actor): Complaint {
    const existing = this.get(id);
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
    const updated = db.complaints.update(id, { ...patch, timeline });
    activityLogger.record({
      actorId: actor.id,
      actorName: actor.name,
      action: "complaint.update",
      entity: "complaint",
      entityId: id,
      meta: patch,
    });
    return updated;
  },

  appendTimeline(id: string, input: ComplaintTimelineInput, actor: Actor): Complaint {
    const existing = this.get(id);
    const entry = {
      at: new Date().toISOString(),
      actorId: actor.id,
      actorName: actor.name,
      note: input.note,
      statusFrom: existing.status,
      statusTo: input.status ?? existing.status,
    };
    const timeline = [...existing.timeline, entry];
    const updated = db.complaints.update(id, {
      status: input.status ?? existing.status,
      timeline,
    });
    activityLogger.record({
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
