import { activityLogger } from "../../core/logger";
import { db } from "../../db";
import { leaderboardService } from "../leaderboard/service";

/** Aggregator pure-read untuk halaman Dashboard. */
export const dashboardService = {
  async summary(salesId?: string) {
    const today = new Date().toISOString().slice(0, 10);
    const monthPrefix = today.slice(0, 7);

    const [allVisits, totalOutletActive, openComplaints, highPriorityComplaints, profile, ranking, recentActivity] =
      await Promise.all([
        db.visits.findAll(salesId ? { where: { sales_id: salesId } } : undefined),
        db.outlets.count({ where: { status: "active" } }),
        db.complaints.count({ in: { status: ["open", "in_progress"] } }),
        db.complaints.count({
          in: { status: ["open", "in_progress"] },
          where: { priority: "high" },
        }),
        salesId ? db.userProfiles.findOne({ where: { user_id: salesId } }) : Promise.resolve(null),
        leaderboardService.ranking({ period: "month" }),
        activityLogger.list({ limit: 10 }),
      ]);

    const visitsToday = allVisits.filter((v) => v.visitDate === today);
    const visitsThisMonth = allVisits.filter((v) => v.visitDate.startsWith(monthPrefix));
    const salesThisMonth = visitsThisMonth
      .filter((v) => v.outcome === "order")
      .reduce((s, v) => s + v.orderValue, 0);
    const target = profile?.monthlyTarget ?? 150_000_000;

    const weekly: { day: string; actual: number; target: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const ds = d.toISOString().slice(0, 10);
      const sumDay = allVisits
        .filter((v) => v.visitDate === ds && v.outcome === "order")
        .reduce((s, v) => s + v.orderValue, 0);
      weekly.push({
        day: ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"][d.getDay()],
        actual: Math.round(sumDay / 1_000_000),
        target: 20,
      });
    }

    return {
      kpi: {
        totalOutletActive,
        visitsToday: visitsToday.length,
        salesThisMonth,
        targetThisMonth: target,
        achievementPct: target > 0 ? (salesThisMonth / target) * 100 : 0,
        openComplaints,
        highPriorityComplaints,
      },
      weeklyPerformance: weekly,
      recentActivity,
      todayTopRanking: ranking.slice(0, 3),
    };
  },
};
