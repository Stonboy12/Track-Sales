import { z } from "zod";
import type { NextRequest } from "next/server";
import { ok } from "../../core/response";
import { Errors } from "../../core/errors";
import { requireAuth } from "../../core/auth";
import { parseQuery } from "../../core/validate";
import { userService } from "./service";

const listQuery = z.object({
  role: z.enum(["admin", "sales"]).optional(),
  area: z.string().optional(),
  search: z.string().optional(),
});

export const userController = {
  async list(req: NextRequest) {
    requireAuth(req);
    const q = parseQuery(req, listQuery);
    return ok(await userService.list(q));
  },
  async getById(req: NextRequest, id: string) {
    requireAuth(req);
    const u = await userService.get(id);
    if (!u) throw Errors.notFound("User");
    return ok(u);
  },
};
