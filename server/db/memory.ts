import { createMemoryRepository, type Repository } from "./repository";
import type {
  Complaint,
  CompetitorPrice,
  Notification,
  Outlet,
  Product,
  PromoSimulation,
  Report,
  RoutePlan,
  User,
  UserSetting,
  Visit,
} from "./types";
import { seed } from "./seed";

/**
 * Pusat akses semua repository. Ditaruh sebagai singleton global agar
 * selamat dari hot-reload Next.js di mode dev.
 */
export interface DB {
  users: Repository<User>;
  outlets: Repository<Outlet>;
  visits: Repository<Visit>;
  routePlans: Repository<RoutePlan>;
  competitorPrices: Repository<CompetitorPrice>;
  products: Repository<Product>;
  reports: Repository<Report>;
  promoSimulations: Repository<PromoSimulation>;
  complaints: Repository<Complaint>;
  notifications: Repository<Notification>;
  settings: Repository<UserSetting>;
}

function createDB(): DB {
  const seeded = seed();
  return {
    users: createMemoryRepository("user", seeded.users),
    outlets: createMemoryRepository("outlet", seeded.outlets),
    visits: createMemoryRepository("visit", seeded.visits),
    routePlans: createMemoryRepository("route", seeded.routePlans),
    competitorPrices: createMemoryRepository("comp", seeded.competitorPrices),
    products: createMemoryRepository("prod", seeded.products),
    reports: createMemoryRepository("rep", seeded.reports),
    promoSimulations: createMemoryRepository("promo", []),
    complaints: createMemoryRepository("cmp", seeded.complaints),
    notifications: createMemoryRepository("notif", seeded.notifications),
    settings: createMemoryRepository("set", seeded.settings),
  };
}

const g = globalThis as unknown as { __fmcgDB?: DB };
export const db: DB = g.__fmcgDB ?? createDB();
g.__fmcgDB = db;
