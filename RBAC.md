# FMCG Sales OS — RBAC, Auth Flow, dan Database Design

Dokumen ini menjelaskan **arsitektur otorisasi** sistem FMCG Sales OS: 2 role (`admin` dan `sales`), database yang menopangnya, alur login, route protection, dan implementasi konkrit di backend & frontend.

---

## 1. Analisis Kebutuhan Sistem

### Perbedaan akses

| Aspek                        | **Admin**                      | **Sales**                   |
| ---------------------------- | ------------------------------ | --------------------------- |
| SKU (produk) — view          | ✅                             | ✅ (read-only)              |
| SKU — create / update / delete | ✅                            | ❌                          |
| Promo — view aktif           | ✅ (semua, termasuk nonaktif)   | ✅ (hanya aktif & berlaku) |
| Promo — create / update / delete | ✅                          | ❌                          |
| Outlet                       | ✅ semua data, semua wilayah    | ✅ outlet yang ditugaskan   |
| Visit                        | ✅ lihat semua                  | ✅ input & lihat miliknya   |
| Complaint                    | ✅ lihat semua + close          | ✅ buat & update miliknya   |
| Daily Report                 | ✅ lihat semua tim              | ✅ buat untuk dirinya       |
| Leaderboard                  | ✅                             | ✅                          |
| Activity log                 | ✅                             | ❌                          |
| Kelola user (role/aktif)     | ✅                             | ❌                          |
| Settings personal            | ✅                             | ✅                          |

### Data yang disimpan

- **Identitas** (`user_profiles`): role, area, target, team, status aktif.
- **Master data** (`products`/SKU, `promos`): hanya admin yang menulis.
- **Operasional** (`outlets`, `visits`, `route_plans`, `complaints`, `reports`, `competitor_prices`).
- **Per-user** (`user_settings`, `notifications`).
- **Audit** (`activity_logs`): siapa melakukan apa dan kapan.

### Bagaimana role dipakai

- **Frontend** — sidebar menyembunyikan menu yang user tidak berhak (`navigationFor(role)` di `lib/navigation.ts`). Halaman `/admin/*` adalah **server component** yang memanggil `requireServerUser({ role: "admin" })` → kalau bukan admin, redirect ke `/`.
- **Backend** — setiap controller memanggil `requireAuth(req)` atau `requireRole(req, "admin")`. Tidak peduli frontend menyembunyikan tombol atau tidak — server adalah satu-satunya gate.
- **DB** — kolom `user_profiles.role` adalah single source of truth. Token InsForge tidak menyimpan role; role di-lookup per request dari tabel ini.

---

## 2. Struktur Database

Diimplementasikan di Postgres melalui InsForge. Semua tabel pakai `id uuid PK DEFAULT gen_random_uuid()` dan `created_at`/`updated_at` `timestamptz DEFAULT now()`.

```text
auth.users (built-in InsForge)              ┐
   │ 1-1                                    │ disediakan InsForge
   ▼                                        │ (email, password,
user_profiles                               ┘  email_verified, profile JSON)
   id uuid PK
   user_id text UNIQUE        ───────────► auth.users.id
   role text  CHECK (role IN ('admin','sales'))
   area text
   phone text
   monthly_target bigint
   team_id text
   is_active boolean
   created_at, updated_at

outlets
   id, code UNIQUE, name, area, segment ('A'|'B'|'C'),
   priority ('high'|'medium'|'low'), status ('active'|'pending'|'closed'),
   owner_name, phone, address,
   assigned_sales_id text  ───► auth.users.id (sales pemegang outlet)

visits
   id, outlet_id ─► outlets, sales_id text ─► auth.users.id,
   visit_date date, outcome ('order'|'no_order'|'follow_up'|'closed'),
   order_value bigint, notes

route_plans
   id, sales_id, date, outlet_ids jsonb (urutan stop), name

products  (= "SKU" di domain bisnis FMCG)
   id, sku UNIQUE, name, category, brand, price,
   stock_status ('in_stock'|'low'|'out'),
   description, selling_points jsonb, promo, faqs jsonb

promos
   id, name, description,
   product_id ─► products (nullable),
   type ('discount'|'bundling'|'cashback'|'pwp'),
   discount_pct numeric, bundling_qty int, cashback_amount bigint,
   min_qty int, starts_at date, ends_at date, is_active bool,
   created_by text  (admin yang membuat)

competitor_prices
   id, product_id ─► products (nullable),
   product_name, competitor, outlet, area,
   price, our_price, observed_at date, note,
   reported_by text

complaints
   id, code UNIQUE (CMP-####),
   outlet_id ─► outlets, outlet_name, area, product_name,
   category ('kualitas'|'pengiriman'|'harga'|'lainnya'),
   status ('open'|'in_progress'|'resolved'),
   priority ('high'|'medium'|'low'),
   reported_by_id text, reported_by_name,
   description, timeline jsonb (append-only)

reports
   id, date, sales_id, visits jsonb (snapshot saat generate),
   general_notes, generated_text

leaderboard         — TIDAK persisten; dihitung on-the-fly dari
                      user_profiles + visits per `period`.

user_settings
   id, user_id UNIQUE, theme, language,
   notifications jsonb, bio

notifications
   id, user_id, title, body, read, link

activity_logs
   id, actor_id, actor_name, action, entity, entity_id,
   meta jsonb, at (= created_at)
```

