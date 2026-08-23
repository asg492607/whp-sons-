"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Customer360Page() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCust, setSelectedCust] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("Purchases");

  useEffect(() => {
    fetch("/api/customers")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCustomers(data.data);
          if (data.data.length > 0) setSelectedCust(data.data[0]);
        }
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E1E1E] flex flex-col font-sans">
      <header className="border-b border-[#E8E2D9] bg-white px-8 py-3.5 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="वामन हरी पेठे सन्स" className="h-10 w-auto object-contain rounded border border-[#E8E2D9]" />
          <div>
            <h1 className="font-bold text-[#1E1E1E] text-sm font-serif">Customer 360 Dossier & Loyalty</h1>
            <p className="text-[10px] text-[#666666] font-mono">Omnichannel Profile • Purchase History • Family Relationship Graph</p>
          </div>
        </div>
        <Link href="/admin/dashboard" className="text-xs font-bold text-[#ED5425] hover:underline">
          Back to Control Center
        </Link>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 w-full flex-1 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Directory */}
          <div className="bg-white border border-[#E8E2D9] rounded-3xl p-5 space-y-4 shadow-xs">
            <h2 className="font-serif font-bold text-lg text-[#1E1E1E]">Customer Directory ({customers.length})</h2>

            {loading ? (
              <p className="text-xs text-[#666666] text-center py-10">Loading customer dossiers...</p>
            ) : (
              <div className="space-y-3">
                {customers.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCust(c)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all text-xs space-y-1 ${
                      selectedCust?.id === c.id ? "bg-[#FFF2ED] border-[#ED5425]" : "bg-[#FAF8F5] border-[#E8E2D9] hover:border-[#ED5425]"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <strong className="text-[#1E1E1E] text-sm font-serif">{c.firstName} {c.lastName}</strong>
                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded font-mono text-[10px] font-bold">
                        {c.tier} TIER
                      </span>
                    </div>
                    <p className="text-[#666666]">📞 {c.phone} • {c.city}</p>
                    <p className="text-[#ED5425] font-bold">Loyalty Points: {c.loyaltyPoints} pts</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Customer 360 Dossier Main View */}
          <div className="lg:col-span-2 bg-white border border-[#E8E2D9] rounded-3xl p-6 space-y-6 shadow-xs">
            {selectedCust ? (
              <div className="space-y-6">
                {/* Dossier Header */}
                <div className="flex justify-between items-start border-b border-[#E8E2D9] pb-5">
                  <div className="space-y-1">
                    <span className="font-mono text-[#ED5425] text-xs font-bold">{selectedCust.customerCode}</span>
                    <h2 className="font-serif font-bold text-2xl text-[#1E1E1E]">{selectedCust.firstName} {selectedCust.lastName}</h2>
                    <p className="text-xs text-[#666666]">📞 {selectedCust.phone} • 📧 {selectedCust.email || "No Email"} • 📍 {selectedCust.city}, {selectedCust.state}</p>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="px-3 py-1 bg-[#FFF2ED] text-[#ED5425] border border-[#ED5425]/20 rounded-full font-bold text-xs">
                      {selectedCust.tier} VIP MEMBER
                    </span>
                    <p className="text-xs text-[#666666] block">Branch: <strong className="text-[#1E1E1E]">{selectedCust.branch?.name || "Dadar Flagship"}</strong></p>
                  </div>
                </div>

                {/* Tab Navigation */}
                <div className="flex gap-2 border-b border-[#E8E2D9] pb-3 text-xs font-bold">
                  {["Purchases", "Appointments", "Quotations", "Repairs", "Timeline"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-xl transition-all ${
                        activeTab === tab ? "bg-[#ED5425] text-white shadow-xs" : "bg-[#FAF8F5] text-[#666666] hover:text-[#ED5425]"
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab Contents */}
                {activeTab === "Purchases" && (
                  <div className="space-y-3">
                    <h4 className="font-serif font-bold text-base text-[#1E1E1E]">Purchase History ({selectedCust.sales?.length || 0})</h4>
                    {selectedCust.sales?.length === 0 ? (
                      <p className="text-xs text-[#666666] py-6">No previous sales records for this customer.</p>
                    ) : (
                      selectedCust.sales?.map((s: any) => (
                        <div key={s.id} className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D9] text-xs space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-mono font-bold text-[#ED5425]">{s.invoiceNumber}</span>
                            <span className="text-[#1E1E1E] font-bold">Total: ₹{s.netAmount?.toLocaleString()}</span>
                          </div>
                          <p className="text-[#666666]">Invoice Date: {new Date(s.saleDate).toLocaleDateString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === "Appointments" && (
                  <div className="space-y-3">
                    <h4 className="font-serif font-bold text-base text-[#1E1E1E]">Showroom Consultations ({selectedCust.appointments?.length || 0})</h4>
                    {selectedCust.appointments?.length === 0 ? (
                      <p className="text-xs text-[#666666] py-6">No upcoming store appointments.</p>
                    ) : (
                      selectedCust.appointments?.map((a: any) => (
                        <div key={a.id} className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D9] text-xs space-y-1">
                          <div className="flex justify-between items-center">
                            <strong className="text-[#1E1E1E]">{a.branch?.name}</strong>
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded font-bold text-[10px]">{a.status}</span>
                          </div>
                          <p className="text-[#666666]">Scheduled: {new Date(a.appointmentDate).toLocaleString()}</p>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {activeTab === "Quotations" && (
                  <div className="space-y-3">
                    <h4 className="font-serif font-bold text-base text-[#1E1E1E]">Jewellery Quotations ({selectedCust.quotations?.length || 0})</h4>
                    <p className="text-xs text-[#666666] py-6">No active quotations found.</p>
                  </div>
                )}

                {activeTab === "Repairs" && (
                  <div className="space-y-3">
                    <h4 className="font-serif font-bold text-base text-[#1E1E1E]">Repairs & Polish Services ({selectedCust.repairs?.length || 0})</h4>
                    <p className="text-xs text-[#666666] py-6">No active repair orders found.</p>
                  </div>
                )}

                {activeTab === "Timeline" && (
                  <div className="space-y-3">
                    <h4 className="font-serif font-bold text-base text-[#1E1E1E]">Omnichannel Activity Timeline</h4>
                    <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D9] text-xs space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#ED5425]"></span>
                        <strong className="text-[#1E1E1E]">Customer Registered</strong>
                        <span className="text-[10px] text-[#666666]">{new Date(selectedCust.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-[#666666]">Joined Silver VIP Loyalty tier at WHPS Central Platform.</p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-[#666666] text-center py-20">Select a customer from the left directory to view full 360 dossier.</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}