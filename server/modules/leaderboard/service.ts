import { db } from "../../db/memory";

export interface LeaderboardEntry {
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

export const leaderboardService = {
  /**
   * Hitung leaderboard on the fly dari data User + Visit.
   * Periode: "month" (bulan visitDate sekarang) atau "all".
   */
  ranking(opts: { area?: string; period?: "month" | "all" } = {}): LeaderboardEntry[] {
    const period = opts.period ?? "month";
    const allVisits = db.visits.findAll();
    const now = new Date();
    const currentMonth = now.toISOString().slice(0, 7); // YYYY-MM

    const filteredVisits = allVisits.filter((v) =>
      period === "month" ? v.visitDate.startsWith(currentMonth) : true
    );

    const sales = db.users.findAll(
      (u) => u.role === "sales" && (opts.area ? u.area === opts.area : true)
    );

    const entries: Omit<LeaderboardEntry, "rank">[] = sales.map((u) => {
      const userVisits = filteredVisits.filter((v) => v.salesId === u.id);
      const achievement = userVisits
        .filter((v) => v.outcome === "order")
        .reduce((s, v) => s + v.orderValue, 0);
      const target = u.monthlyTarget ?? 100_000_000;
      const outletsActive = new Set(userVisits.map((v) => v.outletId)).size;
      return {
        userId: u.id,
        name: u.name,
        area: u.area,
        achievement,
        target,
        achievementPct: target > 0 ? (achievement / target) * 100 : 0,
        visits: userVisits.length,
        outletsActive,
      };
    });

    return entries
      .sort((a, b) => b.achievementPct - a.achievementPct || b.achievement - a.achievement)
      .map((e, idx) => ({ ...e, rank: idx + 1 }));
  },
};
