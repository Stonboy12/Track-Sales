import { ok } from "@/server/core/response";

export async function GET() {
  return ok({ status: "ok", time: new Date().toISOString() });
}
