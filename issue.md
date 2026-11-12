# Issue: Inisialisasi Struktur Project & Setup Arsitektur Monorepo

## 1. Deskripsi Singkat
Buat struktur dasar project full-stack untuk e-commerce berbasis monorepo menggunakan **Bun Workspace**, memisahkan aplikasi Frontend, Backend, dan konfigurasi Database (ORM) agar modular dan mudah dikembangkan lebih lanjut.

---

## 2. Tech Stack
- **Runtime & Package Manager:** Bun (Workspaces enabled)
- **Frontend:** Svelte (SvelteKit)
- **Backend:** Elysia.js
- **Database:** MySQL
- **ORM:** Drizzle ORM (`drizzle-kit`, `mysql2`)

---

## 3. Rencana Struktur Direktori (High-Level)

```text
eccomerce/
├── apps/
│   ├── web/               # Frontend: SvelteKit app
│   └── api/               # Backend: Elysia app
├── packages/
│   └── db/                # Shared Database layer: Drizzle schemas, migrations, client
├── .env.example           # Shared / global environment variable template
├── package.json           # Root workspace config & unified scripts
├── tsconfig.json          # Base TypeScript config
└── README.md
```

---

## 4. Tahapan Implementasi (Milestones)

### Milestone 1: Workspace & Root Setup
- [ ] Inisialisasi root repository dengan `bun init`.
- [ ] Konfigurasi `package.json` root dengan konfigurasi workspace (`apps/*`, `packages/*`).
- [ ] Buat file `.gitignore` standar.
- [ ] Buat file `.env.example`.
- [ ] Siapkan root scripts (`dev`, `build`, `lint`).

### Milestone 2: Setup Database & Drizzle ORM (`packages/db`)
- [ ] Pasang dependensi: `drizzle-orm`, `mysql2`, dan `drizzle-kit`.
- [ ] Buat koneksi database MySQL menggunakan driver pooling.
- [ ] Buat konfigurasi `drizzle.config.ts`.
- [ ] Buat skema awal (tabel `users`).
- [ ] Siapkan script migrasi dan introspeksi database (`db:generate`, `db:push`, `db:migrate`).

### Milestone 3: Setup Backend (`apps/api`)
- [ ] Inisialisasi project Elysia.js dengan TypeScript.
- [ ] Pasang plugin esensial Elysia: `@elysiajs/cors`, `@elysiajs/swagger`.
- [ ] Hubungkan instance Drizzle ORM ke dalam context Elysia.
- [ ] Buat endpoint dasar: `GET /health`.

### Milestone 4: Setup Frontend (`apps/web`)
- [ ] Inisialisasi project SvelteKit dengan TypeScript.
- [ ] Bersihkan boilerplate default.
- [ ] Konfigurasi API fetch helper / environment variable (`PUBLIC_API_URL`).
- [ ] Buat halaman pengujian status backend di `routes/+page.svelte`.

---

## 5. Kriteria Penerimaan (Acceptance Criteria)
1. Perintah `bun install` berhasil di root.
2. Perintah `bun run dev --filter api` menjalankan Elysia + Swagger di `/swagger`.
3. Drizzle ORM terkonfigurasi untuk MySQL.
4. Perintah `bun run dev --filter web` menjalankan SvelteKit.
5. Perintah `bun run dev` di root menjalankan frontend dan backend secara paralel.

