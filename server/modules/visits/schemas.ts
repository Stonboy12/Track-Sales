import { z } from "zod";

const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format tanggal harus YYYY-MM-DD");

export const visitCreateSchema = z.object({
  outletId: z.string().min(1),
  salesId: z.string().min(1).optional(),
  visitDate: dateStr,
  outcome: z.enum(["order", "no_order", "follow_up", "closed"]),
  orderValue: z.number().int().nonnegative().default(0),
  notes: z.string().max(2000).optional(),
});
export type VisitCreateInput = z.infer<typeof visitCreateSchema>;

export const visitUpdateSchema = visitCreateSchema.partial();
export type VisitUpdateInput = z.infer<typeof visitUpdateSchema>;

export const visitListQuerySchema = z.object({
  outletId: z.string().optional(),
  salesId: z.string().optional(),
  outcome: z.enum(["order", "no_order", "follow_up", "closed"]).optional(),
  from: dateStr.optional(),
  to: dateStr.optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});
export type VisitListQuery = z.infer<typeof visitListQuerySchema>;
