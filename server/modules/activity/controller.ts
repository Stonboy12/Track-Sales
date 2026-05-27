import type { NextRequest } from "next/server";
import { ok } from "../../core/response";
import { requireRole } from "../../core/auth";
import { activityLogger } from "../../core/logger";

export const activityController = {
  async list(req: NextRequest) {
    requireRole(req, "admin");
    const url = req.nextUrl.searchParams;
    const limit = Math.min(parseInt(url.get("limit") ?? "100", 10) || 100, 1000);
    const entity = url.get("entity") ?? undefined;
    const actorId = url.get("actorId") ?? undefined;
    return ok(await activityLogger.list({ limit, entity, actorId }));
  },
};