### Relasi paling penting

- **user → visits** (1-N): setiap visit punya `sales_id`.
- **user → outlets** (N-N via `assigned_sales_id`): satu sales punya beberapa outlet, satu outlet bisa di-reassign.
- **outlet → visits** (1-N), **outlet → complaints** (1-N).
- **product → promos** (1-N opsional, promo bisa lintas-produk).
- **report → user + visits** (visits di-snapshot ke jsonb agar laporan tidak ikut berubah saat data visit dimutasi).

---

## 3. Role & Permission Matrix

| Resource / Action               | admin | sales        | Catatan                                        |
| ------------------------------- | :---: | :----------: | ---------------------------------------------- |
| **Auth**                        |       |              |                                                |
| login / logout / me             |   ✅  |     ✅       | semua user                                     |
| register sales baru             |   ✅  |     ❌       | sales dibuat oleh admin atau self-signup       |
| **SKU (`products`)**            |       |              |                                                |
| view                            |   ✅  |     ✅       |                                                |
| create / update / delete        |   ✅  |     ❌       | 403 di backend                                 |
| **Promo (`promos`)**            |       |              |                                                |
| view                            |   ✅  | ✅ (aktif)   | sales hanya promo `is_active && in-period`     |
| create / update / delete        |   ✅  |     ❌       |                                                |
| **Outlet**                      |       |              |                                                |
| view list & detail              |   ✅  |     ✅       | rencana: sales hanya outlet yang ditugaskan†   |
| create / update                 |   ✅  |     ✅       |                                                |
| delete                          |   ✅  |     ❌       |                                                |
| **Visit**                       |       |              |                                                |
| view all                        |   ✅  |     ❌       | sales filter `salesId = self`                  |
| create / update                 |   ✅  | ✅ (own)     |                                                |
| **Complaint**                   |       |              |                                                |
| view all                        |   ✅  |     ✅       |                                                |
| create                          |   ✅  |     ✅       |                                                |
| update status / append timeline |   ✅  |     ✅       | (audit oleh activity_log)                       |
| **Daily Report**                |       |              |                                                |
| generate                        |   ✅  |     ✅       |                                                |
| save / list semua tim           |   ✅  |     ❌       | sales hanya milik sendiri                      |
| **Leaderboard**                 |   ✅  |     ✅       |                                                |
| **Activity log**                |   ✅  |     ❌       | 403                                            |
| **Settings personal**           |   ✅  |     ✅       |                                                |
| **Seed admin endpoint**         |   ✅  |     ❌       |                                                |

> † Saat ini API masih return all outlets ke sales. Untuk hardening produksi, tambahkan filter `assigned_sales_id = session.sub` di `outletService.list`.

---

## 4. Authentication Flow

