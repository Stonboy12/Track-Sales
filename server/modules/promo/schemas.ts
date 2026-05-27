import { z } from "zod";

export const promoCalculateSchema = z.object({
  basePrice: z.number().nonnegative(),
  qty: z.number().int().nonnegative(),
  discountPct: z.number().min(0).max(100).default(0),
  bundling: z.number().int().nonnegative().default(0),
  cashback: z.number().nonnegative().default(0),
  /** opsional, untuk hitung margin % */
  costPerUnit: z.number().nonnegative().optional(),
});
export type PromoCalculateInput = z.infer<typeof promoCalculateSchema>;

export const promoSimulateSchema = z.object({
  scenarios: z
    .array(
      promoCalculateSchema.extend({
        name: z.string().min(1).max(80),
      })
    )
    .min(1)
    .max(10),
});
export type PromoSimulateInput = z.infer<typeof promoSimulateSchema>;
