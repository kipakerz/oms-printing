import Link from "next/link";
import { ShieldCheck, ArrowRight } from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Admin Dashboard</h2>
            <p className="text-sm text-slate-500">
              Role: ADMIN terverifikasi. Akses rute /admin/* aktif.
            </p>
          </div>
        </div>
        <p className="text-sm text-slate-600 mt-4 leading-relaxed">
          Modul CRUD Client, Vendor, Order, Finance, dan Cashflow akan diimplementasikan pada tahap selanjutnya setelah Phase 1 & 2 disetujui.
        </p>

        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-4">
          <Link
            href="/produksi/dashboard"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            Lihat Tampilan Tim Produksi Jakarta
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
