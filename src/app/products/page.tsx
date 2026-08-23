"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Jewellery360Viewer from "@/components/Jewellery360Viewer";
import { formatINR } from "@/lib/formatters";

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const staticLuxuryProducts = [
    {
      id: "p1",
      sku: "SKU-PESHWAI-01",
      name: "22K Royal Peshwai Gold Saaj",
      categoryName: "Peshwai Crafts",
      metalType: "GOLD",
      purity: "22KT",
      minWeightGm: 35.5,
      price: 243500,
      description: "Handcrafted Maharashtrian heritage 22K gold Peshwai necklace with ruby and emerald cabochons.",
      images: [
        "/images/peshwai_necklace.jpg",
        "/assets/products/kolhapuri_saaj.jpg",
        "/images/hero_gold_jewellery.jpg"
      ]
    },
    {
      id: "p2",
      sku: "SKU-NAGAS-02",
      name: "Antique Nagas Temple Gold Bangles",
      categoryName: "Temple Gold",
      metalType: "GOLD",
      purity: "22KT",
      minWeightGm: 48.0,
      price: 329000,
      description: "Intricate antique 22K temple carving Nagas bangles with goddess Lakshmi motifs.",
      images: [
        "/images/nagas_bangles.jpg",
        "/assets/products/gold_bangles.jpg",
        "/assets/products/mens_royal_kada.jpg"
      ]
    },
    {
      id: "p3",
      sku: "SKU-RING-03",
      name: "Solitaire Diamond Platinum Ring",
      categoryName: "Solitaires",
      metalType: "PLATINUM",
      purity: "18KT White Gold",
      minWeightGm: 6.5,
      price: 185000,
      description: "VVS1 D-color certified solitaire diamond set in platinum 6-prong crown.",
      images: [
        "/images/solitaire_ring.jpg",
        "/assets/products/diamond_solitaire.jpg",
        "/assets/products/solitaire_diamond_ring.jpg"
      ]
    },
    {
      id: "p4",
      sku: "SKU-JHUMKA-04",
      name: "Kundan Meenakari Pearl Jhumka",
      categoryName: "Kundan Crafts",
      metalType: "GOLD",
      purity: "22KT",
      minWeightGm: 22.0,
      price: 154000,
      description: "Traditional Rajasthani Kundan meenakari gold Jhumka with freshwater cultured pearls.",
      images: [
        "/images/kundan_jhumka.jpg",
        "/assets/products/brahmani_nath.jpg",
        "/assets/products/mangalsutra.jpg"
      ]
    }
  ];

  useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data.length > 0) {
          setProducts(data.data);
        } else {
          setProducts(staticLuxuryProducts);
        }
        setLoading(false);
      })
      .catch(() => {
        setProducts(staticLuxuryProducts);
        setLoading(false);
      });
  }, []);

  const categories = ["ALL", "Peshwai Crafts", "Temple Gold", "Solitaires", "Kundan Crafts"];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = activeCategory === "ALL" || (p.categoryName || p.category?.name) === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E1E1E] flex flex-col font-sans">
      {/* Live Gold Rate Banner Ticker */}
      <div className="bg-[#1E1E1E] text-white py-2 px-6 text-xs font-semibold flex justify-between items-center border-b border-amber-500/30">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1 text-amber-400 font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> LIVE GOLD SPOT:
          </span>
          <span>22K Gold: <strong className="text-amber-300 font-mono">₹6,850/g</strong></span>
          <span className="text-neutral-500">|</span>
          <span>24K Fine Gold: <strong className="text-amber-300 font-mono">₹7,472/g</strong></span>
          <span className="text-neutral-500">|</span>
          <span>Silver 999: <strong className="text-neutral-300 font-mono">₹88/g</strong></span>
        </div>
        <span className="text-[10px] text-amber-200/70 font-serif hidden md:inline">
          वामन हरी पेटे सन्स • Jewellers Since 1909
        </span>
      </div>

      {/* Main Responsive Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E8E2D9]">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative w-44 h-12">
              <Image
                src="/assets/logo/whps_logo.png"
                alt="Waman Hari Pethe Sons Logo"
                fill
                priority
                sizes="176px"
                className="object-contain object-left"
              />
            </div>
            <div className="border-l border-neutral-300 pl-3 hidden sm:block">
              <div className="text-[10px] text-[#ED5425] font-bold uppercase tracking-widest">
                Jewellers Since 1909
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-neutral-600">
            <Link href="/" className="hover:text-[#ED5425] transition-colors">Home</Link>
            <Link href="/products" className="text-[#ED5425]">Collections</Link>
            <Link href="/stores" className="hover:text-[#ED5425] transition-colors">Showrooms</Link>
            <Link href="/admin/quotations" className="hover:text-[#ED5425] transition-colors">Tax Estimate</Link>
            <Link href="/admin/custom-orders" className="hover:text-[#ED5425] transition-colors">Karigar Work</Link>
            <Link href="/admin/dashboard" className="hover:text-[#ED5425] transition-colors">Enterprise Platform</Link>
          </nav>

          <Link
            href="/appointments"
            className="px-5 py-2.5 bg-[#ED5425] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#C83E13] transition-all shadow-md"
          >
            Book Showroom Visit
          </Link>
        </div>
      </header>

      {/* Collection Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 w-full flex-1 space-y-8">
        {/* Title & Filter Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-[#E8E2D9] pb-8">
          <div>
            <span className="text-xs font-bold text-[#ED5425] uppercase tracking-widest">
              BIS HALLMARKED 22KT & SOLITAIRE HEIRLOOMS
            </span>
            <h1 className="font-serif text-3xl font-bold text-[#1E1E1E] mt-1">
              Certified Masterpiece Collections
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Every piece features 360° interactive view, HUID laser stamp verification & live GST valuation breakup.
            </p>
          </div>

          {/* Search Box */}
          <div className="w-full md:w-72 relative">
            <input
              type="text"
              placeholder="Search by name, SKU or motif..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-neutral-300 rounded-xl text-xs focus:outline-none focus:border-[#ED5425] shadow-sm"
            />
            <span className="absolute left-3 top-3 text-neutral-400 text-xs">🔍</span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm whitespace-nowrap ${
                activeCategory === cat
                  ? "bg-[#ED5425] text-white"
                  : "bg-white text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
              }`}
            >
              {cat === "ALL" ? "All Masterpieces" : cat}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-24 text-neutral-500 text-xs font-semibold">
            Loading hallmarked jewellery collection...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((p) => (
              <div key={p.id} className="flex flex-col">
                <Jewellery360Viewer
                  images={p.images || ["/images/peshwai_necklace.jpg"]}
                  productName={p.name}
                  purity={p.purity || "22KT Gold"}
                  grossWeight={p.minWeightGm || p.weight}
                />
                <div className="mt-3 bg-white p-4 rounded-xl border border-[#E8E2D9] space-y-2 flex-1 flex flex-col justify-between shadow-sm">
                  <div>
                    <div className="flex justify-between items-center text-[10px] text-neutral-500 mb-1 font-mono">
                      <span className="text-[#ED5425] font-bold">{p.sku}</span>
                      <span>HUID Verified</span>
                    </div>
                    <p className="text-xs text-neutral-600 line-clamp-2 leading-relaxed">{p.description}</p>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                    <span className="text-sm font-bold text-[#1E1E1E]" suppressHydrationWarning>
                      ₹{formatINR(p.price || 243500)}
                    </span>
                    <Link
                      href="/admin/quotations"
                      className="px-3 py-1.5 bg-[#ED5425] text-white rounded-lg text-[11px] font-bold hover:bg-[#C83E13] transition-all shadow-sm"
                    >
                      Tax Estimate →
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