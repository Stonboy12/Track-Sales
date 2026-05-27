import { z } from "zod";

export const settingsUpdateSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  language: z.enum(["id", "en"]).optional(),
  notifications: z.record(z.boolean()).optional(),
  bio: z.string().max(2000).optional(),
});
export type SettingsUpdateInput = z.infer<typeof settingsUpdateSchema>;
