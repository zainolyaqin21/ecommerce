# E-Commerce Monorepo

Struktur project e-commerce modern dengan arsitektur monorepo berbasis **Bun Workspaces**.

## Tech Stack
- **Runtime & Package Manager:** [Bun](https://bun.sh/)
- **Frontend:** [SvelteKit](https://kit.svelte.dev/) (Svelte 5)
- **Backend:** [Elysia.js](https://elysiajs.com/)
- **Database:** MySQL
- **ORM:** [Drizzle ORM](https://orm.drizzle.team/)

---

## Struktur Direktori

```text
eccomerce/
├── apps/
│   ├── web/               # Frontend: SvelteKit app (Port 3000)
│   └── api/               # Backend: Elysia.js app (Port 3001)
├── packages/
│   └── db/                # Shared Database layer: Drizzle schemas, migrations & MySQL client
├── .env.example           # Environment template
├── package.json           # Root workspace script & config
├── tsconfig.json          # Root TypeScript configuration
└── README.md
```

---

## Memulai Proyek (Getting Started)

### 1. Prerequisites
- Pastikan [Bun](https://bun.sh) telah terinstal (v1.1+ direkomendasikan).
- Pastikan MySQL server sedang berjalan.

### 2. Konfigurasi Environment
Salin file `.env.example` menjadi `.env` pada root:
```bash
cp .env.example .env
```
Sesuaikan kredensial database `DATABASE_URL` dengan database MySQL Anda:
```env
DATABASE_URL=mysql://user:password@localhost:3306/ecommerce_db
```

### 3. Install Dependencies
Jalankan instalasi dependensi di root (otomatis menginstal seluruh workspace):
```bash
bun install
```

### 4. Database Migrations
Untuk membuat dan mengaplikasikan skema Drizzle ORM ke database MySQL:
```bash
# Push schema langsung ke MySQL
bun run db:push

# Atau buka Drizzle Studio (Database GUI)
bun run db:studio
```

### 5. Menjalankan Server Development
Jalankan frontend dan backend secara bersamaan:
```bash
bun run dev
```

Atau jalankan masing-masing service secara terpisah:
```bash
# Jalankan Backend API saja (http://localhost:3001)
bun run dev:api

# Jalankan Frontend Web saja (http://localhost:3000)
bun run dev:web
```

---

## Dokumentasi API (Swagger)
Ketika backend berjalan, dokumentasi interaktif Swagger dapat diakses di:
👉 **[http://localhost:3001/swagger](http://localhost:3001/swagger)**

