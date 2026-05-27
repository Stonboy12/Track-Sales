import type { NextRequest } from "next/server";
import { Errors } from "./errors";
import { tryGetContext } from "./request-context";
import type { Role } from "../db/types";

/**
 * Auth helper. Kita tidak lagi mint JWT sendiri — semua token diterbitkan
 * InsForge lewat `signInWithPassword`. Server kita hanya menyimpan token itu
 * di cookie httpOnly (sebagai session) dan mendekodenya untuk membaca claim.
 *
 * Verifikasi tanda tangan token dilakukan oleh InsForge sendiri pada setiap
 * panggilan database / auth (request akan ditolak server InsForge bila token
 * dipalsukan). Decoding di sini hanya untuk membaca `sub`, `email`, `exp`.
 */
export const SESSION_COOKIE = process.env.SESSION_COOKIE || "fmcg_session";
const COOKIE_TTL_SECONDS = 60 * 60 * 24 * 7;

export interface SessionPayload {
  sub: string;
  email: string;
  name?: string;
  exp: number;
  iat?: number;
}

function b64urlDecode(input: string): Buffer {
  let s = input.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return Buffer.from(s, "base64");
}

export function decodeSession(token: string): SessionPayload | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const json = JSON.parse(b64urlDecode(payload).toString("utf-8")) as
      | (SessionPayload & { name?: string; user?: { name?: string; profile?: { name?: string } } })
      | null;
    if (!json) return null;
    if (json.exp && json.exp * 1000 < Date.now()) return null;
    return {
      sub: json.sub,
      email: json.email,
      name: json.name ?? json.user?.profile?.name ?? json.user?.name,
      exp: json.exp,
      iat: json.iat,
    };
  } catch {
    return null;
  }
}

export function buildSessionCookie(token: string, maxAgeSec = COOKIE_TTL_SECONDS): string {
  const parts = [
    `${SESSION_COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAgeSec}`,
  ];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

export function buildClearSessionCookie(): string {
  const parts = [`${SESSION_COOKIE}=`, "Path=/", "HttpOnly", "SameSite=Lax", "Max-Age=0"];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

export function readSessionToken(req: NextRequest): string | null {
  return req.cookies.get(SESSION_COOKIE)?.value ?? null;
}

export function getSession(req: NextRequest): SessionPayload | null {
  const token = readSessionToken(req);
  if (!token) return null;
  return decodeSession(token);
}

/**
 * Pastikan request terautentikasi. Mengembalikan info user dari context;
 * gunakan ini di controller menggantikan getSession langsung.
 */
export interface SessionInfo {
  sub: string;
  email: string;
  name: string;
  role?: Role;
  token: string;
}

export function requireAuth(req: NextRequest): SessionInfo {
  const ctx = tryGetContext();
  const token = ctx?.accessToken ?? readSessionToken(req);
  const session = token ? decodeSession(token) : null;
  if (!token || !session) throw Errors.unauthorized();
  return {
    sub: session.sub,
    email: session.email,
    name: session.name ?? session.email.split("@")[0],
    role: ctx?.role,
    token,
  };
}

/**
 * Hierarki sederhana: admin > sales.
 * `requireRole(req, "sales")` artinya minimal sales (admin lulus juga).
 * `requireRole(req, "admin")` hanya admin.
 */
const ROLE_HIERARCHY: Record<Role, Role[]> = {
  admin: ["admin"],
  sales: ["admin", "sales"],
};

/** Pastikan user punya role minimal `min`. */
export function requireRole(req: NextRequest, ...allowed: Role[]): SessionInfo {
  const session = requireAuth(req);
  if (!session.role || !allowed.includes(session.role)) {
    // dukung juga "role minimal" via hierarki: bila allowed=["sales"], sales/supervisor/admin OK
    const expanded = new Set<Role>();
    for (const a of allowed) for (const r of ROLE_HIERARCHY[a]) expanded.add(r);
    if (!session.role || !expanded.has(session.role)) {
      throw Errors.forbidden();
    }
  }
  return session;
}
