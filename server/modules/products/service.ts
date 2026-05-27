import { Errors } from "../../core/errors";
import { activityLogger } from "../../core/logger";
import { db } from "../../db/memory";
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
  list(q: ProductListQuery): Product[] {
    return db.products.findAll((p) => {
      if (q.category && p.category !== q.category) return false;
      if (q.brand && p.brand !== q.brand) return false;
      if (q.stockStatus && p.stockStatus !== q.stockStatus) return false;
      if (
        q.search &&
        !`${p.name} ${p.sku} ${p.brand}`.toLowerCase().includes(q.search.toLowerCase())
      )
        return false;
      return true;
    });
  },
  get(id: string): Product {
    const p = db.products.findById(id);
    if (!p) throw Errors.notFound("Product");
    return p;
  },
  create(input: ProductCreateInput, actor: Actor) {
    if (db.products.findOne((p) => p.sku === input.sku))
      throw Errors.conflict("SKU sudah dipakai.");
    const created = db.products.create(input);
    activityLogger.record({
      actorId: actor.id,
      actorName: actor.name,
      action: "product.create",
      entity: "product",
      entityId: created.id,
      meta: { sku: created.sku, name: created.name },
    });
    return created;
  },
  update(id: string, patch: ProductUpdateInput, actor: Actor) {
    this.get(id);
    const u = db.products.update(id, patch);
    activityLogger.record({
      actorId: actor.id,
      actorName: actor.name,
      action: "product.update",
      entity: "product",
      entityId: id,
    });
    return u;
  },
};
