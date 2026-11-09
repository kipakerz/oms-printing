"use client";

import { useSession, signOut } from "next-auth/react";
import { LogOut, Factory, User } from "lucide-react";

export default function ProduksiHeader() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-30 bg-slate-900 text-white shadow-md">
      <div className="max-w-lg mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-sm">
            <Factory className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight">Produksi OMS</h1>
            <p className="text-[11px] text-slate-400">Hub Produksi Jakarta</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {session?.user && (
            <div className="hidden xs:flex items-center gap-1.5 text-xs bg-slate-800 py-1.5 px-2.5 rounded-md text-slate-300">
              <User className="w-3.5 h-3.5 text-slate-400" />
              <span className="truncate max-w-[100px]">{session.user.name}</span>
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            title="Keluar Akun"
            aria-label="Keluar Akun"
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
