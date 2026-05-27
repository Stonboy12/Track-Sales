import { randomId } from "../core/crypto";
import type { BaseEntity } from "./types";

/**
 * Repository generic — interface CRUD minimal yang sama untuk semua entitas.
 * Implementasi default-nya pakai in-memory store. Cara swap ke DB asli:
 *   - Buat class baru yang mengimplementasi `Repository<T>`
 *   - Ekspor instance-nya dari `server/db/memory.ts`
 *   - Tidak perlu mengubah service/controller.
 */
export interface Repository<T extends BaseEntity> {
  findAll(filter?: (t: T) => boolean): T[];
  findById(id: string): T | null;
  findOne(predicate: (t: T) => boolean): T | null;
  create(input: Omit<T, "id" | "createdAt" | "updatedAt">): T;
  update(id: string, patch: Partial<Omit<T, "id" | "createdAt" | "updatedAt">>): T;
  delete(id: string): void;
  count(filter?: (t: T) => boolean): number;
}

/** Implementasi default in-memory. Aman untuk preview & test. */
export function createMemoryRepository<T extends BaseEntity>(
  entityName: string,
  initial: T[] = []
): Repository<T> {
  const store = new Map<string, T>();
  for (const item of initial) store.set(item.id, item);

  return {
    findAll(filter) {
      const all = Array.from(store.values());
      return filter ? all.filter(filter) : all;
    },
    findById(id) {
      return store.get(id) ?? null;
    },
    findOne(predicate) {
      for (const v of store.values()) if (predicate(v)) return v;
      return null;
    },
    create(input) {
      const now = new Date().toISOString();
      const id = randomId(entityName.slice(0, 3));
      const entity = { ...input, id, createdAt: now, updatedAt: now } as T;
      store.set(id, entity);
      return entity;
    },
    update(id, patch) {
      const existing = store.get(id);
      if (!existing) {
        throw new Error(`${entityName} ${id} not found`);
      }
      const updated = {
        ...existing,
        ...patch,
        id: existing.id,
        createdAt: existing.createdAt,
        updatedAt: new Date().toISOString(),
      } as T;
      store.set(id, updated);
      return updated;
    },
    delete(id) {
      store.delete(id);
    },
    count(filter) {
      if (!filter) return store.size;
      let n = 0;
      for (const v of store.values()) if (filter(v)) n++;
      return n;
    },
  };
}
