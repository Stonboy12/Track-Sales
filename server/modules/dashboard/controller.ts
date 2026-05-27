import type { NextRequest } from "next/server";
import { ok } from "../../core/response";
import { requireAuth } from "../../core/auth";
import { dashboardService } from "./service";

export const dashboardController = {
  async summary(req: NextRequest) {
    const session = requireAuth(req);
    const url = req.nextUrl.searchParams;
    const salesId =
      url.get("salesId") ?? (session.role === "sales" ? session.sub : undefined);
    return ok(dashboardService.summary(salesId));
  },
};
