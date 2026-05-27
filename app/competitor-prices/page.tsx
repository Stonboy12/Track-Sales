"use client";

import * as React from "react";
import {
  Plus,
  Sparkles,
  Search,
  TrendingUp,
  TrendingDown,
  Minus,
  Filter,
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
import {
  competitorPrices,
  priceTrend,
  products,
} from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

export default function CompetitorPricesPage() {
  const [productFilter, setProductFilter] = React.useState("all");
  const [search, setSearch] = React.useState("");

  const filtered = competitorPrices.filter((p) => {
    if (productFilter !== "all" && p.product !== productFilter) return false;
    if (
      search &&
      !`${p.competitor} ${p.outlet}`.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Competitor Price Tracker"
        description="Lacak pergerakan harga kompetitor dan dapatkan insight cepat."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" /> Filter Lanjutan
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4" /> Catat Harga
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Input form */}
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
              <Select>
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
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="comp">Brand Kompetitor</Label>
              <Input id="comp" placeholder="Misal: Ultra Milk" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="outlet">Outlet</Label>
              <Input id="outlet" placeholder="Nama outlet" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="price">Harga (Rp)</Label>
                <Input id="price" type="number" placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="date">Tanggal</Label>
                <Input id="date" type="date" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="note">Catatan (opsional)</Label>
              <Input id="note" placeholder="Misal: promo PWP" />
            </div>
            <Button className="w-full">Simpan Catatan Harga</Button>
          </CardContent>
        </Card>

        {/* Trend chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Tren Harga: Susu UHT Coklat 250ml</CardTitle>
                <CardDescription>Perbandingan harga kami vs kompetitor</CardDescription>
              </div>
              <Select defaultValue="30">
                <SelectTrigger className="h-8 w-32 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 hari</SelectItem>
                  <SelectItem value="30">30 hari</SelectItem>
                  <SelectItem value="90">90 hari</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <LineChart
              data={priceTrend}
              xKey="date"
              series={[
                { key: "us", label: "Harga Kami", color: "hsl(var(--primary))" },
                { key: "comp", label: "Kompetitor", color: "hsl(var(--destructive))", dashed: true },
              ]}
              height={260}
              formatValue={(v) => formatCurrency(v)}
            />
          </CardContent>
        </Card>
      </div>

      {/* AI insight */}
      <Card className="border-primary/30 bg-primary/[0.03]">
        <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-5 w-5" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-semibold">AI Insight</p>
              <Badge variant="info">Auto-generated</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Kompetitor <span className="font-medium text-foreground">Ultra Milk</span> menurunkan harga
              <span className="font-medium text-foreground"> 4%</span> dalam 30 hari terakhir di Jakarta Pusat.
              Pertimbangkan promo PWP atau bundling 2 dus untuk mempertahankan margin di outlet segmen A.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <Badge variant="warning">Risiko medium</Badge>
              <Badge variant="muted">3 outlet terdampak</Badge>
              <Badge variant="muted">Direkomendasikan: bundling</Badge>
            </div>
          </div>
          <Button variant="outline" size="sm">
            Lihat Rekomendasi
          </Button>
        </CardContent>
      </Card>

      {/* Price history */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="text-base">Histori Harga Kompetitor</CardTitle>
              <CardDescription>{filtered.length} catatan</CardDescription>
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
                  <SelectItem value="all">Semua Produk</SelectItem>
                  {Array.from(new Set(competitorPrices.map((c) => c.product))).map(
                    (p) => (
                      <SelectItem key={p} value={p}>
                        {p}
                      </SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
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
                    <TableCell className="font-medium">{row.product}</TableCell>
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
                      {row.date}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {row.note ?? "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
