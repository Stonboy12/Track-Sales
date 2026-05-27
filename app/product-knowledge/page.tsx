"use client";

import * as React from "react";
import {
  Search,
  Sparkles,
  Send,
  Package,
  Tag,
  TrendingUp,
  HelpCircle,
  Plus,
  Bot,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { products, type Product } from "@/lib/mock-data";
import { cn, formatCurrency } from "@/lib/utils";

const stockBadge: Record<Product["stockStatus"], { label: string; variant: "success" | "warning" | "destructive" }> = {
  in_stock: { label: "Tersedia", variant: "success" },
  low: { label: "Stok Rendah", variant: "warning" },
  out: { label: "Habis", variant: "destructive" },
};

export default function ProductKnowledgePage() {
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("all");
  const [selectedId, setSelectedId] = React.useState(products[0].id);

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const filtered = products.filter((p) => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== "all" && p.category !== category) return false;
    return true;
  });

  const selected = products.find((p) => p.id === selectedId) ?? products[0];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Knowledge Hub"
        description="Semua info produk yang Anda butuhkan saat selling. Cepat dan terpusat."
        actions={
          <Button size="sm">
            <Plus className="h-4 w-4" /> Tambah Produk
          </Button>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Product list */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Daftar Produk</CardTitle>
            <CardDescription>{filtered.length} produk</CardDescription>
            <div className="space-y-2 pt-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari produk..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kategori</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {filtered.map((p) => {
              const active = p.id === selectedId;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={cn(
                    "flex w-full items-start gap-3 rounded-lg border p-3 text-left transition-colors",
                    active
                      ? "border-primary bg-primary/5"
                      : "border-border bg-background hover:bg-muted/40"
                  )}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted">
                    <Package className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {p.brand} · {p.sku}
                    </p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <span className="text-xs font-semibold">
                        {formatCurrency(p.price)}
                      </span>
                      <Badge variant={stockBadge[p.stockStatus].variant} className="text-[10px]">
                        {stockBadge[p.stockStatus].label}
                      </Badge>
                    </div>
                  </div>
                </button>
              );
            })}
          </CardContent>
        </Card>

        {/* Detail */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">
                  {selected.brand} · {selected.category}
                </p>
                <CardTitle className="mt-1 text-xl">{selected.name}</CardTitle>
                <CardDescription className="mt-0.5">
                  {selected.sku} · Harga {formatCurrency(selected.price)}
                </CardDescription>
              </div>
              <Badge variant={stockBadge[selected.stockStatus].variant}>
                {stockBadge[selected.stockStatus].label}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="desc">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="desc">Deskripsi</TabsTrigger>
                <TabsTrigger value="sell">Selling Point</TabsTrigger>
                <TabsTrigger value="promo">Promo</TabsTrigger>
                <TabsTrigger value="faq">FAQ</TabsTrigger>
              </TabsList>
              <TabsContent value="desc" className="space-y-3">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {selected.description}
                </p>
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">Harga retail</p>
                    <p className="text-sm font-semibold">{formatCurrency(selected.price)}</p>
                  </div>
                  <div className="rounded-md border p-3">
                    <p className="text-xs text-muted-foreground">Brand</p>
                    <p className="text-sm font-semibold">{selected.brand}</p>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="sell" className="space-y-2">
                {selected.sellingPoints.map((point, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-md border bg-background p-3"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                      {i + 1}
                    </div>
                    <p className="text-sm">{point}</p>
                  </div>
                ))}
              </TabsContent>
              <TabsContent value="promo">
                <div className="rounded-lg border bg-warning/5 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-warning/15 text-warning">
                      <Tag className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Promo Aktif</p>
                      <p className="mt-1 text-sm text-muted-foreground">{selected.promo}</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="faq" className="space-y-2">
                {selected.faqs.map((f, i) => (
                  <div key={i} className="rounded-md border bg-background p-3">
                    <p className="flex items-start gap-2 text-sm font-medium">
                      <HelpCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {f.q}
                    </p>
                    <p className="mt-1 pl-6 text-sm text-muted-foreground">{f.a}</p>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* AI Chatbot */}
      <Card className="border-primary/30">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base">AI Product Assistant</CardTitle>
                <CardDescription>
                  Tanya apa saja tentang produk, promo, atau strategi selling.
                </CardDescription>
              </div>
            </div>
            <Badge variant="info" className="gap-1">
              <Sparkles className="h-3 w-3" /> Beta
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-3 rounded-lg border bg-muted/30 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-lg bg-background px-3 py-2 text-sm shadow-sm">
                Halo Adi! Saya bisa bantu jelaskan produk, bandingkan dengan kompetitor,
                atau bikin pitch singkat. Mau mulai dari mana?
              </div>
            </div>
            <div className="flex flex-wrap gap-2 pl-10">
              {[
                "Bandingkan dengan kompetitor",
                "Buatkan pitch 30 detik",
                "Apa promo aktif minggu ini?",
                "Strategi closing untuk segmen A",
              ].map((s) => (
                <button
                  key={s}
                  className="rounded-full border bg-background px-3 py-1 text-xs hover:border-primary hover:text-primary"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Input placeholder="Tanyakan apa pun tentang produk..." />
            <Button size="icon">
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
