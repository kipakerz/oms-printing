import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { OrderStatus } from "@prisma/client";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PATCH(request: Request, { params }: RouteParams) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Tidak terautentikasi" }, { status: 401 });
  }

  // Both PRODUKSI and ADMIN can update order status
  if (session.user.role !== "PRODUKSI" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Akses tidak diizinkan" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const { status, resiNumber } = body;

    // Validate valid status
    const validStatuses: OrderStatus[] = [
      "PENDING",
      "PROSES_CETAK",
      "QC_PACKING",
      "DALAM_PENGIRIMAN",
      "SELESAI",
    ];

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Status pesanan tidak valid" },
        { status: 400 }
      );
    }

    // When status changes to DALAM_PENGIRIMAN, validate resiNumber
    if (status === "DALAM_PENGIRIMAN" && (!resiNumber || !resiNumber.trim())) {
      return NextResponse.json(
        { error: "Nomor resi atau informasi kurir wajib diisi saat pengiriman" },
        { status: 400 }
      );
    }

    const updateData: {
      status: OrderStatus;
      resiNumber?: string;
    } = {
      status,
    };

    if (resiNumber !== undefined) {
      updateData.resiNumber = resiNumber.trim();
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        resiNumber: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      message: "Status pesanan berhasil diperbarui",
      data: updatedOrder,
    });
  } catch (error) {
    console.error("Gagal memperbarui status pesanan:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memperbarui status pesanan" },
      { status: 500 }
    );
  }
}
