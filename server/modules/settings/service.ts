import { activityLogger } from "../../core/logger";
import { db } from "../../db/memory";
import type { UserSetting } from "../../db/types";
import type { SettingsUpdateInput } from "./schemas";

interface Actor {
  id: string;
  name: string;
}

export const settingsService = {
  get(userId: string): UserSetting {
    let setting = db.settings.findOne((s) => s.userId === userId);
    if (!setting) {
      setting = db.settings.create({
        userId,
        theme: "system",
        language: "id",
        notifications: {
          visit_reminder: true,
          new_complaint: true,
          target_update: false,
          weekly_insight: true,
          new_promo: true,
        },
      });
    }
    return setting;
  },
  update(actor: Actor, patch: SettingsUpdateInput): UserSetting {
    const current = this.get(actor.id);
    const merged: SettingsUpdateInput = {
      ...patch,
      notifications: patch.notifications
        ? { ...current.notifications, ...patch.notifications }
        : undefined,
    };
    const updated = db.settings.update(current.id, merged);
    activityLogger.record({
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
