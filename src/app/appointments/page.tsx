"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AppointmentsPage() {
  const [branches, setBranches] = useState<any[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    branchId: "",
    date: "",
    time: "11:00",
    purpose: "BRIDAL_TRYON"
  });

  useEffect(() => {
    fetch("/api/branches")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setBranches(data.data);
          if (data.data.length > 0) setForm((f) => ({ ...f, branchId: data.data[0].id }));
        }
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E1E1E] flex flex-col font-sans">
      <header className="border-b border-[#E8E2D9] bg-white px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="वामन हरी पेठे सन्स" className="h-10 w-auto object-contain rounded border border-[#E8E2D9]" />
          <span className="font-serif font-bold text-[#1E1E1E] text-lg">WAMAN HARI PETHE SONS</span>
        </Link>
        <span className="text-xs text-[#666666]">VIP Showroom Appointment</span>
      </header>

      <main className="max-w-xl mx-auto px-6 py-12 w-full flex-1">
        <div className="bg-white border border-[#E8E2D9] rounded-3xl p-8 shadow-lg space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-serif text-2xl font-bold text-[#1E1E1E]">Book Private Consultation</h1>
            <p className="text-xs text-[#666666]">Schedule your private trial with our senior jewellery consultant.</p>
          </div>

          {submitted ? (
            <div className="p-6 bg-[#FFF2ED] border border-[#ED5425]/30 rounded-2xl text-center space-y-3">
              <div className="text-[#ED5425] text-3xl font-bold font-serif">✓ Visit Reserved</div>
              <p className="text-[#1E1E1E] text-sm">Your appointment has been saved in the WHPS Central Database!</p>
              <p className="text-xs text-[#666666]">Our showroom manager will contact you shortly.</p>
              <button onClick={() => setSubmitted(false)} className="px-4 py-2 bg-[#ED5425] text-white font-bold text-xs rounded-lg mt-4">
                Book Another Visit
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#1E1E1E] font-semibold mb-1">Full Name</label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Ananya Deshmukh"
                  className="w-full bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl px-4 py-2.5 text-[#1E1E1E] focus:border-[#ED5425] outline-none"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#1E1E1E] font-semibold mb-1">Phone Number</label>
                  <input
                    required
                    type="tel"
                    placeholder="+91 98200 12345"
                    className="w-full bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl px-4 py-2.5 text-[#1E1E1E] focus:border-[#ED5425] outline-none"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[#1E1E1E] font-semibold mb-1">Email Address</label>
                  <input
                    type="email"
                    placeholder="ananya@example.com"
                    className="w-full bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl px-4 py-2.5 text-[#1E1E1E] focus:border-[#ED5425] outline-none"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#1E1E1E] font-semibold mb-1">Select Showroom Branch</label>
                <select
                  className="w-full bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl px-4 py-2.5 text-[#1E1E1E] focus:border-[#ED5425] outline-none"
                  value={form.branchId}
                  onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name} ({b.city})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[#1E1E1E] font-semibold mb-1">Date</label>
                  <input
                    required
                    type="date"
                    className="w-full bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl px-4 py-2.5 text-[#1E1E1E] focus:border-[#ED5425] outline-none"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[#1E1E1E] font-semibold mb-1">Preferred Time</label>
                  <select
                    className="w-full bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl px-4 py-2.5 text-[#1E1E1E] focus:border-[#ED5425] outline-none"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                  >
                    <option value="11:00">11:00 AM</option>
                    <option value="14:00">02:00 PM</option>
                    <option value="17:00">05:00 PM</option>
                    <option value="19:00">07:00 PM</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[#1E1E1E] font-semibold mb-1">Purpose of Visit</label>
                <select
                  className="w-full bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl px-4 py-2.5 text-[#1E1E1E] focus:border-[#ED5425] outline-none"
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                >
                  <option value="BRIDAL_TRYON">Bridal Jewellery Trial</option>
                  <option value="CUSTOM_DESIGN">Custom Design Consultation</option>
                  <option value="GOLD_EXCHANGE">Old Gold Exchange</option>
                  <option value="DIAMOND_PURCHASE">Solitaire & Diamond Purchase</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-[#ED5425] hover:bg-[#ED5425] text-white font-bold text-sm rounded-xl transition-colors shadow-lg shadow-amber-500/20 mt-4"
              >
                {loading ? "Saving to Database..." : "Confirm Showroom Visit"}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}