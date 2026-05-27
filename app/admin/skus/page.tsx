import { requireServerUser } from "@/lib/server-session";
import { serverApi } from "@/lib/api-client";
import { PageHeader } from "@/components/layout/page-header";
import { ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SkuManager } from "./sku-manager";
import type { Product } from "@/server/db/types";

export const dynamic = "force-dynamic";

export default async function AdminSkusPage() {
  const me = await requireServerUser({ role: "admin" });
  let initial: Product[] = [];
  let error: string | null = null;
  try {
    initial = await serverApi<Product[]>("GET", "/api/products");
  } catch (e) {
    error = e instanceof Error ? e.message : "Gagal memuat SKU.";
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="SKU Manager"
        description="Kelola katalog produk. Hanya admin yang dapat menambah atau mengubah SKU."
      />

      <Card className="border-primary/30 bg-primary/[0.03]">
        <CardContent className="flex items-center gap-3 p-4">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <p className="flex-1 text-sm">
            Login sebagai <span className="font-semibold">{me.name}</span> · admin · proteksi
            di server-component + <code className="text-xs">requireRole(&quot;admin&quot;)</code> di API.
          </p>
        </CardContent>
      </Card>

      <SkuManager initial={initial} initialError={error} />
    </div>
  );
}
