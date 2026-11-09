import React from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white text-sm">
            OMS
          </div>
          <div>
            <h1 className="font-bold text-sm">Admin Surabaya</h1>
            <p className="text-xs text-slate-400">Order Management System</p>
          </div>
        </div>
      </header>
      <main className="p-6 max-w-7xl mx-auto w-full flex-1">{children}</main>
    </div>
  );
}
