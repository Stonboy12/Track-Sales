import { z } from "zod";
import { withApi } from "@/server/core/handler";
import { ok } from "@/server/core/response";
import { requireRole } from "@/server/core/auth";
import { parseBody } from "@/server/core/validate";
import { db } from "@/server/db";
import {
  outlets as mockOutlets,
  products as mockProducts,
  competitorPrices as mockCompetitorPrices,
} from "@/lib/mock-data";

/**
 * Endpoint admin-only untuk seed data awal ke InsForge.
 *
 * Tidak idempotent total — produk & outlet dicegah duplikat lewat unique key
 * (sku, code) dan akan di-skip bila sudah ada.
 *
 * POST body opsional: `{ "tables": ["outlets","products","competitor_prices"] }`
 */
const bodySchema = z
  .object({
    tables: z.array(z.enum(["outlets", "products", "competitor_prices"])).optional(),
  })
  .default({});

export const POST = withApi(async (req) => {
  const session = requireRole(req, "admin");
  const { tables } = await parseBody(req, bodySchema);
  const include = (t: string) => !tables || tables.includes(t as never);

  const stats: Record<string, { inserted: number; skipped: number }> = {};

  if (include("outlets")) {
    let inserted = 0;
    let skipped = 0;
    for (const o of mockOutlets) {
      const exists = await db.outlets.findOne({ where: { code: o.code } });
      if (exists) {
        skipped++;
        continue;
      }
      await db.outlets.create({
        code: o.code,
        name: o.name,
        area: o.area,
        segment: o.segment,
        priority: o.priority,
        status: o.status,
        ownerName: o.ownerName,
        phone: o.phone,
        address: o.address,
        assignedSalesId: session.sub,
      });
      inserted++;
    }
    stats.outlets = { inserted, skipped };
  }

  if (include("products")) {
    let inserted = 0;
    let skipped = 0;
    for (const p of mockProducts) {
      const exists = await db.products.findOne({ where: { sku: p.sku } });
      if (exists) {
        skipped++;
        continue;
      }
      await db.products.create({
        sku: p.sku,
        name: p.name,
        category: p.category,
        brand: p.brand,
        price: p.price,
        stockStatus: p.stockStatus,
        description: p.description,
        sellingPoints: p.sellingPoints,
        promo: p.promo,
        faqs: p.faqs,
      });
      inserted++;
    }
    stats.products = { inserted, skipped };
  }

  if (include("competitor_prices")) {
    let inserted = 0;
    for (const c of mockCompetitorPrices) {
      await db.competitorPrices.create({
        productName: c.product,
        competitor: c.competitor,
        outlet: c.outlet,
        area: c.area,
        price: c.price,
        ourPrice: c.ourPrice,
        observedAt: c.date,
        note: c.note,
        reportedBy: session.sub,
      });
      inserted++;
    }
    stats.competitor_prices = { inserted, skipped: 0 };
  }

  return ok({ stats });
});

export const dynamic = "force-dynamic";
