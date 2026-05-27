// Centralized mock data for FMCG Sales OS preview.
// Replace with real API calls when backend is wired.

export type Priority = "high" | "medium" | "low";
export type OutletStatus = "active" | "pending" | "closed";
export type OutletSegment = "A" | "B" | "C";
export type ComplaintStatus = "open" | "in_progress" | "resolved";

export interface Outlet {
  id: string;
  code: string;
  name: string;
  area: string;
  segment: OutletSegment;
  priority: Priority;
  status: OutletStatus;
  ownerName: string;
  phone: string;
  address: string;
  lastVisit: string;
  monthlyRevenue: number;
  growth: number;
  ordersThisMonth: number;
}

export const outlets: Outlet[] = [
  {
    id: "o1",
    code: "JKT-001",
    name: "Toko Sumber Rejeki",
    area: "Jakarta Selatan",
    segment: "A",
    priority: "high",
    status: "active",
    ownerName: "Pak Hartono",
    phone: "0812-3456-7890",
    address: "Jl. Kemang Raya No. 12",
    lastVisit: "2 hari lalu",
    monthlyRevenue: 24500000,
    growth: 8.4,
    ordersThisMonth: 14,
  },
  {
    id: "o2",
    code: "JKT-002",
    name: "Indomaret Sudirman",
    area: "Jakarta Pusat",
    segment: "A",
    priority: "high",
    status: "active",
    ownerName: "Bu Rina",
    phone: "0813-1234-5678",
    address: "Jl. Sudirman Kav. 21",
    lastVisit: "Hari ini",
    monthlyRevenue: 38200000,
    growth: 12.1,
    ordersThisMonth: 22,
  },
  {
    id: "o3",
    code: "JKT-003",
    name: "Warung Bu Yati",
    area: "Jakarta Timur",
    segment: "C",
    priority: "low",
    status: "active",
    ownerName: "Bu Yati",
    phone: "0857-9988-7766",
    address: "Jl. Pondok Bambu Raya 7",
    lastVisit: "1 minggu lalu",
    monthlyRevenue: 4200000,
    growth: -3.2,
    ordersThisMonth: 5,
  },
  {
    id: "o4",
    code: "BDG-004",
    name: "Toko Maju Jaya",
    area: "Bandung Kota",
    segment: "B",
    priority: "medium",
    status: "active",
    ownerName: "Pak Sumarno",
    phone: "0822-1122-3344",
    address: "Jl. Asia Afrika No. 88",
    lastVisit: "3 hari lalu",
    monthlyRevenue: 12800000,
    growth: 4.7,
    ordersThisMonth: 9,
  },
  {
    id: "o5",
    code: "BDG-005",
    name: "Mini Market Sehati",
    area: "Bandung Utara",
    segment: "B",
    priority: "medium",
    status: "pending",
    ownerName: "Bu Lestari",
    phone: "0856-7788-9900",
    address: "Jl. Setiabudi No. 45",
    lastVisit: "Belum pernah",
    monthlyRevenue: 0,
    growth: 0,
    ordersThisMonth: 0,
  },
  {
    id: "o6",
    code: "JKT-006",
    name: "Alfamart Cipete",
    area: "Jakarta Selatan",
    segment: "A",
    priority: "high",
    status: "active",
    ownerName: "Pak Bagus",
    phone: "0811-2233-4455",
    address: "Jl. Cipete Raya No. 10",
    lastVisit: "Kemarin",
    monthlyRevenue: 31500000,
    growth: -1.8,
    ordersThisMonth: 18,
  },
  {
    id: "o7",
    code: "SBY-007",
    name: "Toko Berkah Surabaya",
    area: "Surabaya Barat",
    segment: "B",
    priority: "medium",
    status: "active",
    ownerName: "Pak Joko",
    phone: "0838-1212-3434",
    address: "Jl. HR Muhammad No. 30",
    lastVisit: "5 hari lalu",
    monthlyRevenue: 9800000,
    growth: 6.3,
    ordersThisMonth: 7,
  },
  {
    id: "o8",
    code: "JKT-008",
    name: "Warung Pak Hadi",
    area: "Jakarta Timur",
    segment: "C",
    priority: "low",
    status: "active",
    ownerName: "Pak Hadi",
    phone: "0852-3344-5566",
    address: "Jl. Cipinang Indah No. 22",
    lastVisit: "2 minggu lalu",
    monthlyRevenue: 3100000,
    growth: -7.5,
    ordersThisMonth: 3,
  },
];

