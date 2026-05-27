import Link from "next/link";
import {
  Store,
  CalendarCheck,
  Target,
  AlertOctagon,
  TrendingUp,
  Plus,
  Map as MapIcon,
  FileText,
  Calculator,
  ChevronRight,
} from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { KpiCard } from "@/components/dashboard/kpi-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AreaChart } from "@/components/charts/area-chart";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { initialsOf, formatCurrency, formatPercent } from "@/lib/utils";
import { requireServerUser } from "@/lib/server-session";
import { serverApi, ApiClientError } from "@/lib/api-client";
import { EmptyState } from "@/components/ui/empty-state";

export const dynamic = "force-dynamic";

interface DashboardSummary {
  kpi: {
    totalOutletActive: number;
    visitsToday: number;
    salesThisMonth: number;
    targetThisMonth: number;
    achievementPct: number;
    openComplaints: number;
    highPriorityComplaints: number;
  };
  weeklyPerformance: { day: string; actual: number; target: number }[];
  recentActivity: {
    id: string;
    at: string;
    actorName: string | null;
    action: string;
    entity: string;
    entityId?: string;
  }[];
  todayTopRanking: { userId: string; name: string; achievementPct: number }[];
}

const quickActions = [
  { title: "Mulai Visit", href: "/route-planner", icon: MapIcon, tone: "bg-primary/10 text-primary" },
  { title: "Buat Laporan", href: "/daily-report", icon: FileText, tone: "bg-success/15 text-success" },
  { title: "Catat Komplain", href: "/complaints", icon: AlertOctagon, tone: "bg-warning/15 text-warning" },
  { title: "Hitung Promo", href: "/promo-calculator", icon: Calculator, tone: "bg-secondary text-secondary-foreground" },
];

function relativeTime(iso: string) {
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const m = Math.round(diff / 60_000);
  if (m < 1) return "baru saja";
  if (m < 60) return `${m} menit lalu`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} jam lalu`;
  return `${Math.round(h / 24)} hari lalu`;
}

export default async function DashboardPage() {
  const me = await requireServerUser();

  let summary: DashboardSummary | null = null;
  let errorMessage: string | null = null;
  try {
    summary = await serverApi<DashboardSummary>("GET", "/api/dashboard/summary");
  } catch (e) {
    errorMessage =
      e instanceof ApiClientError
        ? e.message
        : "Tidak bisa memuat ringkasan dashboard.";
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Selamat datang, ${me.name.split(" ")[0]}`}
        description="Ringkasan aktivitas dan target Anda hari ini."
        actions={
          <>
            <Button variant="outline" size="sm">
              Export Ringkasan
            </Button>
            <Button size="sm" asChild>
              <Link href="/daily-report">
                <Plus className="h-4 w-4" /> Laporan Baru
              </Link>
            </Button>
          </>
        }
      />

      {errorMessage && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {errorMessage}
        </div>
      )}

      {summary && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <KpiCard
              label="Total Outlet Aktif"
              value={String(summary.kpi.totalOutletActive)}
              caption="status active"
              icon={Store}
            />
            <KpiCard
              label="Visit Hari Ini"
              value={String(summary.kpi.visitsToday)}
              caption="kunjungan tercatat"
              icon={CalendarCheck}
              tone="success"
            />
            <KpiCard
              label="Sales Bulan Ini"
              value={
                summary.kpi.salesThisMonth >= 1_000_000
                  ? `Rp ${(summary.kpi.salesThisMonth / 1_000_000).toFixed(1)} Jt`
                  : formatCurrency(summary.kpi.salesThisMonth)
              }
              caption={`dari ${formatCurrency(summary.kpi.targetThisMonth)} target`}
              icon={Target}
            />
            <KpiCard
              label="Complaint Open"
              value={String(summary.kpi.openComplaints)}
              caption={`${summary.kpi.highPriorityComplaints} prioritas tinggi`}
              icon={AlertOctagon}
              tone="warning"
            />
            <KpiCard
              label="Pencapaian"
              value={formatPercent(summary.kpi.achievementPct, 0)}
              caption="dari target bulanan"
              icon={TrendingUp}
              tone={summary.kpi.achievementPct >= 100 ? "success" : "default"}
            />
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Action</CardTitle>
              <CardDescription>Akses cepat ke menu yang sering Anda gunakan.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {quickActions.map((qa) => {
                  const Icon = qa.icon;
                  return (
                    <Link
                      key={qa.title}
                      href={qa.href}
                      className="group flex items-center gap-3 rounded-lg border bg-background p-3 transition-colors hover:border-primary hover:bg-accent"
                    >
                      <div className={`flex h-10 w-10 items-center justify-center rounded-md ${qa.tone}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{qa.title}</p>
                        <p className="text-xs text-muted-foreground">Buka modul</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-base">Performa Penjualan Mingguan</CardTitle>
                  <CardDescription>7 hari terakhir, dalam juta rupiah</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                {summary.weeklyPerformance.some((w) => w.actual > 0) ? (
                  <AreaChart
                    data={summary.weeklyPerformance}
                    xKey="day"
                    series={[
                      { key: "actual", label: "Aktual", color: "hsl(var(--primary))" },
                      { key: "target", label: "Target", color: "hsl(var(--muted-foreground))" },
                    ]}
                    height={280}
                    formatValue={(v) => `Rp ${v} Jt`}
                  />
                ) : (
                  <EmptyState
                    icon={<TrendingUp className="h-5 w-5" />}
                    title="Belum ada visit tercatat"
                    description="Mulai input visit dari Route Planner agar grafik performa mingguan terisi."
                    action={
                      <Button asChild size="sm">
                        <Link href="/route-planner">Mulai Visit</Link>
                      </Button>
                    }
                  />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Top Performer</CardTitle>
                <CardDescription>Bulan berjalan</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {summary.todayTopRanking.length === 0 ? (
                  <p className="rounded-md border border-dashed bg-muted/30 p-4 text-center text-xs text-muted-foreground">
                    Belum ada data sales untuk diperingkat.
                  </p>
                ) : (
                  summary.todayTopRanking.map((entry, idx) => (
                    <div key={entry.userId} className="flex items-center gap-3 rounded-md border bg-background p-2.5">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                        #{idx + 1}
                      </span>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                          {initialsOf(entry.name || "U")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{entry.name || "—"}</p>
                        <Progress value={Math.min(entry.achievementPct, 100)} className="mt-1 h-1.5" />
                      </div>
                      <Badge variant="muted" className="text-[10px]">
                        {entry.achievementPct.toFixed(0)}%
                      </Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Aktivitas Terbaru</CardTitle>
              <CardDescription>10 aksi terakhir di sistem</CardDescription>
            </CardHeader>
            <CardContent>
              {summary.recentActivity.length === 0 ? (
                <p className="rounded-md border border-dashed bg-muted/30 p-4 text-center text-sm text-muted-foreground">
                  Belum ada aktivitas tercatat.
                </p>
              ) : (
                <ul className="divide-y">
                  {summary.recentActivity.map((act) => (
                    <li key={act.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-muted text-xs">
                          {initialsOf(act.actorName ?? "Sistem")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">
                          <span className="font-medium">{act.actorName ?? "Sistem"}</span>{" "}
                          <span className="text-muted-foreground">
                            {act.action}
                            {act.entityId ? ` (${act.entity}#${act.entityId.slice(0, 6)})` : ""}
                          </span>
                        </p>
                      </div>
                      <p className="shrink-0 text-xs text-muted-foreground">{relativeTime(act.at)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
