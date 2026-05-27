import { z } from "zod";

const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD");

export const promoCreateSchema = z.object({
  name: z.string().min(2).max(120),
  description: z.string().max(2000).optional(),
  productId: z.string().uuid().optional(),
  type: z.enum(["discount", "bundling", "cashback", "pwp"]),
  discountPct: z.number().min(0).max(100).default(0),
  bundlingQty: z.number().int().nonnegative().default(0),
  cashbackAmount: z.number().int().nonnegative().default(0),
  minQty: z.number().int().min(1).default(1),
  startsAt: dateStr,
  endsAt: dateStr,
  isActive: z.boolean().default(true),
});
export type PromoCreateInput = z.infer<typeof promoCreateSchema>;

export const promoUpdateSchema = promoCreateSchema.partial();
export type PromoUpdateInput = z.infer<typeof promoUpdateSchema>;

export const promoListQuerySchema = z.object({
  isActive: z.coerce.boolean().optional(),
  productId: z.string().optional(),
  type: z.enum(["discount", "bundling", "cashback", "pwp"]).optional(),
});
export type PromoListQuery = z.infer<typeof promoListQuerySchema>;
