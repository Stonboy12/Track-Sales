import type { NextRequest } from "next/server";
import { ok, created } from "../../core/response";
import { requireAuth } from "../../core/auth";
import { parseBody, parseQuery } from "../../core/validate";
import { visitService } from "./service";
import {
  visitCreateSchema,
  visitListQuerySchema,
  visitUpdateSchema,
} from "./schemas";

export const visitController = {
  async list(req: NextRequest) {
    requireAuth(req);
    const q = parseQuery(req, visitListQuerySchema);
    const r = visitService.list(q);
    return ok(r.items, {
      meta: { total: r.total, page: r.page, limit: r.limit },
    });
  },
  async getById(req: NextRequest, id: string) {
    requireAuth(req);
    return ok(visitService.get(id));
  },
  async create(req: NextRequest) {
    const session = requireAuth(req);
    const input = await parseBody(req, visitCreateSchema);
    const v = visitService.create(input, { id: session.sub, name: session.name });
    return created(v);
  },
  async update(req: NextRequest, id: string) {
    const session = requireAuth(req);
    const patch = await parseBody(req, visitUpdateSchema);
    return ok(visitService.update(id, patch, { id: session.sub, name: session.name }));
  },
  async byOutlet(req: NextRequest, outletId: string) {
    requireAuth(req);
    return ok(visitService.byOutlet(outletId));
  },
};
