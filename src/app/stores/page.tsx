"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function StoresPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/branches")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setBranches(data.data);
        setLoading(false);
      });
  }, []);

  const SHOWROOM_IMAGES: Record<string, string> = {
    "WHP-MUM-01": "/assets/showrooms/flagship_showroom.jpg",
    "WHP-PUN-01": "/assets/showrooms/showroom_pune.jpg",
    "WHP-MUM-02": "/assets/showrooms/showroom_thane.jpg",
    "WHP-MUM-03": "/assets/showrooms/showroom_vashi.jpg"
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E1E1E] flex flex-col font-sans">
      <header className="border-b border-[#E8E2D9] bg-white px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="वामन हरी पेठे सन्स" className="h-10 w-auto object-contain rounded border border-[#E8E2D9]" />
          <span className="font-serif font-bold text-[#1E1E1E] text-lg">WAMAN HARI PETHE SONS</span>
        </Link>
        <Link href="/appointments" className="px-4 py-2 rounded-xl bg-[#ED5425] text-white text-xs font-bold shadow-md">
          Book Store Visit
        </Link>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 w-full flex-1 space-y-8">
        <div className="border-b border-[#E8E2D9] pb-6">
          <h1 className="font-serif text-3xl font-bold text-[#1E1E1E]">Our Showroom Network</h1>
          <p className="text-[#666666] text-xs mt-1">12 Connected Showroom Branches across Maharashtra & Goa sharing Central Data Backbone</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#666666] text-xs">Loading showroom network...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.map((b) => {
              const imgUrl = SHOWROOM_IMAGES[b.code] || "/assets/showrooms/flagship_showroom.jpg";
              return (
                <div key={b.id} className="bg-white border border-[#E8E2D9] rounded-2xl overflow-hidden hover:border-[#ED5425] hover:shadow-xl transition-all flex flex-col justify-between">
                  <div>
                    <div className="aspect-16/9 overflow-hidden bg-[#FFF2ED] relative">
                      <img src={imgUrl} alt={b.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                      <span className="absolute top-3 right-3 px-2.5 py-0.5 bg-white/90 text-emerald-700 font-bold text-[10px] rounded font-mono shadow-xs border border-emerald-200">
                        {b.status}
                      </span>
                    </div>

                    <div className="p-6 space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-mono text-[#ED5425] bg-[#FFF2ED] px-2 py-0.5 rounded font-bold border border-[#ED5425]/20">{b.code}</span>
                      </div>
                      <h3 className="font-serif font-bold text-xl text-[#1E1E1E]">{b.name}</h3>
                      <p className="text-xs text-[#666666]">{b.city}, {b.state}</p>

                      <div className="pt-3 border-t border-[#E8E2D9] space-y-2 text-xs text-[#666666]">
                        <p>📞 Phone: <strong className="text-[#1E1E1E]">{b.phone}</strong></p>
                        <p>🎯 Monthly Target: <strong className="text-[#ED5425]">₹{(b.targetMonthlyRevenue / 100000).toFixed(1)} Lakhs/mo</strong></p>
                        <p>🏛 Vault Strongrooms: <strong className="text-[#1E1E1E]">{b.inventoryLocations?.length || 0} Rooms</strong></p>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 pt-0">
                    <Link href="/appointments" className="w-full inline-block text-center py-2.5 bg-[#FFF2ED] hover:bg-[#ED5425] hover:text-white font-bold text-xs rounded-xl text-[#ED5425] transition-colors">
                      Book Visit at {b.city}
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}