import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decodeSession, SESSION_COOKIE } from "@/server/core/auth";
import { createInsforgeClient } from "@/lib/insforge";
import type { Role } from "@/server/db/types";

/**
 * Helper untuk Server Components: ambil session user (sub, role, name) tanpa
 * pakai withApi() — karena Server Components tidak punya request context kita.
 *
 * Cara pakai dari Server Component:
 *   const me = await getServerUser();
 *   if (!me) redirect("/login");
 *   if (me.role !== "admin") redirect("/");
 */
export interface ServerUser {
  id: string;
  email: string;
  name: string;
  role: Role;
}

export async function getServerUser(): Promise<ServerUser | null> {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const session = decodeSession(token);
  if (!session) return null;

  // Lookup role via InsForge (sekali per request).
  const client = createInsforgeClient(token);
  let role: Role = "sales";
  try {
    const { data } = await client.database
      .from("user_profiles")
      .select("role,is_active")
      .eq("user_id", session.sub)
      .maybeSingle();
    if (data) {
      const row = data as { role: Role; is_active?: boolean };
      if (row.is_active === false) return null; // user dinonaktifkan
      role = row.role;
    }
  } catch {
    // toleransi: kalau lookup gagal, default role sales
  }

  return {
    id: session.sub,
    email: session.email,
    name: session.name ?? session.email.split("@")[0],
    role,
  };
}

/**
 * Versi guard: redirect bila tidak login atau role tidak cukup.
 * Pakai langsung di awal Server Component:
 *   const me = await requireServerUser({ role: "admin" });
 */
export async function requireServerUser(opts: { role?: Role } = {}): Promise<ServerUser> {
  const user = await getServerUser();
  if (!user) redirect("/login");
  if (opts.role && opts.role === "admin" && user.role !== "admin") {
    redirect("/"); // sales tidak boleh ke halaman admin
  }
  return user;
}
