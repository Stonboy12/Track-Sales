# FMCG Sales OS — Backend

Backend modular untuk FMCG Sales OS. Arsitektur layered, in-memory repository, validasi ketat dengan Zod, response konsisten, dan logging aktivitas.

## Arsitektur

```
server/
├── core/
│   ├── response.ts     # ok(), created(), fail() — bentuk respons API
│   ├── errors.ts       # AppError + Errors helpers
│   ├── handler.ts      # withApi() wrapper untuk semua route
│   ├── auth.ts         # session HS256 (JWT-like) via cookie
│   ├── crypto.ts       # scrypt password + randomId
│   ├── validate.ts     # parseBody / parseQuery (zod)
│   └── logger.ts       # in-memory activity log (1000 entry, ring buffer)
├── db/
│   ├── types.ts        # Tipe semua entitas (User, Outlet, Visit, ...)
│   ├── repository.ts   # Interface Repository<T> + impl in-memory
│   ├── memory.ts       # Singleton DB (semua repo)
│   └── seed.ts         # Seeder dari lib/mock-data.ts
└── modules/
    ├── auth/           # login, register, logout, me
    ├── users/          # list user
    ├── outlets/        # CRUD + detail + performance
    ├── visits/         # CRUD + by-outlet
    ├── route-plans/    # save + optimize (heuristic)
    ├── competitor-prices/  # CRUD + tren + insight
    ├── products/       # CRUD
    ├── complaints/     # CRUD + timeline
    ├── reports/        # generate + save
    ├── promo/          # calculate + simulate (pure)
    ├── leaderboard/    # ranking on-the-fly
    ├── dashboard/      # summary aggregator
    ├── settings/       # per-user
    ├── notifications/  # per-user
    └── activity/       # admin only
```

Semua route handler ada di `app/api/<resource>/route.ts` dan **hanya** memanggil controller. Tidak ada logika di sana.

## Layering

| Layer            | Tanggung jawab                                            |
| ---------------- | --------------------------------------------------------- |
| **Controller**   | Parse request, panggil service, format response.          |
| **Service**      | Business logic, orchestrate repo + validation eksternal.  |
| **Repository**   | CRUD persistence, tidak tahu apa-apa soal HTTP.           |
| **Schema (Zod)** | Validasi input dan tipe TypeScript turunannya.            |
| **Logger**       | Catat aksi penting agar bisa di-audit.                    |

Mengganti DB nanti = ganti implementasi `Repository<T>` di `server/db/memory.ts`. Tidak ada controller/service yang perlu diubah.

## Auth

- **Strategy**: cookie session HS256 (`fmcg_session`, httpOnly).
- **Password**: hashed dengan `scrypt` + salt (built-in Node).
- **Roles**: `admin`, `supervisor`, `sales`.
- **Helpers**: `requireAuth(req)`, `requireRole(req, ...roles)` di setiap controller.

### Akun seed (default password `password123`)

| Email                    | Role        | Nama          |
| ------------------------ | ----------- | ------------- |
| `admin@fmcg.id`          | admin       | Admin Utama   |
| `supervisor@fmcg.id`     | supervisor  | Putri Supervisor |
| `adi.pratama@fmcg.id`    | sales       | Adi Pratama   |
| `rini.kurnia@fmcg.id`    | sales       | Rini Kurnia   |
| ...                      | sales       | (tim)         |

## Response Envelope

Semua endpoint mengembalikan bentuk yang sama:

**Success**
```json
{ "success": true, "data": <payload>, "meta": { "total": 42 } }
```

**Error**
```json
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "...", "details": {...} } }
```

Error codes yang dipakai: `UNAUTHORIZED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`, `CONFLICT`, `INTERNAL_ERROR`.

## API Endpoints

