import { activityLogger } from "../../core/logger";
import { db } from "../../db";
import type { UserSetting } from "../../db/types";
import type { SettingsUpdateInput } from "./schemas";

interface Actor {
  id: string;
  name: string;
}

const DEFAULTS: Omit<UserSetting, "id" | "userId" | "createdAt" | "updatedAt"> = {
  theme: "system",
  language: "id",
  notifications: {
    visit_reminder: true,
    new_complaint: true,
    target_update: false,
    weekly_insight: true,
    new_promo: true,
  },
};

export const settingsService = {
  async get(userId: string): Promise<UserSetting> {
    const existing = await db.settings.findOne({ where: { user_id: userId } });
    if (existing) return existing;
    return db.settings.create({ userId, ...DEFAULTS });
  },

  async update(actor: Actor, patch: SettingsUpdateInput): Promise<UserSetting> {
    const current = await this.get(actor.id);
    const merged: SettingsUpdateInput = {
      ...patch,
      notifications: patch.notifications
        ? { ...current.notifications, ...patch.notifications }
        : undefined,
    };
    const updated = await db.settings.update(current.id, merged);
    await activityLogger.record({
      actorId: actor.id,
      actorName: actor.name,
      action: "settings.update",
      entity: "setting",
      entityId: current.id,
      meta: patch,
    });
    return updated;
  },
};
