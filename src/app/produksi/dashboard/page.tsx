"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Package,
  Printer,
  CheckCircle2,
  Truck,
  ExternalLink,
  RefreshCw,
  AlertCircle,
  Building2,
  User,
  Clock,
  Layers,
} from "lucide-react";
import ResiModal from "@/components/ResiModal";

type OrderStatus =
  | "PENDING"
  | "PROSES_CETAK"
  | "QC_PACKING"
  | "DALAM_PENGIRIMAN"
  | "SELESAI";

interface OrderItem {
  id: string;
  orderNumber: string;
  productType: string;
  specifications: string;
  quantity: number;
  fileUrl: string;
  resiNumber: string | null;
  status: OrderStatus;
  createdAt: string;
  client: {
    name: string;
    company?: string | null;
    whatsapp: string;
    address?: string | null;
  };
  vendor: {
    name: string;
    contact: string;
    specialty: string;
  };
}

export default function ProduksiDashboard() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Resi Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<OrderItem | null>(null);

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/produksi/orders");
      if (!res.ok) {
        throw new Error("Gagal mengambil data antrean produksi.");
      }
      const data = await res.json();
      setOrders(data.data || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Terjadi kesalahan";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleUpdateStatus = async (
    orderId: string,
    newStatus: OrderStatus,
    resiNumber?: string
  ) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, resiNumber }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Gagal memperbarui status.");
      }

      // Update local state immediately
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: newStatus, resiNumber: resiNumber ?? o.resiNumber }
            : o
        )
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal memperbarui status";
      alert(msg);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenDeliveryModal = (order: OrderItem) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const handleResiSubmit = async (resi: string) => {
    if (!selectedOrder) return;
    await handleUpdateStatus(selectedOrder.id, "DALAM_PENGIRIMAN", resi);
  };

  const filteredOrders = orders.filter((order) => {
    if (activeTab === "ALL") return true;
    return order.status === activeTab;
  });

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return {
          label: "Menunggu SPK",
          className: "bg-amber-100 text-amber-800 border-amber-200",
          icon: Clock,
        };
      case "PROSES_CETAK":
        return {
          label: "Proses Cetak",
          className: "bg-blue-100 text-blue-800 border-blue-200",
          icon: Printer,
        };
      case "QC_PACKING":
        return {
          label: "QC & Packing",
          className: "bg-purple-100 text-purple-800 border-purple-200",
          icon: CheckCircle2,
        };
      case "DALAM_PENGIRIMAN":
        return {
          label: "Dalam Pengiriman",
          className: "bg-emerald-100 text-emerald-800 border-emerald-200",
          icon: Truck,
        };
      default:
        return {
          label: status,
          className: "bg-slate-100 text-slate-800 border-slate-200",
          icon: Package,
        };
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Refresh */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Antrean Produksi</h2>
          <p className="text-xs text-slate-500">
            Perbarui progres pesanan cetak & pengiriman
          </p>
        </div>
        <button
          onClick={fetchOrders}
          disabled={isLoading}
          aria-label="Segarkan Antrean"
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-xs flex items-center gap-1.5 text-xs font-semibold min-h-[44px]"
        >
          <RefreshCw
            className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-600" : ""}`}
          />
          <span className="hidden sm:inline">Segarkan</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
        {[
          { key: "ALL", label: "Semua" },
          { key: "PENDING", label: "Menunggu" },
          { key: "PROSES_CETAK", label: "Cetak" },
          { key: "QC_PACKING", label: "QC / Packing" },
          { key: "DALAM_PENGIRIMAN", label: "Kirim" },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-3 py-2 rounded-xl font-medium whitespace-nowrap transition-colors min-h-[40px] ${
                isActive
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="space-y-3 py-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-5 border border-slate-200 animate-pulse space-y-3 shadow-xs"
            >
              <div className="h-5 bg-slate-200 rounded w-1/3" />
              <div className="h-4 bg-slate-100 rounded w-3/4" />
              <div className="h-16 bg-slate-50 rounded-xl" />
              <div className="h-12 bg-slate-200 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 rounded-2xl p-5 text-center text-red-700 space-y-3"
        >
          <AlertCircle className="w-8 h-8 mx-auto text-red-600" />
          <p className="text-sm font-semibold">{error}</p>
          <button
            onClick={fetchOrders}
            className="px-4 py-2.5 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 transition-colors inline-flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Coba Muat Ulang
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && filteredOrders.length === 0 && (
        <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-2">
          <Layers className="w-10 h-10 mx-auto text-slate-300" />
          <h3 className="text-sm font-bold text-slate-700">Tidak Ada Antrean</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            Tidak ada pesanan aktif pada kategori ini. Silakan periksa tab status
            lainnya.
          </p>
        </div>
      )}

      {/* Order Cards List */}
      {!isLoading &&
        !error &&
        filteredOrders.map((order) => {
          const badge = getStatusBadge(order.status);
          const BadgeIcon = badge.icon;
          const isBusy = updatingId === order.id;

          return (
            <article
              key={order.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md"
            >
              {/* Card Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100 flex items-start justify-between gap-3">
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Nomor Pesanan
                  </span>
                  <h3 className="text-lg font-extrabold text-slate-900 leading-tight">
                    {order.orderNumber}
                  </h3>
                </div>
                <div
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${badge.className}`}
                >
                  <BadgeIcon className="w-3.5 h-3.5" />
                  <span>{badge.label}</span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 sm:p-5 space-y-3.5 text-xs sm:text-sm">
                {/* Product & Qty */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 mb-0.5 font-medium">
                    Produk & Kuantitas:
                  </p>
                  <p className="font-bold text-slate-900 text-sm sm:text-base">
                    {order.productType}
                  </p>
                  <p className="text-xs font-semibold text-blue-700 mt-1">
                    Jumlah: {order.quantity.toLocaleString("id-ID")} pcs
                  </p>
                </div>

                {/* Specifications */}
                <div>
                  <p className="text-xs text-slate-500 font-semibold mb-1">
                    Spesifikasi Teknis:
                  </p>
                  <div className="bg-slate-50/70 p-3 rounded-lg border border-slate-100 text-xs text-slate-700 whitespace-pre-line leading-relaxed font-mono">
                    {order.specifications}
                  </div>
                </div>

                {/* Vendor Information */}
                <div className="flex items-start gap-2 text-slate-600 bg-amber-50/50 p-3 rounded-xl border border-amber-100/60">
                  <Building2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-slate-800">
                      Vendor: {order.vendor.name}
                    </p>
                    <p className="text-slate-500">
                      Kontak: {order.vendor.contact} ({order.vendor.specialty})
                    </p>
                  </div>
                </div>

                {/* Client Information */}
                <div className="flex items-start gap-2 text-slate-600 bg-blue-50/40 p-3 rounded-xl border border-blue-100/60">
                  <User className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <p className="font-bold text-slate-800">
                      Tujuan Kirim: {order.client.name}{" "}
                      {order.client.company ? `(${order.client.company})` : ""}
                    </p>
                    {order.client.address && (
                      <p className="text-slate-500 mt-0.5">
                        {order.client.address}
                      </p>
                    )}
                  </div>
                </div>

                {/* Resi info if in delivery */}
                {order.resiNumber && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
                    <div className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-emerald-600" />
                      <div>
                        <span className="font-bold">Resi/Kurir: </span>
                        <span>{order.resiNumber}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenDeliveryModal(order)}
                      className="text-[11px] font-bold text-emerald-700 underline hover:text-emerald-900"
                    >
                      Ubah Resi
                    </button>
                  </div>
                )}

                {/* Google Drive Link Button */}
                {order.fileUrl && (
                  <a
                    href={order.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 rounded-xl border border-blue-200 bg-blue-50 text-blue-700 font-semibold text-xs flex items-center justify-center gap-1.5 hover:bg-blue-100 transition-colors min-h-[44px]"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Buka File Cetak di Google Drive</span>
                  </a>
                )}
              </div>

              {/* Action Buttons (Large Touch Target) */}
              <div className="p-4 sm:p-5 bg-slate-50/80 border-t border-slate-100 space-y-2">
                {order.status === "PENDING" && (
                  <button
                    onClick={() => handleUpdateStatus(order.id, "PROSES_CETAK")}
                    disabled={isBusy}
                    className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 min-h-[48px] disabled:opacity-70"
                  >
                    <Printer className="w-5 h-5" />
                    <span>
                      {isBusy ? "Memproses..." : "Mulai Proses Cetak"}
                    </span>
                  </button>
                )}

                {order.status === "PROSES_CETAK" && (
                  <button
                    onClick={() => handleUpdateStatus(order.id, "QC_PACKING")}
                    disabled={isBusy}
                    className="w-full py-3.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 min-h-[48px] disabled:opacity-70"
                  >
                    <CheckCircle2 className="w-5 h-5" />
                    <span>
                      {isBusy ? "Memproses..." : "Barang Diambil & QC Packing"}
                    </span>
                  </button>
                )}

                {order.status === "QC_PACKING" && (
                  <button
                    onClick={() => handleOpenDeliveryModal(order)}
                    disabled={isBusy}
                    className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-bold text-sm shadow-sm transition-colors flex items-center justify-center gap-2 min-h-[48px] disabled:opacity-70"
                  >
                    <Truck className="w-5 h-5" />
                    <span>
                      {isBusy ? "Memproses..." : "Kirim Kurir (Input Resi)"}
                    </span>
                  </button>
                )}

                {order.status === "DALAM_PENGIRIMAN" && (
                  <div className="w-full py-3 px-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold text-xs flex items-center justify-center gap-2 text-center min-h-[48px]">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Barang sedang dikirim. Menunggu penyelesaian oleh Admin.</span>
                  </div>
                )}
              </div>
            </article>
          );
        })}

      {/* Resi Input Modal */}
      {selectedOrder && (
        <ResiModal
          isOpen={isModalOpen}
          orderNumber={selectedOrder.orderNumber}
          initialResi={selectedOrder.resiNumber}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedOrder(null);
          }}
          onSubmit={handleResiSubmit}
        />
      )}
    </div>
  );
}
