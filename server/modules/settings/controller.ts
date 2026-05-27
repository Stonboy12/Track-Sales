import type { NextRequest } from "next/server";
import { ok } from "../../core/response";
import { requireAuth } from "../../core/auth";
import { parseBody } from "../../core/validate";
import { settingsService } from "./service";
import { settingsUpdateSchema } from "./schemas";

export const settingsController = {
  async get(req: NextRequest) {
    const session = requireAuth(req);
    return ok(settingsService.get(session.sub));
  },
  async update(req: NextRequest) {
    const session = requireAuth(req);
    const patch = await parseBody(req, settingsUpdateSchema);
    return ok(
      settingsService.update({ id: session.sub, name: session.name }, patch)
    );
  },
};
