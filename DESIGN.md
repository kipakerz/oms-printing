# Spesifikasi Proyek: Internal Order Management System (OMS) Percetakan

## 1. Ikhtisar Proyek

Membangun sistem manajemen pesanan internal (OMS) berbasis web untuk bisnis broker percetakan. Sistem ini menjembatani Admin di Surabaya (mengelola klien, desain, dan keuangan) dengan Kepala Produksi di Jakarta (mengambil barang di vendor, _Quality Control_, dan pengiriman). Sistem ini difokuskan pada fungsionalitas manajemen internal, bukan etalase publik.

## 2. Tech Stack

- **Framework:** Next.js (App Router, TypeScript)
- **Styling:** Tailwind CSS (Shadcn UI atau komponen Tailwind murni)
- **Database:** Supabase (PostgreSQL)
- **ORM:** Prisma
- **Authentication:** NextAuth.js (Credentials Provider)
- **PDF Generation:** `@react-pdf/renderer` (Untuk Invoice & SPK)
- **Deployment Target:** Vercel

## 3. Hak Akses & Peran (Role-Based Access Control)

Sistem menggunakan `NextAuth.js` dengan dua role utama:

1.  **ROLE: ADMIN**
    - Akses penuh (CRUD) ke semua modul: Klien, Vendor, Order, Finance, Cashflow.
    - Bisa melihat HPP (Harga Modal Vendor), Harga Jual, dan Margin Keuntungan.
    - Bisa _generate_ dan mengunduh SPK (Surat Perintah Kerja) dan Invoice.
    - Akses rute: `/admin/*`

2.  **ROLE: PRODUKSI**
    - Akses sangat terbatas (Mobile-First UI).
    - Hanya bisa melihat daftar SPK / Antrean Produksi dan detail pesanan.
    - **Blind Pricing:** TIDAK BISA melihat harga, margin, atau _cashflow_.
    - Hanya bisa memperbarui (Update) **Status Order** dan memasukkan **Nomor Resi**.
    - Akses rute: `/produksi/*`

## 4. Skema Database (Prisma)

Buat file `prisma/schema.prisma` dengan definisi berikut:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum Role {
  ADMIN
  PRODUKSI
}

enum OrderStatus {
  PENDING
  PROSES_CETAK
  QC_PACKING
  DALAM_PENGIRIMAN
  SELESAI
}

model User {
  id       String @id @default(cuid())
  name     String
  email    String @unique
  password String // Digunakan oleh NextAuth Credentials (hashed)
  role     Role   @default(PRODUKSI)
}

model Client {
  id        String   @id @default(cuid())
  name      String
  company   String?
  whatsapp  String
  address   String?
  orders    Order[]
  createdAt DateTime @default(now())
}

model Vendor {
  id        String   @id @default(cuid())
  name      String
  contact   String
  specialty String
  orders    Order[]
}

model Order {
  id             String      @id @default(cuid())
  orderNumber    String      @unique
  clientId       String
  client         Client      @relation(fields: [clientId], references: [id])
  vendorId       String
  vendor         Vendor      @relation(fields: [vendorId], references: [id])
  productType    String
  specifications String      @db.Text
  quantity       Int
  fileUrl        String      // Link Google Drive File Cetak
  resiNumber     String?     // Diisi oleh role PRODUKSI
  status         OrderStatus @default(PENDING)
  finance        Finance?
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
}

model Finance {
  id            String  @id @default(cuid())
  orderId       String  @unique
  order         Order   @relation(fields: [orderId], references: [id])
  vendorCost    Decimal @db.Decimal(10, 2)
  sellingPrice  Decimal @db.Decimal(10, 2)
  shippingFee   Decimal @db.Decimal(10, 2) @default(0)
  paymentStatus String  // Enum string: UNPAID, DP_50, PAID
}

