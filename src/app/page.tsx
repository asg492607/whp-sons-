"use client";

import Link from "next/link";
import Jewellery360Viewer from "@/components/Jewellery360Viewer";

export default function HomePage() {
  const featuredProducts = [
    {
      id: "p1",
      name: "22K Royal Peshwai Gold Saaj",
      purity: "22KT Gold",
      weight: 35.5,
      price: 243500,
      images: ["/images/peshwai_necklace.jpg", "/images/hero_gold_jewellery.jpg"]
    },
    {
      id: "p2",
      name: "Antique Nagas Temple Gold Bangles",
      purity: "22KT Gold",
      weight: 48.0,
      price: 329000,
      images: ["/images/nagas_bangles.jpg", "/images/hero_gold_jewellery.jpg"]
    },
    {
      id: "p3",
      name: "Solitaire Diamond Platinum Ring",
      purity: "18KT White Gold",
      weight: 6.5,
      price: 185000,
      images: ["/images/solitaire_ring.jpg"]
    },
    {
      id: "p4",
      name: "Kundan Meenakari Pearl Jhumka",
      purity: "22KT Gold",
      weight: 22.0,
      price: 154000,
      images: ["/images/kundan_jhumka.jpg"]
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E1E1E]">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E8E2D9]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#ED5425] rounded-xl flex items-center justify-center text-white font-serif font-bold text-xl shadow-md">
              W
            </div>
            <div>
              <div className="font-serif font-bold text-lg leading-none text-[#1E1E1E]">
                वामन हरी पेटे सन्स
              </div>
              <div className="text-[10px] text-[#ED5425] font-bold uppercase tracking-widest mt-0.5">
                Jewellers Since 1909
              </div>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-neutral-600">
            <Link href="/products" className="hover:text-[#ED5425] transition-colors">Collections</Link>
            <Link href="/stores" className="hover:text-[#ED5425] transition-colors">Showrooms</Link>
            <Link href="/admin/quotations" className="hover:text-[#ED5425] transition-colors">Tax Estimate</Link>
            <Link href="/admin/custom-orders" className="hover:text-[#ED5425] transition-colors">Karigar Orders</Link>
            <Link href="/admin/dashboard" className="hover:text-[#ED5425] transition-colors">Enterprise Platform</Link>
          </nav>

          <Link
            href="/admin/login"
            className="px-5 py-2.5 bg-[#ED5425] text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#C83E13] transition-all shadow-md"
          >
            Admin Sign In
          </Link>
        </div>
      </header>

      {/* Hero Banner with High-Res Gold Jewellery & Corner Logo */}
      <section className="relative h-[560px] bg-neutral-900 overflow-hidden">
        <img
          src="/images/hero_gold_jewellery.jpg"
          alt="Waman Hari Pethe Sons Heritage 22KT Gold Crafts"
          className="w-full h-full object-cover object-center opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-center">
          <div className="max-w-7xl mx-auto px-6 w-full">
            <div className="max-w-xl">
              <span className="px-3 py-1 bg-[#ED5425] text-white text-[11px] font-bold uppercase tracking-widest rounded-md shadow-md">
                HERITAGE PESHWAI 22KT GOLD CRAFTS
              </span>
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-white mt-4 leading-tight">
                Jewellery That Carries A Legacy.
              </h1>
              <p className="text-sm text-neutral-200 mt-3 leading-relaxed">
                Discover timeless Maharashtrian Peshwai craftsmanship, certified hallmarked gold, and conflict-free diamond heirlooms passed across generations.
              </p>
              <div className="flex items-center gap-4 mt-8">
                <Link
                  href="/products"
                  className="px-6 py-3 bg-[#ED5425] text-white rounded-xl font-semibold text-xs uppercase tracking-wider hover:bg-[#C83E13] transition-all shadow-lg"
                >
                  Explore Collection →
                </Link>
                <Link
                  href="/appointments"
                  className="px-6 py-3 bg-white text-[#1E1E1E] rounded-xl font-semibold text-xs uppercase tracking-wider hover:bg-neutral-100 transition-all shadow-md"
                >
                  Book Private Consultation
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Small Brand Logo Badge in Top Right Corner */}
        <div className="absolute top-6 right-6 bg-black/70 backdrop-blur-md px-4 py-2 rounded-lg border border-amber-500/40 flex items-center gap-2 shadow-xl">
          <span className="text-amber-400 font-serif font-bold text-sm">वामन हरी पेटे सन्स</span>
          <span className="text-amber-200/70 font-mono text-xs">• 1909</span>
        </div>
      </section>

      {/* Featured 360 Degree Interactive Jewellery Showcase */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
          <div>
            <span className="text-[11px] font-bold text-[#ED5425] uppercase tracking-widest">
              INTERACTIVE 360° SHOWCASE
            </span>
            <h2 className="text-3xl font-serif font-bold text-[#1E1E1E] mt-1">
              Peshwai & Heritage Masterpieces
            </h2>
          </div>
          <p className="text-xs text-neutral-500 max-w-sm mt-2 md:mt-0">
            Drag any jewellery card left or right to inspect 360-degree rotational angles, craftsmanship details, and hallmarking stamps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((prod) => (
            <div key={prod.id} className="flex flex-col">
              <Jewellery360Viewer
                images={prod.images}
                productName={prod.name}
                purity={prod.purity}
                grossWeight={prod.weight}
              />
              <div className="mt-3 flex justify-between items-center px-1">
                <span className="text-sm font-bold text-[#1E1E1E]">
                  ₹{prod.price.toLocaleString()}
                </span>
                <Link
                  href="/admin/quotations"
                  className="text-xs font-semibold text-[#ED5425] hover:underline"
                >
                  Get Estimate →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}