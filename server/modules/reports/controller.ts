import type { NextRequest } from "next/server";
import { ok, created } from "../../core/response";
import { requireAuth } from "../../core/auth";
import { parseBody } from "../../core/validate";
import { reportService } from "./service";
import { reportGenerateSchema, reportSaveSchema } from "./schemas";

export const reportController = {
  async generate(req: NextRequest) {
    const session = requireAuth(req);
    const input = await parseBody(req, reportGenerateSchema);
    return ok(reportService.generate(input, { id: session.sub, name: session.name }));
  },
  async list(req: NextRequest) {
    const session = requireAuth(req);
    const url = req.nextUrl.searchParams;
    const salesId =
      url.get("salesId") ?? (session.role === "sales" ? session.sub : undefined);
    return ok(await reportService.list(salesId));
  },
  async getById(req: NextRequest, id: string) {
    requireAuth(req);
    return ok(await reportService.get(id));
  },
  async save(req: NextRequest) {
    const session = requireAuth(req);
    const input = await parseBody(req, reportSaveSchema);
    return created(await reportService.save(input, { id: session.sub, name: session.name }));
  },
};
