import { db } from "../../db";
import { getContext } from "../../core/request-context";
import type { PublicUser, Role } from "../../db/types";

interface InsforgeUser {
  id: string;
  email: string;
  profile?: { name?: string; avatar_url?: string };
}

/**
 * Service users gabungkan data dari InsForge auth (email/profile) dan
 * tabel user_profiles (role/area/target).
 *
 * Catatan: InsForge SDK belum mengekspos endpoint listUsers untuk anon role,
 * jadi list()/get() di sini di-back-end ke `user_profiles` (yang kita kontrol).
 * Bila perlu detail email/avatar, panggil getProfile dari client side.
 */
export const userService = {
  async list(filter?: { role?: Role; area?: string; search?: string }) {
    const profiles = await db.userProfiles.findAll({
      where: filter?.role ? { role: filter.role } : undefined,
      ilike: filter?.area ? { area: `%${filter.area}%` } : undefined,
      order: [{ column: "created_at", ascending: false }],
    });
    let result = profiles;
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      result = result.filter((p) => (p.area ?? "").toLowerCase().includes(q));
    }
    // Kembalikan PublicUser[] minimal (tanpa email/avatar) — frontend bisa
    // memanggil getProfile(userId) jika butuh data tambahan.
    return result.map<Partial<PublicUser> & { id: string; userId: string; role: Role }>(
      (p) => ({
        id: p.userId,
        userId: p.userId,
        role: p.role,
        area: p.area,
        phone: p.phone,
        monthlyTarget: p.monthlyTarget,
        name: "",
        email: "",
      })
    );
  },

  async get(userId: string) {
    const profile = await db.userProfiles.findOne({ where: { user_id: userId } });
    if (!profile) return null;
    // Coba ambil profile InsForge (nama + avatar)
    const { client } = getContext();
    const { data } = await client.auth.getProfile(userId).catch(() => ({ data: null }));
    return {
      id: userId,
      email: "",
      name: (data as { name?: string } | null)?.name ?? "",
      avatarUrl: (data as { avatar_url?: string } | null)?.avatar_url,
      role: profile.role,
      area: profile.area,
      phone: profile.phone,
      monthlyTarget: profile.monthlyTarget,
    } satisfies PublicUser;
  },
};
