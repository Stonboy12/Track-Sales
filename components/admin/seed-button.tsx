"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Sprout, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api, ApiClientError } from "@/lib/api-client";

interface SeedStats {
  stats: Record<string, { inserted: number; skipped: number }>;
}

/**
 * Tombol untuk admin: panggil POST /api/admin/seed sekali untuk isi data
 * awal (outlets, products, competitor_prices) dari mock-data ke InsForge.
 *
 * Sengaja tidak idempotent total — data yang sudah ada lewat unique key
 * (sku, code) akan di-skip; competitor_prices akan tetap nambah.
 */
export function SeedButton() {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<SeedStats | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  async function run() {
    if (!confirm("Seed data awal (outlets, products, competitor_prices)? Bisa dijalankan ulang.")) return;
    setSubmitting(true);
    setError(null);
    setResult(null);
    try {
      const data = await api.post<SeedStats>("/api/admin/seed", {});
      setResult(data);
      router.refresh();
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Seed gagal.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <Button size="sm" variant="outline" onClick={run} disabled={submitting}>
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sprout className="h-4 w-4" />}
        Seed data awal
      </Button>
      {result && (
        <p className="flex items-center gap-1 text-xs text-success">
          <CheckCircle2 className="h-3 w-3" />
          {Object.entries(result.stats)
            .map(([k, v]) => `${k}: +${v.inserted}/skip ${v.skipped}`)
            .join(" · ")}
        </p>
      )}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
