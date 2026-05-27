/**
 * Tipe inti entitas backend. Menyamai bentuk row di Postgres tapi pakai
 * camelCase. Konversi snake_case ↔ camelCase ada di `mappers.ts`.
 */

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}

export type Role = "admin" | "sales";

export type Priority = "high" | "medium" | "low";
export type OutletStatus = "active" | "pending" | "closed";
export type OutletSegment = "A" | "B" | "C";
export type ComplaintStatus = "open" | "in_progress" | "resolved";
export type ComplaintCategory = "kualitas" | "pengiriman" | "harga" | "lainnya";
export type VisitOutcome = "order" | "no_order" | "follow_up" | "closed";
export type StockStatus = "in_stock" | "low" | "out";

/** Bentuk public user yang dikembalikan oleh /api/auth/me. */
export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  area?: string;
  phone?: string;
  monthlyTarget?: number;
  avatarUrl?: string;
  emailVerified?: boolean;
}

export interface Outlet extends BaseEntity {
  code: string;
  name: string;
  area: string;
  segment: OutletSegment;
  priority: Priority;
  status: OutletStatus;
  ownerName: string;
  phone: string;
  address: string;
  assignedSalesId?: string;
}

export interface Visit extends BaseEntity {
  outletId: string;
  salesId: string;
  visitDate: string;
  outcome: VisitOutcome;
  orderValue: number;
  notes?: string;
}

export interface RoutePlan extends BaseEntity {
  salesId: string;
  date: string;
  outletIds: string[];
  name?: string;
}

export interface CompetitorPrice extends BaseEntity {
  productId?: string;
  productName: string;
  competitor: string;
  outlet: string;
  area: string;
  price: number;
  ourPrice: number;
  observedAt: string;
  note?: string;
  reportedBy: string;
}

export interface Product extends BaseEntity {
  sku: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  stockStatus: StockStatus;
  description: string;
  sellingPoints: string[];
  promo: string;
  faqs: { q: string; a: string }[];
}

export interface Report extends BaseEntity {
  date: string;
  salesId: string;
  visits: {
    outletId: string;
    outletName: string;
    outcome: VisitOutcome;
    orderValue: number;
    notes?: string;
  }[];
  generalNotes?: string;
  generatedText: string;
}

export interface PromoResult {
  gross: number;
  discountAmount: number;
  bundlingValue: number;
  finalPrice: number;
  effectiveQty: number;
  pricePerUnit: number;
  savingsPct: number;
  marginPct?: number;
}

export interface ComplaintTimelineEntry {
  at: string;
  actorId: string;
  actorName: string;
  note: string;
  statusFrom?: ComplaintStatus;
  statusTo?: ComplaintStatus;
}

export interface Complaint extends BaseEntity {
  code: string;
  outletId: string;
  outletName: string;
  area: string;
  productName: string;
  category: ComplaintCategory;
  status: ComplaintStatus;
  priority: Priority;
  reportedById: string;
  reportedByName: string;
  description: string;
  timeline: ComplaintTimelineEntry[];
}

export interface Notification extends BaseEntity {
  userId: string;
  title: string;
  body?: string;
  read: boolean;
  link?: string;
}

export interface Promo extends BaseEntity {
  name: string;
  description?: string;
  productId?: string;
  type: "discount" | "bundling" | "cashback" | "pwp";
  discountPct: number;
  bundlingQty: number;
  cashbackAmount: number;
  minQty: number;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  createdBy: string;
}

export interface UserSetting extends BaseEntity {
  userId: string;
  theme: "light" | "dark" | "system";
  language: "id" | "en";
  notifications: Record<string, boolean>;
  bio?: string;
}
