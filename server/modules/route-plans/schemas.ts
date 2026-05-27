import { z } from "zod";

const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

export const routeOptimizeSchema = z.object({
  outletIds: z.array(z.string().min(1)).min(1).max(50),
  /** strategy=priority: high>medium>low; strategy=area: kelompokkan area */
  strategy: z.enum(["priority", "area", "balanced"]).default("priority"),
});
export type RouteOptimizeInput = z.infer<typeof routeOptimizeSchema>;

export const routeSaveSchema = z.object({
  name: z.string().max(80).optional(),
  date: dateStr,
  outletIds: z.array(z.string().min(1)).min(1),
});
export type RouteSaveInput = z.infer<typeof routeSaveSchema>;
