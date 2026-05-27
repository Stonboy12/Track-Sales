import type { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "./errors";
import { fail } from "./response";

/**
 * Wrapper umum untuk semua route handler. Menangkap AppError, ZodError,
 * dan error lain, lalu mengubahnya jadi response standar.
 */
export function withApi<Ctx = unknown>(
  handler: (req: NextRequest, ctx: Ctx) => Promise<NextResponse>
) {
  return async (req: NextRequest, ctx: Ctx): Promise<NextResponse> => {
    try {
      return await handler(req, ctx);
    } catch (e) {
      if (e instanceof AppError) {
        return fail(e.code, e.message, e.status, e.details);
      }
      if (e instanceof ZodError) {
        return fail("VALIDATION_ERROR", "Input tidak valid.", 400, e.flatten());
      }
      console.error("[api]", e);
      const msg = e instanceof Error ? e.message : "Unknown error";
      return fail("INTERNAL_ERROR", msg, 500);
    }
  };
}
