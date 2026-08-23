"use client";
import Link from "next/link";

export default function FranchisePage() {
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E1E1E] flex flex-col font-sans">
      <header className="border-b border-[#E8E2D9] bg-white px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="वामन हरी पेठे सन्स" className="h-10 w-auto object-contain rounded border border-[#E8E2D9]" />
          <span className="font-serif font-bold text-[#1E1E1E] text-lg">WAMAN HARI PETHE SONS</span>
        </Link>
        <span className="text-xs text-[#666666]">Module 14: Franchise Expansion</span>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12 w-full flex-1 space-y-8">
        <div className="text-center space-y-3">
          <h1 className="font-serif text-3xl font-bold text-[#1E1E1E]">Franchise Expansion Program</h1>
          <p className="text-xs text-[#666666]">Partner with Maharashtra's trusted heritage jewellery brand. Franchise evaluation and site due diligence.</p>
        </div>

        <div className="bg-white border border-[#E8E2D9] rounded-3xl p-8 space-y-6 shadow-sm">
          <h2 className="font-serif text-xl font-bold text-[#1E1E1E]">Franchise Application Form</h2>
          <form onSubmit={(e) => { e.preventDefault(); alert("Franchise enquiry registered in WHPS database!"); }} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Full Name</label>
                <input required type="text" placeholder="Partner Name" className="w-full bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl px-4 py-2.5 outline-none focus:border-[#ED5425]" />
              </div>
              <div>
                <label className="block font-semibold mb-1">City of Interest</label>
                <input required type="text" placeholder="e.g. Kolhapur, Nashik, Goa" className="w-full bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl px-4 py-2.5 outline-none focus:border-[#ED5425]" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold mb-1">Investment Capacity</label>
                <select className="w-full bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl px-4 py-2.5 outline-none focus:border-[#ED5425]">
                  <option>₹2 Cr - ₹5 Cr</option>
                  <option>₹5 Cr - ₹10 Cr</option>
                  <option>Above ₹10 Cr</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Property Ownership</label>
                <select className="w-full bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl px-4 py-2.5 outline-none focus:border-[#ED5425]">
                  <option>Owned Commercial Property</option>
                  <option>Leased Commercial Property</option>
                  <option>Searching Property</option>
                </select>
              </div>
            </div>

            <button type="submit" className="w-full py-3 bg-[#ED5425] hover:bg-[#ED5425] text-white font-bold text-sm rounded-xl transition-colors shadow-md">
              Submit Franchise Application
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}