export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  brand: string;
  price: number;
  stockStatus: "in_stock" | "low" | "out";
  description: string;
  sellingPoints: string[];
  promo: string;
  faqs: { q: string; a: string }[];
}

export const products: Product[] = [
  {
    id: "p1",
    sku: "SKU-001",
    name: "Susu UHT Coklat 250ml",
    category: "Minuman",
    brand: "Indomilk",
    price: 7500,
    stockStatus: "in_stock",
    description:
      "Susu UHT rasa coklat 250ml dengan kandungan kalsium tinggi, cocok untuk anak dan keluarga.",
    sellingPoints: [
      "Margin retailer 18%",
      "Kemasan eye-catching",
      "Top 3 di kategori susu UHT anak",
    ],
    promo: "Beli 2 lusin gratis 1 dus display.",
    faqs: [
      { q: "Apa keunggulan dibanding kompetitor?", a: "Kalsium 30% lebih tinggi dan harga retail lebih kompetitif." },
      { q: "Berapa lama masa simpan?", a: "9 bulan tanpa pendinginan, lebih lama dari rata-rata." },
    ],
  },
  {
    id: "p2",
    sku: "SKU-002",
    name: "Mie Instan Goreng Spesial",
    category: "Makanan",
    brand: "Indomie",
    price: 3200,
    stockStatus: "in_stock",
    description: "Mie instan goreng dengan bumbu spesial, varian terlaris #1 nasional.",
    sellingPoints: [
      "SKU paling cepat habis di rak",
      "Margin 12% + bonus dus",
      "Promo TVC nasional aktif",
    ],
    promo: "Bonus 1 dus per pembelian 10 dus.",
    faqs: [
      { q: "Apa target outlet utama?", a: "Outlet segmen A & B dengan traffic tinggi." },
    ],
  },
  {
    id: "p3",
    sku: "SKU-003",
    name: "Sabun Mandi Cair 250ml",
    category: "Personal Care",
    brand: "Lifebuoy",
    price: 18500,
    stockStatus: "low",
    description: "Sabun mandi cair 250ml dengan formula pelindung kulit dari kuman.",
    sellingPoints: [
      "Margin 22%",
      "Top of mind antibakteri",
      "Free pouch refill di promo bulan ini",
    ],
    promo: "Diskon 8% untuk pembelian 2 karton.",
    faqs: [
      { q: "Bagaimana penanganan stok rendah?", a: "Lakukan order minimum 1 karton untuk lock harga promo." },
    ],
  },
  {
    id: "p4",
    sku: "SKU-004",
    name: "Kopi Sachet Original",
    category: "Minuman",
    brand: "Kapal Api",
    price: 1500,
    stockStatus: "in_stock",
    description: "Kopi sachet original 25g, signature blend nasional.",
    sellingPoints: ["Top seller renteng", "Promo bonus mug", "Margin retailer 15%"],
    promo: "Free mug per pembelian 5 renteng.",
    faqs: [{ q: "Cocok untuk warung kecil?", a: "Sangat cocok, fast moving SKU." }],
  },
  {
    id: "p5",
    sku: "SKU-005",
    name: "Pasta Gigi Whitening 120g",
    category: "Personal Care",
    brand: "Pepsodent",
    price: 14500,
    stockStatus: "out",
    description: "Pasta gigi whitening 120g dengan formula pemutih alami.",
    sellingPoints: ["Brand recall tinggi", "Re-order rate 92%", "Margin 19%"],
    promo: "Promo bundling sikat gigi.",
    faqs: [{ q: "Kapan restock?", a: "Estimasi 3 hari kerja." }],
  },
  {
    id: "p6",
    sku: "SKU-006",
    name: "Air Mineral 600ml",
    category: "Minuman",
    brand: "Aqua",
    price: 3500,
    stockStatus: "in_stock",
    description: "Air mineral 600ml, market leader kategori air minum kemasan.",
    sellingPoints: ["Volume tertinggi", "Bonus dus per 50 dus", "Display gratis"],
    promo: "Free display rack untuk order 50 dus.",
    faqs: [{ q: "Apakah ada kontrak khusus?", a: "Tersedia kontrak ekslusif untuk segmen A." }],
  },
];

export interface CompetitorPrice {
  id: string;
  product: string;
  competitor: string;
  outlet: string;
  area: string;
  price: number;
  ourPrice: number;
  date: string;
  note?: string;
}

