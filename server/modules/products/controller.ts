import type { NextRequest } from "next/server";
import { ok, created } from "../../core/response";
import { requireAuth, requireRole } from "../../core/auth";
import { parseBody, parseQuery } from "../../core/validate";
import { productService } from "./service";
import {
  productCreateSchema,
  productListQuerySchema,
  productUpdateSchema,
} from "./schemas";

export const productController = {
  async list(req: NextRequest) {
    requireAuth(req);
    const q = parseQuery(req, productListQuerySchema);
    return ok(productService.list(q));
  },
  async getById(req: NextRequest, id: string) {
    requireAuth(req);
    return ok(productService.get(id));
  },
  async create(req: NextRequest) {
    const session = requireRole(req, "admin", "supervisor");
    const input = await parseBody(req, productCreateSchema);
    return created(productService.create(input, { id: session.sub, name: session.name }));
  },
  async update(req: NextRequest, id: string) {
    const session = requireRole(req, "admin", "supervisor");
    const patch = await parseBody(req, productUpdateSchema);
    return ok(productService.update(id, patch, { id: session.sub, name: session.name }));
  },
};
