"use client";

import * as React from "react";
import {
  Store,
  TrendingDown,
  TrendingUp,
  ShoppingBag,
  Filter,
  Download,
  ArrowDownRight,
  ArrowUpRight,
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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BarChart } from "@/components/charts/bar-chart";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import {
  outletPerformanceTrend,
  outlets,
  type OutletSegment,
} from "@/lib/mock-data";
import { cn, formatCurrency } from "@/lib/utils";

const segmentDescriptions: Record<OutletSegment, { label: string; tone: string }> = {
  A: { label: "Premium · revenue tinggi", tone: "bg-primary/10 text-primary" },
  B: { label: "Reguler · stabil", tone: "bg-warning/15 text-warning" },
  C: { label: "Berkembang · perlu dorongan", tone: "bg-muted text-muted-foreground" },
};

export default function OutletPerformancePage() {
  const [area, setArea] = React.useState("all");
  const [period, setPeriod] = React.useState("month");

  const segmentCounts = outlets.reduce(
    (acc, o) => {
      acc[o.segment]++;
      return acc;
    },
    { A: 0, B: 0, C: 0 } as Record<OutletSegment, number>
  );

  const decliningOutlets = outlets
    .filter((o) => o.growth < 0)
    .sort((a, b) => a.growth - b.growth);

  const totalRevenue = outlets.reduce((sum, o) => sum + o.monthlyRevenue, 0);
  const avgGrowth = outlets.reduce((sum, o) => sum + o.growth, 0) / outlets.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Outlet Performance Dashboard"
        description="Pantau performa, segmentasi, dan outlet yang perlu perhatian."
        actions={
          <>
            <Select value={area} onValueChange={setArea}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Wilayah" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Wilayah</SelectItem>
                <SelectItem value="jakarta">Jakarta</SelectItem>
                <SelectItem value="bandung">Bandung</SelectItem>
                <SelectItem value="surabaya">Surabaya</SelectItem>
              </SelectContent>
            </Select>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-36">
                <SelectValue placeholder="Periode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Mingguan</SelectItem>
                <SelectItem value="month">Bulanan</SelectItem>
                <SelectItem value="quarter">Kuartal</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4" /> Export
            </Button>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          label="Total Outlet"
          value={`${outlets.length}`}
          caption="aktif & pending"
          icon={Store}
        />
        <KpiCard
          label="Revenue Bulan Ini"
          value={formatCurrency(totalRevenue)}
          delta={6.4}
          icon={ShoppingBag}
          tone="success"
        />
        <KpiCard
          label="Avg Growth"
          value={`${avgGrowth.toFixed(1)}%`}
          delta={avgGrowth}
          icon={TrendingUp}
          tone={avgGrowth >= 0 ? "success" : "destructive"}
        />
        <KpiCard
          label="Outlet Turun"
          value={`${decliningOutlets.length}`}
          caption="butuh follow-up"
          icon={TrendingDown}
          tone="warning"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tren Aktivitas Outlet per Segmen</CardTitle>
            <CardDescription>Jumlah outlet aktif transaksi per bulan</CardDescription>
          </CardHeader>
          <CardContent>
            <BarChart
              data={outletPerformanceTrend}
              xKey="month"
              series={[
                { key: "a", label: "Segmen A", color: "hsl(var(--primary))" },
                { key: "b", label: "Segmen B", color: "hsl(var(--warning))" },
                { key: "c", label: "Segmen C", color: "hsl(var(--muted-foreground))" },
              ]}
              stacked
              height={280}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Segmentasi Outlet</CardTitle>
            <CardDescription>Distribusi A/B/C berdasarkan revenue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {(["A", "B", "C"] as OutletSegment[]).map((seg) => {
              const count = segmentCounts[seg];
              const pct = (count / outlets.length) * 100;
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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Outlet Performa Turun</CardTitle>
              <CardDescription>
                {decliningOutlets.length} outlet menurun · perlu kunjungan prioritas
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" /> Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-0 pb-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Outlet</TableHead>
                <TableHead>Area</TableHead>
                <TableHead>Segmen</TableHead>
                <TableHead className="text-right">Revenue Bulan Ini</TableHead>
                <TableHead className="text-right">Growth</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {decliningOutlets.map((outlet) => (
                <TableRow key={outlet.id}>
                  <TableCell>
                    <div className="leading-tight">
                      <p className="font-medium">{outlet.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {outlet.code} · {outlet.ownerName}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{outlet.area}</TableCell>
                  <TableCell>
                    <Badge variant="outline">Segmen {outlet.segment}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(outlet.monthlyRevenue)}
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                      <ArrowDownRight className="h-3 w-3" />
                      {Math.abs(outlet.growth).toFixed(1)}%
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button size="sm" variant="outline">
                      Jadwalkan Visit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Top Performer Bulan Ini</CardTitle>
          <CardDescription>Outlet dengan growth positif terbaik</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {outlets
            .filter((o) => o.growth > 0)
            .sort((a, b) => b.growth - a.growth)
            .slice(0, 6)
            .map((o) => (
              <div
                key={o.id}
                className="flex items-center gap-3 rounded-lg border bg-background p-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-success/15 text-success">
                  <Store className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{o.name}</p>
                  <p className="text-xs text-muted-foreground">{o.area}</p>
                </div>
                <span className="inline-flex items-center gap-0.5 text-xs font-semibold text-success">
                  <ArrowUpRight className="h-3 w-3" />
                  {o.growth.toFixed(1)}%
                </span>
              </div>
            ))}
        </CardContent>
      </Card>
    </div>
  );
}
