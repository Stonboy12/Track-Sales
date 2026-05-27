import { z } from "zod";

const dateStr = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

const visitEntry = z.object({
  outletId: z.string().min(1),
  outletName: z.string().min(1),
  outcome: z.enum(["order", "no_order", "follow_up", "closed"]),
  orderValue: z.number().int().nonnegative().default(0),
  notes: z.string().max(2000).optional(),
});

export const reportGenerateSchema = z.object({
  date: dateStr,
  visits: z.array(visitEntry).min(1).max(50),
  generalNotes: z.string().max(4000).optional(),
});
export type ReportGenerateInput = z.infer<typeof reportGenerateSchema>;

export const reportSaveSchema = reportGenerateSchema.extend({
  generatedText: z.string().min(1),
});
export type ReportSaveInput = z.infer<typeof reportSaveSchema>;
