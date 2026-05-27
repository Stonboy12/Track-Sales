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
import { outlets, type Outlet, type Priority } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

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

export default function RoutePlannerPage() {
  const [search, setSearch] = React.useState("");
  const [areaFilter, setAreaFilter] = React.useState<string>("all");
  const [priorityFilter, setPriorityFilter] = React.useState<string>("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [route, setRoute] = React.useState<Outlet[]>(outlets.slice(0, 4));

  const areas = Array.from(new Set(outlets.map((o) => o.area)));

  const filtered = outlets.filter((o) => {
    if (search && !o.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (areaFilter !== "all" && o.area !== areaFilter) return false;
    if (priorityFilter !== "all" && o.priority !== priorityFilter) return false;
    if (statusFilter !== "all" && o.status !== statusFilter) return false;
    return true;
  });

  const toggleOutlet = (outlet: Outlet) => {
    setRoute((prev) =>
      prev.find((p) => p.id === outlet.id)
        ? prev.filter((p) => p.id !== outlet.id)
        : [...prev, outlet]
    );
  };

  const moveItem = (idx: number, dir: -1 | 1) => {
    setRoute((prev) => {
      const next = [...prev];
      const target = idx + dir;
      if (target < 0 || target >= next.length) return prev;
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    });
  };

  const optimize = () => {
    setRoute((prev) =>
      [...prev].sort((a, b) => {
        const order: Record<Priority, number> = { high: 0, medium: 1, low: 2 };
        return order[a.priority] - order[b.priority];
      })
    );
  };

  const totalDuration = route.length * 45; // 45 min per visit

  return (
    <div className="space-y-6">
      <PageHeader
        title="Route Planner"
        description="Pilih outlet dan susun rute kunjungan paling efisien."
        actions={
          <>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" /> Export
            </Button>
            <Button variant="outline" size="sm">
              <Save className="h-4 w-4" /> Save Route
            </Button>
            <Button size="sm" onClick={optimize}>
              <Sparkles className="h-4 w-4" /> Optimize Route
            </Button>
          </>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Outlet list */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Daftar Outlet</CardTitle>
            <CardDescription>
              {filtered.length} outlet tersedia · {route.length} dipilih
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
                    <SelectItem value="all">Semua Area</SelectItem>
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
                    <SelectItem value="all">Semua</SelectItem>
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
                    <SelectItem value="all">Semua</SelectItem>
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
          </ScrollArea>
        </Card>

        {/* Map preview */}
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
              {/* Decorative grid */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage:
                    "linear-gradient(hsl(var(--border)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--border)) 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />
              {/* Pins */}
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
                  Integrasi map akan tersedia setelah backend dihubungkan.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Route order */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Urutan Rute Direkomendasikan</CardTitle>
              <CardDescription>
                Drag untuk mengurutkan, atau klik panah untuk memindahkan posisi.
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
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => toggleOutlet(stop)}
                    >
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
