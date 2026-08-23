"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [products, setProducts] = useState<any[]>([]);

  const BANNERS = [
    { title: "JEWELLERY THAT CARRIES A LEGACY.", sub: "Heritage Peshwai 22KT Gold Crafts", desc: "Discover timeless craftsmanship across generations from Waman Hari Pethe Sons.", img: "/assets/banners/slide_bridal_heritage.jpg" },
    { title: "SOLITAIRES CRAFTED FOR FOREVER.", sub: "IGI Certified VVS Diamonds", desc: "Pure platinum & gold engagement solitaires tailored to your unique love story.", img: "/assets/banners/slide_diamond_collection.jpg" },
    { title: "OLD GOLD EXCHANGE MELA.", sub: "100% Market Value Guarantee", desc: "Upgrade your old gold jewellery to 100% certified 916 hallmarked designs.", img: "/assets/banners/slide_exchange_mela.jpg" }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % BANNERS.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setProducts(data.data);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E1E1E] flex flex-col font-sans">
      {/* Gold Rate Bar (Clean White, Demo Ticker) */}
      <div className="bg-white border-b border-[#E8E2D9] px-8 py-2 text-xs flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="flex items-center gap-6">
          <span className="font-bold tracking-wider flex items-center gap-2 text-[#ED5425]">
            <span className="w-2 h-2 rounded-full bg-[#ED5425] animate-pulse"></span>
            DEMO GOLD RATES (MH)
          </span>
          <span className="text-[#666666]">22K Gold: <strong className="text-[#1E1E1E]">₹6,850/g</strong></span>
          <span className="text-[#666666]">24K Gold: <strong className="text-[#1E1E1E]">₹7,470/g</strong></span>
          <span className="text-[#666666]">Silver: <strong className="text-[#1E1E1E]">₹88.50/g</strong></span>
        </div>
        <div className="flex items-center gap-6 text-[#666666] text-[11px]">
          <span>Showrooms Open Today (9:30 AM - 8:30 PM)</span>
          <Link href="/stores" className="text-[#ED5425] font-bold hover:underline">Find Nearest Showroom →</Link>
        </div>
      </div>

      {/* Main Luxury Header */}
      <header className="border-b border-[#E8E2D9] bg-white/95 backdrop-blur-md px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-xs">
        <Link href="/" className="flex items-center gap-4 group">
          <img src="/logo.png" alt="वामन हरी पेठे सन्स" className="h-12 w-auto object-contain rounded border border-[#E8E2D9]" />
          <div>
            <h1 className="font-serif font-bold text-xl tracking-wider text-[#1E1E1E] group-hover:text-[#ED5425] transition-colors">
              WAMAN HARI PETHE SONS
            </h1>
            <p className="text-[11px] text-[#666666] font-marathi font-semibold">
              वामन हरी पेठे सन्स • Jewellers Since 1909
            </p>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-8 text-xs uppercase font-bold tracking-wider text-[#1E1E1E]">
          <Link href="/products" className="hover:text-[#ED5425] transition-colors">Jewellery</Link>
          <Link href="/products" className="hover:text-[#ED5425] transition-colors">Collections</Link>
          <Link href="/products" className="hover:text-[#ED5425] transition-colors">Bridal</Link>
          <Link href="/products" className="hover:text-[#ED5425] transition-colors">Gold</Link>
          <Link href="/products" className="hover:text-[#ED5425] transition-colors">Diamond</Link>
          <Link href="/stores" className="hover:text-[#ED5425] transition-colors">Showrooms</Link>
        </nav>

        <div className="flex items-center gap-5 text-xs">
          <Link href="/appointments" className="hidden sm:inline-flex px-5 py-2.5 rounded-xl bg-[#ED5425] hover:bg-[#C83E13] text-white font-bold transition-all shadow-md shadow-orange-500/15">
            Book Store Visit
          </Link>
          <Link href="/admin/login" className="text-[#666666] hover:text-[#ED5425] font-semibold">
            Enterprise Log In
          </Link>
        </div>
      </header>

      {/* Full-Width Image-Led Editorial Hero */}
      <section className="relative w-full h-[580px] bg-[#1E1E1E] overflow-hidden border-b border-[#E8E2D9]">
        {BANNERS.map((banner, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              idx === currentSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            <img src={banner.img} alt={banner.title} className="w-full h-full object-cover opacity-85" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent flex items-center px-12 md:px-20">
              <div className="max-w-xl space-y-5 text-white">
                <span className="px-3.5 py-1 bg-[#ED5425] text-white font-bold text-[11px] rounded-full uppercase tracking-widest">
                  {banner.sub}
                </span>
                <h2 className="font-serif text-4xl sm:text-5xl font-bold leading-tight drop-shadow-md tracking-tight">
                  {banner.title}
                </h2>
                <p className="text-slate-200 text-sm leading-relaxed">
                  {banner.desc}
                </p>
                <div className="flex gap-4 pt-2">
                  <Link href="/products" className="px-6 py-3.5 bg-[#ED5425] hover:bg-[#C83E13] text-white font-bold text-xs rounded-xl shadow-lg transition-all">
                    Explore Collection →
                  </Link>
                  <Link href="/appointments" className="px-6 py-3.5 bg-white/95 hover:bg-white text-[#1E1E1E] font-bold text-xs rounded-xl transition-all">
                    Book Private Consultation
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Minimal Hero Slide Indicators */}
        <div className="absolute bottom-8 left-12 md:left-20 z-20 flex gap-2">
          {BANNERS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentSlide(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentSlide ? "w-10 bg-[#ED5425]" : "w-3 bg-white/50"
              }`}
            />
          ))}
        </div>
      </section>

      {/* Category Visual Grid */}
      <section className="py-16 px-8 max-w-7xl mx-auto w-full space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs uppercase tracking-widest text-[#ED5425] font-bold">Heritage Collections</span>
          <h3 className="font-serif text-3xl font-bold text-[#1E1E1E]">Shop by Craft & Tradition</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.name}
              href="/products"
              className="group bg-white border border-[#E8E2D9] rounded-2xl overflow-hidden shadow-xs hover:border-[#ED5425] hover:shadow-lg transition-all text-center"
            >
              <div className="aspect-square bg-[#FFF2ED] overflow-hidden relative">
                <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-3">
                <h4 className="font-bold text-xs text-[#1E1E1E] group-hover:text-[#ED5425] transition-colors">{cat.name}</h4>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Masterpieces Grid */}
      <section className="py-16 px-8 max-w-7xl mx-auto w-full space-y-10 bg-white border border-[#E8E2D9] rounded-3xl shadow-sm my-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-[#ED5425] font-bold">Selected Works</span>
            <h3 className="font-serif text-3xl font-bold text-[#1E1E1E]">Featured Masterpieces</h3>
          </div>
          <Link href="/products" className="text-xs font-bold text-[#ED5425] hover:underline">
            View Complete Catalogue ({products.length} Items) →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((p) => {
            const mediaUrl = p.media && p.media[0] ? p.media[0].url : "/assets/products/kolhapuri_saaj.jpg";
            return (
              <div key={p.id} className="bg-[#FAF8F5] border border-[#E8E2D9] rounded-2xl overflow-hidden hover:border-[#ED5425] hover:shadow-xl transition-all flex flex-col justify-between group">
                <div>
                  <div className="aspect-4/3 overflow-hidden relative bg-white">
                    <img src={mediaUrl} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    <span className="absolute top-3 right-3 px-3 py-1 bg-white/90 backdrop-blur-md text-[#ED5425] font-mono text-[11px] rounded-md font-bold border border-[#ED5425]/20 shadow-xs">
                      {p.purity} {p.metalType}
                    </span>
                  </div>

                  <div className="p-6 space-y-2">
                    <span className="text-[10px] font-mono text-[#ED5425] font-bold bg-[#FFF2ED] px-2 py-0.5 rounded border border-[#ED5425]/20">
                      {p.sku}
                    </span>
                    <h4 className="font-serif font-bold text-xl text-[#1E1E1E] leading-snug">{p.name}</h4>
                    <p className="text-xs text-[#666666] line-clamp-2 leading-relaxed">{p.description}</p>
                  </div>
                </div>

                <div className="p-6 pt-0 space-y-4">
                  <div className="flex justify-between items-center text-xs pt-3 border-t border-[#E8E2D9]">
                    <div>
                      <span className="text-[10px] text-[#666666] block">Approx Weight</span>
                      <strong className="text-[#1E1E1E]">{p.minWeightGm}g - {p.maxWeightGm}g</strong>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-[#666666] block">Hallmark</span>
                      <strong className="text-emerald-700 font-bold">BIS 916 HUID</strong>
                    </div>
                  </div>

                  <Link href="/appointments" className="w-full inline-block text-center py-3 bg-[#ED5425] hover:bg-[#C83E13] text-white font-bold text-xs rounded-xl transition-colors shadow-md shadow-orange-500/10">
                    Book Private Trial at Showroom
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white border-y border-[#E8E2D9] py-14 px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          <div className="p-4 space-y-3">
            <img src="/assets/features/feat_huid_hallmark.jpg" alt="BIS Hallmarked" className="w-16 h-16 mx-auto rounded-xl object-cover shadow-xs border border-[#E8E2D9]" />
            <h4 className="font-bold text-sm text-[#1E1E1E]">100% BIS 916 Hallmarked</h4>
            <p className="text-xs text-[#666666]">Unique HUID code verified on government BIS portal.</p>
          </div>
          <div className="p-4 space-y-3">
            <img src="/assets/features/feat_karigar_bespoke.jpg" alt="Bespoke Karigari" className="w-16 h-16 mx-auto rounded-xl object-cover shadow-xs border border-[#E8E2D9]" />
            <h4 className="font-bold text-sm text-[#1E1E1E]">Master Karigar Crafts</h4>
            <p className="text-xs text-[#666666]">Centuries-old Peshwai goldsmith traditions.</p>
          </div>
          <div className="p-4 space-y-3">
            <img src="/assets/features/feat_legacy_100.jpg" alt="125+ Years Legacy" className="w-16 h-16 mx-auto rounded-xl object-cover shadow-xs border border-[#E8E2D9]" />
            <h4 className="font-bold text-sm text-[#1E1E1E]">Jewellers Since 1909</h4>
            <p className="text-xs text-[#666666]">Serving generations of families across Maharashtra.</p>
          </div>
          <div className="p-4 space-y-3">
            <img src="/assets/features/feat_live_rates.jpg" alt="Live Rates" className="w-16 h-16 mx-auto rounded-xl object-cover shadow-xs border border-[#E8E2D9]" />
            <h4 className="font-bold text-sm text-[#1E1E1E]">Transparent Pricing</h4>
            <p className="text-xs text-[#666666]">Daily rate updates with itemized pricing breakups.</p>
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="bg-white border-t border-[#E8E2D9] py-10 px-8 text-center text-xs text-[#666666] space-y-4">
        <div className="flex justify-center items-center gap-3">
          <img src="/logo.png" alt="Waman Hari Pethe Sons Logo" className="h-9 w-auto object-contain" />
          <span className="font-serif font-bold text-[#1E1E1E] text-lg">WAMAN HARI PETHE SONS</span>
        </div>
        <p className="font-marathi text-xs text-[#1E1E1E]">वामन हरी पेठे सन्स • Jewellers Since 1909</p>
        <div className="flex justify-center gap-6 pt-2 text-xs font-semibold text-[#1E1E1E]">
          <Link href="/products" className="hover:text-[#ED5425]">Jewellery</Link>
          <Link href="/stores" className="hover:text-[#ED5425]">Showrooms</Link>
          <Link href="/careers" className="hover:text-[#ED5425]">Careers</Link>
          <Link href="/franchise" className="hover:text-[#ED5425]">Franchise</Link>
          <Link href="/admin/login" className="hover:text-[#ED5425]">Enterprise Admin</Link>
        </div>
        <p className="pt-4 border-t border-[#E8E2D9] text-[11px]">
          © 2026 Waman Hari Pethe Sons. All Rights Reserved. Shared Central Data Backbone.
        </p>
      </footer>
    </div>
  );
}

const CATEGORIES = [
  { name: "Gold Jewellery", img: "/assets/categories/gold_jewellery.jpg" },
  { name: "Diamond Solitaires", img: "/assets/categories/diamond_jewellery.jpg" },
  { name: "Bridal Collections", img: "/assets/categories/bridal_jewellery.jpg" },
  { name: "Mangalsutra", img: "/assets/categories/mangalsutra.jpg" },
  { name: "Gold Bangles & Patlya", img: "/assets/categories/gold_bangles.jpg" },
  { name: "Heritage Nath", img: "/assets/categories/nath_heritage.jpg" },
];