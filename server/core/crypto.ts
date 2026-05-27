import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

/**
 * Hashing password pakai scrypt (built-in Node) — tidak butuh dependency tambahan.
 * Format simpan: `salt$hash` (hex), aman untuk disimpan apa adanya di DB.
 */
const KEYLEN = 64;

export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(plain, salt, KEYLEN).toString("hex");
  return `${salt}$${hash}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  const [salt, hash] = stored.split("$");
  if (!salt || !hash) return false;
  const candidate = scryptSync(plain, salt, KEYLEN);
  const original = Buffer.from(hash, "hex");
  if (candidate.length !== original.length) return false;
  return timingSafeEqual(candidate, original);
}

export function randomId(prefix = "id"): string {
  return `${prefix}_${randomBytes(8).toString("hex")}`;
}
