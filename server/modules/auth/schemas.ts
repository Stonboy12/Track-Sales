import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(72),
  name: z.string().min(2).max(80),
  role: z.enum(["admin", "sales"]).optional(),
  area: z.string().optional(),
  phone: z.string().optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;
