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
  Loader2,
  Save,
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
import { api, ApiClientError } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import type { Outlet, VisitOutcome } from "@/server/db/types";

interface VisitEntry {
  localId: string;
  outletId: string;
  outletName: string;
  outcome: VisitOutcome;
  orderValue: number;
  notes: string;
}

interface GenerateResp {
  summary: { total: number; success: number; orderTotal: number };
  generatedText: string;
}

interface MeResp {
  id: string;
  name: string;
  email: string;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function newVisit(): VisitEntry {
  return {
    localId: `v_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    outletId: "",
    outletName: "",
    outcome: "order",
    orderValue: 0,
    notes: "",
  };
}

export default function DailyReportPage() {
  const [outlets, setOutlets] = React.useState<Outlet[]>([]);
  const [me, setMe] = React.useState<MeResp | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);

  const [date, setDate] = React.useState(todayStr());
  const [generalNotes, setGeneralNotes] = React.useState("");
  const [visits, setVisits] = React.useState<VisitEntry[]>([newVisit()]);
  const [generated, setGenerated] = React.useState<GenerateResp | null>(null);
  const [generating, setGenerating] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [outletsData, meData] = await Promise.all([
          api.get<Outlet[]>("/api/outlets", { query: { limit: 200 } }),
          api.get<MeResp>("/api/auth/me"),
        ]);
        setOutlets(outletsData);
        setMe(meData);
      } catch (e) {
        setError(e instanceof ApiClientError ? e.message : "Gagal memuat data.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function update(localId: string, patch: Partial<VisitEntry>) {
    setVisits((prev) => prev.map((v) => (v.localId === localId ? { ...v, ...patch } : v)));
  }

  function setOutlet(localId: string, outletId: string) {
    const o = outlets.find((x) => x.id === outletId);
    update(localId, { outletId, outletName: o?.name ?? "" });
  }

  async function generate() {
    if (visits.length === 0 || visits.some((v) => !v.outletId)) {
      setError("Lengkapi outlet untuk semua visit.");
      return;
    }
    setGenerating(true);
    setError(null);
    try {
      const resp = await api.post<GenerateResp>("/api/reports/generate", {
        date,
        visits: visits.map((v) => ({
          outletId: v.outletId,
          outletName: v.outletName,
          outcome: v.outcome,
          orderValue: v.orderValue,
          notes: v.notes || undefined,
        })),
        generalNotes: generalNotes || undefined,
      });
      setGenerated(resp);
      setInfo("Laporan berhasil di-generate.");
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Gagal generate.");
    } finally {
      setGenerating(false);
    }
  }

  async function save() {
    if (!generated) {
      setError("Generate dulu sebelum simpan.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api.post("/api/reports", {
        date,
        visits: visits.map((v) => ({
          outletId: v.outletId,
          outletName: v.outletName,
          outcome: v.outcome,
          orderValue: v.orderValue,
          notes: v.notes || undefined,
        })),
        generalNotes: generalNotes || undefined,
        generatedText: generated.generatedText,
      });
      setInfo("Laporan tersimpan ke server.");
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Gagal menyimpan.");
    } finally {
      setSaving(false);
    }
  }

  async function copyText() {
    if (!generated) return;
    try {
      await navigator.clipboard.writeText(generated.generatedText);
      setInfo("Teks tersalin ke clipboard.");
    } catch {
      setError("Browser tidak mendukung copy.");
    }
  }

  function downloadText() {
    if (!generated) return;
    const blob = new Blob([generated.generatedText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `laporan-${date}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const totalOrder = visits.reduce((s, v) => s + (v.orderValue || 0), 0);
  const successVisits = visits.filter((v) => v.outcome === "order").length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Daily Sales Report"
        description="Catat visit hari ini, sistem akan susun laporan otomatis untuk Anda."
        actions={
          <>
            <Button variant="outline" size="sm" disabled>
              <Calendar className="h-4 w-4" /> Riwayat Laporan
            </Button>
            <Button size="sm" onClick={generate} disabled={generating}>
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generate Laporan
            </Button>
          </>
        }
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

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Info Umum</CardTitle>
              <CardDescription>Detail tanggal dan salesman.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="date">Tanggal</Label>
                <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sp">Salesperson</Label>
                <Input id="sp" value={me?.name ?? "—"} disabled />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-base">Visit Harian</CardTitle>
                <CardDescription>{visits.length} kunjungan</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={() => setVisits((p) => [...p, newVisit()])}>
                <Plus className="h-4 w-4" /> Tambah
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {loading && (
                <div className="flex h-20 items-center justify-center text-sm text-muted-foreground">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat outlet...
                </div>
              )}
              {!loading && visits.map((v, i) => (
                <div key={v.localId} className="space-y-3 rounded-lg border bg-background p-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="muted">Visit #{i + 1}</Badge>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-muted-foreground"
                      onClick={() => setVisits((p) => p.filter((x) => x.localId !== v.localId))}
                      disabled={visits.length === 1}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Outlet</Label>
                      <Select value={v.outletId} onValueChange={(val) => setOutlet(v.localId, val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih outlet" />
                        </SelectTrigger>
                        <SelectContent>
                          {outlets.map((o) => (
                            <SelectItem key={o.id} value={o.id}>
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
                        onValueChange={(val) => update(v.localId, { outcome: val as VisitOutcome })}
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
                      onChange={(e) => update(v.localId, { orderValue: Number(e.target.value) || 0 })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Catatan</Label>
                    <Textarea
                      rows={2}
                      placeholder="Apa yang terjadi saat visit?"
                      value={v.notes}
                      onChange={(e) => update(v.localId, { notes: e.target.value })}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Catatan Umum Hari Ini</CardTitle>
              <CardDescription>Observasi lapangan / hal yang perlu dilaporkan.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                rows={4}
                placeholder="Misal: kemacetan area Sudirman cukup parah..."
                value={generalNotes}
                onChange={(e) => setGeneralNotes(e.target.value)}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="lg:sticky lg:top-20">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Hasil Laporan Otomatis</CardTitle>
                  <CardDescription>Preview ringkasan harian Anda.</CardDescription>
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

              <div className="rounded-lg bg-muted/40 p-4 text-sm">
                {generated ? (
                  <pre className="whitespace-pre-wrap font-sans leading-relaxed">{generated.generatedText}</pre>
                ) : (
                  <p className="text-muted-foreground">
                    Klik <strong>Generate Laporan</strong> untuk melihat narasi otomatis.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-4 gap-2">
                <Button variant="outline" size="sm" onClick={copyText} disabled={!generated}>
                  <Copy className="h-4 w-4" /> Copy
                </Button>
                <Button variant="outline" size="sm" onClick={downloadText} disabled={!generated}>
                  <Download className="h-4 w-4" /> Download
                </Button>
                <Button variant="outline" size="sm" disabled={!generated}>
                  <Mail className="h-4 w-4" /> Email
                </Button>
                <Button size="sm" onClick={save} disabled={!generated || saving}>
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Simpan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