model Cashflow {
  id          String   @id @default(cuid())
  type        String   // INCOME atau EXPENSE
  amount      Decimal  @db.Decimal(10, 2)
  description String
  date        DateTime @default(now())
}
```

## 5. Arsitektur Rute (App Router)

Susun struktur folder Next.js sebagai berikut:

- `/app/login`: Halaman autentikasi NextAuth.
- `/app/admin`: Layout Admin (Sidebar, Desktop-friendly).
  - `/app/admin/dashboard`: Ringkasan pendapatan & order aktif.
  - `/app/admin/orders`: CRUD Order, Generate SPK/Invoice.
  - `/app/admin/clients`: CRUD Client.
  - `/app/admin/vendors`: CRUD Vendor.
  - `/app/admin/cashflow`: Pencatatan uang masuk/keluar.
- `/app/produksi`: Layout Produksi (Tanpa sidebar, Mobile-first).
  - `/app/produksi/dashboard`: Daftar order dengan status `PENDING`, `PROSES_CETAK`, `QC_PACKING`.
  - `/app/produksi/order/[id]`: Detail spesifikasi cetak & tombol aksi (Update Status).
- `/app/api/*`: Endpoint API.
  - `/app/api/auth/[...nextauth]`: Konfigurasi NextAuth.
  - `/app/api/whatsapp/route.ts`: Webhook/Trigger untuk API WhatsApp.

## 6. Alur Kerja (Workflow) & Logika Sistem

### A. Alur Pembaruan Status

- `PENDING`: Status awal saat Admin membuat Order.
- `PROSES_CETAK`: Admin menekan tombol "Kirim SPK". Trigger API WhatsApp terkirim ke Klien dan Kepala Produksi.
- `QC_PACKING`: Kepala Produksi (di HP) menekan tombol "Barang Diambil & QC".
- `DALAM_PENGIRIMAN`: Kepala Produksi menekan tombol "Kirim Kurir", lalu sistem memunculkan Modal untuk memasukkan `resiNumber`. Setelah disimpan, trigger API WhatsApp terkirim ke Klien.
- `SELESAI`: Admin menekan tombol "Tutup Pesanan" (Setelah klien membayar lunas).

### B. Integrasi Notifikasi WhatsApp (Trigger)

Buat _utility function_ (misal di `lib/whatsapp.ts`) yang dapat dipanggil saat _update_ Prisma terjadi. Gunakan format API request standar (misal menggunakan API dari Fonnte/Wablas).

- **Trigger 1 (SPK Dibuat -> Ke Produksi):**
  "Halo Produksi. Ada SPK Baru [OrderNumber]. Vendor: [Vendor Name]. Spesifikasi: [Product Type]. Silakan cek dashboard."
- **Trigger 2 (Proses Cetak -> Ke Klien):**
  "Halo [Nama Klien], pesanan [Jenis Cetak] Anda sedang diproses. Kami akan mengabari jika barang siap dikirim."
- **Trigger 3 (Pengiriman -> Ke Klien):**
  "Pesanan Anda sedang dikirim. Resi/Kurir: [ResiNumber]. Terima kasih telah menggunakan jasa kami!"

### C. Pembuatan PDF (Invoice & SPK)

Gunakan `@react-pdf/renderer`. Buat dua komponen terpisah:

1.  `SPKDocument`: Berisi Nomor Order, Detail Vendor, Spesifikasi Produk, Kuantitas, dan Link/QR Code Google Drive (Data dari tabel `Order` dan `Vendor`). Jangan masukkan harga.
2.  `InvoiceDocument`: Berisi Nama Klien, Daftar Pesanan, Total Tagihan, dan Status Pembayaran (Data dari tabel `Client`, `Order`, dan `Finance`).

## 7. Instruksi Implementasi untuk AI (Langkah-Langkah Vibecoding)

AI agent harus mengeksekusi _build_ dengan urutan berikut:

1.  **Tahap 1 (Setup Base):** Inisialisasi Next.js, instalasi _dependencies_ (Prisma, Tailwind, NextAuth), setup koneksi Supabase, jalankan `npx prisma db push`.
2.  **Tahap 2 (Auth & Layout):** Konfigurasi `route.ts` NextAuth. Buat _Middleware_ untuk memproteksi `/admin` hanya untuk role `ADMIN` dan `/produksi` hanya untuk role `PRODUKSI`. Buat _seeder script_ untuk 1 user Admin dan 1 user Produksi.
3.  **Tahap 3 (Admin Panel):** Bangun form UI untuk memasukkan Client, Vendor, dan Order. Integrasikan dengan Prisma. Pastikan form Order memiliki relasi _dropdown_ ke Client dan Vendor.
4.  **Tahap 4 (Mobile UI Produksi):** Bangun `/produksi/dashboard` dengan antarmuka berbasis _Card_ (_Card-based UI_) yang besar untuk layar HP. Buat fungsi pembaruan status `onClick`.
5.  **Tahap 5 (PDF & WA Integrasi):** Implementasikan _React PDF_ untuk generate dokumen SPK dan Invoice. Tambahkan _fetch logic_ sederhana ke `lib/whatsapp.ts` dan panggil di dalam aksi pengubahan status (_server actions_ atau API routes).
