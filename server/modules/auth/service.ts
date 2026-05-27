import { Errors } from "../../core/errors";
import { activityLogger } from "../../core/logger";
import { getContext } from "../../core/request-context";
import { db } from "../../db";
import type { PublicUser, Role } from "../../db/types";
import type { LoginInput, RegisterInput } from "./schemas";

interface InsforgeUser {
  id: string;
  email: string;
  emailVerified?: boolean;
  profile?: { name?: string; avatar_url?: string };
}

async function loadProfile(userId: string) {
  return db.userProfiles.findOne({ where: { user_id: userId } });
}

async function ensureProfile(userId: string, role: Role = "sales", area?: string) {
  const existing = await loadProfile(userId);
  if (existing) return existing;
  return db.userProfiles.create({
    userId,
    role,
    area,
  } as any);
}

function toPublicUser(u: InsforgeUser, profile: Awaited<ReturnType<typeof loadProfile>>): PublicUser {
  return {
    id: u.id,
    email: u.email,
    name: u.profile?.name ?? u.email.split("@")[0],
    avatarUrl: u.profile?.avatar_url,
    emailVerified: u.emailVerified,
    role: profile?.role ?? "sales",
    area: profile?.area,
    phone: profile?.phone,
    monthlyTarget: profile?.monthlyTarget,
  };
}

export const authService = {
  /** Login — pakai InsForge SDK; sukses kembalikan user + access token (caller akan set cookie). */
  async login(input: LoginInput): Promise<{ user: PublicUser; accessToken: string }> {
    const { client } = getContext();
    const { data, error } = await client.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });
    if (error || !data?.accessToken || !data.user) {
      throw Errors.unauthorized(error?.message ?? "Email atau password salah.");
    }
    // Setelah signIn berhasil, SDK menempelkan accessToken pada client; tapi
    // kita tetap pakai client baru per-request, jadi kita panggil setAccessToken
    // dulu agar query profile pakai token yang baru.
    (client as unknown as { setAccessToken?: (t: string | null) => void })
      .setAccessToken?.(data.accessToken);

    const profile = await ensureProfile(data.user.id);
    const user = toPublicUser(data.user as InsforgeUser, profile);
    activityLogger.record({
      actorId: user.id,
      actorName: user.name,
      action: "auth.login",
      entity: "user",
      entityId: user.id,
    });
    return { user, accessToken: data.accessToken };
  },

  /** Register — tangani case email verification required. */
  async register(input: RegisterInput): Promise<{
    user: PublicUser | null;
    accessToken: string | null;
    requireEmailVerification: boolean;
  }> {
    const { client } = getContext();
    const { data, error } = await client.auth.signUp({
      email: input.email,
      password: input.password,
      name: input.name,
    });
    if (error) {
      // Map ke 400/409 yang masuk akal
      if (error.message?.toLowerCase().includes("already")) {
        throw Errors.conflict("Email sudah terdaftar.");
      }
      throw Errors.validation({ formErrors: [error.message ?? "Gagal daftar."] });
    }
    if (!data) throw Errors.internal("Respons signUp kosong.");

    // Buat user_profiles row terlepas dari email verification (agar role tersedia
    // saat user verifikasi nanti). Pakai default role=sales atau dari payload.
    if (data.user?.id) {
      const role: Role = input.role ?? "sales";
      await ensureProfile(data.user.id, role, input.area);
    }

    if (data.requireEmailVerification || !data.accessToken) {
      return { user: null, accessToken: null, requireEmailVerification: true };
    }

    (client as unknown as { setAccessToken?: (t: string | null) => void })
      .setAccessToken?.(data.accessToken);
    const profile = await loadProfile(data.user!.id);
    const user = toPublicUser(data.user as InsforgeUser, profile);
    activityLogger.record({
      actorId: user.id,
      actorName: user.name,
      action: "auth.register",
      entity: "user",
      entityId: user.id,
    });
    return { user, accessToken: data.accessToken, requireEmailVerification: false };
  },

  async logout(): Promise<void> {
    const { client, userId, userName } = getContext();
    try {
      await client.auth.signOut();
    } catch {
      // ignore — cookie tetap dihapus oleh controller
    }
    if (userId) {
      activityLogger.record({
        actorId: userId,
        actorName: userName ?? null,
        action: "auth.logout",
        entity: "user",
        entityId: userId,
      });
    }
  },

  /** Ambil user saat ini (validasi token via InsForge `getCurrentUser`). */
  async me(): Promise<PublicUser> {
    const { client, userId } = getContext();
    if (!userId) throw Errors.unauthorized();
    const { data, error } = await client.auth.getCurrentUser();
    if (error || !data?.user) throw Errors.unauthorized("Sesi tidak valid.");
    const profile = await ensureProfile(data.user.id);
    return toPublicUser(data.user as InsforgeUser, profile);
  },
};
