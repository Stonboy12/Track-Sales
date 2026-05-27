# FMCG Sales OS

Frontend untuk **FMCG Sales OS** — platform kerja terpadu untuk salesman FMCG.
Dibangun dengan **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS 3.4**, dan komponen ala **shadcn/ui** + **Recharts**.

> 🛠 Status: frontend-only. Semua data masih mock lokal, siap dihubungkan ke backend nanti.

## Modul

1. **Dashboard** — KPI utama, quick actions, performa mingguan, task hari ini, aktivitas.
2. **Route Planner** — daftar outlet, filter area/prioritas/status, map preview, urutan rute.
3. **Competitor Price Tracker** — form input, tren harga, AI insight, histori.
4. **Outlet Performance** — segmentasi A/B/C, outlet turun, top performer.
5. **Product Knowledge Hub** — grid produk, detail (Deskripsi/Selling/Promo/FAQ), AI assistant.
6. **Daily Sales Report** — form visit + auto-generate report (copy/download/email).
7. **Promo & Discount Calculator** — kalkulasi real-time + multi-skenario.
8. **Complaint Tracker** — board status, drawer detail dengan timeline, dialog tambah komplain.
9. **Team Sales Leaderboard** — podium top 3, ranking lengkap, badge & achievement.
10. **Settings** — profil, tema (light/dark/system), preferensi notifikasi, integrasi.

## Setup

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

## Struktur Folder

```
app/                    # Next.js App Router pages
  layout.tsx            # root layout + ThemeProvider + AppShell
  page.tsx              # Dashboard
  route-planner/
  competitor-prices/
  outlet-performance/
  product-knowledge/
  daily-report/
  promo-calculator/
  complaints/
  leaderboard/
  settings/
components/
  ui/                   # shadcn-style primitives (button, card, ...)
  layout/               # AppShell, Sidebar, Topbar, PageHeader
  charts/               # AreaChart, BarChart, LineChart (Recharts)
  dashboard/            # KpiCard
  providers/            # ThemeProvider (next-themes)
lib/
  utils.ts              # cn, formatCurrency, formatNumber, ...
  navigation.ts         # sidebar nav config
  mock-data.ts          # semua data dummy modul
```

## Highlight UI

- **Responsive**: sidebar collapse jadi sheet di mobile, topbar adaptif.
- **Dark mode**: siap pakai via `next-themes` (toggle di topbar & settings).
- **Modular & reusable**: KpiCard, PageHeader, charts, EmptyState dipakai lintas modul.
- **State management**: lokal `useState` dengan kontrak data `lib/mock-data.ts`. Siap diganti dengan fetcher API/SDK tanpa mengubah komponen.
- **Bahasa UI**: Indonesia, sesuai konteks bisnis FMCG lapangan.

## Dependencies Utama

- `next@14.2`, `react@18`, `typescript@5`
- `tailwindcss@3.4` (sengaja dipatok di v3.4, bukan v4)
- `@radix-ui/react-*` untuk primitif aksesibel
- `lucide-react` untuk ikon
- `recharts` untuk grafik
- `next-themes` untuk dark mode
- `class-variance-authority`, `tailwind-merge`, `clsx`, `tailwindcss-animate`

## Roadmap (saat backend siap)

- Ganti `lib/mock-data.ts` dengan SDK calls (mis. InsForge / REST).
- Auth flow (login, role-based access untuk salesman/supervisor).
- Real-time komplain & notifikasi (WebSocket).
- Geolocation + map provider untuk Route Planner.
- AI insight & assistant terhubung ke LLM (mis. via OpenRouter).
