"use client";

import * as React from "react";
import { Plus, Search, Pencil, Trash2, Package, Loader2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api, ApiClientError } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import type { Product, StockStatus } from "@/server/db/types";

type Mode = "create" | "edit";

interface FormState {
  sku: string;
  name: string;
  brand: string;
  category: string;
  price: string;
  stockStatus: StockStatus;
  description: string;
  sellingPoints: string; // joined by newline
  promo: string;
}

const EMPTY: FormState = {
  sku: "",
  name: "",
  brand: "",
  category: "",
  price: "0",
  stockStatus: "in_stock",
  description: "",
  sellingPoints: "",
  promo: "",
};

const stockTone: Record<StockStatus, "success" | "warning" | "destructive"> = {
  in_stock: "success",
  low: "warning",
  out: "destructive",
};

const stockLabel: Record<StockStatus, string> = {
  in_stock: "Tersedia",
  low: "Stok Rendah",
  out: "Habis",
};

export function SkuManager({
  initial,
  initialError,
}: {
  initial: Product[];
  initialError: string | null;
}) {
  const [items, setItems] = React.useState<Product[]>(initial);
  const [search, setSearch] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [mode, setMode] = React.useState<Mode>("create");
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState<FormState>(EMPTY);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(initialError);
  const [info, setInfo] = React.useState<string | null>(null);

  function openCreate() {
    setMode("create");
    setEditingId(null);
    setForm(EMPTY);
    setError(null);
    setOpen(true);
  }

  function openEdit(p: Product) {
    setMode("edit");
    setEditingId(p.id);
    setForm({
      sku: p.sku,
      name: p.name,
      brand: p.brand,
      category: p.category,
      price: String(p.price),
      stockStatus: p.stockStatus,
      description: p.description,
      sellingPoints: (p.sellingPoints ?? []).join("\n"),
      promo: p.promo ?? "",
    });
    setError(null);
    setOpen(true);
  }

  async function refresh() {
    try {
      const data = await api.get<Product[]>("/api/products");
      setItems(data);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Gagal memuat ulang SKU.");
    }
  }

  async function submit() {
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        sku: form.sku.trim(),
        name: form.name.trim(),
        brand: form.brand.trim(),
        category: form.category.trim(),
        price: Number(form.price) || 0,
        stockStatus: form.stockStatus,
        description: form.description.trim(),
        sellingPoints: form.sellingPoints
          .split("\n")
          .map((s) => s.trim())
          .filter(Boolean),
        promo: form.promo.trim(),
        faqs: [] as { q: string; a: string }[],
      };
      if (mode === "create") {
        await api.post<Product>("/api/products", payload);
        setInfo(`SKU ${payload.sku} berhasil ditambahkan.`);
      } else if (editingId) {
        await api.patch<Product>(`/api/products/${editingId}`, payload);
        setInfo(`SKU ${payload.sku} berhasil diperbarui.`);
      }
      setOpen(false);
      await refresh();
    } catch (e) {
      setError(
        e instanceof ApiClientError
          ? e.message
          : "Gagal menyimpan SKU."
      );
    } finally {
      setSubmitting(false);
    }
  }

  // Note: products module belum punya DELETE endpoint; cukup soft-disable lewat
  // stockStatus="out". Kalau nanti perlu hard delete, tambahkan ke controller.
  async function softDisable(p: Product) {
    if (!confirm(`Tandai "${p.name}" sebagai habis stok?`)) return;
    try {
      await api.patch<Product>(`/api/products/${p.id}`, { stockStatus: "out" });
      setInfo(`Stok ${p.name} ditandai habis.`);
      await refresh();
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Gagal mengubah status.");
    }
  }

  const filtered = items.filter((p) =>
    !search
      ? true
      : `${p.name} ${p.sku} ${p.brand}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-5 w-5 text-primary" />
              Daftar SKU
            </CardTitle>
            <CardDescription>{items.length} produk · live dari InsForge</CardDescription>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 sm:w-56"
                placeholder="Cari SKU/nama/brand..."
              />
            </div>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" /> Tambah SKU
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {info && (
          <p className="mb-3 rounded-md border border-success/30 bg-success/10 px-3 py-2 text-xs text-success">
            {info}
          </p>
        )}
        {error && (
          <p className="mb-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
            {error}
          </p>
        )}

        {filtered.length === 0 ? (
          <div className="rounded-lg border border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">
            {items.length === 0
              ? "Belum ada SKU. Klik Tambah SKU atau jalankan POST /api/admin/seed."
              : "Tidak ada SKU cocok dengan pencarian."}
          </div>
        ) : (
          <ul className="divide-y">
            {filtered.map((p) => (
              <li key={p.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted">
                  <Package className="h-5 w-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.sku} · {p.brand} · {p.category}
                  </p>
                </div>
                <span className="text-sm font-semibold">{formatCurrency(p.price)}</span>
                <Badge variant={stockTone[p.stockStatus]}>{stockLabel[p.stockStatus]}</Badge>
                <Button size="icon" variant="ghost" onClick={() => openEdit(p)}>
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-destructive"
                  onClick={() => softDisable(p)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "Tambah SKU" : "Edit SKU"}</DialogTitle>
            <DialogDescription>
              Hanya admin yang bisa menyimpan. Validasi akhir di server.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="f-sku">SKU code</Label>
              <Input
                id="f-sku"
                value={form.sku}
                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                disabled={mode === "edit"}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-brand">Brand</Label>
              <Input
                id="f-brand"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="f-name">Nama</Label>
              <Input
                id="f-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-cat">Kategori</Label>
              <Input
                id="f-cat"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="f-price">Harga retail (Rp)</Label>
              <Input
                id="f-price"
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Status stok</Label>
              <Select
                value={form.stockStatus}
                onValueChange={(v) => setForm({ ...form, stockStatus: v as StockStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="in_stock">Tersedia</SelectItem>
                  <SelectItem value="low">Stok Rendah</SelectItem>
                  <SelectItem value="out">Habis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="f-desc">Deskripsi</Label>
              <Textarea
                id="f-desc"
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="f-sp">Selling points (1 baris = 1 poin)</Label>
              <Textarea
                id="f-sp"
                rows={3}
                value={form.sellingPoints}
                onChange={(e) => setForm({ ...form, sellingPoints: e.target.value })}
                placeholder="Margin retailer 18%&#10;Top seller di kategori..."
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="f-promo">Catatan promo (opsional)</Label>
              <Input
                id="f-promo"
                value={form.promo}
                onChange={(e) => setForm({ ...form, promo: e.target.value })}
              />
            </div>
          </div>
          {error && (
            <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Batal
            </Button>
            <Button onClick={submit} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Simpan"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