export const competitorPrices: CompetitorPrice[] = [
  {
    id: "cp1",
    product: "Susu UHT Coklat 250ml",
    competitor: "Ultra Milk",
    outlet: "Indomaret Sudirman",
    area: "Jakarta Pusat",
    price: 7200,
    ourPrice: 7500,
    date: "2026-05-26",
    note: "Promo PWP turun 5%",
  },
  {
    id: "cp2",
    product: "Mie Instan Goreng",
    competitor: "Mie Sedaap",
    outlet: "Toko Sumber Rejeki",
    area: "Jakarta Selatan",
    price: 3000,
    ourPrice: 3200,
    date: "2026-05-25",
  },
  {
    id: "cp3",
    product: "Sabun Mandi Cair 250ml",
    competitor: "Dettol",
    outlet: "Alfamart Cipete",
    area: "Jakarta Selatan",
    price: 19000,
    ourPrice: 18500,
    date: "2026-05-25",
    note: "Display di shelf utama",
  },
  {
    id: "cp4",
    product: "Kopi Sachet Original",
    competitor: "ABC",
    outlet: "Warung Bu Yati",
    area: "Jakarta Timur",
    price: 1400,
    ourPrice: 1500,
    date: "2026-05-24",
  },
  {
    id: "cp5",
    product: "Air Mineral 600ml",
    competitor: "Le Minerale",
    outlet: "Toko Berkah Surabaya",
    area: "Surabaya Barat",
    price: 3300,
    ourPrice: 3500,
    date: "2026-05-23",
    note: "Promo gondola",
  },
];

export interface Salesperson {
  id: string;
  name: string;
  area: string;
  achievement: number;
  target: number;
  visits: number;
  outletsActive: number;
  badges: string[];
}

export const salespeople: Salesperson[] = [
  {
    id: "s1",
    name: "Adi Pratama",
    area: "Jakarta Selatan",
    achievement: 142_500_000,
    target: 150_000_000,
    visits: 86,
    outletsActive: 38,
    badges: ["Top Visit", "Streak 30 Hari"],
  },
  {
    id: "s2",
    name: "Rini Kurnia",
    area: "Jakarta Pusat",
    achievement: 165_300_000,
    target: 150_000_000,
    visits: 78,
    outletsActive: 41,
    badges: ["Top Sales", "Outlet Hunter"],
  },
  {
    id: "s3",
    name: "Bambang Wijaya",
    area: "Bandung",
    achievement: 118_900_000,
    target: 130_000_000,
    visits: 64,
    outletsActive: 29,
    badges: ["Konsistensi"],
  },
  {
    id: "s4",
    name: "Sari Dewi",
    area: "Surabaya",
    achievement: 134_700_000,
    target: 130_000_000,
    visits: 71,
    outletsActive: 33,
    badges: ["Top Growth"],
  },
  {
    id: "s5",
    name: "Hendra Saputra",
    area: "Jakarta Timur",
    achievement: 92_400_000,
    target: 120_000_000,
    visits: 52,
    outletsActive: 24,
    badges: [],
  },
  {
    id: "s6",
    name: "Maya Lestari",
    area: "Jakarta Barat",
    achievement: 121_800_000,
    target: 120_000_000,
    visits: 69,
    outletsActive: 31,
    badges: ["Komplain 0"],
  },
];

export interface Complaint {
  id: string;
  code: string;
  outlet: string;
  area: string;
  product: string;
  category: "kualitas" | "pengiriman" | "harga" | "lainnya";
  status: ComplaintStatus;
  priority: Priority;
  reportedBy: string;
  createdAt: string;
  description: string;
  timeline: { time: string; actor: string; note: string }[];
}

