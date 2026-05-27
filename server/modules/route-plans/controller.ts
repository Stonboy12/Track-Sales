import type { NextRequest } from "next/server";
import { ok, created } from "../../core/response";
import { requireAuth } from "../../core/auth";
import { parseBody } from "../../core/validate";
import { routePlanService } from "./service";
import { routeOptimizeSchema, routeSaveSchema } from "./schemas";

export const routePlanController = {
  async optimize(req: NextRequest) {
    requireAuth(req);
    const input = await parseBody(req, routeOptimizeSchema);
    return ok(await routePlanService.optimize(input));
  },
  async list(req: NextRequest) {
    const session = requireAuth(req);
    const url = req.nextUrl.searchParams;
    const sales = url.get("salesId") ?? (session.role === "sales" ? session.sub : undefined);
    return ok(await routePlanService.list(sales));
  },
  async save(req: NextRequest) {
    const session = requireAuth(req);
    const input = await parseBody(req, routeSaveSchema);
    return created(await routePlanService.save(input, { id: session.sub, name: session.name }));
  },
};
