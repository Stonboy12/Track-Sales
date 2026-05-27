import { z } from "zod";

export const productCreateSchema = z.object({
  sku: z.string().min(1).max(40),
  name: z.string().min(2).max(120),
  category: z.string().min(1),
  brand: z.string().min(1),
  price: z.number().int().nonnegative(),
  stockStatus: z.enum(["in_stock", "low", "out"]).default("in_stock"),
  description: z.string().min(1).max(2000),
  sellingPoints: z.array(z.string().min(1).max(200)).default([]),
  promo: z.string().max(500).default(""),
  faqs: z
    .array(z.object({ q: z.string().min(1).max(200), a: z.string().min(1).max(1000) }))
    .default([]),
});
export type ProductCreateInput = z.infer<typeof productCreateSchema>;

export const productUpdateSchema = productCreateSchema.partial();
export type ProductUpdateInput = z.infer<typeof productUpdateSchema>;

export const productListQuerySchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  stockStatus: z.enum(["in_stock", "low", "out"]).optional(),
});
export type ProductListQuery = z.infer<typeof productListQuerySchema>;
