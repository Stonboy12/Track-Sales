import { Errors } from "../../core/errors";
import { activityLogger } from "../../core/logger";
import { db } from "../../db";
import type { Promo } from "../../db/types";
import type { PromoCreateInput, PromoListQuery, PromoUpdateInput } from "./schemas";

interface Actor {
  id: string;
  name: string;
}

export const promoService = {
  /**
   * Sales otomatis hanya melihat promo aktif & dalam periode.
   * Admin bisa lihat semua via opts.activeOnly=false (controller-controlled).
   */
  async list(q: PromoListQuery, opts: { activeOnly?: boolean } = {}): Promise<Promo[]> {
    const today = new Date().toISOString().slice(0, 10);
    const all = await db.promos.findAll({
      where: {
        ...(q.isActive !== undefined ? { is_active: q.isActive } : {}),
        ...(q.productId ? { product_id: q.productId } : {}),
        ...(q.type ? { type: q.type } : {}),
      },
      order: [{ column: "starts_at", ascending: false }],
    });
    if (opts.activeOnly) {
      return all.filter((p) => p.isActive && p.startsAt <= today && p.endsAt >= today);
    }
    return all;
  },

  async get(id: string): Promise<Promo> {
    const p = await db.promos.findById(id);
    if (!p) throw Errors.notFound("Promo");
    return p;
  },

  async create(input: PromoCreateInput, actor: Actor): Promise<Promo> {
    if (input.endsAt < input.startsAt) {
      throw Errors.validation({ formErrors: ["Tanggal akhir harus setelah tanggal mulai."] });
    }
    if (input.productId) {
      const prod = await db.products.findById(input.productId);
      if (!prod) throw Errors.notFound("Product");
    }
    const created = await db.promos.create({ ...input, createdBy: actor.id });
    await activityLogger.record({
      actorId: actor.id,
      actorName: actor.name,
      action: "promo.create",
      entity: "promo",
      entityId: created.id,
      meta: { name: created.name, type: created.type },
    });
    return created;
  },

  async update(id: string, patch: PromoUpdateInput, actor: Actor): Promise<Promo> {
    await this.get(id);
    if (patch.startsAt && patch.endsAt && patch.endsAt < patch.startsAt) {
      throw Errors.validation({ formErrors: ["Tanggal akhir harus setelah tanggal mulai."] });
    }
    if (patch.productId) {
      const prod = await db.products.findById(patch.productId);
      if (!prod) throw Errors.notFound("Product");
    }
    const updated = await db.promos.update(id, patch);
    await activityLogger.record({
      actorId: actor.id,
      actorName: actor.name,
      action: "promo.update",
      entity: "promo",
      entityId: id,
      meta: { changes: Object.keys(patch) },
    });
    return updated;
  },

  async remove(id: string, actor: Actor) {
    await this.get(id);
    await db.promos.delete(id);
    await activityLogger.record({
      actorId: actor.id,
      actorName: actor.name,
      action: "promo.delete",
      entity: "promo",
      entityId: id,
    });
  },
};
