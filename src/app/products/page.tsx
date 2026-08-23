"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProducts(data.data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E1E1E] flex flex-col font-sans">
      <header className="border-b border-[#E8E2D9] bg-white px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="वामन हरी पेठे सन्स" className="h-10 w-auto object-contain rounded border border-[#E8E2D9]" />
          <span className="font-serif font-bold text-[#1E1E1E] text-lg">WAMAN HARI PETHE SONS</span>
        </Link>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <Link href="/stores" className="text-[#666666] hover:text-[#ED5425]">Stores</Link>
          <Link href="/appointments" className="px-3 py-1.5 rounded-lg bg-[#ED5425] text-white">Book Visit</Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10 w-full flex-1 space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#E8E2D9] pb-6">
          <div>
            <h1 className="font-serif text-3xl font-bold text-[#1E1E1E]">Certified Jewellery Collection</h1>
            <p className="text-[#666666] text-xs mt-1">22KT Gold & Platinum Solitaires with BIS Hallmarking & HUID Tracking</p>
          </div>
          <span className="px-3 py-1 bg-[#FFF2ED] border border-[#ED5425]/30 text-[#ED5425] text-xs font-semibold rounded-full">
            {products.length} Products Available
          </span>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#666666] text-xs">Loading jewellery collection...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <div key={p.id} className="bg-white border border-[#E8E2D9] rounded-2xl p-6 flex flex-col justify-between hover:border-[#ED5425] hover:shadow-lg transition-all">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono text-[#ED5425] bg-[#FFF2ED] px-2 py-0.5 rounded font-bold border border-amber-500/20">{p.sku}</span>
                    <span className="text-xs text-emerald-700 font-bold">{p.purity} {p.metalType}</span>
                  </div>
                  <h3 className="font-serif font-bold text-xl text-[#1E1E1E]">{p.name}</h3>
                  <p className="text-xs text-[#666666] leading-relaxed">{p.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-[#E8E2D9] space-y-3 text-xs">
                  <div className="flex justify-between text-[#666666]">
                    <span>Category: <strong className="text-[#1E1E1E]">{p.category?.name || "Jewellery"}</strong></span>
                    <span>Weight Range: <strong className="text-[#1E1E1E]">{p.minWeightGm}g - {p.maxWeightGm}g</strong></span>
                  </div>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-[#ED5425] font-semibold">Making Charge: {p.makingChargeValue}%</span>
                    <Link href="/appointments" className="px-4 py-2 bg-[#ED5425] text-white font-bold rounded-lg hover:bg-[#ED5425] transition-colors">
                      Reserve / Try On
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}