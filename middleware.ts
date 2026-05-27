import { NextResponse, type NextRequest } from "next/server";

/**
 * Protected routes.
 *
 * Middleware **TIDAK** men-decode JWT (Edge runtime tidak punya semua API
 * Node yang kita pakai). Tugas verifikasi tetap di route handler API. Di sini
 * kita hanya:
 *   1. Pastikan cookie session ada untuk halaman protected → kalau tidak
 *      ada, redirect ke /login.
 *   2. Lewatkan halaman publik dan asset.
 *
 * Cek role per-halaman (mis. /admin/*) dilakukan di server component / page
 * lewat hook `requireSessionUser({ role: "admin" })`. Backend (semua API)
 * juga punya `requireRole()` sebagai sumber kebenaran.
 */
const SESSION_COOKIE = process.env.SESSION_COOKIE || "fmcg_session";

const PUBLIC_PATHS = ["/login", "/register"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/static") ||
    pathname === "/favicon.ico" ||
    PUBLIC_PATHS.includes(pathname)
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
