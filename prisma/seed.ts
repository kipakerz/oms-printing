import { PrismaClient, Role, OrderStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // 1. Seed Users (1 Admin, 1 Produksi)
  const hashedAdminPassword = await bcrypt.hash("admin123", 10);
  const hashedProduksiPassword = await bcrypt.hash("produksi123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@oms.local" },
    update: {},
    create: {
      name: "Admin Surabaya",
      email: "admin@oms.local",
      password: hashedAdminPassword,
      role: Role.ADMIN,
    },
  });

  const produksi = await prisma.user.upsert({
    where: { email: "produksi@oms.local" },
    update: {},
    create: {
      name: "Kepala Produksi Jakarta",
      email: "produksi@oms.local",
      password: hashedProduksiPassword,
      role: Role.PRODUKSI,
    },
  });

  console.log("Created users:", { admin: admin.email, produksi: produksi.email });

  // 2. Seed Sample Client
  const client = await prisma.client.upsert({
    where: { id: "client-sample-1" },
    update: {},
    create: {
      id: "client-sample-1",
      name: "PT Bintang Abadi",
      company: "Bintang Group",
      whatsapp: "081234567890",
      address: "Jl. Sudirman No. 45, Jakarta",
    },
  });

  // 3. Seed Sample Vendor
  const vendor = await prisma.vendor.upsert({
    where: { id: "vendor-sample-1" },
    update: {},
    create: {
      id: "vendor-sample-1",
      name: "Percetakan Cepat Jaya",
      contact: "089876543210",
      specialty: "Offset & Packaging Box",
    },
  });

  // 4. Seed Sample Orders for Produksi testing
  await prisma.order.upsert({
    where: { orderNumber: "ORD-2026-001" },
    update: {},
    create: {
      orderNumber: "ORD-2026-001",
      clientId: client.id,
      vendorId: vendor.id,
      productType: "Box Packaging Ivory 310gsm",
      specifications: "Ukuran: 20x15x7 cm\nFinishing: Doff Lamination + Spot UV logo\nKuantitas: 1000 pcs",
      quantity: 1000,
      fileUrl: "https://drive.google.com/drive/folders/sample-file-box",
      status: OrderStatus.PENDING,
      finance: {
        create: {
          vendorCost: 3500000,
          sellingPrice: 5500000,
          shippingFee: 150000,
          paymentStatus: "DP_50",
        },
      },
    },
  });

  await prisma.order.upsert({
    where: { orderNumber: "ORD-2026-002" },
    update: {},
    create: {
      orderNumber: "ORD-2026-002",
      clientId: client.id,
      vendorId: vendor.id,
      productType: "Brosur A4 Lipat 3 Art Paper 150gsm",
      specifications: "Full Color 2 Sisi\nLipat 3 rapi\nKuantitas: 2500 lembar",
      quantity: 2500,
      fileUrl: "https://drive.google.com/drive/folders/sample-file-brosur",
      status: OrderStatus.PROSES_CETAK,
      finance: {
        create: {
          vendorCost: 1200000,
          sellingPrice: 2100000,
          shippingFee: 50000,
          paymentStatus: "PAID",
        },
      },
    },
  });

  await prisma.order.upsert({
    where: { orderNumber: "ORD-2026-003" },
    update: {},
    create: {
      orderNumber: "ORD-2026-003",
      clientId: client.id,
      vendorId: vendor.id,
      productType: "Sticker Vinyl Die Cut",
      specifications: "Ukuran 5x5 cm\nLaminasi Glossy tahan air\nKuantitas: 5000 pcs",
      quantity: 5000,
      fileUrl: "https://drive.google.com/drive/folders/sample-file-sticker",
      status: OrderStatus.QC_PACKING,
      finance: {
        create: {
          vendorCost: 800000,
          sellingPrice: 1500000,
          shippingFee: 30000,
          paymentStatus: "PAID",
        },
      },
    },
  });

  console.log("Database seeded successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
