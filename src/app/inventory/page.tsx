"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminInventoryPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionResult, setActionResult] = useState<any>(null);

  // Form State
  const [targetBranchId, setTargetBranchId] = useState("");
  const [targetCustId, setTargetCustId] = useState("");
  const [actionNote, setActionNote] = useState("");

  const loadInventory = () => {
    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/branches").then((r) => r.json()),
      fetch("/api/customers").then((r) => r.json())
    ]).then(([prodRes, branchRes, custRes]) => {
      if (prodRes.success) setProducts(prodRes.data);
      if (branchRes.success) {
        setBranches(branchRes.data);
        if (branchRes.data.length > 1) setTargetBranchId(branchRes.data[1].id);
      }
      if (custRes.success) {
        setCustomers(custRes.data);
        if (custRes.data.length > 0) setTargetCustId(custRes.data[0].id);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    loadInventory();
  }, []);

  const allItems = products.flatMap((p) =>
    (p.items || []).map((item: any) => ({ ...item, product: p }))
  );

  const filteredItems = allItems.filter(
    (item) =>
      item.itemCode?.toLowerCase().includes(search.toLowerCase()) ||
      item.huid?.toLowerCase().includes(search.toLowerCase()) ||
      item.product?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleItemAction = async (itemId: string, action: string) => {
    setActionLoading(true);
    setActionResult(null);

    const res = await fetch(`/api/inventory/items/${itemId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        note: actionNote,
        toBranchId: targetBranchId,
        customerId: targetCustId
      })
    });
    const result = await res.json();
    setActionLoading(false);

    if (result.success) {
      setSelectedItem(result.data);
      setActionResult(result.record);
      alert(`Atomic transaction ${action} successfully executed & saved to database!`);
      loadInventory();
    } else {
      alert(`Failed: ${result.error}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E1E1E] flex flex-col font-sans">
      <header className="border-b border-[#E8E2D9] bg-white px-8 py-3.5 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="वामन हरी पेठे सन्स" className="h-10 w-auto object-contain rounded border border-[#E8E2D9]" />
          <div>
            <h1 className="font-bold text-[#1E1E1E] text-sm font-serif">M05 — HUID Inventory & Atomic Stock Control</h1>
            <p className="text-[10px] text-[#666666] font-mono">Atomic $transaction • Real DB Entities (Sale, Invoice, Transfer, RepairTicket, Reservation)</p>
          </div>
        </div>
        <Link href="/admin/dashboard" className="text-xs font-bold text-[#ED5425] hover:underline">
          Back to Control Center
        </Link>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 w-full flex-1 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-[#E8E2D9] p-5 rounded-2xl shadow-xs">
          <div>
            <h2 className="font-serif font-bold text-xl text-[#1E1E1E]">HUID Jewellery Item Search</h2>
            <p className="text-xs text-[#666666]">Inspect weight, purity, branch location, and issue atomic transactions</p>
          </div>

          <div className="w-full sm:w-80">
            <input
              type="text"
              placeholder="Search by HUID (e.g. HUID-MH-984321) or SKU..."
              className="w-full bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl px-4 py-2 text-xs outline-none focus:border-[#ED5425]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Item List */}
          <div className="lg:col-span-2 space-y-4">
            {loading ? (
              <p className="text-xs text-[#666666] text-center py-20">Loading database inventory...</p>
            ) : filteredItems.length === 0 ? (
              <p className="text-xs text-[#666666] text-center py-20">No matching jewellery items found.</p>
            ) : (
              filteredItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => { setSelectedItem(item); setActionResult(null); }}
                  className={`p-5 rounded-2xl bg-white border cursor-pointer transition-all shadow-xs flex justify-between items-center gap-4 ${
                    selectedItem?.id === item.id ? "border-[#ED5425] ring-2 ring-[#ED5425]/20" : "border-[#E8E2D9] hover:border-[#ED5425]"
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[#ED5425] font-bold text-xs">{item.itemCode}</span>
                      <span className="px-2 py-0.5 bg-[#FFF2ED] text-[#ED5425] border border-[#ED5425]/20 rounded font-mono text-[10px] font-bold">
                        {item.huid}
                      </span>
                      <span className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                        item.status === "IN_STOCK" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                        item.status === "RESERVED" ? "bg-amber-50 text-amber-700 border border-amber-200" :
                        item.status === "UNDER_REPAIR" ? "bg-sky-50 text-sky-700 border border-sky-200" : "bg-purple-50 text-purple-700 border border-purple-200"
                      }`}>
                        {item.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-base text-[#1E1E1E] font-serif">{item.product?.name}</h4>
                    <p className="text-xs text-[#666666]">
                      Branch: <strong className="text-[#1E1E1E]">{item.branch?.name || "Dadar Flagship"}</strong> • Wt: <strong className="text-[#1E1E1E]">{item.grossWeightGm}g</strong> • Price: <strong className="text-[#ED5425]">₹{item.tagPrice?.toLocaleString()}</strong>
                    </p>
                  </div>

                  <button className="px-3.5 py-1.5 bg-[#FFF2ED] text-[#ED5425] font-bold text-xs rounded-xl hover:bg-[#ED5425] hover:text-white transition-colors">
                    Inspect Item →
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Detailed HUID Inspector Side Card */}
          <div className="bg-white border border-[#E8E2D9] rounded-3xl p-6 space-y-6 shadow-xs h-fit sticky top-24">
            {selectedItem ? (
              <div className="space-y-5 text-xs">
                <div className="flex justify-between items-start border-b border-[#E8E2D9] pb-4">
                  <div>
                    <span className="font-mono text-[#ED5425] text-xs font-bold block">{selectedItem.itemCode}</span>
                    <h3 className="font-serif font-bold text-xl text-[#1E1E1E]">{selectedItem.product?.name}</h3>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-mono text-[10px] font-bold border border-emerald-200 rounded">
                    BIS 916 CERTIFIED
                  </span>
                </div>

                <div className="space-y-1.5 text-[#666666]">
                  <p>HUID Registration: <strong className="text-[#ED5425] font-mono font-bold">{selectedItem.huid}</strong></p>
                  <p>Current Branch: <strong className="text-[#1E1E1E]">{selectedItem.branch?.name || "Dadar Flagship"}</strong></p>
                  <p>Location Room: <strong className="text-[#1E1E1E]">{selectedItem.location?.name || "Main Vault"}</strong></p>
                  <p>Gross Weight: <strong className="text-[#1E1E1E]">{selectedItem.grossWeightGm}g</strong></p>
                  <p>Tag Price: <strong className="text-[#ED5425] font-bold">₹{selectedItem.tagPrice?.toLocaleString()}</strong></p>
                  <p>Current Status: <strong className="text-[#ED5425] uppercase font-bold">{selectedItem.status}</strong></p>
                </div>

                {/* Form Selections */}
                <div className="space-y-3 pt-3 border-t border-[#E8E2D9]">
                  <div>
                    <label className="block text-[#666666] font-bold mb-1">Target Customer (For Sale/Repair/Reservation)</label>
                    <select
                      className="w-full bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl px-3 py-2 text-[#1E1E1E] outline-none"
                      value={targetCustId}
                      onChange={(e) => setTargetCustId(e.target.value)}
                    >
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>{c.name || `${c.firstName} ${c.lastName}`} ({c.phone})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#666666] font-bold mb-1">Destination Branch (For Stock Transfer)</label>
                    <select
                      className="w-full bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl px-3 py-2 text-[#1E1E1E] outline-none"
                      value={targetBranchId}
                      onChange={(e) => setTargetBranchId(e.target.value)}
                    >
                      {branches.map((b) => (
                        <option key={b.id} value={b.id}>{b.name} ({b.city})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#666666] font-bold mb-1">Transaction Note</label>
                    <input
                      type="text"
                      className="w-full bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl px-3 py-2 text-[#1E1E1E] outline-none placeholder:text-gray-400"
                      placeholder="Note for audit trail..."
                      value={actionNote}
                      onChange={(e) => setActionNote(e.target.value)}
                    />
                  </div>
                </div>

                {/* Action Dispatcher Buttons */}
                <div className="space-y-2 pt-2">
                  <p className="font-bold text-[#1E1E1E]">Trigger Atomic Database Transaction:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      disabled={actionLoading}
                      onClick={() => handleItemAction(selectedItem.id, "RESERVE")}
                      className="px-3 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl transition-all shadow-xs"
                    >
                      Create Reservation
                    </button>
                    <button
                      disabled={actionLoading}
                      onClick={() => handleItemAction(selectedItem.id, "TRANSFER")}
                      className="px-3 py-2 bg-[#ED5425] hover:bg-[#C83E13] text-white font-bold rounded-xl transition-all shadow-xs"
                    >
                      Dispatch Transfer
                    </button>
                    <button
                      disabled={actionLoading}
                      onClick={() => handleItemAction(selectedItem.id, "REPAIR")}
                      className="px-3 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl transition-all shadow-xs"
                    >
                      Issue Repair Ticket
                    </button>
                    <button
                      disabled={actionLoading}
                      onClick={() => handleItemAction(selectedItem.id, "SELL")}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-xs"
                    >
                      Execute Full Sale
                    </button>
                  </div>
                </div>

                {/* Atomic Transaction Result Card */}
                {actionResult && (
                  <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1 text-[11px] animate-fadeIn">
                    <p className="font-bold text-emerald-800">✅ Atomic $transaction Saved to SQLite DB!</p>
                    {actionResult.saleNo && <p>Invoice Created: <strong className="font-mono text-emerald-950">{actionResult.saleNo}</strong> (Total: ₹{actionResult.totalAmount?.toLocaleString()})</p>}
                    {actionResult.transferNo && <p>Transfer No: <strong className="font-mono text-emerald-950">{actionResult.transferNo}</strong> (Dispatched to Branch)</p>}
                    {actionResult.ticketNo && <p>Repair Ticket: <strong className="font-mono text-emerald-950">{actionResult.ticketNo}</strong> (Status: IN_PROGRESS)</p>}
                    {actionResult.expiresAt && <p>Reservation Expiry: <strong className="font-mono text-emerald-950">{new Date(actionResult.expiresAt).toLocaleDateString()}</strong></p>}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-16 text-[#666666] text-xs">
                <span className="text-3xl block mb-2">💎</span>
                Click any jewellery item on the left to inspect HUID hallmarking details and trigger atomic database transactions.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}