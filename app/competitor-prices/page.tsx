"use client";

import * as React from "react";
import {
  Plus,
  Sparkles,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LineChart } from "@/components/charts/line-chart";
import { api, ApiClientError } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import type { CompetitorPrice, Product } from "@/server/db/types";

interface TrendResp {
  series: { date: string; us: number; comp: number }[];
  insight: string;
}

const ALL = "__all__";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

export default function CompetitorPricesPage() {
  const [items, setItems] = React.useState<CompetitorPrice[]>([]);
  const [products, setProducts] = React.useState<Product[]>([]);
  const [trend, setTrend] = React.useState<TrendResp | null>(null);
  const [productFilter, setProductFilter] = React.useState<string>(ALL);
  const [trendDays, setTrendDays] = React.useState("30");
  const [trendProduct, setTrendProduct] = React.useState<string>("");
  const [search, setSearch] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);

  // form
  const [fProduct, setFProduct] = React.useState("");
  const [fComp, setFComp] = React.useState("");
  const [fOutlet, setFOutlet] = React.useState("");
  const [fArea, setFArea] = React.useState("");
  const [fPrice, setFPrice] = React.useState("0");
  const [fOurPrice, setFOurPrice] = React.useState("0");
  const [fDate, setFDate] = React.useState(todayStr());
  const [fNote, setFNote] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [pricesData, productsData] = await Promise.all([
          api.get<CompetitorPrice[]>("/api/competitor-prices"),
          api.get<Product[]>("/api/products"),
        ]);
        setItems(pricesData);
        setProducts(productsData);
        // Auto-pick first product yang punya histori untuk trend chart
        const firstProductInPrices = pricesData[0]?.productName ?? "";
        if (firstProductInPrices) setTrendProduct(firstProductInPrices);
      } catch (e) {
        setError(e instanceof ApiClientError ? e.message : "Gagal memuat data.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  React.useEffect(() => {
    if (!trendProduct) {
      setTrend(null);
      return;
    }
    (async () => {
      try {
        const data = await api.get<TrendResp>("/api/competitor-prices/trend", {
          query: { productName: trendProduct, days: trendDays },
        });
        setTrend(data);
      } catch {
        setTrend(null);
      }
    })();
  }, [trendProduct, trendDays]);

  async function refresh() {
    const data = await api.get<CompetitorPrice[]>("/api/competitor-prices");
    setItems(data);
  }

  async function submit() {
    if (!fProduct || !fComp || !fOutlet || !fArea) {
      setError("Lengkapi produk, brand kompetitor, outlet, dan area.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await api.post<CompetitorPrice>("/api/competitor-prices", {
        productName: fProduct,
        competitor: fComp.trim(),
        outlet: fOutlet.trim(),
        area: fArea.trim(),
        price: Number(fPrice) || 0,
        ourPrice: Number(fOurPrice) || 0,
        observedAt: fDate,
        note: fNote.trim() || undefined,
      });
      setInfo(`Catatan harga "${fProduct}" tersimpan.`);
      // reset
      setFComp("");
      setFOutlet("");
      setFArea("");
      setFPrice("0");
      setFOurPrice("0");
      setFNote("");
      await refresh();
      // Refresh tren bila produk yang sama
      if (trendProduct === fProduct) {
        const data = await api.get<TrendResp>("/api/competitor-prices/trend", {
          query: { productName: fProduct, days: trendDays },
        });
        setTrend(data);
      }
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Gagal menyimpan.");
    } finally {
      setSubmitting(false);
    }
  }

  const filtered = items.filter((p) => {
    if (productFilter !== ALL && p.productName !== productFilter) return false;
    if (
      search &&
      !`${p.competitor} ${p.outlet}`.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  const productNames = Array.from(new Set(items.map((c) => c.productName)));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Competitor Price Tracker"
        description="Lacak pergerakan harga kompetitor dan dapatkan insight cepat."
      />

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
      {info && (
        <div className="rounded-md border border-success/30 bg-success/10 p-3 text-sm text-success">
          {info}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Input Harga Cepat</CardTitle>
            <CardDescription>
              Catat harga produk kompetitor saat visit outlet.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="prod">Produk</Label>
              <Select value={fProduct} onValueChange={setFProduct}>
                <SelectTrigger id="prod">
                  <SelectValue placeholder="Pilih produk" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((p) => (
                    <SelectItem key={p.id} value={p.name}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {products.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  Belum ada produk. Minta admin seed data atau buat SKU dulu.
                </p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="comp">Brand Kompetitor</Label>
              <Input
                id="comp"
                value={fComp}
                onChange={(e) => setFComp(e.target.value)}
                placeholder="Misal: Ultra Milk"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="outlet">Outlet</Label>
                <Input
                  id="outlet"
                  value={fOutlet}
                  onChange={(e) => setFOutlet(e.target.value)}
                  placeholder="Nama outlet"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="area">Area</Label>
                <Input
                  id="area"
                  value={fArea}
                  onChange={(e) => setFArea(e.target.value)}
                  placeholder="Misal: Jakarta Pusat"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="price">Harga Komp. (Rp)</Label>
                <Input
                  id="price"
                  type="number"
                  value={fPrice}
                  onChange={(e) => setFPrice(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ourPrice">Harga Kami (Rp)</Label>
                <Input
                  id="ourPrice"
                  type="number"
                  value={fOurPrice}
                  onChange={(e) => setFOurPrice(e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="date">Tanggal</Label>
                <Input
                  id="date"
                  type="date"
                  value={fDate}
                  onChange={(e) => setFDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="note">Catatan</Label>
                <Input
                  id="note"
                  value={fNote}
                  onChange={(e) => setFNote(e.target.value)}
                  placeholder="opsional"
                />
              </div>
            </div>
            <Button className="w-full" onClick={submit} disabled={submitting}>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Simpan Catatan Harga
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">
                  Tren Harga{trendProduct ? `: ${trendProduct}` : ""}
                </CardTitle>
                <CardDescription>Perbandingan harga kami vs kompetitor</CardDescription>
              </div>
              <div className="flex gap-2">
                <Select value={trendProduct} onValueChange={setTrendProduct}>
                  <SelectTrigger className="h-8 w-44 text-xs">
                    <SelectValue placeholder="Pilih produk" />
                  </SelectTrigger>
                  <SelectContent>
                    {productNames.map((n) => (
                      <SelectItem key={n} value={n}>
                        {n}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={trendDays} onValueChange={setTrendDays}>
                  <SelectTrigger className="h-8 w-24 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 hari</SelectItem>
                    <SelectItem value="30">30 hari</SelectItem>
                    <SelectItem value="90">90 hari</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {trend && trend.series.length > 0 ? (
              <LineChart
                data={trend.series}
                xKey="date"
                series={[
                  { key: "us", label: "Harga Kami", color: "hsl(var(--primary))" },
                  { key: "comp", label: "Kompetitor", color: "hsl(var(--destructive))", dashed: true },
                ]}
                height={260}
                formatValue={(v) => formatCurrency(v)}
              />
            ) : (
              <div className="flex h-64 items-center justify-center rounded-lg border border-dashed bg-muted/30 text-sm text-muted-foreground">
                {trendProduct
                  ? "Belum ada data cukup untuk produk ini."
                  : "Pilih produk untuk melihat tren."}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {trend && trend.insight && (
        <Card className="border-primary/30 bg-primary/[0.03]">
          <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">Insight Tren</p>
                <Badge variant="info">Auto-generated</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{trend.insight}</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-base">Histori Harga Kompetitor</CardTitle>
              <CardDescription>
                {loading ? "memuat..." : `${filtered.length} catatan`}
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 sm:w-56"
                  placeholder="Cari outlet/brand..."
                />
              </div>
              <Select value={productFilter} onValueChange={setProductFilter}>
                <SelectTrigger className="sm:w-52">
                  <SelectValue placeholder="Filter produk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL}>Semua Produk</SelectItem>
                  {productNames.map((p) => (
                    <SelectItem key={p} value={p}>
                      {p}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          {loading ? (
            <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat data...
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">
              Belum ada catatan harga. Mulai dari form di sebelah kiri.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Produk</TableHead>
                  <TableHead>Kompetitor</TableHead>
                  <TableHead>Outlet · Area</TableHead>
                  <TableHead className="text-right">Harga Komp.</TableHead>
                  <TableHead className="text-right">Harga Kami</TableHead>
                  <TableHead className="text-right">Selisih</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Catatan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row) => {
                  const diff = row.ourPrice - row.price;
                  const Icon =
                    diff > 0 ? TrendingDown : diff < 0 ? TrendingUp : Minus;
                  const tone =
                    diff > 0
                      ? "text-destructive"
                      : diff < 0
                        ? "text-success"
                        : "text-muted-foreground";
                  return (
                    <TableRow key={row.id}>
                      <TableCell className="font-medium">{row.productName}</TableCell>
                      <TableCell>{row.competitor}</TableCell>
                      <TableCell>
                        <div className="leading-tight">
                          <p className="text-sm">{row.outlet}</p>
                          <p className="text-xs text-muted-foreground">{row.area}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(row.price)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(row.ourPrice)}
                      </TableCell>
                      <TableCell className={`text-right ${tone}`}>
                        <span className="inline-flex items-center gap-1">
                          <Icon className="h-3 w-3" />
                          {formatCurrency(Math.abs(diff))}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground">
                        {row.observedAt}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {row.note ?? "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
