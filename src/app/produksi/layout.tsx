import React from "react";
import ProduksiHeader from "@/components/ProduksiHeader";

export default function ProduksiLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      <ProduksiHeader />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5 pb-20">
        {children}
      </main>
    </div>
  );
}
