import { createClient, type InsForgeClient } from "@insforge/sdk";

/**
 * Konfigurasi InsForge dipusatkan di sini.
 *
 * - Browser/SSR public bundle: hanya boleh pakai variabel `NEXT_PUBLIC_*`.
 * - Server-only code: lihat `server/insforge/server-client.ts` untuk client
 *   yang bisa di-set access token user (per request).
 */
const baseUrl = process.env.NEXT_PUBLIC_INSFORGE_URL;
const anonKey = process.env.NEXT_PUBLIC_INSFORGE_ANON_KEY;

if (!baseUrl || !anonKey) {
  // Jangan throw di module load; biar build & SSG tetap jalan tanpa env.
  // Kita hanya peringatkan; pemanggil yang benar-benar butuh akan lempar nanti.
  if (process.env.NODE_ENV !== "production") {
    console.warn(
      "[insforge] NEXT_PUBLIC_INSFORGE_URL / NEXT_PUBLIC_INSFORGE_ANON_KEY belum di-set. " +
        "Salin .env.example ke .env.local lalu isi nilainya."
    );
  }
}

/** Client global untuk dipakai dari komponen client (browser). */
export const insforge: InsForgeClient = createClient({
  baseUrl: baseUrl ?? "",
  anonKey: anonKey ?? "",
});

export const INSFORGE_BASE_URL = baseUrl ?? "";
export const INSFORGE_ANON_KEY = anonKey ?? "";

/**
 * Helper untuk membuat client baru — dipakai server-side per-request supaya
 * setAccessToken() tidak bocor ke request lain (statefulness InsForge SDK).
 */
export function createInsforgeClient(accessToken?: string | null): InsForgeClient {
  const client = createClient({
    baseUrl: baseUrl ?? "",
    anonKey: anonKey ?? "",
  });
  if (accessToken) {
    // SDK 1.2.x menyediakan setAccessToken pada client; ini akan dilampirkan
    // sebagai Authorization header pada semua request DB / storage.
    (client as unknown as { setAccessToken?: (t: string | null) => void })
      .setAccessToken?.(accessToken);
  }
  return client;
}

export type { InsForgeClient };
