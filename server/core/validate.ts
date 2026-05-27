import type { NextRequest } from "next/server";
import { z, type ZodTypeAny } from "zod";

/**
 * Helper validasi standar. Lempar ZodError; akan ditangkap `withApi`
 * dan jadi response 400 VALIDATION_ERROR.
 */
export async function parseBody<T extends ZodTypeAny>(
  req: NextRequest,
  schema: T
): Promise<z.infer<T>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  return schema.parse(body);
}

export function parseQuery<T extends ZodTypeAny>(
  req: NextRequest,
  schema: T
): z.infer<T> {
  const params = Object.fromEntries(req.nextUrl.searchParams.entries());
  return schema.parse(params);
}

/** Skema umum yang sering dipakai */
export const idSchema = z.string().min(1);
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50).optional(),
});
