import { requireServerUser } from "@/lib/server-session";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tag, Plus, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

/**
 * Halaman Promo Manager — admin only.
 * Server Component sengaja: enforcement role di sisi server lewat
 * `requireServerUser({ role: "admin" })` yang akan redirect bila bukan admin.
 *
 * Sales yang mencoba membuka URL ini akan diarahkan ke "/" tanpa pernah
 * me-render apa pun di klien.
 */
export default async function AdminPromosPage() {
  const me = await requireServerUser({ role: "admin" });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Promo Manager"
        description="Buat dan kelola program promo. Hanya admin yang bisa akses halaman ini."
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4" /> Buat Promo
          </Button>
        }
      />

      <Card className="border-primary/30 bg-primary/[0.03]">
        <CardContent className="flex items-center gap-3 p-4">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <div className="flex-1 text-sm">
            Login sebagai <span className="font-semibold">{me.name}</span> ({me.role}).
            Halaman ini diproteksi <code className="text-xs">requireServerUser</code> +
            <code className="text-xs"> requireRole(&quot;admin&quot;)</code> di API.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Daftar Promo</CardTitle>
          </div>
          <CardDescription>
            Data live diambil dari InsForge tabel <code>promos</code> via{" "}
            <code>GET /api/promos</code>.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PromoList />
        </CardContent>
      </Card>
    </div>
  );
}

async function PromoList() {
  // Kita ambil dari API kita sendiri (bukan langsung InsForge) agar konsisten
  // dengan kontrak yang sama dipakai client-side.
  const headers: Record<string, string> = {};
  const cookie = (await import("next/headers")).cookies().toString();
  if (cookie) headers.cookie = cookie;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/promos`, { headers, cache: "no-store" });
  const json = await res.json();
  if (!json.success) {
    return (
      <p className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
        {json.error?.message ?? "Gagal memuat promo."}
      </p>
    );
  }
  const promos = json.data as {
    id: string;
    name: string;
    type: string;
    discountPct: number;
    startsAt: string;
    endsAt: string;
    isActive: boolean;
  }[];

  if (promos.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">
        Belum ada promo. Klik <strong>Buat Promo</strong> untuk menambahkan.
      </div>
    );
  }

  return (
    <ul className="divide-y">
      {promos.map((p) => (
        <li key={p.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-warning/15 text-warning">
            <Tag className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">{p.name}</p>
            <p className="text-xs text-muted-foreground">
              {p.type.toUpperCase()} · {p.startsAt} → {p.endsAt}
            </p>
          </div>
          <Badge variant={p.isActive ? "success" : "muted"}>
            {p.isActive ? "Aktif" : "Nonaktif"}
          </Badge>
        </li>
      ))}
    </ul>
  );
}
