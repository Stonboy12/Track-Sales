"use client";

import * as React from "react";
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  Users,
  Target,
  Star,
  Crown,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { salespeople } from "@/lib/mock-data";
import { cn, formatCurrency, initialsOf } from "@/lib/utils";

export default function LeaderboardPage() {
  const [period, setPeriod] = React.useState("month");
  const [area, setArea] = React.useState("all");

  const sorted = [...salespeople].sort(
    (a, b) =>
      b.achievement / b.target - a.achievement / a.target ||
      b.achievement - a.achievement
  );

  const top3 = sorted.slice(0, 3);
  const rest = sorted.slice(3);

  const totalSales = sorted.reduce((sum, s) => sum + s.achievement, 0);
  const totalTarget = sorted.reduce((sum, s) => sum + s.target, 0);
  const avgAchievement = (totalSales / totalTarget) * 100;

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
                <SelectItem value="all">Semua Wilayah</SelectItem>
                <SelectItem value="jakarta">Jakarta</SelectItem>
                <SelectItem value="bandung">Bandung</SelectItem>
                <SelectItem value="surabaya">Surabaya</SelectItem>
              </SelectContent>
            </Select>
            <Tabs value={period} onValueChange={setPeriod}>
              <TabsList>
                <TabsTrigger value="week">Minggu</TabsTrigger>
                <TabsTrigger value="month">Bulan</TabsTrigger>
                <TabsTrigger value="quarter">Kuartal</TabsTrigger>
              </TabsList>
            </Tabs>
          </>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Total Sales" value={formatCurrency(totalSales)} icon={TrendingUp} tone="success" />
        <KpiCard label="Total Target" value={formatCurrency(totalTarget)} icon={Target} />
        <KpiCard label="Pencapaian Tim" value={`${avgAchievement.toFixed(1)}%`} delta={4.2} icon={Trophy} tone="success" />
        <KpiCard label="Salesman Aktif" value={`${sorted.length}`} icon={Users} />
      </div>

      {/* Podium Top 3 */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Top Performer Bulan Ini</CardTitle>
          <CardDescription>3 salesman dengan pencapaian tertinggi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {top3.map((s, i) => {
              const pct = (s.achievement / s.target) * 100;
              const podium = [
                { icon: Crown, tone: "bg-warning text-warning-foreground", label: "Juara 1" },
                { icon: Medal, tone: "bg-muted-foreground text-background", label: "Juara 2" },
                { icon: Award, tone: "bg-orange-500 text-white", label: "Juara 3" },
              ][i];
              const Icon = podium.icon;
              return (
                <div
                  key={s.id}
                  className={cn(
                    "relative overflow-hidden rounded-xl border p-5",
                    i === 0 && "bg-gradient-to-br from-warning/10 via-background to-background ring-1 ring-warning/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar className="h-14 w-14">
                        <AvatarFallback className="bg-primary/10 text-base font-semibold text-primary">
                          {initialsOf(s.name)}
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
                      <p className="mt-1 truncate font-semibold">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.area}</p>
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
                    {s.badges.length > 0 && (
                      <div className="flex flex-wrap gap-1 pt-1">
                        {s.badges.map((b) => (
                          <Badge key={b} variant="info" className="gap-1 text-[10px]">
                            <Star className="h-2.5 w-2.5" /> {b}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Full ranking */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Ranking Lengkap</CardTitle>
          <CardDescription>{sorted.length} salesman aktif</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {rest.map((s, i) => {
            const rank = i + 4;
            const pct = (s.achievement / s.target) * 100;
            return (
              <div
                key={s.id}
                className="flex items-center gap-4 rounded-lg border bg-background p-3"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                  #{rank}
                </div>
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {initialsOf(s.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <p className="text-sm font-medium">{s.name}</p>
                    {s.badges.map((b) => (
                      <Badge key={b} variant="muted" className="text-[10px]">
                        {b}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {s.area} · {s.visits} visit · {s.outletsActive} outlet aktif
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
                <Button size="sm" variant="outline" className="hidden md:inline-flex">
                  Detail
                </Button>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Achievements gallery */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Achievement Tim</CardTitle>
          <CardDescription>Badge yang baru diraih oleh tim</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { name: "Top Sales", desc: "Mencapai 110% target bulanan", icon: Trophy, tone: "bg-warning/15 text-warning" },
            { name: "Outlet Hunter", desc: "Buka 10+ outlet baru", icon: Star, tone: "bg-primary/10 text-primary" },
            { name: "Streak 30 Hari", desc: "Submit laporan 30 hari berturut", icon: Medal, tone: "bg-success/15 text-success" },
            { name: "Komplain 0", desc: "Tidak ada komplain dalam 1 bulan", icon: Award, tone: "bg-secondary text-secondary-foreground" },
          ].map((a) => {
            const Icon = a.icon;
            return (
              <div
                key={a.name}
                className="flex items-start gap-3 rounded-lg border bg-background p-3"
              >
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-md", a.tone)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{a.name}</p>
                  <p className="text-xs text-muted-foreground">{a.desc}</p>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
