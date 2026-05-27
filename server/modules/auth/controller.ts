import type { NextRequest } from "next/server";
import { ok, created } from "../../core/response";
import { buildClearSessionCookie, buildSessionCookie } from "../../core/auth";
import { parseBody } from "../../core/validate";
import { authService } from "./service";
import { loginSchema, registerSchema } from "./schemas";

export const authController = {
  async login(req: NextRequest) {
    const input = await parseBody(req, loginSchema);
    const { user, accessToken } = await authService.login(input);
    return ok(
      { user },
      { headers: { "Set-Cookie": buildSessionCookie(accessToken) } }
    );
  },

  async register(req: NextRequest) {
    const input = await parseBody(req, registerSchema);
    const result = await authService.register(input);
    if (result.requireEmailVerification || !result.accessToken) {
      return created({
        requireEmailVerification: true,
        message:
          "Akun dibuat. Silakan cek email untuk verifikasi sebelum login.",
      });
    }
    const res = created({ user: result.user });
    res.headers.set("Set-Cookie", buildSessionCookie(result.accessToken));
    return res;
  },

  async logout() {
    await authService.logout();
    return ok(
      { ok: true },
      { headers: { "Set-Cookie": buildClearSessionCookie() } }
    );
  },

  async me() {
    return ok(await authService.me());
  },
};
