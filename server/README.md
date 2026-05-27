# FMCG Sales OS — Backend (InsForge)

Backend FMCG Sales OS yang sudah disambungkan ke **InsForge** (PostgreSQL + Auth + Storage). Ini lapisan yang berdiri di antara halaman frontend Next.js dan InsForge: routing API, validasi, otorisasi, mapping data, dan logging aktivitas.

## Arsitektur

```
lib/
  insforge.ts                # Factory client InsForge (browser & server)
server/
├── core/
│   ├── response.ts          # ok / created / fail (envelope standar)
│   ├── errors.ts            # AppError + Errors helpers
│   ├── handler.ts           # withApi: init RequestContext + error mapping
│   ├── request-context.ts   # AsyncLocalStorage (token, userId, role, client)
│   ├── auth.ts              # decode session cookie (InsForge JWT)
│   ├── validate.ts          # parseBody / parseQuery (zod)
│   └── logger.ts            # activity_logs (persisted) + ring-buffer fallback
├── db/
│   ├── types.ts             # Tipe entitas TS (camelCase)
│   ├── repository.ts        # Interface Repository<T> async + QueryOptions
│   ├── insforge-repository.ts # Impl pakai InsForge SDK
│   ├── mappers.ts           # snake_case ↔ camelCase per entity
│   └── index.ts             # Singleton DB (semua repo)
└── modules/
    ├── auth/                # signUp/signIn/signOut/me — pakai InsForge
    ├── users/               # query user_profiles + InsForge profile
    ├── outlets/             # CRUD + detail + performance
    ├── visits/              # CRUD + by-outlet
    ├── route-plans/         # save + optimize (heuristic)
    ├── competitor-prices/   # CRUD + tren + insight
    ├── products/            # CRUD
    ├── complaints/          # CRUD + timeline
    ├── reports/             # generate + save
    ├── promo/               # calculate + simulate (pure)
    ├── leaderboard/         # ranking on-the-fly
    ├── dashboard/           # summary aggregator
    ├── settings/            # per-user
    ├── notifications/       # per-user
    └── activity/            # admin/supervisor only
app/
├── api/**/route.ts          # 33 endpoint, thin delegator ke controller
├── login/page.tsx           # halaman publik
├── register/page.tsx        # halaman publik
└── (semua halaman dashboard) # protected oleh middleware.ts
middleware.ts                # redirect ke /login bila cookie session kosong
```

## Auth Flow

```
Frontend (login form)
   │
   ▼
POST /api/auth/login           ──► Server
                                    │
                                    │ 1. authService.login(input)
                                    │    = client.auth.signInWithPassword()
                                    │
                                    │ 2. Eager-create user_profiles row
                                    │
                                    │ 3. Set httpOnly cookie:
                                    │    fmcg_session = <InsForge accessToken>
                                    ▼
                              Response: { user }   (cookie attached)
```

Tiap request berikutnya:

```
Browser                   Next.js middleware            withApi() wrapper
─────────                 ────────────────────          ─────────────────
GET /api/outlets    ──►   Cek cookie ada?       ──►    Decode JWT → userId
                                                        Buat InsForge client
                                                        dengan setAccessToken
                                                        Eager-load role dari
                                                        user_profiles
                                                        ──► run controller
                                                            ──► service
                                                                ──► repo
                                                                    ──► InsForge
```

## Database Schema

Tabel publik (yang kita kontrol):

| Tabel               | Kolom kunci                                                | Relasi                            |
| ------------------- | ---------------------------------------------------------- | --------------------------------- |
| `user_profiles`     | `user_id` (unik, ke InsForge users)                        | 1-1 ke `auth.users`               |
| `outlets`           | `code` (unik), `assigned_sales_id`                         | dipakai visits & complaints       |
| `visits`            | `outlet_id` FK → outlets, `sales_id`                       | satu outlet → banyak visit        |
| `route_plans`       | `sales_id`, `outlet_ids` (jsonb array)                     | per salesman                      |
| `competitor_prices` | `product_id` FK → products (nullable), `observed_at`       | histori                           |
| `products`          | `sku` (unik), `selling_points` (jsonb), `faqs` (jsonb)     | independen                        |
| `complaints`        | `code` (unik), `outlet_id` FK → outlets, `timeline` (jsonb)| timeline append-only              |
| `reports`           | `sales_id`, `date`, `visits` (jsonb)                       | satu user → banyak report         |
| `notifications`     | `user_id`, `read`                                          | per user                          |
| `user_settings`     | `user_id` (unik)                                           | 1-1 ke user                       |
| `activity_logs`     | `actor_id`, `action`, `entity`, `entity_id`, `meta` jsonb  | audit trail                       |

