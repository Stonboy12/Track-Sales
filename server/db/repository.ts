import type { BaseEntity } from "./types";

/**
 * Generic async Repository<T>. Implementasi default-nya pakai InsForge SDK
 * (lihat `insforge-repository.ts`). Cara swap ke DB lain (mis. Postgres
 * langsung): ganti factory di `server/db/index.ts`.
 */
export interface QueryOptions {
  /** Equality filters (column = value). */
  where?: Record<string, unknown>;
  /** ILIKE filters: { column: '%pattern%' } */
  ilike?: Record<string, string>;
  /** IN filters. */
  in?: Record<string, unknown[]>;
  /** Greater-than-or-equal filters. */
  gte?: Record<string, unknown>;
  /** Less-than-or-equal filters. */
  lte?: Record<string, unknown>;
  /** IS filters (e.g. for null). */
  is?: Record<string, unknown>;
  order?: { column: string; ascending?: boolean }[];
  limit?: number;
  offset?: number;
}

export interface Repository<T extends BaseEntity> {
  findAll(opts?: QueryOptions): Promise<T[]>;
  findById(id: string): Promise<T | null>;
  findOne(opts: QueryOptions): Promise<T | null>;
  create(input: Omit<T, "id" | "createdAt" | "updatedAt">): Promise<T>;
  update(id: string, patch: Partial<Omit<T, "id" | "createdAt" | "updatedAt">>): Promise<T>;
  delete(id: string): Promise<void>;
  count(opts?: QueryOptions): Promise<number>;
  /** Untuk join eager — opsional. Default panggil findAll saja. */
  listWithCount(opts?: QueryOptions): Promise<{ items: T[]; total: number }>;
}
