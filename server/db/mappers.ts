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
 * Mapper antara baris DB (snake_case) dan entitas TypeScript (camelCase).
 * Dipisah agar bila skema berubah, perubahan tertahan di satu tempat.
 */

type Row = Record<string, unknown>;

const toIso = (v: unknown): string =>
  v instanceof Date ? v.toISOString() : typeof v === "string" ? v : new Date().toISOString();

export interface Mapper<T> {
  table: string;
  toRow(input: Partial<T>): Row;
  fromRow(row: Row): T;
}

export const outletMapper: Mapper<Outlet> = {
  table: "outlets",
  toRow(o) {
    const r: Row = {};
    if (o.code !== undefined) r.code = o.code;
    if (o.name !== undefined) r.name = o.name;
    if (o.area !== undefined) r.area = o.area;
    if (o.segment !== undefined) r.segment = o.segment;
    if (o.priority !== undefined) r.priority = o.priority;
    if (o.status !== undefined) r.status = o.status;
    if (o.ownerName !== undefined) r.owner_name = o.ownerName;
    if (o.phone !== undefined) r.phone = o.phone;
    if (o.address !== undefined) r.address = o.address;
    if (o.assignedSalesId !== undefined) r.assigned_sales_id = o.assignedSalesId;
    return r;
  },
  fromRow(r) {
    return {
      id: r.id as string,
      code: r.code as string,
      name: r.name as string,
      area: r.area as string,
      segment: r.segment as Outlet["segment"],
      priority: r.priority as Outlet["priority"],
      status: r.status as Outlet["status"],
      ownerName: r.owner_name as string,
      phone: r.phone as string,
      address: r.address as string,
      assignedSalesId: (r.assigned_sales_id as string | null) ?? undefined,
      createdAt: toIso(r.created_at),
      updatedAt: toIso(r.updated_at),
    };
  },
};

export const visitMapper: Mapper<Visit> = {
  table: "visits",
  toRow(v) {
    const r: Row = {};
    if (v.outletId !== undefined) r.outlet_id = v.outletId;
    if (v.salesId !== undefined) r.sales_id = v.salesId;
    if (v.visitDate !== undefined) r.visit_date = v.visitDate;
    if (v.outcome !== undefined) r.outcome = v.outcome;
    if (v.orderValue !== undefined) r.order_value = v.orderValue;
    if (v.notes !== undefined) r.notes = v.notes;
    return r;
  },
  fromRow(r) {
    return {
      id: r.id as string,
      outletId: r.outlet_id as string,
      salesId: r.sales_id as string,
      visitDate: (r.visit_date as string).slice(0, 10),
      outcome: r.outcome as Visit["outcome"],
      orderValue: Number(r.order_value ?? 0),
      notes: (r.notes as string | null) ?? undefined,
      createdAt: toIso(r.created_at),
      updatedAt: toIso(r.updated_at),
    };
  },
};

export const routePlanMapper: Mapper<RoutePlan> = {
  table: "route_plans",
  toRow(p) {
    const r: Row = {};
    if (p.salesId !== undefined) r.sales_id = p.salesId;
    if (p.date !== undefined) r.date = p.date;
    if (p.outletIds !== undefined) r.outlet_ids = p.outletIds;
    if (p.name !== undefined) r.name = p.name;
    return r;
  },
  fromRow(r) {
    return {
      id: r.id as string,
      salesId: r.sales_id as string,
      date: (r.date as string).slice(0, 10),
      outletIds: (r.outlet_ids as string[]) ?? [],
      name: (r.name as string | null) ?? undefined,
      createdAt: toIso(r.created_at),
      updatedAt: toIso(r.updated_at),
    };
  },
};

