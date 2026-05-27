import { activityLogger } from "../../core/logger";
import { db } from "../../db/memory";
import { leaderboardService } from "../leaderboard/service";

/** Ringkasan untuk halaman Dashboard utama. Aggregator pure-read. */
export const dashboardService = {
  summary(salesId?: string) {
    const today = new Date().toISOString().slice(0, 10);
    const monthPrefix = today.slice(0, 7);

    const allVisits = db.visits.findAll();
    const myVisits = allVisits.filter((v) => (salesId ? v.salesId === salesId : true));

    const visitsToday = myVisits.filter((v) => v.visitDate === today);
    const visitsThisMonth = myVisits.filter((v) => v.visitDate.startsWith(monthPrefix));
    const salesThisMonth = visitsThisMonth
      .filter((v) => v.outcome === "order")
      .reduce((s, v) => s + v.orderValue, 0);

    const totalOutletActive = db.outlets.count((o) => o.status === "active");
    const openComplaints = db.complaints.count((c) => c.status !== "resolved");
    const highPriorityComplaints = db.complaints.count(
      (c) => c.status !== "resolved" && c.priority === "high"
    );

    const me = salesId ? db.users.findById(salesId) : null;
    const target = me?.monthlyTarget ?? 150_000_000;
    const achievementPct = target > 0 ? (salesThisMonth / target) * 100 : 0;

    // Performa harian 7 hari terakhir untuk chart
    const weekly: { day: string; actual: number; target: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      const sumDay = myVisits
        .filter((v) => v.visitDate === ds && v.outcome === "order")
        .reduce((s, v) => s + v.orderValue, 0);
      weekly.push({
        day: ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"][d.getDay()],
        actual: Math.round(sumDay / 1_000_000), // dalam juta
        target: 20,
      });
    }

    return {
      kpi: {
        totalOutletActive,
        visitsToday: visitsToday.length,
        salesThisMonth,
        targetThisMonth: target,
        achievementPct,
        openComplaints,
        highPriorityComplaints,
      },
      weeklyPerformance: weekly,
      recentActivity: activityLogger.list({ limit: 10 }),
      todayTopRanking: leaderboardService.ranking({ period: "month" }).slice(0, 3),
    };
  },
};
