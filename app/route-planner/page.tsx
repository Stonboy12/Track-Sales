"use client";

import * as React from "react";
import {
  MapPin,
  Sparkles,
  Save,
  Download,
  GripVertical,
  Search,
  Navigation,
  Clock,
  Phone,
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
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { api, ApiClientError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { Outlet, Priority } from "@/server/db/types";

const priorityVariant: Record<Priority, "destructive" | "warning" | "muted"> = {
  high: "destructive",
  medium: "warning",
  low: "muted",
};

const priorityLabel: Record<Priority, string> = {
  high: "Tinggi",
  medium: "Sedang",
  low: "Rendah",
};

const ALL = "__all__";

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

interface OptimizeStop {
  order: number;
  outletId: string;
  outletName: string;
  area: string;
  priority: Priority;
}

export default function RoutePlannerPage() {
  const [outlets, setOutlets] = React.useState<Outlet[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [info, setInfo] = React.useState<string | null>(null);

  const [search, setSearch] = React.useState("");
  const [areaFilter, setAreaFilter] = React.useState(ALL);
  const [priorityFilter, setPriorityFilter] = React.useState(ALL);
  const [statusFilter, setStatusFilter] = React.useState(ALL);

  const [route, setRoute] = React.useState<Outlet[]>([]);
  const [strategy, setStrategy] = React.useState<"priority" | "area" | "balanced">("priority");
  const [optimizing, setOptimizing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [routeName, setRouteName] = React.useState("");
  const [routeDate, setRouteDate] = React.useState(todayStr());
  const [estimate, setEstimate] = React.useState<{ minutes: number; km: number } | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await api.get<Outlet[]>("/api/outlets", { query: { limit: 200 } });
        setOutlets(data);
        setRoute(data.slice(0, Math.min(4, data.length)));
      } catch (e) {
        setError(e instanceof ApiClientError ? e.message : "Gagal memuat outlet.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const areas = Array.from(new Set(outlets.map((o) => o.area)));

  const filtered = outlets.filter((o) => {
    if (search && !o.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (areaFilter !== ALL && o.area !== areaFilter) return false;
    if (priorityFilter !== ALL && o.priority !== priorityFilter) return false;
    if (statusFilter !== ALL && o.status !== statusFilter) return false;
    return true;
  });

  function toggleOutlet(outlet: Outlet) {
    setRoute((prev) =>
      prev.find((p) => p.id === outlet.id)
        ? prev.filter((p) => p.id !== outlet.id)
        : [...prev, outlet]
    );
    setEstimate(null); // estimasi lama tidak valid lagi
  }

  function moveItem(idx: number, dir: -1 | 1) {
    setRoute((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  }

  async function optimize() {
    if (route.length === 0) {
      setError("Pilih outlet dulu sebelum optimize.");
      return;
    }
    setOptimizing(true);
    setError(null);
    try {
      const result = await api.post<{
        stops: OptimizeStop[];
        estimatedDurationMin: number;
        estimatedDistanceKm: number;
      }>("/api/route-plans/optimize", {
        outletIds: route.map((r) => r.id),
        strategy,
      });
      // urutkan ulang berdasarkan response
      const byId = new Map(route.map((r) => [r.id, r]));
      const reordered = result.stops
        .map((s) => byId.get(s.outletId))
        .filter((o): o is Outlet => Boolean(o));
      setRoute(reordered);
      setEstimate({
        minutes: result.estimatedDurationMin,
        km: result.estimatedDistanceKm,
      });
      setInfo(`Rute dioptimasi (${strategy}). Estimasi ${result.estimatedDurationMin} menit, ${result.estimatedDistanceKm.toFixed(1)} km.`);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Gagal optimize.");
    } finally {
      setOptimizing(false);
    }
  }

  async function saveRoute() {
    if (route.length === 0) {
      setError("Tidak ada stop untuk disimpan.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api.post("/api/route-plans", {
        name: routeName.trim() || `Rute ${routeDate}`,
        date: routeDate,
        outletIds: route.map((r) => r.id),
      });
      setInfo(`Rute disimpan: ${routeName.trim() || `Rute ${routeDate}`} (${route.length} stop).`);
    } catch (e) {
      setError(e instanceof ApiClientError ? e.message : "Gagal menyimpan rute.");
    } finally {
      setSaving(false);
    }
  }

  const totalDuration = estimate?.minutes ?? route.length * 45;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Route Planner"
        description="Pilih outlet dan susun rute kunjungan paling efisien."
        actions={
          <>
            <Select value={strategy} onValueChange={(v) => setStrategy(v as typeof strategy)}>
              <SelectTrigger className="h-9 w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="priority">Strategi: Prioritas</SelectItem>
                <SelectItem value="area">Strategi: Area</SelectItem>
                <SelectItem value="balanced">Strategi: Seimbang</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" disabled>
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button variant="outline" size="sm" onClick={saveRoute} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Route
            </Button>
            <Button size="sm" onClick={optimize} disabled={optimizing}>
              {optimizing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Optimize Route
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

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Detail Rute</CardTitle>
          <CardDescription>Beri nama dan tanggal untuk disimpan.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          <Input
            placeholder="Nama rute (opsional)"
            value={routeName}
            onChange={(e) => setRouteName(e.target.value)}
          />
          <Input
            type="date"
            value={routeDate}
            onChange={(e) => setRouteDate(e.target.value)}
          />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary">{route.length} stop</Badge>
            {estimate && (
              <Badge variant="info" className="gap-1">
                <Clock className="h-3 w-3" /> ± {estimate.minutes} min · {estimate.km.toFixed(1)} km
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Daftar Outlet</CardTitle>
            <CardDescription>
              {loading ? "memuat..." : `${filtered.length} tersedia · ${route.length} dipilih`}
            </CardDescription>
            <div className="space-y-2 pt-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Cari outlet..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8"
                />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <Select value={areaFilter} onValueChange={setAreaFilter}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Area" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>Semua Area</SelectItem>
                    {areas.map((a) => (
                      <SelectItem key={a} value={a}>
                        {a}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Prioritas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>Semua</SelectItem>
                    <SelectItem value="high">Tinggi</SelectItem>
                    <SelectItem value="medium">Sedang</SelectItem>
                    <SelectItem value="low">Rendah</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={ALL}>Semua</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <Separator />
          <ScrollArea className="h-[480px]">
            {loading ? (
              <div className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat...
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-6 text-center text-sm text-muted-foreground">
                {outlets.length === 0
                  ? "Belum ada outlet. Minta admin seed data."
                  : "Tidak ada outlet cocok dengan filter."}
              </div>
            ) : (
              <div className="divide-y">
                {filtered.map((outlet) => {
                  const selected = !!route.find((r) => r.id === outlet.id);
                  return (
                    <button
                      key={outlet.id}
                      onClick={() => toggleOutlet(outlet)}
                      className={cn(
                        "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40",
                        selected && "bg-primary/5"
                      )}
                    >
                      <div
                        className={cn(
                          "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-xs font-semibold",
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        {selected ? "✓" : outlet.segment}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-medium">{outlet.name}</p>
                          <Badge
                            variant={priorityVariant[outlet.priority]}
                            className="shrink-0 text-[10px]"
                          >
                            {priorityLabel[outlet.priority]}
                          </Badge>
                        </div>
                        <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" /> {outlet.area}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Map Preview</CardTitle>
                <CardDescription>
                  Estimasi: {route.length} stop · ± {totalDuration} menit
                </CardDescription>
              </div>
              <Badge variant="info" className="gap-1">
                <Navigation className="h-3 w-3" /> Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-[16/9] overflow-hidden rounded-lg border bg-gradient-to-br from-primary/5 via-muted/30 to-background">
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />
              {route.slice(0, 6).map((stop, i) => (
                <div
                  key={stop.id}
                  className="absolute flex flex-col items-center"
                  style={{
                    left: `${10 + ((i * 17) % 80)}%`,
                    top: `${15 + ((i * 23) % 65)}%`,
                  }}
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground shadow-lg ring-4 ring-primary/20">
                    {i + 1}
                  </div>
                  <span className="mt-1 rounded bg-background/90 px-1.5 py-0.5 text-[10px] font-medium shadow-sm">
                    {stop.name}
                  </span>
                </div>
              ))}
              <div className="absolute bottom-3 left-3 rounded-md bg-background/95 px-3 py-2 text-xs shadow-md">
                <p className="font-medium">Map Preview</p>
                <p className="text-muted-foreground">
                  Integrasi map provider akan tersedia kemudian.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Urutan Rute</CardTitle>
              <CardDescription>
                Klik panah untuk mengurutkan, atau pakai Optimize Route untuk auto-sort.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" /> ± {totalDuration} menit total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {route.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-muted/30 p-8 text-center text-sm text-muted-foreground">
              Belum ada outlet dipilih. Pilih dari daftar di sebelah kiri.
            </div>
          ) : (
            <ol className="space-y-2">
              {route.map((stop, idx) => (
                <li
                  key={stop.id}
                  className="flex items-center gap-3 rounded-lg border bg-background p-3"
                >
                  <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {idx + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium">{stop.name}</p>
                      <Badge variant={priorityVariant[stop.priority]} className="text-[10px]">
                        {priorityLabel[stop.priority]}
                      </Badge>
                    </div>
                    <p className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {stop.area}
                      </span>
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {stop.phone}
                      </span>
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => moveItem(idx, -1)}
                      disabled={idx === 0}
                    >
                      ↑
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-8 w-8"
                      onClick={() => moveItem(idx, 1)}
                      disabled={idx === route.length - 1}
                    >
                      ↓
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => toggleOutlet(stop)}>
                      Hapus
                    </Button>
                  </div>
                </li>
              ))}
            </ol>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