```
┌────────────┐    1. POST /api/auth/login {email,password}
│  Frontend  │ ────────────────────────────────────────────────┐
└────────────┘                                                  │
                                                                ▼
                                             ┌──────────────────────────────┐
                                             │ Server: authController.login │
                                             └──────────────────────────────┘
                                                              │
                                                  2. signInWithPassword()
                                                              │
                                                              ▼
                                             ┌──────────────────────────────┐
                                             │           InsForge            │
                                             │  (validasi password, terbit  │
                                             │   accessToken JWT)           │
                                             └──────────────────────────────┘
                                                              │
                                                  3. ensureProfile(userId)
                                                              │
                                                              ▼
                                             ┌──────────────────────────────┐
                                             │ user_profiles                 │
                                             │  - bila belum ada → create    │
                                             │    dengan role='sales'        │
                                             │  - bila is_active=false →     │
                                             │    tolak login (401)          │
                                             └──────────────────────────────┘
                                                              │
                                                              ▼
                                             4. Set-Cookie:
                                                fmcg_session = <accessToken>
                                                HttpOnly; SameSite=Lax;
                                                Max-Age=7d; (Secure di prod)
                                                              │
       ┌──────────────────────────────────────────────────────┘
       │
       ▼
┌────────────┐    5. router.replace(role==='admin' ? '/admin/promos' : '/')
│  Frontend  │     (atau next param dari URL ?next=...)
└────────────┘
```

### Validasi yang dilakukan saat login

1. Email & password dicek InsForge (server-side, bukan klien).
2. Email belum diverifikasi → 401 dengan pesan asli InsForge.
3. `user_profiles.is_active = false` → 401 (akun dinonaktifkan).
4. Sesi disimpan **httpOnly cookie**, tidak terlihat ke JavaScript klien.

### Logout

`POST /api/auth/logout`:
1. `client.auth.signOut()` di server.
2. `Set-Cookie` dengan `Max-Age=0` untuk hapus session cookie.
3. Activity log: `auth.logout`.

---

## 5. Protected Routes

```
Public (tanpa auth):
  /login
  /register

Protected (semua user login — middleware redirect ke /login jika cookie tidak ada):
  /                       Dashboard
  /route-planner
  /daily-report
  /complaints
  /outlet-performance
  /competitor-prices
  /product-knowledge
  /promo-calculator
  /leaderboard
  /settings

Admin only (server component requireServerUser({ role: "admin" })):
  /admin/skus             SKU Manager
  /admin/promos           Promo Manager
```

