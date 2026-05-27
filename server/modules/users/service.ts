import { db } from "../../db/memory";
import type { User } from "../../db/types";

function toPublic(u: User) {
  const { passwordHash, ...rest } = u;
  void passwordHash;
  return rest;
}

export const userService = {
  list(filter?: { role?: User["role"]; area?: string; search?: string }) {
    return db.users
      .findAll((u) => {
        if (filter?.role && u.role !== filter.role) return false;
        if (filter?.area && u.area !== filter.area) return false;
        if (
          filter?.search &&
          !`${u.name} ${u.email}`.toLowerCase().includes(filter.search.toLowerCase())
        )
          return false;
        return true;
      })
      .map(toPublic);
  },
  get(id: string) {
    const u = db.users.findById(id);
    return u ? toPublic(u) : null;
  },
};
