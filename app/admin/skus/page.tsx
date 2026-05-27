import { requireServerUser } from "@/lib/server-session";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Package, Plus, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

/** SKU Manager — admin only. */
export default async function AdminSkusPage() {
  const me = await requireServerUser({ role: "admin" });

  const headers: Record<string, string> = {};
  const cookie = (await import("next/headers")).cookies().toString();
  if (cookie) headers.cookie = cookie;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/products`, { headers, cache: "no-store" });
  const json = await res.json();
  const products = (json.success ? json.data : []) as {
    id: string;
    sku: string;
    name: string;
    brand: string;
    price: number;
    stockStatus: string;
  }[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="SKU Manager"
        description="Kelola katalog produk. Hanya admin yang dapat menambah atau mengubah SKU."
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4" /> Tambah SKU
          </Button>
        }
      />

      <Card className="border-primary/30 bg-primary/[0.03]">
        <CardContent className="flex items-center gap-3 p-4">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <p className="flex-1 text-sm">
            <span className="font-semibold">{me.name}</span> · admin · proteksi double:
            server component + <code>requireRole(&quot;admin&quot;)</code> di API.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <CardTitle className="text-base">Daftar SKU</CardTitle>
          </div>
          <CardDescription>{products.length} produk aktif di sistem.</CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">
              Belum ada SKU. Klik <strong>Tambah SKU</strong> atau jalankan{" "}
              <code>POST /api/admin/seed</code>.
            </div>
          ) : (
            <ul className="divide-y">
              {products.map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.sku} · {p.brand}
                    </p>
                  </div>
                  <span className="text-sm font-semibold">
                    Rp {p.price.toLocaleString("id-ID")}
                  </span>
                  <Badge
                    variant={
                      p.stockStatus === "in_stock"
                        ? "success"
                        : p.stockStatus === "low"
                          ? "warning"
                          : "destructive"
                    }
                  >
                    {p.stockStatus}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
