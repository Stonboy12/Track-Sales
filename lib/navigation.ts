import {
  LayoutDashboard,
  Map,
  TrendingUp,
  Store,
  BookOpen,
  FileText,
  Calculator,
  MessageSquareWarning,
  Trophy,
  Settings,
  Tag,
  Package,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "@/server/db/types";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  badge?: string;
  /** Bila ada, item hanya tampil untuk role di list ini. */
  roles?: Role[];
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const navigation: NavGroup[] = [
  {
    label: "Overview",
    items: [
      {
        title: "Dashboard",
        href: "/",
        icon: LayoutDashboard,
        description: "Ringkasan harian & KPI utama",
      },
    ],
  },
  {
    label: "Lapangan",
    items: [
      { title: "Route Planner", href: "/route-planner", icon: Map },
      { title: "Daily Sales Report", href: "/daily-report", icon: FileText },
      { title: "Complaint Tracker", href: "/complaints", icon: MessageSquareWarning, badge: "3" },
    ],
  },
  {
    label: "Insight",
    items: [
      { title: "Outlet Performance", href: "/outlet-performance", icon: Store },
      { title: "Competitor Prices", href: "/competitor-prices", icon: TrendingUp },
      { title: "Product Knowledge", href: "/product-knowledge", icon: BookOpen },
    ],
  },
  {
    label: "Tools",
    items: [
      { title: "Promo Calculator", href: "/promo-calculator", icon: Calculator },
      { title: "Leaderboard", href: "/leaderboard", icon: Trophy },
    ],
  },
  {
    label: "Admin",
    items: [
      {
        title: "SKU Manager",
        href: "/admin/skus",
        icon: Package,
        description: "Kelola katalog produk",
        roles: ["admin"],
      },
      {
        title: "Promo Manager",
        href: "/admin/promos",
        icon: Tag,
        description: "Buat & atur program promo",
        roles: ["admin"],
      },
    ],
  },
  {
    label: "Akun",
    items: [{ title: "Settings", href: "/settings", icon: Settings }],
  },
];

export function navigationFor(role: Role | undefined): NavGroup[] {
  return navigation
    .map((g) => ({
      ...g,
      items: g.items.filter((i) => !i.roles || (role && i.roles.includes(role))),
    }))
    .filter((g) => g.items.length > 0);
}

export const flatNavigation: NavItem[] = navigation.flatMap((g) => g.items);
