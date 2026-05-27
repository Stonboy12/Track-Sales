import type { NextRequest } from "next/server";
import { ok, created } from "../../core/response";
import { requireAuth, requireRole } from "../../core/auth";
import { parseBody, parseQuery } from "../../core/validate";
import { promoService } from "./service";
import { promoCreateSchema, promoListQuerySchema, promoUpdateSchema } from "./schemas";

export const promoController = {
  /**
   * Sales hanya melihat promo aktif (filter di service).
   * Admin bisa lihat semua, termasuk promo yang dinonaktifkan.
   */
  async list(req: NextRequest) {
    const session = requireAuth(req);
    const q = parseQuery(req, promoListQuerySchema);
    const isAdmin = session.role === "admin";
    return ok(await promoService.list(q, { activeOnly: !isAdmin }));
  },

  async getById(req: NextRequest, id: string) {
    requireAuth(req);
    return ok(await promoService.get(id));
  },

  async create(req: NextRequest) {
    const session = requireRole(req, "admin");
    const input = await parseBody(req, promoCreateSchema);
    return created(await promoService.create(input, { id: session.sub, name: session.name }));
  },

  async update(req: NextRequest, id: string) {
    const session = requireRole(req, "admin");
    const patch = await parseBody(req, promoUpdateSchema);
    return ok(await promoService.update(id, patch, { id: session.sub, name: session.name }));
  },

  async remove(req: NextRequest, id: string) {
    const session = requireRole(req, "admin");
    await promoService.remove(id, { id: session.sub, name: session.name });
    return ok({ id });
  },
};
