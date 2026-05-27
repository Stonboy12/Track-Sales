"use client";

import * as React from "react";
import {
  Store,
  TrendingDown,
  TrendingUp,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Progress } from "@/components/ui/progress";
import { api, ApiClientError } from "@/lib/api-client";
import { cn, formatCurrency } from "@/lib/utils";

interface PerformanceResp {
  totalOutlets: number;
  totalRevenue: number;
  segmentCount: { A: number; B: number; C: number };
  perOutlet: {
    outletId: string;
    name: string;
    area: string;
    segment: "A" | "B" | "C";
    revenue: number;
    visits: number;
  }[];
}

const ALL = "__all__";

const segmentDescriptions: Record<"A" | "B" | "C", { label: string; tone: string }> = {
  A: { label: "Premium · revenue tinggi", tone: "bg-primary/10 text-primary" },
  B: { label: "Reguler · stabil", tone: "bg-warning/15 text-warning" },
  C: { label: "Berkembang · perlu dorongan", tone: "bg-muted text-muted-foreground" },
};

export default function OutletPerformancePage() {
  const [data, setData] = React.useState<PerformanceResp | null>(null);
  const [area, setArea] = React.useState(ALL);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const resp = await api.get<PerformanceResp>("/api/outlets/performance", {
          query: area === ALL ? {} : { area },
        });
        setData(resp);
      } catch (e) {
        setError(e instanceof ApiClientError ? e.message : "Gagal memuat performance.");
      } finally {
        setLoading(false);
      }
    })();
  }, [area]);

  const allAreas = data ? Array.from(new Set(data.perOutlet.map((o) => o.area))) : [];
  const totals = data ?? { totalOutlets: 0, totalRevenue: 0, segmentCount: { A: 0, B: 0, C: 0 }, perOutlet: [] };
  const idleOutlets = totals.perOutlet.filter((o) => o.revenue === 0).slice(0, 8);
  const topOutlets = totals.perOutlet.filter((o) => o.revenue > 0).slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Outlet Performance Dashboard"
        description="Pantau performa, segmentasi, dan outlet yang perlu perhatian."
        actions={
          <Select value={area} onValueChange={setArea}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Wilayah" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>Semua Wilayah</SelectItem>
              {allAreas.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        }
      />

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Outlet" value={`${totals.totalOutlets}`} icon={Store} />
        <KpiCard
          label="Total Revenue"
          value={formatCurrency(totals.totalRevenue)}
          icon={ShoppingBag}
          tone="success"
        />
        <KpiCard
          label="Outlet Aktif"
          value={`${totals.perOutlet.filter((o) => o.revenue > 0).length}`}
          icon={TrendingUp}
        />
        <KpiCard
          label="Outlet Idle"
          value={`${idleOutlets.length}`}
          caption="belum ada order"
          icon={TrendingDown}
          tone="warning"
        />
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat...
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Top Performer (Revenue)</CardTitle>
                <CardDescription>Outlet dengan total order tertinggi</CardDescription>
              </CardHeader>
              <CardContent>
                {topOutlets.length === 0 ? (
                  <p className="rounded-md border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                    Belum ada visit dengan order. Catat visit dari Route Planner atau Daily Report.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {topOutlets.map((o, idx) => {
                      const max = topOutlets[0]?.revenue || 1;
                      return (
                        <li key={o.outletId} className="flex items-center gap-3 rounded-md border bg-background p-3">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                            #{idx + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <p className="truncate text-sm font-medium">{o.name}</p>
                              <Badge variant="outline" className="text-[10px]">
                                Segmen {o.segment}
                              </Badge>
                            </div>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {o.area} · {o.visits} visit
                            </p>
                            <Progress value={(o.revenue / max) * 100} className="mt-1.5 h-1.5" />
                          </div>
                          <p className="shrink-0 text-sm font-semibold">{formatCurrency(o.revenue)}</p>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Segmentasi Outlet</CardTitle>
                <CardDescription>Distribusi A/B/C</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(["A", "B", "C"] as const).map((seg) => {
                  const count = totals.segmentCount[seg];
                  const pct = totals.totalOutlets > 0 ? (count / totals.totalOutlets) * 100 : 0;
                  return (
                    <div key={seg}>
                      <div className="mb-1.5 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "flex h-7 w-7 items-center justify-center rounded-md text-sm font-semibold",
                              segmentDescriptions[seg].tone
                            )}
                          >
                            {seg}
                          </span>
                          <div className="leading-tight">
                            <p className="text-sm font-medium">Segmen {seg}</p>
                            <p className="text-xs text-muted-foreground">
                              {segmentDescriptions[seg].label}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold">
                          {count} <span className="text-xs text-muted-foreground">({pct.toFixed(0)}%)</span>
                        </p>
                      </div>
                      <Progress value={pct} />
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Outlet Idle (Belum ada order)</CardTitle>
              <CardDescription>
                {idleOutlets.length} outlet · perlu dijadwalkan kunjungan
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {idleOutlets.length === 0 ? (
                <p className="px-6 pb-6 text-sm text-muted-foreground">
                  🎉 Semua outlet sudah ada visit dengan order.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Outlet</TableHead>
                      <TableHead>Area</TableHead>
                      <TableHead>Segmen</TableHead>
                      <TableHead className="text-right">Visit</TableHead>
                      <TableHead className="text-right">Revenue</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {idleOutlets.map((o) => (
                      <TableRow key={o.outletId}>
                        <TableCell className="font-medium">{o.name}</TableCell>
                        <TableCell className="text-muted-foreground">{o.area}</TableCell>
                        <TableCell>
                          <Badge variant="outline">Segmen {o.segment}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{o.visits}</TableCell>
                        <TableCell className="text-right">{formatCurrency(o.revenue)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
