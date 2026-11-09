"use client";

import { useState, useEffect, useRef } from "react";
import { Truck, X, Loader2, AlertCircle } from "lucide-react";

interface ResiModalProps {
  isOpen: boolean;
  orderNumber: string;
  initialResi?: string | null;
  onClose: () => void;
  onSubmit: (resi: string) => Promise<void>;
}

export default function ResiModal({
  isOpen,
  orderNumber,
  initialResi = "",
  onClose,
  onSubmit,
}: ResiModalProps) {
  const [resi, setResi] = useState(initialResi || "");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setResi(initialResi || "");
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen, initialResi]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resi.trim()) {
      setError("Nomor resi atau nama kurir wajib diisi.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit(resi.trim());
      onClose();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Gagal menyimpan nomor resi";
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/60 backdrop-blur-xs"
    >
      <div
        className="w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-5 shadow-xl border border-slate-200 animate-in fade-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-base">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Truck className="w-5 h-5" />
            </div>
            <span id="modal-title">Input Resi & Ekspedisi</span>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Tutup Dialog"
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="py-3">
          <p className="text-xs text-slate-500 mb-1">Nomor Pesanan:</p>
          <p className="text-sm font-bold text-slate-800">{orderNumber}</p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-3 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="resiNumber"
              className="block text-xs font-semibold text-slate-700 mb-1.5"
            >
              Nomor Resi / Info Kurir:
            </label>
            <input
              ref={inputRef}
              id="resiNumber"
              type="text"
              required
              value={resi}
              onChange={(e) => setResi(e.target.value)}
              placeholder="Contoh: JNE JKT12345678 / Lalamove B 1234 CD"
              className="w-full px-3.5 py-3 rounded-xl border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-sm"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Data ini akan dicatat untuk pelacakan pengiriman klien.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 active:bg-slate-100 transition-colors min-h-[48px]"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 shadow-sm min-h-[48px] disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>Simpan & Kirim</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
