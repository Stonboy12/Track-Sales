import type { NextRequest } from "next/server";
import { ok, created } from "../../core/response";
import { requireAuth } from "../../core/auth";
import { parseBody, parseQuery } from "../../core/validate";
import { competitorPriceService } from "./service";
import {
  competitorPriceCreateSchema,
  competitorPriceListQuerySchema,
  competitorTrendQuerySchema,
} from "./schemas";

export const competitorPriceController = {
  async list(req: NextRequest) {
    requireAuth(req);
    const q = parseQuery(req, competitorPriceListQuerySchema);
    const r = await competitorPriceService.list(q);
    return ok(r.items, { meta: { total: r.total, page: r.page, limit: r.limit } });
  },
  async create(req: NextRequest) {
    const session = requireAuth(req);
    const input = await parseBody(req, competitorPriceCreateSchema);
    return created(
      await competitorPriceService.create(input, { id: session.sub, name: session.name })
    );
  },
  async trend(req: NextRequest) {
    requireAuth(req);
    const q = parseQuery(req, competitorTrendQuerySchema);
    return ok(await competitorPriceService.trend(q.productName, q.days));
  },
};
