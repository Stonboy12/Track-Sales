import type { NextRequest } from "next/server";
import { ok, created } from "../../core/response";
import { requireAuth, requireRole } from "../../core/auth";
import { parseBody, parseQuery } from "../../core/validate";
import { outletService } from "./service";
import {
  outletCreateSchema,
  outletListQuerySchema,
  outletUpdateSchema,
} from "./schemas";

export const outletController = {
  async list(req: NextRequest) {
    requireAuth(req);
    const q = parseQuery(req, outletListQuerySchema);
    const result = outletService.list(q);
    return ok(result.items, {
      meta: { total: result.total, page: result.page, limit: result.limit },
    });
  },

  async getById(req: NextRequest, id: string) {
    requireAuth(req);
    return ok(outletService.getDetail(id));
  },

  async create(req: NextRequest) {
    const session = requireRole(req, "admin", "supervisor", "sales");
    const input = await parseBody(req, outletCreateSchema);
    const c = outletService.create(input, { id: session.sub, name: session.name });
    return created(c);
  },

  async update(req: NextRequest, id: string) {
    const session = requireRole(req, "admin", "supervisor", "sales");
    const patch = await parseBody(req, outletUpdateSchema);
    const u = outletService.update(id, patch, { id: session.sub, name: session.name });
    return ok(u);
  },

  async remove(req: NextRequest, id: string) {
    const session = requireRole(req, "admin", "supervisor");
    outletService.remove(id, { id: session.sub, name: session.name });
    return ok({ id });
  },

  async performance(req: NextRequest) {
    requireAuth(req);
    const url = req.nextUrl.searchParams;
    return ok(outletService.performanceSummary(url.get("area") ?? undefined));
  },
};
