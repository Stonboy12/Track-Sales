import { activityLogger } from "../../core/logger";
import { db } from "../../db";
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
  async list(q: CompetitorPriceListQuery) {
    const opts = {
      where: {
        ...(q.productName ? { product_name: q.productName } : {}),
        ...(q.competitor ? { competitor: q.competitor } : {}),
        ...(q.area ? { area: q.area } : {}),
      },
      gte: q.from ? { observed_at: q.from } : undefined,
      lte: q.to ? { observed_at: q.to } : undefined,
      order: [{ column: "observed_at", ascending: false }],
      limit: q.limit,
      offset: (q.page - 1) * q.limit,
    };
    const { items, total } = await db.competitorPrices.listWithCount(opts);
    let result = items;
    if (q.search) {
      const term = q.search.toLowerCase();
      result = items.filter((c) =>
        `${c.productName} ${c.competitor} ${c.outlet}`.toLowerCase().includes(term)
      );
    }
    return { items: result, total, page: q.page, limit: q.limit };
  },

  async create(input: CompetitorPriceCreateInput, actor: Actor): Promise<CompetitorPrice> {
    const created = await db.competitorPrices.create({
      ...input,
      reportedBy: actor.id,
    });
    await activityLogger.record({
      actorId: actor.id,
      actorName: actor.name,
      action: "competitor_price.create",
      entity: "competitor_price",
      entityId: created.id,
      meta: { product: created.productName, competitor: created.competitor },
    });
    return created;
  },

  async trend(productName: string, days: number) {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    const cutoffStr = cutoff.toISOString().slice(0, 10);
    const records = await db.competitorPrices.findAll({
      where: { product_name: productName },
      gte: { observed_at: cutoffStr },
      order: [{ column: "observed_at", ascending: true }],
    });

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
