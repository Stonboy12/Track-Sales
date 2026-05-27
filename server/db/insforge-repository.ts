import type { InsForgeClient } from "@/lib/insforge";
import { getContext } from "../core/request-context";
import { AppError } from "../core/errors";
import type { BaseEntity } from "./types";
import type { Mapper } from "./mappers";
import type { QueryOptions, Repository } from "./repository";

/**
 * Implementasi `Repository<T>` yang mem-back-end ke InsForge (PostgREST).
 * Client diambil per-request dari `RequestContext` agar setiap query
 * memakai access token user yang sedang login.
 */
function getClient(): InsForgeClient {
  return getContext().client;
}

function applyOptions<B extends Record<string, unknown>>(builder: B, opts?: QueryOptions): B {
  if (!opts) return builder;
  let b: any = builder;
  if (opts.where) {
    for (const [k, v] of Object.entries(opts.where)) {
      if (v === undefined) continue;
      b = b.eq(k, v);
    }
  }
  if (opts.ilike) {
    for (const [k, v] of Object.entries(opts.ilike)) b = b.ilike(k, v);
  }
  if (opts.in) {
    for (const [k, v] of Object.entries(opts.in)) b = b.in(k, v);
  }
  if (opts.gte) {
    for (const [k, v] of Object.entries(opts.gte)) b = b.gte(k, v);
  }
  if (opts.lte) {
    for (const [k, v] of Object.entries(opts.lte)) b = b.lte(k, v);
  }
  if (opts.is) {
    for (const [k, v] of Object.entries(opts.is)) b = b.is(k, v);
  }
  if (opts.order) {
    for (const o of opts.order) b = b.order(o.column, { ascending: o.ascending ?? true });
  }
  if (opts.limit !== undefined && opts.offset !== undefined) {
    b = b.range(opts.offset, opts.offset + opts.limit - 1);
  } else if (opts.limit !== undefined) {
    b = b.limit(opts.limit);
  }
  return b as B;
}

function dbErr(stage: string, err: unknown): never {
  const message = err instanceof Error ? err.message : String(err);
  // eslint-disable-next-line no-console
  console.error(`[insforge-repo:${stage}]`, err);
  throw new AppError("DB_ERROR", `Database error (${stage}): ${message}`, 500);
}

export function createInsforgeRepository<T extends BaseEntity>(
  mapper: Mapper<T>
): Repository<T> {
  const { table } = mapper;

  return {
    async findAll(opts) {
      try {
        const client = getClient();
        let q: any = client.database.from(table).select("*");
        q = applyOptions(q, opts);
        const { data, error } = await q;
        if (error) throw error;
        return ((data ?? []) as Record<string, unknown>[]).map((r) => mapper.fromRow(r));
      } catch (e) {
        return dbErr(`${table}.findAll`, e);
      }
    },

    async findById(id) {
      try {
        const client = getClient();
        const { data, error } = await client.database
          .from(table)
          .select("*")
          .eq("id", id)
          .maybeSingle();
        if (error) throw error;
        return data ? mapper.fromRow(data as Record<string, unknown>) : null;
      } catch (e) {
        return dbErr(`${table}.findById`, e);
      }
    },

    async findOne(opts) {
      try {
        const client = getClient();
        let q: any = client.database.from(table).select("*").limit(1);
        q = applyOptions(q, { ...opts, limit: 1 });
        const { data, error } = await q;
        if (error) throw error;
        const arr = (data ?? []) as Record<string, unknown>[];
        return arr.length ? mapper.fromRow(arr[0]) : null;
      } catch (e) {
        return dbErr(`${table}.findOne`, e);
      }
    },

    async create(input) {
      try {
        const client = getClient();
        const row = mapper.toRow(input as Partial<T>);
        const { data, error } = await client.database.from(table).insert(row).select();
        if (error) throw error;
        const arr = (data ?? []) as Record<string, unknown>[];
        if (!arr.length) throw new Error("Insert returned no rows");
        return mapper.fromRow(arr[0]);
      } catch (e) {
        return dbErr(`${table}.create`, e);
      }
    },

    async update(id, patch) {
      try {
        const client = getClient();
        const row = mapper.toRow(patch as Partial<T>);
        // pastikan updated_at refresh — kalau DB punya trigger, baris ini no-op
        (row as Record<string, unknown>).updated_at = new Date().toISOString();
        const { data, error } = await client.database
          .from(table)
          .update(row)
          .eq("id", id)
          .select();
        if (error) throw error;
        const arr = (data ?? []) as Record<string, unknown>[];
        if (!arr.length) {
          throw new AppError("NOT_FOUND", `${table} ${id} tidak ditemukan.`, 404);
        }
        return mapper.fromRow(arr[0]);
      } catch (e) {
        if (e instanceof AppError) throw e;
        return dbErr(`${table}.update`, e);
      }
    },

    async delete(id) {
      try {
        const client = getClient();
        const { error } = await client.database.from(table).delete().eq("id", id);
        if (error) throw error;
      } catch (e) {
        dbErr(`${table}.delete`, e);
      }
    },

    async count(opts) {
      try {
        const client = getClient();
        let q: any = client.database.from(table).select("*", { count: "exact", head: true });
        q = applyOptions(q, opts);
        const { error, count } = await q;
        if (error) throw error;
        return count ?? 0;
      } catch (e) {
        return dbErr(`${table}.count`, e);
      }
    },

    async listWithCount(opts) {
      try {
        const client = getClient();
        let q: any = client.database.from(table).select("*", { count: "exact" });
        q = applyOptions(q, opts);
        const { data, error, count } = await q;
        if (error) throw error;
        const items = ((data ?? []) as Record<string, unknown>[]).map((r) => mapper.fromRow(r));
        return { items, total: count ?? items.length };
      } catch (e) {
        return dbErr(`${table}.listWithCount`, e);
      }
    },
  };
}
