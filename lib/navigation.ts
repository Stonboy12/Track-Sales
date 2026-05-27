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
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  description?: string;
  badge?: string;
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
      {
        title: "Route Planner",
        href: "/route-planner",
        icon: Map,
        description: "Rencanakan rute kunjungan",
      },
      {
        title: "Daily Sales Report",
        href: "/daily-report",
        icon: FileText,
        description: "Generate laporan kunjungan",
      },
      {
        title: "Complaint Tracker",
        href: "/complaints",
        icon: MessageSquareWarning,
        badge: "3",
      },
    ],
  },
  {
    label: "Insight",
    items: [
      {
        title: "Outlet Performance",
        href: "/outlet-performance",
        icon: Store,
      },
      {
        title: "Competitor Prices",
        href: "/competitor-prices",
        icon: TrendingUp,
      },
      {
        title: "Product Knowledge",
        href: "/product-knowledge",
        icon: BookOpen,
      },
    ],
  },
  {
    label: "Tools",
    items: [
      {
        title: "Promo Calculator",
        href: "/promo-calculator",
        icon: Calculator,
      },
      {
        title: "Leaderboard",
        href: "/leaderboard",
        icon: Trophy,
      },
    ],
  },
  {
    label: "Akun",
    items: [
      { title: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export const flatNavigation: NavItem[] = navigation.flatMap((g) => g.items);