export const productMapper: Mapper<Product> = {
  table: "products",
  toRow(p) {
    const r: Row = {};
    if (p.sku !== undefined) r.sku = p.sku;
    if (p.name !== undefined) r.name = p.name;
    if (p.category !== undefined) r.category = p.category;
    if (p.brand !== undefined) r.brand = p.brand;
    if (p.price !== undefined) r.price = p.price;
    if (p.stockStatus !== undefined) r.stock_status = p.stockStatus;
    if (p.description !== undefined) r.description = p.description;
    if (p.sellingPoints !== undefined) r.selling_points = p.sellingPoints;
    if (p.promo !== undefined) r.promo = p.promo;
    if (p.faqs !== undefined) r.faqs = p.faqs;
    return r;
  },
  fromRow(r) {
    return {
      id: r.id as string,
      sku: r.sku as string,
      name: r.name as string,
      category: r.category as string,
      brand: r.brand as string,
      price: Number(r.price ?? 0),
      stockStatus: (r.stock_status as Product["stockStatus"]) ?? "in_stock",
      description: (r.description as string) ?? "",
      sellingPoints: (r.selling_points as string[]) ?? [],
      promo: (r.promo as string) ?? "",
      faqs: (r.faqs as Product["faqs"]) ?? [],
      createdAt: toIso(r.created_at),
      updatedAt: toIso(r.updated_at),
    };
  },
};

export const competitorPriceMapper: Mapper<CompetitorPrice> = {
  table: "competitor_prices",
  toRow(c) {
    const r: Row = {};
    if (c.productId !== undefined) r.product_id = c.productId;
    if (c.productName !== undefined) r.product_name = c.productName;
    if (c.competitor !== undefined) r.competitor = c.competitor;
    if (c.outlet !== undefined) r.outlet = c.outlet;
    if (c.area !== undefined) r.area = c.area;
    if (c.price !== undefined) r.price = c.price;
    if (c.ourPrice !== undefined) r.our_price = c.ourPrice;
    if (c.observedAt !== undefined) r.observed_at = c.observedAt;
    if (c.note !== undefined) r.note = c.note;
    if (c.reportedBy !== undefined) r.reported_by = c.reportedBy;
    return r;
  },
  fromRow(r) {
    return {
      id: r.id as string,
      productId: (r.product_id as string | null) ?? undefined,
      productName: r.product_name as string,
      competitor: r.competitor as string,
      outlet: r.outlet as string,
      area: r.area as string,
      price: Number(r.price ?? 0),
      ourPrice: Number(r.our_price ?? 0),
      observedAt: (r.observed_at as string).slice(0, 10),
      note: (r.note as string | null) ?? undefined,
      reportedBy: r.reported_by as string,
      createdAt: toIso(r.created_at),
      updatedAt: toIso(r.updated_at),
    };
  },
};

export const complaintMapper: Mapper<Complaint> = {
  table: "complaints",
  toRow(c) {
    const r: Row = {};
    if (c.code !== undefined) r.code = c.code;
    if (c.outletId !== undefined) r.outlet_id = c.outletId;
    if (c.outletName !== undefined) r.outlet_name = c.outletName;
    if (c.area !== undefined) r.area = c.area;
    if (c.productName !== undefined) r.product_name = c.productName;
    if (c.category !== undefined) r.category = c.category;
    if (c.status !== undefined) r.status = c.status;
    if (c.priority !== undefined) r.priority = c.priority;
    if (c.reportedById !== undefined) r.reported_by_id = c.reportedById;
    if (c.reportedByName !== undefined) r.reported_by_name = c.reportedByName;
    if (c.description !== undefined) r.description = c.description;
    if (c.timeline !== undefined) r.timeline = c.timeline;
    return r;
  },
  fromRow(r) {
    return {
      id: r.id as string,
      code: r.code as string,
      outletId: r.outlet_id as string,
      outletName: r.outlet_name as string,
      area: r.area as string,
      productName: r.product_name as string,
      category: r.category as Complaint["category"],
      status: r.status as Complaint["status"],
      priority: r.priority as Complaint["priority"],
      reportedById: r.reported_by_id as string,
      reportedByName: r.reported_by_name as string,
      description: r.description as string,
      timeline: (r.timeline as Complaint["timeline"]) ?? [],
      createdAt: toIso(r.created_at),
      updatedAt: toIso(r.updated_at),
    };
  },
};

