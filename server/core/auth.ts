import { createHmac, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { Errors } from "./errors";
import type { Role } from "../db/types";

const SECRET = process.env.AUTH_SECRET || "fmcg-dev-secret-change-me";
export const SESSION_COOKIE = "fmcg_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 hari

export interface SessionPayload {
  sub: string; // user id
  role: Role;
  email: string;
  name: string;
  iat: number;
  exp: number;
}

function b64url(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input) : input;
  return buf.toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64urlDecode(input: string): Buffer {
  let s = input.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return Buffer.from(s, "base64");
}

function sign(data: string): string {
  return b64url(createHmac("sha256", SECRET).update(data).digest());
}

/**
 * Buat token mirip JWT (HS256). Sengaja tidak pakai library JWT untuk menghemat
 * dependency — implementasi kecil, mudah diaudit, mudah diganti dengan `jose` nanti.
 */
export function signToken(payload: Omit<SessionPayload, "iat" | "exp">): string {
  const header = { alg: "HS256", typ: "JWT" };
  const now = Math.floor(Date.now() / 1000);
  const fullPayload: SessionPayload = {
    ...payload,
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };
  const encHeader = b64url(JSON.stringify(header));
  const encPayload = b64url(JSON.stringify(fullPayload));
  const signature = sign(`${encHeader}.${encPayload}`);
  return `${encHeader}.${encPayload}.${signature}`;
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    const [h, p, s] = token.split(".");
    if (!h || !p || !s) return null;
    const expected = sign(`${h}.${p}`);
    const a = Buffer.from(s);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const payload = JSON.parse(b64urlDecode(p).toString("utf-8")) as SessionPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

/** Bentuk Set-Cookie string siap dipakai NextResponse. */
export function buildSessionCookie(token: string, maxAgeSec = SESSION_TTL_SECONDS): string {
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

export function getSession(req: NextRequest): SessionPayload | null {
  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}

/** Pastikan request terautentikasi, lempar 401 bila tidak. */
export function requireAuth(req: NextRequest): SessionPayload {
  const session = getSession(req);
  if (!session) throw Errors.unauthorized();
  return session;
}

/** Pastikan user punya salah satu role yang diizinkan. */
export function requireRole(req: NextRequest, ...roles: Role[]): SessionPayload {
  const session = requireAuth(req);
  if (!roles.includes(session.role)) throw Errors.forbidden();
  return session;
}
