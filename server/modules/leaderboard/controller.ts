import type { NextRequest } from "next/server";
import { z } from "zod";
import { ok } from "../../core/response";
import { requireAuth } from "../../core/auth";
import { parseQuery } from "../../core/validate";
import { leaderboardService } from "./service";

const querySchema = z.object({
  area: z.string().optional(),
  period: z.enum(["month", "all"]).optional(),
});

export const leaderboardController = {
  async list(req: NextRequest) {
    requireAuth(req);
    const q = parseQuery(req, querySchema);
    return ok(await leaderboardService.ranking(q));
  },
};