### Auth
| Method | Path                  | Body / Query                        |
| ------ | --------------------- | ----------------------------------- |
| POST   | `/api/auth/login`     | `{ email, password }`               |
| POST   | `/api/auth/register`  | `{ email, password, name, role? }`  |
| POST   | `/api/auth/logout`    | —                                   |
| GET    | `/api/auth/me`        | (cookie session)                    |

### Outlets
| Method | Path                          | Notes                                       |
| ------ | ----------------------------- | ------------------------------------------- |
| GET    | `/api/outlets`                | Filter: `search`, `area`, `segment`, `priority`, `status`, `assignedSalesId`, pagination. |
| POST   | `/api/outlets`                | Create outlet. |
| GET    | `/api/outlets/:id`            | Detail + statistik visit & komplain.        |
| PATCH  | `/api/outlets/:id`            | Partial update.                             |
| DELETE | `/api/outlets/:id`            | admin/supervisor only.                      |
| GET    | `/api/outlets/performance`    | Aggregator segmen A/B/C, total revenue.     |

### Visits
| Method | Path                              | Notes |
| ------ | --------------------------------- | ----- |
| GET    | `/api/visits`                     | Filter `outletId`, `salesId`, `outcome`, `from`, `to`. |
| POST   | `/api/visits`                     | |
| GET    | `/api/visits/:id`                 | |
| PATCH  | `/api/visits/:id`                 | |
| GET    | `/api/visits/by-outlet/:outletId` | Histori sebuah outlet. |

### Route Plans
| Method | Path                          |
| ------ | ----------------------------- |
| POST   | `/api/route-plans/optimize`   |
| GET    | `/api/route-plans`            |
| POST   | `/api/route-plans`            |

### Competitor Prices
| Method | Path                                | Notes |
| ------ | ----------------------------------- | ----- |
| GET    | `/api/competitor-prices`            | Filter `productName`, `competitor`, `area`, `from`, `to`, pagination. |
| POST   | `/api/competitor-prices`            | |
| GET    | `/api/competitor-prices/trend?productName=...&days=30` | Series + insight ringan. |

### Products
| Method | Path                | Roles                |
| ------ | ------------------- | -------------------- |
| GET    | `/api/products`     | semua user           |
| POST   | `/api/products`     | admin/supervisor     |
| GET    | `/api/products/:id` | semua user           |
| PATCH  | `/api/products/:id` | admin/supervisor     |

### Complaints
| Method | Path                                  |
| ------ | ------------------------------------- |
| GET    | `/api/complaints`                     |
| POST   | `/api/complaints`                     |
| GET    | `/api/complaints/:id`                 |
| PATCH  | `/api/complaints/:id`                 |
| POST   | `/api/complaints/:id/timeline`        |

### Reports
| Method | Path                          |
| ------ | ----------------------------- |
| POST   | `/api/reports/generate`       |
| GET    | `/api/reports`                |
| POST   | `/api/reports`                |
| GET    | `/api/reports/:id`            |

### Promo
| Method | Path                       |
| ------ | -------------------------- |
| POST   | `/api/promo/calculate`     |
| POST   | `/api/promo/simulate`      |

### Lain-lain
| Method | Path                         | Notes                              |
| ------ | ---------------------------- | ---------------------------------- |
| GET    | `/api/leaderboard`           | Query: `area`, `period=month\|all` |
| GET    | `/api/dashboard/summary`     | Query: `salesId`                   |
| GET    | `/api/settings`              | Settings user login                |
| PATCH  | `/api/settings`              |                                    |
| GET    | `/api/notifications`         | Query: `unread=1`, `limit`         |
| PATCH  | `/api/notifications`         | `{ ids?: [], all?: true }`         |
| GET    | `/api/users` / `/api/users/:id` |                                  |
| GET    | `/api/activity`              | admin/supervisor only.             |
| GET    | `/api/health`                | Liveness check.                    |

## Contoh Request/Response

