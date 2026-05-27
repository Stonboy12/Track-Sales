import { activityLogger } from "../../core/logger";
import { db } from "../../db/memory";
import type { CompetitorPrice } from "../../db/types";
import type {
  CompetitorPriceCreateInput,
  CompetitorPriceListQuery,
} from "./schemas";

interface Actor {
  id: string;
  name: string;
}

export const competitorPriceService = {
  list(q: CompetitorPriceListQuery) {
    const all = db.competitorPrices.findAll((c) => {
      if (q.productName && c.productName !== q.productName) return false;
      if (q.competitor && c.competitor !== q.competitor) return false;
      if (q.area && c.area !== q.area) return false;
      if (q.from && c.observedAt < q.from) return false;
      if (q.to && c.observedAt > q.to) return false;
      if (
        q.search &&
        !`${c.productName} ${c.competitor} ${c.outlet}`
          .toLowerCase()
          .includes(q.search.toLowerCase())
      )
        return false;
      return true;
    });
    all.sort((a, b) => b.observedAt.localeCompare(a.observedAt));
    const total = all.length;
    const start = (q.page - 1) * q.limit;
    return {
      items: all.slice(start, start + q.limit),
      total,
      page: q.page,
      limit: q.limit,
    };
  },

  create(input: CompetitorPriceCreateInput, actor: Actor): CompetitorPrice {
    const created = db.competitorPrices.create({
      ...input,
      reportedBy: actor.id,
    });
    activityLogger.record({
      actorId: actor.id,
      actorName: actor.name,
      action: "competitor_price.create",
      entity: "competitor_price",
      entityId: created.id,
      meta: { product: created.productName, competitor: created.competitor },
    });
    return created;
  },

  /**
   * Tren harga harian: rata-rata harga kami vs kompetitor untuk produk tertentu.
   * Output siap-pakai oleh komponen LineChart frontend.
   */
  trend(productName: string, days: number) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    const records = db.competitorPrices.findAll(
      (c) => c.productName === productName && c.observedAt >= cutoffStr
    );

    const grouped = new Map<string, { sumUs: number; sumComp: number; n: number }>();
    for (const r of records) {
      const g = grouped.get(r.observedAt) ?? { sumUs: 0, sumComp: 0, n: 0 };
      g.sumUs += r.ourPrice;
      g.sumComp += r.price;
      g.n += 1;
      grouped.set(r.observedAt, g);
    }
    const series = Array.from(grouped.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, v]) => ({
        date,
        us: Math.round(v.sumUs / v.n),
        comp: Math.round(v.sumComp / v.n),
      }));

    // Insight ringan — gantilah dengan call ke LLM saat AI siap.
    let insight = "Belum ada data cukup untuk menghasilkan insight.";
    if (series.length >= 2) {
      const first = series[0];
      const last = series[series.length - 1];
      const diff = last.comp - first.comp;
      const dir = diff > 0 ? "naik" : diff < 0 ? "turun" : "stabil";
      insight = `Harga kompetitor ${dir} ${Math.abs(
        Math.round((diff / Math.max(first.comp, 1)) * 100)
      )}% dalam ${days} hari. Selisih akhir: Rp ${last.us - last.comp}.`;
    }
    return { series, insight };
  },
};
