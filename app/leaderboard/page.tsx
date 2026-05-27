"use client";

import * as React from "react";
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  Users,
  Target,
  Crown,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api, ApiClientError } from "@/lib/api-client";
import { cn, formatCurrency, initialsOf } from "@/lib/utils";

interface LeaderboardEntry {
  userId: string;
  name: string;
  area?: string;
  achievement: number;
  target: number;
  achievementPct: number;
  visits: number;
  outletsActive: number;
  rank: number;
}

const ALL = "__all__";

export default function LeaderboardPage() {
  const [entries, setEntries] = React.useState<LeaderboardEntry[]>([]);
  const [period, setPeriod] = React.useState("month");
  const [area, setArea] = React.useState(ALL);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await api.get<LeaderboardEntry[]>("/api/leaderboard", {
          query: {
            period,
            area: area === ALL ? undefined : area,
          },
        });
        setEntries(data);
      } catch (e) {
        setError(e instanceof ApiClientError ? e.message : "Gagal memuat leaderboard.");
      } finally {
        setLoading(false);
      }
    })();
  }, [period, area]);

  const top3 = entries.slice(0, 3);
  const rest = entries.slice(3);
  const totalSales = entries.reduce((s, e) => s + e.achievement, 0);
  const totalTarget = entries.reduce((s, e) => s + e.target, 0);
  const avgAchievement = totalTarget > 0 ? (totalSales / totalTarget) * 100 : 0;
  const areas = Array.from(new Set(entries.map((e) => e.area).filter(Boolean))) as string[];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Sales Leaderboard"
        description="Lihat siapa top performer dan dorong tim mencapai target."
        actions={
          <>
            <Select value={area} onValueChange={setArea}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Wilayah" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL}>Semua Wilayah</SelectItem>
                {areas.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Tabs value={period} onValueChange={setPeriod}>
              <TabsList>
                <TabsTrigger value="month">Bulan</TabsTrigger>
                <TabsTrigger value="all">Sepanjang Waktu</TabsTrigger>
              </TabsList>
            </Tabs>
          </>
        }
      />

      {error && (
        <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Sales" value={formatCurrency(totalSales)} icon={TrendingUp} tone="success" />
        <KpiCard label="Total Target" value={formatCurrency(totalTarget)} icon={Target} />
        <KpiCard label="Pencapaian Tim" value={`${avgAchievement.toFixed(1)}%`} icon={Trophy} tone="success" />
        <KpiCard label="Salesman Aktif" value={`${entries.length}`} icon={Users} />
      </div>

      {loading ? (
        <Card>
          <CardContent className="flex h-32 items-center justify-center text-sm text-muted-foreground">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Memuat ranking...
          </CardContent>
        </Card>
      ) : entries.length === 0 ? (
        <Card>
          <CardContent className="rounded-lg p-8 text-center text-sm text-muted-foreground">
            Belum ada salesman terdaftar atau belum ada visit untuk diperingkat.
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Top Performer</CardTitle>
              <CardDescription>3 salesman dengan pencapaian tertinggi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {top3.map((s, i) => {
                  const pct = s.achievementPct;
                  const podium = [
                    { icon: Crown, tone: "bg-warning text-warning-foreground", label: "Juara 1" },
                    { icon: Medal, tone: "bg-muted-foreground text-background", label: "Juara 2" },
                    { icon: Award, tone: "bg-orange-500 text-white", label: "Juara 3" },
                  ][i];
                  const Icon = podium.icon;
                  return (
                    <div
                      key={s.userId}
                      className={cn(
                        "relative overflow-hidden rounded-xl border p-5",
                        i === 0 && "bg-gradient-to-br from-warning/10 via-background to-background ring-1 ring-warning/30"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="h-14 w-14">
                            <AvatarFallback className="bg-primary/10 text-base font-semibold text-primary">
                              {initialsOf(s.name || "U")}
                            </AvatarFallback>
                          </Avatar>
                          <div
                            className={cn(
                              "absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full ring-2 ring-background",
                              podium.tone
                            )}
                          >
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                        </div>
                        <div className="min-w-0 flex-1">
                          <Badge variant="muted" className="text-[10px]">
                            #{i + 1} {podium.label}
                          </Badge>
                          <p className="mt-1 truncate font-semibold">{s.name || "—"}</p>
                          <p className="text-xs text-muted-foreground">{s.area ?? "Tanpa area"}</p>
                        </div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <div>
                          <div className="mb-1 flex items-center justify-between text-xs">
                            <span className="text-muted-foreground">Pencapaian</span>
                            <span className="font-semibold">{pct.toFixed(0)}%</span>
                          </div>
                          <Progress value={Math.min(pct, 100)} />
                        </div>
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <div>
                            <p className="text-[11px] text-muted-foreground">Sales</p>
                            <p className="text-sm font-semibold">{formatCurrency(s.achievement)}</p>
                          </div>
                          <div>
                            <p className="text-[11px] text-muted-foreground">Visit</p>
                            <p className="text-sm font-semibold">{s.visits}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ranking Lengkap</CardTitle>
              <CardDescription>{entries.length} salesman</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {rest.length === 0 ? (
                <p className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                  Hanya {entries.length} salesman; semua sudah ditampilkan di podium.
                </p>
              ) : (
                rest.map((s) => {
                  const pct = s.achievementPct;
                  return (
                    <div
                      key={s.userId}
                      className="flex items-center gap-4 rounded-lg border bg-background p-3"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                        #{s.rank}
                      </div>
                      <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                          {initialsOf(s.name || "U")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{s.name || "—"}</p>
                        <p className="text-xs text-muted-foreground">
                          {s.area ?? "—"} · {s.visits} visit · {s.outletsActive} outlet aktif
                        </p>
                      </div>
                      <div className="hidden w-32 sm:block">
                        <Progress value={Math.min(pct, 100)} />
                        <p className="mt-1 text-right text-xs text-muted-foreground">
                          {pct.toFixed(0)}%
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold">{formatCurrency(s.achievement)}</p>
                        <p className="text-xs text-muted-foreground">
                          dari {formatCurrency(s.target)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
