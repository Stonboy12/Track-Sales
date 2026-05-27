import { requireServerUser } from "@/lib/server-session";
import { serverApi } from "@/lib/api-client";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";
import { PromoManager } from "./promo-manager";
import type { Product, Promo } from "@/server/db/types";

export const dynamic = "force-dynamic";

export default async function AdminPromosPage() {
  const me = await requireServerUser({ role: "admin" });
  let promos: Promo[] = [];
  let products: Product[] = [];
  let error: string | null = null;
  try {
    [promos, products] = await Promise.all([
      serverApi<Promo[]>("GET", "/api/promos"),
      serverApi<Product[]>("GET", "/api/products"),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : "Gagal memuat data promo.";
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Promo Manager"
        description="Buat dan kelola program promo. Hanya admin yang bisa akses halaman ini."
      />

      <Card className="border-primary/30 bg-primary/[0.03]">
        <CardContent className="flex items-center gap-3 p-4">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <p className="flex-1 text-sm">
            <span className="font-semibold">{me.name}</span> · admin · semua perubahan
            divalidasi server (<code className="text-xs">requireRole(&quot;admin&quot;)</code>) dan
            tercatat di <code className="text-xs">activity_logs</code>.
          </p>
        </CardContent>
      </Card>

      <PromoManager initial={promos} products={products} initialError={error} />
    </div>
  );
}
