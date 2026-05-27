import type { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { AppError } from "./errors";
import { fail } from "./response";
import { runWithContext, type RequestContext } from "./request-context";
import { decodeSession, readSessionToken } from "./auth";
import { createInsforgeClient } from "@/lib/insforge";

/**
 * Wrapper umum untuk semua route handler:
 *   1. Init RequestContext (InsForge client + session + role)
 *   2. Jalankan handler
 *   3. Tangkap AppError / ZodError / lain → response standar
 */
export function withApi<Ctx = unknown>(
  handler: (req: NextRequest, ctx: Ctx) => Promise<NextResponse>
) {
  return async (req: NextRequest, ctx: Ctx): Promise<NextResponse> => {
    const token = readSessionToken(req);
    const session = token ? decodeSession(token) : null;
    const requestCtx: RequestContext = {
      accessToken: token,
      userId: session?.sub,
      userEmail: session?.email,
      userName: session?.name,
      client: createInsforgeClient(token ?? null),
    };

    // Eager-load role dari user_profiles bila user terautentikasi.
    if (session?.sub) {
      try {
        const { data } = await requestCtx.client.database
          .from("user_profiles")
          .select("role")
          .eq("user_id", session.sub)
          .maybeSingle();
        if (data && (data as { role?: string }).role) {
          requestCtx.role = (data as { role: RequestContext["role"] }).role;
        }
      } catch {
        // ignore — role optional
      }
    }

    try {
      return await runWithContext(requestCtx, () => handler(req, ctx));
    } catch (e) {
      if (e instanceof AppError) {
        return fail(e.code, e.message, e.status, e.details);
      }
      if (e instanceof ZodError) {
        return fail("VALIDATION_ERROR", "Input tidak valid.", 400, e.flatten());
      }
      // eslint-disable-next-line no-console
      console.error("[api]", e);
      const msg = e instanceof Error ? e.message : "Unknown error";
      return fail("INTERNAL_ERROR", msg, 500);
    }
  };
}
