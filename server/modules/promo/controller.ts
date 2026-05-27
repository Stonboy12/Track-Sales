import type { NextRequest } from "next/server";
import { ok } from "../../core/response";
import { requireAuth } from "../../core/auth";
import { parseBody } from "../../core/validate";
import { promoService } from "./service";
import { promoCalculateSchema, promoSimulateSchema } from "./schemas";

export const promoController = {
  async calculate(req: NextRequest) {
    requireAuth(req);
    const input = await parseBody(req, promoCalculateSchema);
    return ok(promoService.calculate(input));
  },
  async simulate(req: NextRequest) {
    requireAuth(req);
    const input = await parseBody(req, promoSimulateSchema);
    return ok(promoService.simulate(input));
  },
};
