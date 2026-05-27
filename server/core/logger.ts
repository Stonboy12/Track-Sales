import { tryGetContext } from "./request-context";

export interface ActivityLog {
  id: string;
  at: string;
  actorId: string | null;
  actorName: string | null;
  action: string;
  entity: string;
  entityId?: string;
  meta?: Record<string, unknown>;
}

interface RecordInput {
  actorId: string | null;
  actorName: string | null;
  action: string;
  entity: string;
  entityId?: string;
  meta?: Record<string, unknown>;
}

const TABLE = "activity_logs";

/**
 * Persist activity log ke InsForge. Best-effort: kegagalan tidak menggagalkan
 * request utama (mis. user create outlet sukses meski log gagal masuk).
 */
async function record(input: RecordInput): Promise<void> {
  const ctx = tryGetContext();
  if (!ctx) return; // di luar request scope (mis. seed script lokal)
  try {
    const row = {
      actor_id: input.actorId,
      actor_name: input.actorName,
      action: input.action,
      entity: input.entity,
      entity_id: input.entityId ?? null,
      meta: input.meta ?? null,
    };
    const { error } = await ctx.client.database.from(TABLE).insert(row);
    if (error) {
      // eslint-disable-next-line no-console
      console.warn("[activity-logger]", error);
    }
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn("[activity-logger]", e);
  }
}

async function list(opts: { limit?: number; entity?: string; actorId?: string } = {}): Promise<
  ActivityLog[]
> {
  const ctx = tryGetContext();
  if (!ctx) return [];
  let q: any = ctx.client.database.from(TABLE).select("*").order("created_at", { ascending: false });
  if (opts.entity) q = q.eq("entity", opts.entity);
  if (opts.actorId) q = q.eq("actor_id", opts.actorId);
  q = q.limit(opts.limit ?? 100);
  const { data, error } = await q;
  if (error) {
    // eslint-disable-next-line no-console
    console.warn("[activity-logger:list]", error);
    return [];
  }
  return ((data ?? []) as Record<string, unknown>[]).map((r) => ({
    id: r.id as string,
    at: ((r.created_at as string) ?? new Date().toISOString()).toString(),
    actorId: (r.actor_id as string | null) ?? null,
    actorName: (r.actor_name as string | null) ?? null,
    action: r.action as string,
    entity: r.entity as string,
    entityId: (r.entity_id as string | null) ?? undefined,
    meta: (r.meta as Record<string, unknown> | null) ?? undefined,
  }));
}

export const activityLogger = { record, list };
