import { AsyncLocalStorage } from "node:async_hooks";
import type { InsForgeClient } from "@/lib/insforge";

/**
 * Per-request context. Diisi oleh `withApi()` lalu dibaca oleh repository
 * sehingga setiap query DB otomatis pakai access token user yang sedang login.
 *
 * Pakai AsyncLocalStorage agar tidak perlu meneruskan client ke setiap
 * fungsi service — patternnya tetap mirip kode sebelumnya.
 */
export interface RequestContext {
  accessToken?: string | null;
  userId?: string;
  userName?: string;
  userEmail?: string;
  role?: "admin" | "sales";
  /** Lazily-created InsForge client untuk request ini. */
  client: InsForgeClient;
}

const storage = new AsyncLocalStorage<RequestContext>();

export function runWithContext<T>(ctx: RequestContext, fn: () => T): T {
  return storage.run(ctx, fn);
}

export function getContext(): RequestContext {
  const ctx = storage.getStore();
  if (!ctx) {
    throw new Error(
      "Request context belum di-init. Pastikan handler dibungkus withApi()."
    );
  }
  return ctx;
}

export function tryGetContext(): RequestContext | undefined {
  return storage.getStore();
}
