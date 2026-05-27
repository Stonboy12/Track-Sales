import { Errors } from "../../core/errors";
import { db } from "../../db/memory";
import type { Notification } from "../../db/types";

export const notificationService = {
  list(userId: string, opts: { unreadOnly?: boolean; limit?: number } = {}): Notification[] {
    return db.notifications
      .findAll(
        (n) => n.userId === userId && (opts.unreadOnly ? !n.read : true)
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, opts.limit ?? 50);
  },
  markRead(userId: string, id: string): Notification {
    const n = db.notifications.findById(id);
    if (!n || n.userId !== userId) throw Errors.notFound("Notification");
    return db.notifications.update(id, { read: true });
  },
  markAllRead(userId: string): { updated: number } {
    const all = db.notifications.findAll((n) => n.userId === userId && !n.read);
    for (const n of all) db.notifications.update(n.id, { read: true });
    return { updated: all.length };
  },
};
