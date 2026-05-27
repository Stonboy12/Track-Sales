/**
 * Tipe inti entitas backend. Disengaja diperluas dari tipe `lib/mock-data.ts`
 * agar siap dipakai untuk persist (DB) — `createdAt`, `updatedAt`, ownership, dll.
 */
export interface BaseEntity {
  id: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export type Role = "admin" | "supervisor" | "sales";

export type Priority = "high" | "medium" | "low";
export type OutletStatus = "active" | "pending" | "closed";
export type OutletSegment = "A" | "B" | "C";
export type ComplaintStatus = "open" | "in_progress" | "resolved";
export type ComplaintCategory = "kualitas" | "pengiriman" | "harga" | "lainnya";
export type VisitOutcome = "order" | "no_order" | "follow_up" | "closed";
export type StockStatus = "in_stock" | "low" | "out";

export interface User extends BaseEntity {
  email: string;
  name: string;
  role: Role;
  area?: string;
  phone?: string;
  passwordHash: string;
  active: boolean;
  /** target sales bulanan dalam rupiah; dipakai untuk leaderboard */
  monthlyTarget?: number;
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
  /** id user yang memegang outlet */
  assignedSalesId?: string;
}

export interface Visit extends BaseEntity {
  outletId: string;
  salesId: string;
  visitDate: string; // YYYY-MM-DD
  outcome: VisitOutcome;
  orderValue: number;
  notes?: string;
}

export interface RoutePlan extends BaseEntity {
  salesId: string;
  date: string; // YYYY-MM-DD
  outletIds: string[]; // urutan stop
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
  observedAt: string; // YYYY-MM-DD
  note?: string;
  reportedBy: string; // user id
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

export interface PromoSimulation extends BaseEntity {
  name: string;
  basePrice: number;
  qty: number;
  discountPct: number;
  bundling: number;
  cashback: number;
  costPerUnit?: number;
  result: PromoResult;
  createdBy: string;
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

export interface UserSetting extends BaseEntity {
  userId: string;
  theme: "light" | "dark" | "system";
  language: "id" | "en";
  notifications: Record<string, boolean>;
  bio?: string;
}

/** Filter helper umum */
export interface Pagination {
  page?: number;
  limit?: number;
}
