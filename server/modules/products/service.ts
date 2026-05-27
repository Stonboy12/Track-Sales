import { Errors } from "../../core/errors";
import { activityLogger } from "../../core/logger";
import { db } from "../../db";
import type { Product } from "../../db/types";
import type {
  ProductCreateInput,
  ProductListQuery,
  ProductUpdateInput,
} from "./schemas";

interface Actor {
  id: string;
  name: string;
}

export const productService = {
  async list(q: ProductListQuery): Promise<Product[]> {
    return db.products.findAll({
      where: {
        ...(q.category ? { category: q.category } : {}),
        ...(q.brand ? { brand: q.brand } : {}),
        ...(q.stockStatus ? { stock_status: q.stockStatus } : {}),
      },
      ilike: q.search ? { name: `%${q.search}%` } : undefined,
      order: [{ column: "name", ascending: true }],
    });
  },
  async get(id: string): Promise<Product> {
    const p = await db.products.findById(id);
    if (!p) throw Errors.notFound("Product");
    return p;
  },
  async create(input: ProductCreateInput, actor: Actor) {
    const dup = await db.products.findOne({ where: { sku: input.sku } });
    if (dup) throw Errors.conflict("SKU sudah dipakai.");
    const created = await db.products.create(input);
    await activityLogger.record({
      actorId: actor.id,
      actorName: actor.name,
      action: "product.create",
      entity: "product",
      entityId: created.id,
      meta: { sku: created.sku, name: created.name },
    });
    return created;
  },
  async update(id: string, patch: ProductUpdateInput, actor: Actor) {
    await this.get(id);
    const u = await db.products.update(id, patch);
    await activityLogger.record({
      actorId: actor.id,
      actorName: actor.name,
      action: "product.update",
      entity: "product",
      entityId: id,
    });
    return u;
  },
};
