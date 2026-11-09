import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }

  if (session.user.role !== "PRODUKSI" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Akses ditolak" }, { status: 403 });
  }

  try {
    // Blind Pricing: select only production-relevant fields, explicitly exclude finance
    const orders = await prisma.order.findMany({
      where: {
        status: {
          in: ["PENDING", "PROSES_CETAK", "QC_PACKING", "DALAM_PENGIRIMAN"],
        },
      },
      select: {
        id: true,
        orderNumber: true,
        productType: true,
        specifications: true,
        quantity: true,
        fileUrl: true,
        resiNumber: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        client: {
          select: {
            id: true,
            name: true,
            company: true,
            whatsapp: true,
            address: true,
          },
        },
        vendor: {
          select: {
            id: true,
            name: true,
            contact: true,
            specialty: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ data: orders });
  } catch (error) {
    console.error("Gagal mengambil antrean produksi:", error);
    return NextResponse.json(
      { error: "Gagal memuat data antrean pesanan" },
      { status: 500 }
    );
  }
}
