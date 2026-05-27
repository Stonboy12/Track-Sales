import { randomId } from "./crypto";

export interface ActivityLog {
  id: string;
  at: string; // ISO timestamp
  actorId: string | null;
  actorName: string | null;
  action: string; // e.g. "outlet.create", "complaint.update_status"
  entity: string; // e.g. "outlet", "complaint"
  entityId?: string;
  meta?: Record<string, unknown>;
}

const MAX_LOGS = 1000;

class Logger {
  private buf: ActivityLog[] = [];

  record(entry: Omit<ActivityLog, "id" | "at">): ActivityLog {
    const log: ActivityLog = {
      id: randomId("act"),
      at: new Date().toISOString(),
      ...entry,
    };
    this.buf.unshift(log);
    if (this.buf.length > MAX_LOGS) this.buf.length = MAX_LOGS;
    if (process.env.NODE_ENV !== "production") {
      console.log(
        `[activity] ${log.actorName ?? "anon"} -> ${log.action}` +
          (log.entityId ? ` (${log.entity}#${log.entityId})` : "")
      );
    }
    return log;
  }

  list(opts: { limit?: number; entity?: string; actorId?: string } = {}): ActivityLog[] {
    const { limit = 100, entity, actorId } = opts;
    return this.buf
      .filter((l) => (entity ? l.entity === entity : true))
      .filter((l) => (actorId ? l.actorId === actorId : true))
      .slice(0, limit);
  }
}

// Singleton across hot-reloads agar log tidak hilang waktu development.
const g = globalThis as unknown as { __activityLogger?: Logger };
export const activityLogger: Logger = g.__activityLogger ?? new Logger();
g.__activityLogger = activityLogger;
