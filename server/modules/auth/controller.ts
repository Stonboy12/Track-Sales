import type { NextRequest } from "next/server";
import { ok, created } from "../../core/response";
import {
  buildClearSessionCookie,
  buildSessionCookie,
  requireAuth,
  signToken,
} from "../../core/auth";
import { parseBody } from "../../core/validate";
import { activityLogger } from "../../core/logger";
import { authService } from "./service";
import { loginSchema, registerSchema } from "./schemas";

export const authController = {
  async login(req: NextRequest) {
    const input = await parseBody(req, loginSchema);
    const user = authService.login(input);
    const token = signToken({
      sub: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    });
    return ok(
      { user, token },
      { headers: { "Set-Cookie": buildSessionCookie(token) } }
    );
  },

  async register(req: NextRequest) {
    const input = await parseBody(req, registerSchema);
    const user = authService.register(input);
    const token = signToken({
      sub: user.id,
      role: user.role,
      email: user.email,
      name: user.name,
    });
    const res = created({ user, token });
    res.headers.set("Set-Cookie", buildSessionCookie(token));
    return res;
  },

  async logout(req: NextRequest) {
    // best-effort: catat siapa yang logout (kalau masih punya sesi)
    try {
      const session = requireAuth(req);
      activityLogger.record({
        actorId: session.sub,
        actorName: session.name,
        action: "auth.logout",
        entity: "user",
        entityId: session.sub,
      });
    } catch {
      // ignore
    }
    return ok(
      { ok: true },
      { headers: { "Set-Cookie": buildClearSessionCookie() } }
    );
  },

  async me(req: NextRequest) {
    const session = requireAuth(req);
    return ok(authService.me(session.sub));
  },
};
