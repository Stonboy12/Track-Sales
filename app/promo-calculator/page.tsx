"use client";

import * as React from "react";
import { Calculator, Save, Plus, Sparkles, Copy, Trash2 } from "lucide-react";
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
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";

interface Scenario {
  id: string;
  name: string;
  basePrice: number;
  qty: number;
  discountPct: number;
  bundling: number;
  cashback: number;
}

const initialScenarios: Scenario[] = [
  { id: "s1", name: "Skenario Reguler", basePrice: 7500, qty: 24, discountPct: 5, bundling: 0, cashback: 0 },
  { id: "s2", name: "Skenario Bundling", basePrice: 7500, qty: 24, discountPct: 0, bundling: 2, cashback: 0 },
  { id: "s3", name: "Skenario Cashback", basePrice: 7500, qty: 24, discountPct: 3, bundling: 0, cashback: 5000 },
];

function calc(s: Scenario) {
  const gross = s.basePrice * s.qty;
  const discountAmount = (gross * s.discountPct) / 100;
  const bundlingValue = s.bundling * s.basePrice;
  const finalPrice = gross - discountAmount - bundlingValue - s.cashback;
  const effectiveQty = s.qty + s.bundling;
  const pricePerUnit = effectiveQty > 0 ? finalPrice / effectiveQty : 0;
  const savingsPct = gross > 0 ? ((gross - finalPrice) / gross) * 100 : 0;
  return {
    gross,
    discountAmount,
    bundlingValue,
    finalPrice,
    effectiveQty,
    pricePerUnit,
    savingsPct,
  };
}

export default function PromoCalculatorPage() {
  const [primary, setPrimary] = React.useState<Scenario>(initialScenarios[0]);
  const [scenarios, setScenarios] = React.useState<Scenario[]>(initialScenarios);

  const result = calc(primary);

  const updatePrimary = (patch: Partial<Scenario>) => {
    setPrimary((prev) => ({ ...prev, ...patch }));
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Promo & Discount Calculator"
        description="Simulasikan diskon, bundling, dan cashback secara real-time."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4" /> Simpan Skenario
            </Button>
            <Button size="sm">
              <Sparkles className="h-4 w-4" /> Rekomendasi AI
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Input Cepat</CardTitle>
            <CardDescription>Hasil terhitung otomatis di sebelah kanan.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="bp">Harga Awal per Unit (Rp)</Label>
                <Input
                  id="bp"
                  type="number"
                  value={primary.basePrice}
                  onChange={(e) =>
                    updatePrimary({ basePrice: Number(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="qty">Jumlah Unit</Label>
                <Input
                  id="qty"
                  type="number"
                  value={primary.qty}
                  onChange={(e) =>
                    updatePrimary({ qty: Number(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
            <Separator />
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5">
                <Label htmlFor="disc">Diskon (%)</Label>
                <Input
                  id="disc"
                  type="number"
                  value={primary.discountPct}
                  onChange={(e) =>
                    updatePrimary({ discountPct: Number(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="bundle">Bundling Gratis (unit)</Label>
                <Input
                  id="bundle"
                  type="number"
                  value={primary.bundling}
                  onChange={(e) =>
                    updatePrimary({ bundling: Number(e.target.value) || 0 })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cb">Cashback (Rp)</Label>
                <Input
                  id="cb"
                  type="number"
                  value={primary.cashback}
                  onChange={(e) =>
                    updatePrimary({ cashback: Number(e.target.value) || 0 })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-primary/[0.03]">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Hasil Perhitungan</CardTitle>
              <Calculator className="h-5 w-5 text-primary" />
            </div>
            <CardDescription>Update otomatis saat Anda mengetik.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Row label="Harga sebelum promo" value={formatCurrency(result.gross)} />
              <Row
                label={`Diskon (${primary.discountPct}%)`}
                value={`- ${formatCurrency(result.discountAmount)}`}
                tone="muted"
              />
              <Row
                label={`Bundling (${primary.bundling} unit)`}
                value={`- ${formatCurrency(result.bundlingValue)}`}
                tone="muted"
              />
              <Row
                label="Cashback"
                value={`- ${formatCurrency(primary.cashback)}`}
                tone="muted"
              />
              <Separator />
              <Row
                label="Total Bayar"
                value={formatCurrency(result.finalPrice)}
                tone="primary"
                strong
              />
              <Row
                label="Total Unit Diterima"
                value={`${result.effectiveQty} unit`}
              />
              <Row
                label="Harga Efektif per Unit"
                value={formatCurrency(result.pricePerUnit)}
              />
            </div>

            <div className="rounded-lg border bg-background p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Total Hemat</p>
                <Badge variant="success" className="text-sm">
                  {result.savingsPct.toFixed(1)}%
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Customer hemat {formatCurrency(result.gross - result.finalPrice)} dibanding
                harga normal.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm">
                <Copy className="h-4 w-4" /> Copy Hasil
              </Button>
              <Button size="sm">
                <Save className="h-4 w-4" /> Simpan
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <div>
            <CardTitle className="text-base">Simulasi Multi-Skenario</CardTitle>
            <CardDescription>
              Bandingkan beberapa kombinasi promo sekaligus.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4" /> Tambah Skenario
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {scenarios.map((s) => {
              const r = calc(s);
              return (
                <div key={s.id} className="space-y-3 rounded-lg border bg-background p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{s.name}</p>
                    <Button size="icon" variant="ghost" className="h-7 w-7">
                      <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Diskon</span>
                      <span>{s.discountPct}%</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Bundling</span>
                      <span>{s.bundling} unit</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Cashback</span>
                      <span>{formatCurrency(s.cashback)}</span>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground">Total Bayar</p>
                    <p className="text-lg font-semibold">{formatCurrency(r.finalPrice)}</p>
                  </div>
                  <Badge variant="success" className="w-fit">
                    Hemat {r.savingsPct.toFixed(1)}%
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Row({
  label,
  value,
  tone = "default",
  strong,
}: {
  label: string;
  value: string;
  tone?: "default" | "muted" | "primary";
  strong?: boolean;
}) {
  const valueClass =
    tone === "muted"
      ? "text-muted-foreground"
      : tone === "primary"
        ? "text-primary"
        : "text-foreground";
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`${strong ? "text-lg font-semibold" : "text-sm font-medium"} ${valueClass}`}>
        {value}
      </span>
    </div>
  );
}
