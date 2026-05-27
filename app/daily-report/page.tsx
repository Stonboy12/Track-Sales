"use client";

import * as React from "react";
import {
  Sparkles,
  Copy,
  Download,
  Mail,
  Calendar,
  Plus,
  Trash2,
  CheckCircle2,
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { outlets } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";

interface VisitEntry {
  id: string;
  outlet: string;
  outcome: string;
  orderValue: number;
  notes: string;
}

export default function DailyReportPage() {
  const [date, setDate] = React.useState("2026-05-27");
  const [salesperson, setSalesperson] = React.useState("Adi Pratama");
  const [generalNotes, setGeneralNotes] = React.useState("");
  const [visits, setVisits] = React.useState<VisitEntry[]>([
    { id: "v1", outlet: outlets[0].name, outcome: "order", orderValue: 1850000, notes: "Order rutin, request POSM tambahan" },
    { id: "v2", outlet: outlets[1].name, outcome: "order", orderValue: 4200000, notes: "Tambah SKU baru kopi sachet" },
    { id: "v3", outlet: outlets[3].name, outcome: "no_order", orderValue: 0, notes: "Stok masih banyak, follow up minggu depan" },
  ]);

  const [generated, setGenerated] = React.useState(false);

  const totalOrder = visits.reduce((sum, v) => sum + v.orderValue, 0);
  const successVisits = visits.filter((v) => v.outcome === "order").length;

  const updateVisit = (id: string, patch: Partial<VisitEntry>) => {
    setVisits((prev) => prev.map((v) => (v.id === id ? { ...v, ...patch } : v)));
  };

  const addVisit = () => {
    setVisits((prev) => [
      ...prev,
      {
        id: `v${Date.now()}`,
        outlet: "",
        outcome: "order",
        orderValue: 0,
        notes: "",
      },
    ]);
  };

  const removeVisit = (id: string) => {
    setVisits((prev) => prev.filter((v) => v.id !== id));
  };

  const generateReport = () => setGenerated(true);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Sales Report"
        description="Catat visit hari ini, sistem akan susun laporan otomatis untuk Anda."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4" /> Riwayat Laporan
            </Button>
            <Button size="sm" onClick={generateReport}>
              <Sparkles className="h-4 w-4" /> Generate Laporan
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Form */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Info Umum</CardTitle>
              <CardDescription>Detail tanggal dan salesman.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="date">Tanggal</Label>
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sp">Salesperson</Label>
                <Input
                  id="sp"
                  value={salesperson}
                  onChange={(e) => setSalesperson(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-base">Visit Harian</CardTitle>
                <CardDescription>{visits.length} kunjungan hari ini</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={addVisit}>
                <Plus className="h-4 w-4" /> Tambah
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {visits.map((v, i) => (
                <div
                  key={v.id}
                  className="space-y-3 rounded-lg border bg-background p-3"
                >
                  <div className="flex items-center justify-between">
                    <Badge variant="muted">Visit #{i + 1}</Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground"
                      onClick={() => removeVisit(v.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Outlet</Label>
                      <Select
                        value={v.outlet}
                        onValueChange={(val) => updateVisit(v.id, { outlet: val })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih outlet" />
                        </SelectTrigger>
                        <SelectContent>
                          {outlets.map((o) => (
                            <SelectItem key={o.id} value={o.name}>
                              {o.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs">Hasil</Label>
                      <Select
                        value={v.outcome}
                        onValueChange={(val) => updateVisit(v.id, { outcome: val })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="order">Order</SelectItem>
                          <SelectItem value="no_order">No Order</SelectItem>
                          <SelectItem value="follow_up">Follow Up</SelectItem>
                          <SelectItem value="closed">Outlet Tutup</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Nilai Order (Rp)</Label>
                    <Input
                      type="number"
                      value={v.orderValue}
                      onChange={(e) =>
                        updateVisit(v.id, { orderValue: Number(e.target.value) || 0 })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Catatan</Label>
                    <Textarea
                      rows={2}
                      placeholder="Apa yang terjadi saat visit?"
                      value={v.notes}
                      onChange={(e) => updateVisit(v.id, { notes: e.target.value })}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Catatan Umum Hari Ini</CardTitle>
              <CardDescription>
                Tambahkan observasi lapangan atau hal yang perlu dilaporkan.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={4}
                placeholder="Misal: kemacetan area Sudirman cukup parah, kompetitor agresif promo..."
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        {/* Output panel */}
        <div className="space-y-4">
          <Card className="lg:sticky lg:top-20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Hasil Laporan Otomatis</CardTitle>
                  <CardDescription>
                    Preview ringkasan harian Anda.
                  </CardDescription>
                </div>
                {generated && (
                  <Badge variant="success" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" /> Generated
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-md border bg-background p-3 text-center">
                  <p className="text-xs text-muted-foreground">Total Visit</p>
                  <p className="mt-1 text-lg font-semibold">{visits.length}</p>
                </div>
                <div className="rounded-md border bg-background p-3 text-center">
                  <p className="text-xs text-muted-foreground">Berhasil</p>
                  <p className="mt-1 text-lg font-semibold text-success">{successVisits}</p>
                </div>
                <div className="rounded-md border bg-background p-3 text-center">
                  <p className="text-xs text-muted-foreground">Total Order</p>
                  <p className="mt-1 text-lg font-semibold">{formatCurrency(totalOrder)}</p>
                </div>
              </div>

              <Separator />

              <div className="rounded-lg bg-muted/40 p-4 text-sm leading-relaxed">
                <p className="font-semibold">Laporan Harian — {date}</p>
                <p className="text-muted-foreground">Salesperson: {salesperson}</p>
                <div className="mt-3 space-y-2">
                  <p>
                    Hari ini total <strong>{visits.length} visit</strong> dilakukan dengan{" "}
                    <strong>{successVisits} order berhasil</strong>, total nilai order
                    sebesar <strong>{formatCurrency(totalOrder)}</strong>.
                  </p>
                  <div>
                    <p className="font-medium">Detail Kunjungan:</p>
                    <ol className="ml-5 mt-1 list-decimal space-y-1 text-muted-foreground">
                      {visits.map((v, i) => (
                        <li key={v.id}>
                          <span className="text-foreground">{v.outlet || "—"}</span>:{" "}
                          {v.outcome === "order"
                            ? `order ${formatCurrency(v.orderValue)}`
                            : v.outcome.replace("_", " ")}
                          {v.notes && ` — ${v.notes}`}
                        </li>
                      ))}
                    </ol>
                  </div>
                  {generalNotes && (
                    <div>
                      <p className="font-medium">Catatan Umum:</p>
                      <p className="text-muted-foreground">{generalNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Button variant="outline" size="sm">
                  <Copy className="h-4 w-4" /> Copy
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4" /> Download
                </Button>
                <Button size="sm">
                  <Mail className="h-4 w-4" /> Send Email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