Semua tabel pakai `id uuid` PK, `created_at` & `updated_at` timestamptz default `now()`.

## Environment

Salin `.env.example` → `.env.local`:

```bash
NEXT_PUBLIC_INSFORGE_URL=https://<your-project>.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=eyJhbGci...   # ambil via MCP get-anon-key
SESSION_COOKIE=fmcg_session
```

> ⚠️ **Email verification**: Default InsForge `requireEmailVerification: true`. Di development tanpa SMTP, **disable** lewat dashboard InsForge → Auth Settings, atau gunakan endpoint OTP `verifyEmail` dari frontend.

## Endpoint

Semua endpoint sebelumnya tetap ada (33 routes). Auth contract sama seperti versi sebelumnya:

| Method | Path                          | Notes                                      |
| ------ | ----------------------------- | ------------------------------------------ |
| POST   | `/api/auth/login`             | Body `{ email, password }`. Set cookie.    |
| POST   | `/api/auth/register`          | Bisa balik `requireEmailVerification:true` |
| POST   | `/api/auth/logout`            | Clear cookie + InsForge signOut            |
| GET    | `/api/auth/me`                | Validasi token via InsForge                |
| POST   | `/api/admin/seed`             | **admin only**. Body opsional `{ tables: [...] }` |

Endpoint modul lain identik dengan versi memory store. Keep your existing frontend calls — bentuk response tidak berubah.

## Onboarding (langkah pertama deploy)

1. Set env (`.env.local` atau dashboard hosting).
2. Schema dibuat otomatis (sudah dijalankan via SQL di `/projects/sandbox`); cek di dashboard InsForge → Database. Bila perlu re-deploy ke project lain, jalankan SQL yang sama.
3. **Disable email verification** di InsForge dashboard, atau setup SMTP.
4. Daftarkan user pertama lewat `/register` (atau via SDK direct).
5. Promosikan ke admin (one-time):
   ```sql
   UPDATE user_profiles SET role = 'admin' WHERE user_id = '<insforge-user-id>';
   ```
6. Login sebagai admin → POST `/api/admin/seed` untuk isi `outlets`, `products`, `competitor_prices` dari mock data.

## Mengganti DB / Adapter Lain

Ubah hanya satu file: `server/db/index.ts`. Contoh menukar dengan adapter custom (mis. Supabase, PostgreSQL langsung, in-memory tests):

```ts
// Ganti createInsforgeRepository(...) dengan implementasi Repository<T> Anda.
import { createSupabaseRepository } from "./supabase-repository";
import { outletMapper } from "./mappers";
export const db: DB = {
  outlets: createSupabaseRepository<Outlet>(outletMapper),
  // ...
};
```

Service & controller **tidak perlu diubah** — interface `Repository<T>` adalah kontrak satu-satunya.

## Storage

Bucket `attachments` (public) tersedia. Pemakaian dari frontend:

```ts
import { insforge } from "@/lib/insforge";
const { data, error } = await insforge.storage
  .bucket("attachments")
  .upload("complaints/cmp-1042/photo.jpg", file);
```

URL publik kemudian disimpan di `complaints.attachment_urls` (jsonb array).

## Logging Aktivitas

Setiap mutasi penting (create outlet, update complaint, generate report, dll) menulis row ke `activity_logs`. Ada di `server/core/logger.ts` — best-effort, gagal log tidak menggagalkan request utama.

```bash
GET /api/activity?limit=50&entity=complaint   # admin/supervisor only
```

## Catatan Keamanan & Asumsi

- **Auth**: Token InsForge disimpan di cookie httpOnly + SameSite=Lax. Production tambahkan `Secure` (otomatis ketika `NODE_ENV=production`).
- **Decoding JWT**: Server kita decode JWT InsForge tanpa verifikasi tanda tangan — verifikasi nyata dilakukan oleh server InsForge pada setiap query DB. Cookie hanya pernah di-set oleh `/api/auth/login` (yang sudah lewat InsForge), sehingga isinya terjamin valid sampai expire.
- **RBAC**: 3 role di `user_profiles.role`: `admin`, `supervisor`, `sales`. Hierarki: admin ⊃ supervisor ⊃ sales (lihat `server/core/auth.ts:requireRole`).
- **RLS belum aktif**: Otorisasi sepenuhnya dipegang lapisan API kita. Untuk production yang lebih strict, tambahkan PostgreSQL RLS policies pada tiap tabel (mis. `auth.uid() = sales_id` untuk `visits`).
- **Per-request client**: SDK InsForge stateful (`setAccessToken` mengubah header Authorization global pada client). Kita buat client baru per request via `createInsforgeClient()` agar token tidak bocor antar request.
