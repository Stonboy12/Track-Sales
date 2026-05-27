"use client";

import * as React from "react";
import { Plus, Pencil, Trash2, Tag, Loader2, Search } from "lucide-react";
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
import { Switch } from "@/components/ui/switch";
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
import { formatCurrency, formatPercent } from "@/lib/utils";
import type { Product, Promo } from "@/server/db/types";

type Mode = "create" | "edit";
type PromoType = Promo["type"];

interface FormState {
  name: string;
  description: string;
  productId: string; // empty string = no product (cross-SKU)
  type: PromoType;
  discountPct: string;
  bundlingQty: string;
  cashbackAmount: string;
  minQty: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function plusDays(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const EMPTY: FormState = {
  name: "",
  description: "",
  productId: "",
  type: "discount",
  discountPct: "0",
  bundlingQty: "0",
  cashbackAmount: "0",
  minQty: "1",
  startsAt: todayStr(),
  endsAt: plusDays(30),
  isActive: true,
};

const typeLabel: Record<PromoType, string> = {
  discount: "Diskon",
  bundling: "Bundling",
  cashback: "Cashback",
  pwp: "PWP",
};

const NO_PRODUCT = "__none__";

export function PromoManager({
  initial,
  products,
  initialError,
}: {
  initial: Promo[];
  products: Product[];
  initialError: string | null;
}) {
  const [items, setItems] = React.useState<Promo[]>(initial);
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

  function openEdit(p: Promo) {
    setMode("edit");
    setEditingId(p.id);
    setForm({
      name: p.name,
      description: p.description ?? "",
      productId: p.productId ?? "",
      type: p.type,
      discountPct: String(p.discountPct),
      bundlingQty: String(p.bundlingQty),
      cashbackAmount: String(p.cashbackAmount),
      minQty: String(p.minQty),
      startsAt: p.startsAt,
      endsAt: p.endsAt,
      isActive: p.isActive,
    });
    setError(null);
    setOpen(true);
  }

  async function refresh() {
    try {
      const data = await api.get<Promo[]>("/api/promos");
      setItems(data);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Gagal memuat ulang promo.");
    }
  }

  async function submit() {
    setError(null);
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        productId: form.productId || undefined,
        type: form.type,
        discountPct: Number(form.discountPct) || 0,
        bundlingQty: Number(form.bundlingQty) || 0,
        cashbackAmount: Number(form.cashbackAmount) || 0,
        minQty: Number(form.minQty) || 1,
        startsAt: form.startsAt,
        endsAt: form.endsAt,
        isActive: form.isActive,
      };
      if (mode === "create") {
        await api.post<Promo>("/api/promos", payload);
        setInfo(`Promo "${payload.name}" berhasil dibuat.`);
      } else if (editingId) {
        await api.patch<Promo>(`/api/promos/${editingId}`, payload);
        setInfo(`Promo "${payload.name}" berhasil diperbarui.`);
      }
      setOpen(false);
      await refresh();
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Gagal menyimpan promo.");
    } finally {
      setSubmitting(false);
    }
  }

  async function remove(p: Promo) {
    if (!confirm(`Hapus promo "${p.name}"?`)) return;
    try {
      await api.delete(`/api/promos/${p.id}`);
      setInfo(`Promo "${p.name}" dihapus.`);
      await refresh();
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Gagal menghapus promo.");
    }
  }

  async function toggleActive(p: Promo) {
    try {
      await api.patch<Promo>(`/api/promos/${p.id}`, { isActive: !p.isActive });
      await refresh();
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Gagal mengubah status.");
    }
  }

  const filtered = items.filter((p) =>
    !search
      ? true
      : `${p.name} ${p.type} ${p.description ?? ""}`
          .toLowerCase()
          .includes(search.toLowerCase())
  );