export const reportMapper: Mapper<Report> = {
  table: "reports",
  toRow(r) {
    const row: Row = {};
    if (r.date !== undefined) row.date = r.date;
    if (r.salesId !== undefined) row.sales_id = r.salesId;
    if (r.visits !== undefined) row.visits = r.visits;
    if (r.generalNotes !== undefined) row.general_notes = r.generalNotes;
    if (r.generatedText !== undefined) row.generated_text = r.generatedText;
    return row;
  },
  fromRow(r) {
    return {
      id: r.id as string,
      date: (r.date as string).slice(0, 10),
      salesId: r.sales_id as string,
      visits: (r.visits as Report["visits"]) ?? [],
      generalNotes: (r.general_notes as string | null) ?? undefined,
      generatedText: (r.generated_text as string) ?? "",
      createdAt: toIso(r.created_at),
      updatedAt: toIso(r.updated_at),
    };
  },
};

export const notificationMapper: Mapper<Notification> = {
  table: "notifications",
  toRow(n) {
    const r: Row = {};
    if (n.userId !== undefined) r.user_id = n.userId;
    if (n.title !== undefined) r.title = n.title;
    if (n.body !== undefined) r.body = n.body;
    if (n.read !== undefined) r.read = n.read;
    if (n.link !== undefined) r.link = n.link;
    return r;
  },
  fromRow(r) {
    return {
      id: r.id as string,
      userId: r.user_id as string,
      title: r.title as string,
      body: (r.body as string | null) ?? undefined,
      read: Boolean(r.read),
      link: (r.link as string | null) ?? undefined,
      createdAt: toIso(r.created_at),
      updatedAt: toIso(r.updated_at),
    };
  },
};

export const userSettingMapper: Mapper<UserSetting> = {
  table: "user_settings",
  toRow(s) {
    const r: Row = {};
    if (s.userId !== undefined) r.user_id = s.userId;
    if (s.theme !== undefined) r.theme = s.theme;
    if (s.language !== undefined) r.language = s.language;
    if (s.notifications !== undefined) r.notifications = s.notifications;
    if (s.bio !== undefined) r.bio = s.bio;
    return r;
  },
  fromRow(r) {
    return {
      id: r.id as string,
      userId: r.user_id as string,
      theme: r.theme as UserSetting["theme"],
      language: r.language as UserSetting["language"],
      notifications: (r.notifications as Record<string, boolean>) ?? {},
      bio: (r.bio as string | null) ?? undefined,
      createdAt: toIso(r.created_at),
      updatedAt: toIso(r.updated_at),
    };
  },
};

export interface UserProfile {
  id: string;
  userId: string;
  role: "admin" | "supervisor" | "sales";
  area?: string;
  phone?: string;
  monthlyTarget?: number;
  createdAt: string;
  updatedAt: string;
}

export const userProfileMapper: Mapper<UserProfile> = {
  table: "user_profiles",
  toRow(p) {
    const r: Row = {};
    if (p.userId !== undefined) r.user_id = p.userId;
    if (p.role !== undefined) r.role = p.role;
    if (p.area !== undefined) r.area = p.area;
    if (p.phone !== undefined) r.phone = p.phone;
    if (p.monthlyTarget !== undefined) r.monthly_target = p.monthlyTarget;
    return r;
  },
  fromRow(r) {
    return {
      id: r.id as string,
      userId: r.user_id as string,
      role: (r.role as UserProfile["role"]) ?? "sales",
      area: (r.area as string | null) ?? undefined,
      phone: (r.phone as string | null) ?? undefined,
      monthlyTarget: r.monthly_target ? Number(r.monthly_target) : undefined,
      createdAt: toIso(r.created_at),
      updatedAt: toIso(r.updated_at),
    };
  },
};