### Login
```bash
curl -i -X POST http://localhost:3000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"adi.pratama@fmcg.id","password":"password123"}'
```
Response (set-cookie `fmcg_session=...`):
```json
{
  "success": true,
  "data": {
    "user": { "id": "user_sales_1", "email": "adi.pratama@fmcg.id", "role": "sales", ... },
    "token": "eyJhbGciOi..."
  }
}
```

### List outlet
```bash
curl 'http://localhost:3000/api/outlets?area=Jakarta%20Selatan&priority=high' \
  --cookie "fmcg_session=$TOKEN"
```
```json
{ "success": true, "data": [{ "id":"o1", "code":"JKT-001", ... }], "meta": { "total": 3, "page": 1, "limit": 50 } }
```

### Optimize route
```bash
curl -X POST http://localhost:3000/api/route-plans/optimize \
  -H 'Content-Type: application/json' \
  --cookie "fmcg_session=$TOKEN" \
  -d '{ "outletIds":["o1","o3","o6"], "strategy":"priority" }'
```
```json
{ "success": true, "data": {
  "strategy": "priority",
  "stops": [{ "order": 1, "outletId": "o1", "outletName": "Toko Sumber Rejeki", "priority": "high", "area": "Jakarta Selatan" }, ...],
  "estimatedDurationMin": 135,
  "estimatedDistanceKm": 12.6
}}
```

### Hitung promo
```bash
curl -X POST http://localhost:3000/api/promo/calculate \
  -H 'Content-Type: application/json' \
  --cookie "fmcg_session=$TOKEN" \
  -d '{ "basePrice":7500, "qty":24, "discountPct":5, "bundling":2, "cashback":5000, "costPerUnit":5500 }'
```
```json
{ "success": true, "data": {
  "gross": 180000, "discountAmount": 9000, "bundlingValue": 15000,
  "finalPrice": 151000, "effectiveQty": 26, "pricePerUnit": 5808,
  "savingsPct": 16.1, "marginPct": 5.2
}}
```

### Generate laporan harian
```bash
curl -X POST http://localhost:3000/api/reports/generate \
  -H 'Content-Type: application/json' \
  --cookie "fmcg_session=$TOKEN" \
  -d '{
    "date":"2026-05-27",
    "visits":[
      {"outletId":"o1","outletName":"Toko Sumber Rejeki","outcome":"order","orderValue":1850000,"notes":"Order rutin"},
      {"outletId":"o3","outletName":"Warung Bu Yati","outcome":"no_order","orderValue":0,"notes":"Stok masih banyak"}
    ],
    "generalNotes":"Macet di Sudirman."
  }'
```
```json
{ "success": true, "data": {
  "summary": { "total": 2, "success": 1, "orderTotal": 1850000 },
  "generatedText": "Laporan Harian — 2026-05-27\nSalesperson: Adi Pratama\n..."
}}
```

## Error Handling

- `ZodError` → 400 `VALIDATION_ERROR` (`details` berisi `flatten()`).
- `AppError(code, message, status)` → mapped 1:1.
- Exception lain → 500 `INTERNAL_ERROR` (logged via `console.error`).

## Activity Logging

Setiap mutasi penting (create/update outlet, visit, complaint, dll) memanggil `activityLogger.record({...})`. Log ring-buffer 1000 entry teratas, bisa dibaca via `GET /api/activity` (admin/supervisor).

## Memindahkan ke DB Asli (mis. InsForge / Postgres)

1. Buat implementasi `Repository<T>` baru per entitas (ada di `server/db/repository.ts`).
2. Ganti factory di `server/db/memory.ts` agar mengembalikan adapter baru — service/controller tidak perlu diubah.
3. Update `seed.ts` jika perlu data awal di DB asli, atau hapus.
4. Set environment variable `AUTH_SECRET` (32+ karakter) di production.

## Environment

```
AUTH_SECRET=<random-32-chars>   # secret untuk signing session token
NODE_ENV=production             # mengaktifkan flag Secure pada cookie
```
