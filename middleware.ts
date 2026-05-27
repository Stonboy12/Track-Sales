import { NextResponse, type NextRequest } from "next/server";

/**
 * Protected routes — redirect ke /login bila cookie session tidak ada.
 *
 * Kita SENGAJA tidak men-decode/verifikasi token di middleware
 * (Edge runtime tidak punya semua API Node yang kita pakai). Tugas verifikasi
 * tetap di route handler API kita lewat InsForge SDK. Middleware hanya
 * memastikan cookie ada — proteksi sebenarnya tetap dipegang server.
 */
const SESSION_COOKIE = process.env.SESSION_COOKIE || "fmcg_session";

const PUBLIC_PATHS = ["/login", "/register"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Lewatkan asset, API, dan halaman publik.
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