### Tiga lapisan proteksi

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. middleware.ts (Edge runtime)                                 │
│    Cek cookie 'fmcg_session' ada. Bila tidak → redirect /login. │
│    Tidak men-decode JWT (Edge tidak punya semua API Node).      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Server Component / Layout                                    │
│    requireServerUser({ role: "admin" })                         │
│    - decode token                                               │
│    - lookup role & is_active dari user_profiles                 │
│    - bila bukan admin → redirect("/")                           │
│    - bila is_active=false → redirect("/login")                  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. API Route / Controller                                       │
│    requireAuth(req)  /  requireRole(req, "admin")               │
│    Sumber kebenaran final. Tidak bisa di-bypass dari browser.   │
│    Token diteruskan ke InsForge untuk setiap query DB.          │
└─────────────────────────────────────────────────────────────────┘
```

Pseudocode middleware:

```ts
export function middleware(req: NextRequest) {
  if (isPublicAsset(req) || PUBLIC_PATHS.includes(req.nextUrl.pathname)) {
    return NextResponse.next();
  }
  const token = req.cookies.get("fmcg_session")?.value;
  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", req.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}
```

Pseudocode admin server component:

```tsx
// app/admin/promos/page.tsx
export default async function AdminPromosPage() {
  const me = await requireServerUser({ role: "admin" }); // 401/403 = redirect
  // ... aman, render UI admin
}
```

---

## 6. Backend Authorization Rules

Backend **TIDAK** percaya frontend. Semua endpoint mendeklarasikan kontrak role-nya secara eksplisit.

```ts
// helper di server/core/auth.ts
const ROLE_HIERARCHY: Record<Role, Role[]> = {
  admin: ["admin"],
  sales: ["admin", "sales"],     // admin lulus juga
};

export function requireRole(req, ...allowed: Role[]): SessionInfo {
  const session = requireAuth(req);             // 401 bila tidak login
  const ok = allowed.some(a => ROLE_HIERARCHY[a].includes(session.role));
  if (!ok) throw Errors.forbidden();             // 403
  return session;
}
```

### Aturan per endpoint (cuplikan kode aktual)

```ts
// server/modules/products/controller.ts  (SKU)
async create(req) {
  const session = requireRole(req, "admin");      // 403 untuk sales
  ...
}

// server/modules/promos/controller.ts
async list(req) {
  const session = requireAuth(req);
  const isAdmin = session.role === "admin";
  return ok(await promoService.list(q, { activeOnly: !isAdmin }));
  //                                  ^ sales otomatis dapat filter aktif
}
async create/update/remove(req) {
  const session = requireRole(req, "admin");
  ...
}

// server/modules/visits/controller.ts
async create(req) {
  const session = requireAuth(req);
  // ownership di-set service: salesId = session.sub kalau tidak dikirim
  return created(await visitService.create(input, { id: session.sub, ... }));
}
```

### Validasi input

Semua body & query divalidasi pakai **Zod** sebelum service dijalankan. ZodError otomatis → response 400 `VALIDATION_ERROR` dengan detail field lewat `withApi()` wrapper.

```ts
const promoCreateSchema = z.object({
  name: z.string().min(2).max(120),
  type: z.enum(["discount", "bundling", "cashback", "pwp"]),
  discountPct: z.number().min(0).max(100).default(0),
  startsAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endsAt:   z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  // ...
});
```

---

## 7. API Design

Bentuk envelope sama untuk semua endpoint:

```json
{ "success": true, "data": <T>, "meta": { "total": 42 } }
{ "success": false, "error": { "code": "FORBIDDEN", "message": "Akses ditolak." } }
```

| Method | Path                                  | Role     | Tujuan                                   |
| ------ | ------------------------------------- | -------- | ---------------------------------------- |
| POST   | `/api/auth/login`                     | publik   | login email/password                     |
| POST   | `/api/auth/register`                  | publik   | self-signup (default role `sales`)       |
| POST   | `/api/auth/logout`                    | login    | clear session                            |
| GET    | `/api/auth/me`                        | login    | profil + role saya                       |
| GET    | `/api/users`                          | login    | list user (terbatas user_profiles)       |
| GET    | `/api/users/:id`                      | login    | detail user                              |
| GET    | `/api/products`                       | login    | list SKU                                 |
| GET    | `/api/products/:id`                   | login    | detail SKU                               |
| POST   | `/api/products`                       | **admin**| create SKU                               |
| PATCH  | `/api/products/:id`                   | **admin**| update SKU                               |
| GET    | `/api/promos`                         | login    | list promo (sales: aktif saja)            |
| GET    | `/api/promos/:id`                     | login    | detail promo                             |
| POST   | `/api/promos`                         | **admin**| create promo                             |
| PATCH  | `/api/promos/:id`                     | **admin**| update promo                             |
| DELETE | `/api/promos/:id`                     | **admin**| hapus promo                              |
| GET    | `/api/outlets`                        | login    | list outlet (filter)                     |
| GET    | `/api/outlets/:id`                    | login    | detail + statistik                       |
| POST   | `/api/outlets`                        | login    | create outlet                            |
| PATCH  | `/api/outlets/:id`                    | login    | update                                   |
| DELETE | `/api/outlets/:id`                    | **admin**| hapus                                    |
| GET    | `/api/outlets/performance`            | login    | aggregator A/B/C                         |
| GET/POST/PATCH | `/api/visits[/:id]`           | login    | visit                                    |
| GET    | `/api/visits/by-outlet/:outletId`     | login    | histori per outlet                       |
| POST   | `/api/route-plans/optimize`           | login    | optimasi                                 |
| GET/POST | `/api/route-plans`                  | login    | list / save                              |
| GET    | `/api/competitor-prices[/trend]`      | login    | list / tren                              |
| POST   | `/api/competitor-prices`              | login    | catat harga                              |
| GET/POST/PATCH | `/api/complaints[/:id]`       | login    | komplain                                 |
| POST   | `/api/complaints/:id/timeline`        | login    | append update                            |
| POST   | `/api/reports/generate`               | login    | generate narasi                          |
| GET/POST | `/api/reports`                      | login    | list / save                              |
| POST   | `/api/promo/calculate`                | login    | kalkulasi promo (pure)                   |
| POST   | `/api/promo/simulate`                 | login    | multi-skenario                           |
| GET    | `/api/leaderboard`                    | login    | ranking                                  |
| GET    | `/api/dashboard/summary`              | login    | KPI dashboard                            |
| GET/PATCH | `/api/settings`                    | login    | settings personal                        |
| GET/PATCH | `/api/notifications`               | login    | notifikasi personal                      |
| GET    | `/api/activity`                       | **admin**| audit log                                |
| POST   | `/api/admin/seed`                     | **admin**| isi data awal dari mock                  |
| GET    | `/api/health`                         | publik   | liveness                                 |

### Contoh request/response

**Login:**
```bash
curl -i -X POST /api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"admin@fmcg.id","password":"password123"}'
# 200 OK
# Set-Cookie: fmcg_session=eyJ...; HttpOnly; SameSite=Lax; ...
# {"success":true,"data":{"user":{"id":"usr_xxx","role":"admin",...}}}
```

**Sales coba create promo:**
```bash
curl -X POST /api/promos --cookie "fmcg_session=$SALES_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Diskon","type":"discount","startsAt":"2026-06-01","endsAt":"2026-06-30"}'
# 403 {"success":false,"error":{"code":"FORBIDDEN","message":"Akses ditolak."}}
```

**Admin create promo:**
```bash
curl -X POST /api/promos --cookie "fmcg_session=$ADMIN_TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"name":"Diskon Lebaran","description":"5% all SKU","type":"discount","discountPct":5,"startsAt":"2026-06-01","endsAt":"2026-06-30"}'
# 201 {"success":true,"data":{"id":"...","name":"Diskon Lebaran","isActive":true,...}}
```

---

## 8. Initial Seed Data

Endpoint `POST /api/admin/seed` (admin only) memuat data awal dari `lib/mock-data.ts` ke InsForge:
- 8 outlet (Jakarta Selatan, Pusat, Timur, Bandung, Surabaya)
- 6 produk (Indomilk, Indomie, Lifebuoy, Kapal Api, Pepsodent, Aqua)
- 5 catatan harga kompetitor

Untuk users + promos, contoh seed manual lewat UI:

```text
Akun pertama (lewat /register):
  - admin@fmcg.id / password123 → daftar, lalu UPDATE role='admin'
  - sales1@fmcg.id / password123 → tetap role='sales'
  - sales2@fmcg.id / password123 → tetap role='sales'

