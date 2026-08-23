"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminCRMPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadLeads = () => {
    fetch("/api/crm/leads")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setLeads(data.data);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const handleStatus = async (leadId: string, status: string) => {
    const res = await fetch("/api/crm/leads", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ leadId, status })
    });
    const result = await res.json();
    if (result.success) {
      alert(`Lead status updated to ${status}!`);
      loadLeads();
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E1E1E] flex flex-col font-sans">
      <header className="border-b border-[#E8E2D9] bg-white px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="w-8 h-8 rounded-lg bg-[#ED5425] flex items-center justify-center font-bold text-white">W</Link>
          <div>
            <h1 className="font-bold text-[#1E1E1E] text-sm font-serif">Module 03/06: Customer 360 & Lead CRM</h1>
            <p className="text-[10px] text-[#666666] font-mono">Walk-in, Website & WhatsApp Lead Routing</p>
          </div>
        </div>
        <Link href="/admin/dashboard" className="text-xs text-[#666666] hover:text-[#ED5425]">Back to Admin</Link>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 w-full flex-1 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold font-serif text-[#1E1E1E]">Customer Leads ({leads.length})</h2>
          <span className="text-xs text-[#666666]">Shared Central Database</span>
        </div>

        {loading ? (
          <p className="text-[#666666] text-xs text-center py-20">Loading customer leads...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {leads.map((l) => (
              <div key={l.id} className="bg-white border border-[#E8E2D9] rounded-2xl p-5 space-y-3 text-xs shadow-xs">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-sm text-[#1E1E1E] font-serif">{l.name}</h3>
                  <span className="px-2 py-0.5 bg-[#FFF2ED] text-[#ED5425] border border-amber-500/20 rounded font-semibold text-[10px]">
                    {l.status}
                  </span>
                </div>

                <div className="space-y-1 text-[#666666]">
                  <p>📞 Phone: <strong className="text-[#1E1E1E]">{l.phone}</strong></p>
                  <p>🏛 Branch: <strong className="text-[#1E1E1E]">{l.branch?.name}</strong></p>
                  <p>🌐 Source: <strong className="text-[#1E1E1E]">{l.source}</strong></p>
                  {l.budgetMax && <p>💰 Budget Range: <strong className="text-[#ED5425]">₹{l.budgetMin?.toLocaleString()} - ₹{l.budgetMax?.toLocaleString()}</strong></p>}
                </div>

                <div className="pt-3 border-t border-[#E8E2D9] flex items-center gap-2">
                  <button
                    onClick={() => handleStatus(l.id, "INTERESTED")}
                    className="px-3 py-1.5 bg-[#ED5425] text-white font-bold rounded-lg hover:bg-[#ED5425]"
                  >
                    Mark Interested
                  </button>
                  <button
                    onClick={() => handleStatus(l.id, "CONVERTED")}
                    className="px-3 py-1.5 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700"
                  >
                    Convert Sale
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}