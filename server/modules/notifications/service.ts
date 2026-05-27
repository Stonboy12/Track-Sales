import { Errors } from "../../core/errors";
import { db } from "../../db";
import type { Notification } from "../../db/types";

export const notificationService = {
  async list(userId: string, opts: { unreadOnly?: boolean; limit?: number } = {}): Promise<Notification[]> {
    return db.notifications.findAll({
      where: { user_id: userId, ...(opts.unreadOnly ? { read: false } : {}) },
      order: [{ column: "created_at", ascending: false }],
      limit: opts.limit ?? 50,
    });
  },
  async markRead(userId: string, id: string): Promise<Notification> {
    const n = await db.notifications.findById(id);
    if (!n || n.userId !== userId) throw Errors.notFound("Notification");
    return db.notifications.update(id, { read: true });
  },
  async markAllRead(userId: string): Promise<{ updated: number }> {
    const all = await db.notifications.findAll({
      where: { user_id: userId, read: false },
    });
    await Promise.all(all.map((n) => db.notifications.update(n.id, { read: true })));
    return { updated: all.length };
  },
};
