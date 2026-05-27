import { db } from "../../db";

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
  async ranking(opts: { area?: string; period?: "month" | "all" } = {}): Promise<LeaderboardEntry[]> {
    const period = opts.period ?? "month";
    const now = new Date();
    const monthPrefix = now.toISOString().slice(0, 7);

    const [profiles, allVisits] = await Promise.all([
      db.userProfiles.findAll({
        where: { role: "sales", ...(opts.area ? { area: opts.area } : {}) },
      }),
      db.visits.findAll(),
    ]);

    const filteredVisits = allVisits.filter((v) =>
      period === "month" ? v.visitDate.startsWith(monthPrefix) : true
    );

    const entries = profiles.map((p) => {
      const userVisits = filteredVisits.filter((v) => v.salesId === p.userId);
      const achievement = userVisits
        .filter((v) => v.outcome === "order")
        .reduce((s, v) => s + v.orderValue, 0);
      const target = p.monthlyTarget ?? 100_000_000;
      const outletsActive = new Set(userVisits.map((v) => v.outletId)).size;
      return {
        userId: p.userId,
        name: p.userId, // nama akan di-enrich lewat /api/auth/getProfile bila perlu
        area: p.area,
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