export const complaints: Complaint[] = [
  {
    id: "c1",
    code: "CMP-1042",
    outlet: "Toko Sumber Rejeki",
    area: "Jakarta Selatan",
    product: "Susu UHT Coklat 250ml",
    category: "kualitas",
    status: "open",
    priority: "high",
    reportedBy: "Adi Pratama",
    createdAt: "26 Mei 2026, 09:14",
    description:
      "Pemilik toko melaporkan beberapa kemasan bocor dari batch terakhir.",
    timeline: [
      { time: "26 Mei 09:14", actor: "Adi Pratama", note: "Komplain dibuat" },
      { time: "26 Mei 10:02", actor: "Sistem", note: "Diteruskan ke tim QC" },
    ],
  },
  {
    id: "c2",
    code: "CMP-1041",
    outlet: "Indomaret Sudirman",
    area: "Jakarta Pusat",
    product: "Mie Instan Goreng",
    category: "pengiriman",
    status: "in_progress",
    priority: "medium",
    reportedBy: "Rini Kurnia",
    createdAt: "25 Mei 2026, 15:30",
    description: "Pengiriman terlambat 2 hari, mengganggu stok promo akhir pekan.",
    timeline: [
      { time: "25 Mei 15:30", actor: "Rini Kurnia", note: "Komplain dibuat" },
      { time: "25 Mei 17:10", actor: "Logistik", note: "Investigasi rute pengiriman" },
      { time: "26 Mei 08:00", actor: "Logistik", note: "Pengiriman ulang dijadwalkan hari ini" },
    ],
  },
  {
    id: "c3",
    code: "CMP-1040",
    outlet: "Alfamart Cipete",
    area: "Jakarta Selatan",
    product: "Sabun Mandi Cair 250ml",
    category: "harga",
    status: "open",
    priority: "low",
    reportedBy: "Adi Pratama",
    createdAt: "24 Mei 2026, 11:48",
    description: "Selisih harga dibanding kompetitor cukup signifikan di area ini.",
    timeline: [
      { time: "24 Mei 11:48", actor: "Adi Pratama", note: "Komplain dibuat" },
    ],
  },
  {
    id: "c4",
    code: "CMP-1039",
    outlet: "Toko Maju Jaya",
    area: "Bandung Kota",
    product: "Kopi Sachet Original",
    category: "lainnya",
    status: "resolved",
    priority: "low",
    reportedBy: "Bambang Wijaya",
    createdAt: "22 Mei 2026, 10:00",
    description: "Permintaan POSM tambahan untuk display promosi.",
    timeline: [
      { time: "22 Mei 10:00", actor: "Bambang Wijaya", note: "Komplain dibuat" },
      { time: "23 Mei 09:00", actor: "Marketing", note: "POSM dikirim" },
      { time: "24 Mei 12:00", actor: "Bambang Wijaya", note: "Diselesaikan, terima kasih" },
    ],
  },
];

export const dashboardActivity = [
  {
    id: "a1",
    actor: "Adi Pratama",
    action: "menyelesaikan visit ke Indomaret Sudirman",
    time: "10 menit lalu",
  },
  {
    id: "a2",
    actor: "Rini Kurnia",
    action: "menambahkan harga kompetitor untuk Indomilk",
    time: "32 menit lalu",
  },
  {
    id: "a3",
    actor: "Sistem",
    action: "menutup komplain CMP-1039 sebagai resolved",
    time: "1 jam lalu",
  },
  {
    id: "a4",
    actor: "Bambang Wijaya",
    action: "membuat laporan harian Bandung",
    time: "2 jam lalu",
  },
  {
    id: "a5",
    actor: "Sari Dewi",
    action: "mencapai target mingguan 105%",
    time: "Kemarin",
  },
];

export const todayTasks = [
  {
    id: "t1",
    title: "Visit Toko Sumber Rejeki",
    time: "09:00 - 10:00",
    location: "Jakarta Selatan",
    done: true,
  },
  {
    id: "t2",
    title: "Visit Indomaret Sudirman",
    time: "10:30 - 11:30",
    location: "Jakarta Pusat",
    done: true,
  },
  {
    id: "t3",
    title: "Submit laporan harian",
    time: "12:00 - 12:30",
    location: "Office",
    done: false,
  },
  {
    id: "t4",
    title: "Visit Alfamart Cipete",
    time: "14:00 - 15:00",
    location: "Jakarta Selatan",
    done: false,
  },
  {
    id: "t5",
    title: "Visit Warung Bu Yati",
    time: "15:30 - 16:30",
    location: "Jakarta Timur",
    done: false,
  },
];

export const weeklyPerformance = [
  { day: "Sen", actual: 18.4, target: 20 },
  { day: "Sel", actual: 22.1, target: 20 },
  { day: "Rab", actual: 19.8, target: 20 },
  { day: "Kam", actual: 24.6, target: 20 },
  { day: "Jum", actual: 26.9, target: 22 },
  { day: "Sab", actual: 31.2, target: 25 },
  { day: "Min", actual: 12.4, target: 15 },
];

export const priceTrend = [
  { date: "1 Mei", us: 7500, comp: 7400 },
  { date: "8 Mei", us: 7500, comp: 7400 },
  { date: "15 Mei", us: 7500, comp: 7300 },
  { date: "22 Mei", us: 7500, comp: 7250 },
  { date: "26 Mei", us: 7500, comp: 7200 },
];

export const outletPerformanceTrend = [
  { month: "Jan", a: 320, b: 180, c: 80 },
  { month: "Feb", a: 340, b: 200, c: 78 },
  { month: "Mar", a: 360, b: 210, c: 75 },
  { month: "Apr", a: 380, b: 215, c: 70 },
  { month: "Mei", a: 410, b: 225, c: 68 },
];
