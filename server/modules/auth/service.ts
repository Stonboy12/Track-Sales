import { Errors } from "../../core/errors";
import { hashPassword, verifyPassword } from "../../core/crypto";
import { activityLogger } from "../../core/logger";
import { db } from "../../db/memory";
import type { User } from "../../db/types";
import type { LoginInput, RegisterInput } from "./schemas";

function toPublicUser(u: User) {
  const { passwordHash, ...rest } = u;
  void passwordHash;
  return rest;
}

export const authService = {
  login(input: LoginInput) {
    const user = db.users.findOne((u) => u.email.toLowerCase() === input.email.toLowerCase());
    if (!user || !user.active) throw Errors.unauthorized("Email atau password salah.");
    const ok = verifyPassword(input.password, user.passwordHash);
    if (!ok) throw Errors.unauthorized("Email atau password salah.");
    activityLogger.record({
      actorId: user.id,
      actorName: user.name,
      action: "auth.login",
      entity: "user",
      entityId: user.id,
    });
    return toPublicUser(user);
  },

  register(input: RegisterInput) {
    const existing = db.users.findOne((u) => u.email.toLowerCase() === input.email.toLowerCase());
    if (existing) throw Errors.conflict("Email sudah terdaftar.");
    const created = db.users.create({
      email: input.email,
      name: input.name,
      role: input.role ?? "sales",
      area: input.area,
      phone: input.phone,
      passwordHash: hashPassword(input.password),
      active: true,
    });
    activityLogger.record({
      actorId: created.id,
      actorName: created.name,
      action: "auth.register",
      entity: "user",
      entityId: created.id,
    });
    return toPublicUser(created);
  },

  me(userId: string) {
    const user = db.users.findById(userId);
    if (!user) throw Errors.unauthorized();
    return toPublicUser(user);
  },
};