Promo seed (manual, login sebagai admin → POST /api/promos):
  1. { name:"Diskon Mei", type:"discount", discountPct:5,  startsAt:"2026-05-01", endsAt:"2026-05-31" }
  2. { name:"Bundling Susu", type:"bundling", bundlingQty:1, minQty:24, productId:"<id-susu>", startsAt:"2026-05-15", endsAt:"2026-06-15" }
  3. { name:"Cashback Kopi", type:"cashback", cashbackAmount:5000, minQty:10, startsAt:"2026-06-01", endsAt:"2026-06-30" }

Visit sample (sales login):
  POST /api/visits {"outletId":"<o1>","visitDate":"2026-05-27","outcome":"order","orderValue":1850000,"notes":"Order rutin"}
```

Promote user pertama ke admin (one-time, lewat MCP run-raw-sql):

```sql
UPDATE user_profiles SET role = 'admin' WHERE user_id = 'usr_xxx';
```

---

## 9. Frontend Behavior

```
Sidebar (lib/navigation.ts → navigationFor(role))
├── Overview
│   └── Dashboard                  semua role
├── Lapangan
│   ├── Route Planner             semua role
│   ├── Daily Sales Report        semua role
│   └── Complaint Tracker         semua role
├── Insight
│   ├── Outlet Performance        semua role
│   ├── Competitor Prices         semua role
│   └── Product Knowledge         semua role  (read-only untuk sales)
├── Tools
│   ├── Promo Calculator          semua role
│   └── Leaderboard               semua role
├── Admin                         ← group ini hilang untuk sales
│   ├── SKU Manager               admin only
│   └── Promo Manager             admin only
└── Akun
    └── Settings                  semua role
```

### Pola hide vs disable

- **Menu navigation**: hide. Sales tidak punya alasan melihat menu yang tidak bisa diklik.
- **Tombol aksi (Add SKU, Edit promo, Delete outlet)**: disable + tooltip "khusus admin", lebih informatif daripada hide. Tetap, klik **server-side** akan ditolak 403.
- **Form fields read-only** untuk sales pada Product Knowledge: `<Input readOnly={role !== 'admin'}>`.

### Deteksi role di komponen client

Pola kanonik kami: ambil `role` di Server Component (`getServerUser`) lalu teruskan via props. Untuk efek dinamis di klien (mis. tooltip "khusus admin"), expose lewat React Context atau props ke komponen anak.

```tsx
// app/layout.tsx (Server Component)
const me = await getServerUser();
return <AppShell role={me?.role} userName={me?.name}>{children}</AppShell>;

