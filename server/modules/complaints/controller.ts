import type { NextRequest } from "next/server";
import { ok, created } from "../../core/response";
import { requireAuth } from "../../core/auth";
import { parseBody, parseQuery } from "../../core/validate";
import { complaintService } from "./service";
import {
  complaintCreateSchema,
  complaintListQuerySchema,
  complaintTimelineSchema,
  complaintUpdateSchema,
} from "./schemas";

export const complaintController = {
  async list(req: NextRequest) {
    requireAuth(req);
    const q = parseQuery(req, complaintListQuerySchema);
    return ok(await complaintService.list(q));
  },
  async getById(req: NextRequest, id: string) {
    requireAuth(req);
    return ok(await complaintService.get(id));
  },
  async create(req: NextRequest) {
    const session = requireAuth(req);
    const input = await parseBody(req, complaintCreateSchema);
    return created(await complaintService.create(input, { id: session.sub, name: session.name }));
  },
  async update(req: NextRequest, id: string) {
    const session = requireAuth(req);
    const patch = await parseBody(req, complaintUpdateSchema);
    return ok(await complaintService.update(id, patch, { id: session.sub, name: session.name }));
  },
  async appendTimeline(req: NextRequest, id: string) {
    const session = requireAuth(req);
    const input = await parseBody(req, complaintTimelineSchema);
    return ok(
      await complaintService.appendTimeline(id, input, { id: session.sub, name: session.name })
    );
  },
};
