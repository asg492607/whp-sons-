"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface WorkOrder {
  id: string;
  ticketNo: string;
  description: string;
  estimatedCost: number;
  status: string;
  createdAt: string;
  customer?: { name: string; phone: string };
  item?: { itemCode: string; purity: string; grossWeightGm: number };
}

export default function KarigarCustomOrdersPage() {
  const [orders, setOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [description, setDescription] = useState("");
  const [estimatedCost, setEstimatedCost] = useState("25000");

  const fetchOrders = () => {
    fetch("/api/custom-orders")
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setOrders(json.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCreateWorkOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/custom-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, estimatedCost })
      });
      const json = await res.json();
      if (json.success) {
        setShowModal(false);
        setDescription("");
        fetchOrders();
      }
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] p-8 text-[#1E1E1E]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="px-2.5 py-1 bg-[#ED5425]/10 text-[#ED5425] rounded text-xs font-bold uppercase tracking-wider">
            MANUFACTURING & CRAFTSMANSHIP
          </span>
          <h1 className="text-3xl font-serif font-bold mt-1 text-[#1E1E1E]">
            Karigar Work Orders & Custom Jewellery
          </h1>
          <p className="text-xs text-neutral-500 mt-1 font-mono">
            Tracks casting, stone setting, hallmarking, and master artisan assignments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-[#ED5425] text-white rounded-lg text-xs font-semibold hover:bg-[#C83E13]"
          >
            + New Karigar Work Order
          </button>
          <Link href="/admin/dashboard" className="px-4 py-2 border border-[#E8E2D9] bg-white rounded-lg text-xs font-semibold hover:bg-neutral-50">
            Back to Dashboard
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="text-[#1E1E1E] animate-pulse text-center p-12">Loading Karigar Work Orders...</div>
      ) : (
        <div className="bg-white rounded-xl border border-[#E8E2D9] shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF8F5] border-b border-[#E8E2D9] text-xs font-bold uppercase text-neutral-500">
              <tr>
                <th className="p-4">Work Order No</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Craftsmanship Details</th>
                <th className="p-4">Estimated Cost</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date Issued</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {orders.map((ord) => (
                <tr key={ord.id} className="hover:bg-neutral-50">
                  <td className="p-4 font-mono text-xs font-bold text-[#1E1E1E]">{ord.ticketNo}</td>
                  <td className="p-4 font-semibold text-[#1E1E1E]">
                    {ord.customer?.name || "Bespoke Client"}
                    <div className="text-xs text-neutral-400 font-normal">{ord.customer?.phone}</div>
                  </td>
                  <td className="p-4 text-xs font-medium text-neutral-700 max-w-xs">{ord.description}</td>
                  <td className="p-4 font-bold text-[#1E1E1E]">₹{(ord.estimatedCost || 0).toLocaleString()}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full uppercase">
                      {ord.status}
                    </span>
                  </td>
                  <td className="p-4 text-xs text-neutral-500 font-mono">{new Date(ord.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* New Work Order Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-[#E8E2D9]">
            <h3 className="text-lg font-serif font-bold text-[#1E1E1E] mb-4">Create Master Karigar Work Order</h3>
            <form onSubmit={handleCreateWorkOrder} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-neutral-500 block mb-1">Craftsmanship Specification</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="e.g. 22K Traditional Kolhapuri Saaj with Ruby & Antique Nagas Carving"
                  className="w-full p-2.5 text-xs border border-[#E8E2D9] rounded-lg focus:outline-none focus:border-[#ED5425]"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-neutral-500 block mb-1">Estimated Crafting Cost (₹)</label>
                <input
                  type="number"
                  required
                  value={estimatedCost}
                  onChange={(e) => setEstimatedCost(e.target.value)}
                  className="w-full p-2.5 text-xs border border-[#E8E2D9] rounded-lg focus:outline-none focus:border-[#ED5425]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-[#E8E2D9] text-xs font-semibold rounded-lg hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#ED5425] text-white text-xs font-semibold rounded-lg hover:bg-[#C83E13]"
                >
                  Issue Work Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}