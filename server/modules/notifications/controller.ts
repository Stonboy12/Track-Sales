import type { NextRequest } from "next/server";
import { z } from "zod";
import { ok } from "../../core/response";
import { requireAuth } from "../../core/auth";
import { parseBody, parseQuery } from "../../core/validate";
import { notificationService } from "./service";

const listQuery = z.object({
  unread: z.coerce.boolean().optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

const updateSchema = z.object({
  ids: z.array(z.string()).optional(),
  all: z.boolean().optional(),
});

export const notificationController = {
  async list(req: NextRequest) {
    const session = requireAuth(req);
    const q = parseQuery(req, listQuery);
    return ok(
      await notificationService.list(session.sub, {
        unreadOnly: q.unread,
        limit: q.limit,
      })
    );
  },
  async update(req: NextRequest) {
    const session = requireAuth(req);
    const input = await parseBody(req, updateSchema);
    if (input.all) return ok(await notificationService.markAllRead(session.sub));
    const updated = await Promise.all(
      (input.ids ?? []).map((id) => notificationService.markRead(session.sub, id))
    );
    return ok(updated);
  },
};