  function describePromo(p: Promo) {
    switch (p.type) {
      case "discount":
        return `${formatPercent(p.discountPct, 0)} off, min ${p.minQty} unit`;
      case "bundling":
        return `Beli ${p.minQty} bonus ${p.bundlingQty}`;
      case "cashback":
        return `${formatCurrency(p.cashbackAmount)} cashback, min ${p.minQty} unit`;
      case "pwp":
        return `Purchase with purchase, min ${p.minQty} unit`;
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Tag className="h-5 w-5 text-primary" />
              Daftar Promo
            </CardTitle>
            <CardDescription>{items.length} promo · live dari InsForge</CardDescription>
          </div>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 sm:w-56"
                placeholder="Cari promo..."
              />
            </div>
            <Button size="sm" onClick={openCreate}>
              <Plus className="h-4 w-4" /> Buat Promo
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
              ? "Belum ada promo. Klik Buat Promo untuk mulai."
              : "Tidak ada promo cocok dengan pencarian."}
          </div>
        ) : (
          <ul className="divide-y">
            {filtered.map((p) => {
              const product = products.find((pr) => pr.id === p.productId);
              return (
                <li
                  key={p.id}
                  className="flex flex-col gap-3 py-3 md:flex-row md:items-center first:pt-0 last:pb-0"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-warning/15 text-warning">
                    <Tag className="h-5 w-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">{p.name}</p>
                      <Badge variant="muted" className="text-[10px]">
                        {typeLabel[p.type]}
                      </Badge>
                      {product && (
                        <Badge variant="outline" className="text-[10px]">
                          {product.name}
                        </Badge>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {describePromo(p)} · {p.startsAt} → {p.endsAt}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={p.isActive}
                      onCheckedChange={() => toggleActive(p)}
                    />
                    <Badge variant={p.isActive ? "success" : "muted"}>
                      {p.isActive ? "Aktif" : "Nonaktif"}
                    </Badge>
                    <Button size="icon" variant="ghost" onClick={() => openEdit(p)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => remove(p)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{mode === "create" ? "Buat Promo" : "Edit Promo"}</DialogTitle>
            <DialogDescription>
              Periode dan tipe akan menentukan apakah promo terlihat oleh sales.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="p-name">Nama promo</Label>
              <Input
                id="p-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="p-desc">Deskripsi (opsional)</Label>
              <Textarea
                id="p-desc"
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Tipe</Label>
              <Select
                value={form.type}
                onValueChange={(v) => setForm({ ...form, type: v as PromoType })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="discount">Diskon</SelectItem>
                  <SelectItem value="bundling">Bundling</SelectItem>
                  <SelectItem value="cashback">Cashback</SelectItem>
                  <SelectItem value="pwp">PWP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>SKU terkait (opsional)</Label>
              <Select
                value={form.productId || NO_PRODUCT}
                onValueChange={(v) =>
                  setForm({ ...form, productId: v === NO_PRODUCT ? "" : v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Lintas SKU" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={NO_PRODUCT}>Lintas SKU</SelectItem>
                  {products.map((pr) => (
                    <SelectItem key={pr.id} value={pr.id}>
                      {pr.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {form.type === "discount" && (
              <div className="space-y-1.5">
                <Label htmlFor="p-disc">Diskon (%)</Label>
                <Input
                  id="p-disc"
                  type="number"
                  value={form.discountPct}
                  onChange={(e) => setForm({ ...form, discountPct: e.target.value })}
                />
              </div>
            )}
            {form.type === "bundling" && (
              <div className="space-y-1.5">
                <Label htmlFor="p-bun">Unit bonus</Label>
                <Input
                  id="p-bun"
                  type="number"
                  value={form.bundlingQty}
                  onChange={(e) => setForm({ ...form, bundlingQty: e.target.value })}
                />
              </div>
            )}
            {form.type === "cashback" && (
              <div className="space-y-1.5">
                <Label htmlFor="p-cb">Cashback (Rp)</Label>
                <Input
                  id="p-cb"
                  type="number"
                  value={form.cashbackAmount}
                  onChange={(e) => setForm({ ...form, cashbackAmount: e.target.value })}
                />
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="p-min">Min qty</Label>
              <Input
                id="p-min"
                type="number"
                value={form.minQty}
                onChange={(e) => setForm({ ...form, minQty: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-start">Mulai</Label>
              <Input
                id="p-start"
                type="date"
                value={form.startsAt}
                onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-end">Selesai</Label>
              <Input
                id="p-end"
                type="date"
                value={form.endsAt}
                onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <Switch
                checked={form.isActive}
                onCheckedChange={(v) => setForm({ ...form, isActive: v })}
              />
              <Label>Aktifkan promo ini</Label>
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
