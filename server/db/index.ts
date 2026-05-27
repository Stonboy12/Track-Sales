import { createInsforgeRepository } from "./insforge-repository";
import {
  complaintMapper,
  competitorPriceMapper,
  notificationMapper,
  outletMapper,
  productMapper,
  reportMapper,
  routePlanMapper,
  userProfileMapper,
  userSettingMapper,
  visitMapper,
  type UserProfile,
} from "./mappers";
import type { Repository } from "./repository";
import type {
  Complaint,
  CompetitorPrice,
  Notification,
  Outlet,
  Product,
  Report,
  RoutePlan,
  UserSetting,
  Visit,
} from "./types";

/**
 * Pusat akses repository. Semua service hanya tahu interface `Repository<T>`,
 * tidak peduli ini di-back-end ke InsForge, Postgres langsung, atau in-memory.
 */
export interface DB {
  outlets: Repository<Outlet>;
  visits: Repository<Visit>;
  routePlans: Repository<RoutePlan>;
  competitorPrices: Repository<CompetitorPrice>;
  products: Repository<Product>;
  complaints: Repository<Complaint>;
  reports: Repository<Report>;
  notifications: Repository<Notification>;
  settings: Repository<UserSetting>;
  userProfiles: Repository<UserProfile>;
}

export const db: DB = {
  outlets: createInsforgeRepository<Outlet>(outletMapper),
  visits: createInsforgeRepository<Visit>(visitMapper),
  routePlans: createInsforgeRepository<RoutePlan>(routePlanMapper),
  competitorPrices: createInsforgeRepository<CompetitorPrice>(competitorPriceMapper),
  products: createInsforgeRepository<Product>(productMapper),
  complaints: createInsforgeRepository<Complaint>(complaintMapper),
  reports: createInsforgeRepository<Report>(reportMapper),
  notifications: createInsforgeRepository<Notification>(notificationMapper),
  settings: createInsforgeRepository<UserSetting>(userSettingMapper),
  userProfiles: createInsforgeRepository<UserProfile>(userProfileMapper),
};
