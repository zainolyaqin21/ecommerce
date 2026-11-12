# Issue: Refactor & Best Practice Implementation dari Review PR #4

## 1. Deskripsi Singkat
Setelah melakukan review mendalam pada implementasi modul autentikasi dan session management di PR #4, ditemukan beberapa poin optimasi arsitektur, keamanan (security hardening), dan konsistensi tipe TypeScript. Issue ini merangkum temuan debugging, pembaruan, serta file-file yang dipulihkan (*restored*) dalam working tree.

---

## 2. Catatan File yang Di-restore / Diperbaiki (Restoration Log)
Saat proses sinkronisasi dan checkout branch, file-file berikut dipulihkan ke working directory untuk memastikan keutuhan struktur arsitektur:
1. `apps/api/src/routes/health.route.ts` - Rute health check status server & DB connection.
2. `apps/api/src/routes/user.route.ts` - Rute endpoint data users.
3. `apps/api/src/routes/index.ts` - Root router penggabung (`healthRoutes`, `userRoutes`, `authRoutes`).
4. `apps/api/src/services/health.service.ts` - Service layer diagnosa koneksi MySQL via Drizzle ORM.
5. `apps/api/src/services/user.service.ts` - Service layer query data users.
6. `apps/api/src/services/index.ts` - Barrel export untuk seluruh service.
7. `packages/db/src/schema/sessions.ts` - Skema Drizzle tabel `sessions` dengan relasi cascade ke `users`.
8. `packages/db/src/schema/users.ts` - Skema Drizzle tabel `users` dengan kolom enum `role` (`admin`, `customer`).
9. `packages/db/src/schema/index.ts` - Export skema database.
10. `packages/db/tsconfig.json` - Penyesuaian `rootDir: "."` agar mencakup `drizzle.config.ts`.
11. `apps/api/tsconfig.json` - Standarisasi `"types": ["bun"]` sesuai rilis Bun modern.

---

## 3. Poin Pembaruan & Debugging Best Practices

### A. Keamanan & Proteksi Endpoint (Security Hardening)
- [x] **Session Guard pada User Route (`apps/api/src/routes/user.route.ts`)**:
  - Endpoint `GET /api/users` sebelumnya bersifat publik tanpa proteksi.
  - Ditambahkan validasi session token aktif (baik via Cookie `sessionId` maupun header `Authorization: Bearer <token>`). Akses tanpa session valid mengembalikan `401 Unauthorized`.
- [x] **Pencegahan Data Leakage di AuthService (`apps/api/src/services/auth.service.ts`)**:
  - Query login diubah menjadi *selective projection* (hanya memilih `id`, `name`, `email`, `password`, `role`), bukan `select()` wildcard.
  - Nilai hash password di-protect agar tidak pernah ikut dikembalikan pada objek response.
  - Sanitasi email dengan normalisasi `.trim().toLowerCase()`.
  - Normalisasi nama user dengan `.trim()`.

### B. Konsistensi Tipe Data & Serialisasi JSON
- [x] **BigInt to Number Conversion**:
  - Drizzle ORM MySQL mengembalikan `insertId` dan kolom ID tabel bertipe `bigint` / unsigned bigint.
  - Dikonversi eksplisit ke `Number(...)` agar aman diserialisasi ke JSON tanpa memicu runtime error.

### C. Dokumentasi API (Swagger / OpenAPI)
- [x] **Swagger Tag Registration (`apps/api/src/index.ts`)**:
  - Mendaftarkan tag `Auth` (`User Authentication & Session management`) pada konfigurasi Swagger documentation.

---

## 4. Kriteria Pengujian (Verification)
- [x] `bun x tsc --noEmit` sukses pada `apps/api` dan `packages/db`.
- [x] `bun run build` sukses pada seluruh workspace (`api` & `web`).