// Sidebar (Client Component) — terima role via props
<Sidebar role={role}>
  {navigationFor(role).map(group => /* render */)}
</Sidebar>
```

---

## 10. Security Considerations

> ⚠️ Frontend hanya **kosmetik**. Backend yang menjaga.

- **Tidak hanya hide tombol**: setiap endpoint divalidasi `requireRole`. Sales yang memanggil `POST /api/products` dari curl tetap mendapat 403.
- **Token aman**: disimpan di cookie `httpOnly`, `SameSite=Lax`, `Secure` di production. Tidak bisa dibaca JavaScript klien (anti-XSS exfiltration).
- **Server-side cookie minting only**: cookie hanya di-set oleh `/api/auth/login` setelah verifikasi InsForge. Tidak bisa user kirim JWT palsu ke server kita untuk dipasang sebagai cookie.
- **Decoding tanpa verifikasi sengaja**: kita decode JWT untuk membaca `sub`/`exp` saja. Verifikasi tanda tangan dilakukan **oleh server InsForge** pada setiap query DB — token palsu langsung gagal di sana.
- **Per-request InsForge client**: SDK stateful (`setAccessToken` mutate global). Kita buat client baru per request → token tidak bocor lintas-request.
- **Validasi input**: Zod di setiap endpoint, dengan error 400 yang informatif.
- **Email verification**: default ON di InsForge — production wajib SMTP atau verify-email flow di frontend.
- **Audit trail**: setiap mutasi penting (CRUD outlet, ubah complaint, generate report, dll.) tercatat di `activity_logs` dengan actor + entity + meta JSON.
- **Akun nonaktif**: `is_active=false` di `user_profiles` → `getServerUser` mengembalikan `null` → middleware mendepak ke `/login`.
- **Role konsisten**: tersimpan **hanya di** `user_profiles.role`. Tidak ada cache role di frontend storage. Dilookup setiap request.

### Yang belum (untuk follow-up)

- **Postgres RLS**: saat ini otorisasi sepenuhnya di lapisan API. Tambah RLS untuk defense-in-depth (mis. `auth.uid() = sales_id` pada `visits`).
- **Rate limiting**: pasang di layer reverse proxy (Vercel, Cloudflare).
- **2FA**: untuk akun admin, wajib aktifkan TOTP (InsForge perlu konfigurasi tambahan).
- **Per-area scoping** untuk sales: API list outlet/visit/complaint masih return semua. Bisa diketat di service.

---

## 11. Output Format Ringkasan

```
Architecture
├── Next.js 14 App Router (frontend + API routes)
├── InsForge SDK: Auth (signInWithPassword) + DB (PostgREST) + Storage
├── 3-layer protection: middleware → server component guard → API requireRole
└── Async Repository<T> pattern; swap DB = ganti factory di server/db/index.ts

Database     → 11 tabel + 1 bucket. Lihat §2.
Permissions  → Lihat matrix §3.
Auth flow    → POST /api/auth/login → InsForge → cookie httpOnly. Lihat §4.
Routes       → 3 lapis. Public, login-required, admin-required. Lihat §5.
Endpoints    → 38 routes. Lihat §7.
Seed         → POST /api/admin/seed + manual UPDATE role. Lihat §8.
```

---

## 12. Asumsi & Catatan

1. **`products` dipakai sebagai "SKU"** — istilah bisnis FMCG sama di domain ini. Kalau perlu pemisahan formal (mis. SKU varian per ukuran), tambahkan tabel `sku_variants` dengan FK ke `products`.
2. **Default role saat self-register adalah `sales`**. Promosi ke admin **wajib** lewat update DB manual atau endpoint admin (belum diimplementasi — disengaja agar tidak ada eskalasi privilege via UI).
3. **Email verification ON di InsForge** — di environment dev tanpa SMTP, disable di dashboard atau implementasi flow `verifyEmail` di frontend (sudah didukung SDK).
4. **`team_id` belum dipakai aktif** — ditambahkan sebagai field optional untuk siap-pakai saat ada konsep "branch" atau "tim regional".
5. **Leaderboard tidak persisten** — dihitung on-the-fly dari `user_profiles + visits`. Bila volume membesar, materialized view mingguan adalah opsi.
6. **Tidak ada role `supervisor`** — diramping jadi `admin` sesuai requirement. Migrasi dari versi sebelumnya: `UPDATE user_profiles SET role='admin' WHERE role='supervisor'` (sudah dijalankan).
