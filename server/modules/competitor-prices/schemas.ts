import { z } from "zod";

const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const competitorPriceCreateSchema = z.object({
  productId: z.string().optional(),
  productName: z.string().min(1),
  competitor: z.string().min(1),
  outlet: z.string().min(1),
  area: z.string().min(1),
  price: z.number().int().nonnegative(),
  ourPrice: z.number().int().nonnegative(),
  observedAt: dateStr,
  note: z.string().max(500).optional(),
});
export type CompetitorPriceCreateInput = z.infer<typeof competitorPriceCreateSchema>;

export const competitorPriceListQuerySchema = z.object({
  productName: z.string().optional(),
  competitor: z.string().optional(),
  area: z.string().optional(),
  from: dateStr.optional(),
  to: dateStr.optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});
export type CompetitorPriceListQuery = z.infer<typeof competitorPriceListQuerySchema>;

export const competitorTrendQuerySchema = z.object({
  productName: z.string().min(1),
  days: z.coerce.number().int().min(1).max(365).default(30),
});
