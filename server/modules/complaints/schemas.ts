import { z } from "zod";

export const complaintCreateSchema = z.object({
  outletId: z.string().min(1),
  productName: z.string().min(1),
  category: z.enum(["kualitas", "pengiriman", "harga", "lainnya"]),
  priority: z.enum(["high", "medium", "low"]).default("medium"),
  description: z.string().min(5).max(4000),
});
export type ComplaintCreateInput = z.infer<typeof complaintCreateSchema>;

export const complaintUpdateSchema = z.object({
  status: z.enum(["open", "in_progress", "resolved"]).optional(),
  priority: z.enum(["high", "medium", "low"]).optional(),
  description: z.string().max(4000).optional(),
});
export type ComplaintUpdateInput = z.infer<typeof complaintUpdateSchema>;

export const complaintTimelineSchema = z.object({
  note: z.string().min(1).max(2000),
  status: z.enum(["open", "in_progress", "resolved"]).optional(),
});
export type ComplaintTimelineInput = z.infer<typeof complaintTimelineSchema>;

export const complaintListQuerySchema = z.object({
  status: z.enum(["open", "in_progress", "resolved"]).optional(),
  priority: z.enum(["high", "medium", "low"]).optional(),
  category: z.enum(["kualitas", "pengiriman", "harga", "lainnya"]).optional(),
  outletId: z.string().optional(),
  search: z.string().optional(),
});
export type ComplaintListQuery = z.infer<typeof complaintListQuerySchema>;
