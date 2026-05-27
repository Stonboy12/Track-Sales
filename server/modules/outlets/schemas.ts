import { z } from "zod";

export const outletCreateSchema = z.object({
  code: z.string().min(1).max(40),
  name: z.string().min(2).max(120),
  area: z.string().min(1),
  segment: z.enum(["A", "B", "C"]),
  priority: z.enum(["high", "medium", "low"]),
  status: z.enum(["active", "pending", "closed"]).default("active"),
  ownerName: z.string().min(1),
  phone: z.string().min(5),
  address: z.string().min(1),
  assignedSalesId: z.string().optional(),
});
export type OutletCreateInput = z.infer<typeof outletCreateSchema>;

export const outletUpdateSchema = outletCreateSchema.partial();
export type OutletUpdateInput = z.infer<typeof outletUpdateSchema>;

export const outletListQuerySchema = z.object({
  search: z.string().optional(),
  area: z.string().optional(),
  segment: z.enum(["A", "B", "C"]).optional(),
  priority: z.enum(["high", "medium", "low"]).optional(),
  status: z.enum(["active", "pending", "closed"]).optional(),
  assignedSalesId: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});
export type OutletListQuery = z.infer<typeof outletListQuerySchema>;
