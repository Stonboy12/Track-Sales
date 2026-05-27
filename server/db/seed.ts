import { hashPassword } from "../core/crypto";
import {
  outlets as mockOutlets,
  products as mockProducts,
  competitorPrices as mockCompetitorPrices,
  complaints as mockComplaints,
  salespeople as mockSalespeople,
} from "@/lib/mock-data";
import type {
  Complaint,
  CompetitorPrice,
  Notification,
  Outlet,
  Product,
  Report,
  RoutePlan,
  User,
  UserSetting,
  Visit,
} from "./types";

const NOW = new Date().toISOString();

/**
 * Bangun semua seed data dari mock-data frontend supaya server & UI sinkron
 * out of the box. Saat backend asli siap, ganti seed atau matikan total.
 */
export function seed() {
  const users: User[] = [
    {
      id: "user_admin",
      email: "admin@fmcg.id",
      name: "Admin Utama",
      role: "admin",
      passwordHash: hashPassword("password123"),
      active: true,
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: "user_supervisor",
      email: "supervisor@fmcg.id",
      name: "Putri Supervisor",
      role: "supervisor",
      area: "Jakarta",
      passwordHash: hashPassword("password123"),
      active: true,
      monthlyTarget: 600_000_000,
      createdAt: NOW,
      updatedAt: NOW,
    },
    ...mockSalespeople.map<User>((s) => ({
      id: s.id.replace("s", "user_sales_"),
      email: `${s.name.toLowerCase().split(" ").join(".")}@fmcg.id`,
      name: s.name,
      role: "sales",
      area: s.area,
      passwordHash: hashPassword("password123"),
      active: true,
      monthlyTarget: s.target,
      createdAt: NOW,
      updatedAt: NOW,
    })),
  ];

  const adiId = users.find((u) => u.name === "Adi Pratama")!.id;

  const outlets: Outlet[] = mockOutlets.map((o) => ({
    id: o.id,
    code: o.code,
    name: o.name,
    area: o.area,
    segment: o.segment,
    priority: o.priority,
    status: o.status,
    ownerName: o.ownerName,
    phone: o.phone,
    address: o.address,
    assignedSalesId: adiId,
    createdAt: NOW,
    updatedAt: NOW,
  }));

  // Generate ~20 visit records dari ordersThisMonth + monthlyRevenue mock
  const visits: Visit[] = [];
  let i = 0;
  for (const o of mockOutlets) {
    const orders = Math.min(o.ordersThisMonth, 3);
    for (let k = 0; k < orders; k++) {
      const day = (i + k) % 26 + 1;
      const dateStr = `2026-05-${day.toString().padStart(2, "0")}`;
      visits.push({
        id: `visit_${o.id}_${k}`,
        outletId: o.id,
        salesId: adiId,
        visitDate: dateStr,
        outcome: "order",
        orderValue: Math.round(o.monthlyRevenue / Math.max(o.ordersThisMonth, 1)),
        notes: "Order rutin",
        createdAt: NOW,
        updatedAt: NOW,
      });
    }
    i++;
  }

  const routePlans: RoutePlan[] = [
    {
      id: "route_default",
      salesId: adiId,
      date: "2026-05-27",
      outletIds: mockOutlets.slice(0, 4).map((o) => o.id),
      name: "Rute Hari Ini",
      createdAt: NOW,
      updatedAt: NOW,
    },
  ];

  const products: Product[] = mockProducts.map((p) => ({
    id: p.id,
    sku: p.sku,
    name: p.name,
    category: p.category,
    brand: p.brand,
    price: p.price,
    stockStatus: p.stockStatus,
    description: p.description,
    sellingPoints: p.sellingPoints,
    promo: p.promo,
    faqs: p.faqs,
    createdAt: NOW,
    updatedAt: NOW,
  }));

  const competitorPrices: CompetitorPrice[] = mockCompetitorPrices.map((c) => ({
    id: c.id,
    productName: c.product,
    competitor: c.competitor,
    outlet: c.outlet,
    area: c.area,
    price: c.price,
    ourPrice: c.ourPrice,
    observedAt: c.date,
    note: c.note,
    reportedBy: adiId,
    createdAt: NOW,
    updatedAt: NOW,
  }));

  const complaints: Complaint[] = mockComplaints.map((c) => ({
    id: c.id,
    code: c.code,
    outletId:
      mockOutlets.find((o) => o.name === c.outlet)?.id ?? mockOutlets[0].id,
    outletName: c.outlet,
    area: c.area,
    productName: c.product,
    category: c.category,
    status: c.status,
    priority: c.priority,
    reportedById: adiId,
    reportedByName: c.reportedBy,
    description: c.description,
    timeline: c.timeline.map((t) => ({
      at: t.time,
      actorId: t.actor === "Sistem" ? "system" : adiId,
      actorName: t.actor,
      note: t.note,
    })),
    createdAt: NOW,
    updatedAt: NOW,
  }));

  const reports: Report[] = [];

  const notifications: Notification[] = [
    {
      id: "notif_1",
      userId: adiId,
      title: "Komplain baru dari Toko Sumber Rejeki",
      body: "Pemilik melaporkan kemasan bocor.",
      read: false,
      link: "/complaints",
      createdAt: NOW,
      updatedAt: NOW,
    },
    {
      id: "notif_2",
      userId: adiId,
      title: "Target mingguan Anda 78% tercapai",
      body: "Tinggal 22% lagi untuk minggu ini.",
      read: false,
      createdAt: NOW,
      updatedAt: NOW,
    },
  ];

  const settings: UserSetting[] = users.map((u) => ({
    id: `set_${u.id}`,
    userId: u.id,
    theme: "system",
    language: "id",
    notifications: {
      visit_reminder: true,
      new_complaint: true,
      target_update: false,
      weekly_insight: true,
      new_promo: true,
    },
    bio: u.role === "sales" ? "Sales lapangan FMCG." : undefined,
    createdAt: NOW,
    updatedAt: NOW,
  }));

  return {
    users,
    outlets,
    visits,
    routePlans,
    products,
    competitorPrices,
    complaints,
    reports,
    notifications,
    settings,
  };
}
