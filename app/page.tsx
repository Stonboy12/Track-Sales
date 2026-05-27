"use client";

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
  CheckCircle2,
  Circle,
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
import {
  dashboardActivity,
  todayTasks,
  weeklyPerformance,
} from "@/lib/mock-data";
import { initialsOf, formatPercent } from "@/lib/utils";

const quickActions = [
  { title: "Mulai Visit", href: "/route-planner", icon: MapIcon, tone: "bg-primary/10 text-primary" },
  { title: "Buat Laporan", href: "/daily-report", icon: FileText, tone: "bg-success/15 text-success" },
  { title: "Catat Komplain", href: "/complaints", icon: AlertOctagon, tone: "bg-warning/15 text-warning" },
  { title: "Hitung Promo", href: "/promo-calculator", icon: Calculator, tone: "bg-secondary text-secondary-foreground" },
];

export default function DashboardPage() {
  const completedTasks = todayTasks.filter((t) => t.done).length;
  const totalTasks = todayTasks.length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Selamat datang, Adi"
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

      {/* KPI cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          label="Total Outlet Aktif"
          value="142"
          delta={3.2}
          caption="vs minggu lalu"
          icon={Store}
        />
        <KpiCard
          label="Visit Hari Ini"
          value={`${completedTasks}/${totalTasks}`}
          caption={`${formatPercent((completedTasks / totalTasks) * 100, 0)} selesai`}
          icon={CalendarCheck}
          tone="success"
        />
        <KpiCard
          label="Sales Target"
          value="Rp 142.5 Jt"
          delta={5.8}
          caption="dari Rp 150 Jt target"
          icon={Target}
          tone="default"
        />
        <KpiCard
          label="Complaint Open"
          value="3"
          delta={-12.5}
          caption="2 prioritas tinggi"
          icon={AlertOctagon}
          tone="warning"
        />
        <KpiCard
          label="Performa Minggu Ini"
          value="108%"
          delta={4.1}
          caption="dari target"
          icon={TrendingUp}
          tone="success"
        />
      </div>

      {/* Quick actions */}
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

      {/* Chart + Tasks */}
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base">Performa Penjualan Mingguan</CardTitle>
              <CardDescription>Aktual vs target dalam juta rupiah</CardDescription>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-primary" /> Aktual
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-muted-foreground/60" /> Target
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <AreaChart
              data={weeklyPerformance}
              xKey="day"
              series={[
                { key: "actual", label: "Aktual", color: "hsl(var(--primary))" },
                { key: "target", label: "Target", color: "hsl(var(--muted-foreground))" },
              ]}
              height={280}
              formatValue={(v) => `Rp ${v} Jt`}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Task Hari Ini</CardTitle>
              <Badge variant="secondary">
                {completedTasks}/{totalTasks}
              </Badge>
            </div>
            <Progress value={(completedTasks / totalTasks) * 100} className="mt-1.5" />
          </CardHeader>
          <CardContent className="space-y-2">
            {todayTasks.map((task) => (
              <div
                key={task.id}
                className="flex items-start gap-3 rounded-md border bg-background p-2.5"
              >
                {task.done ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                ) : (
                  <Circle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                )}
                <div className="flex-1 leading-tight">
                  <p
                    className={`text-sm font-medium ${
                      task.done ? "text-muted-foreground line-through" : ""
                    }`}
                  >
                    {task.title}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {task.time} · {task.location}
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Activity */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Aktivitas Terbaru</CardTitle>
          <CardDescription>Aktivitas tim dan sistem dalam 24 jam terakhir</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="divide-y">
            {dashboardActivity.map((act) => (
              <li key={act.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-muted text-xs">
                    {initialsOf(act.actor)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{act.actor}</span>{" "}
                    <span className="text-muted-foreground">{act.action}</span>
                  </p>
                </div>
                <p className="shrink-0 text-xs text-muted-foreground">{act.time}</p>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
