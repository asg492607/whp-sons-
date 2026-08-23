"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

interface Branch360Data {
  id: string;
  name: string;
  code: string;
  type: string;
  city: string;
  gstNumber: string;
  targetMonthlyRevenue: number;
  employees: Array<{
    id: string;
    employeeCode: string;
    department?: { name: string };
    designation?: { name: string };
    user?: { name: string; email: string };
    attendance?: Array<{ status: string; date: string }>;
  }>;
  inventoryLocations: Array<{
    id: string;
    name: string;
    type: string;
    currentCount: number;
    items: Array<{
      id: string;
      itemCode: string;
      huid: string;
      purity: string;
      grossWeightGm: number;
      tagPrice: number;
      status: string;
      product?: { name: string };
    }>;
  }>;
  leads: Array<{ id: string; leadNo: string; name: string; phone: string; status: string; estimatedBudget: number }>;
  sales: Array<{ id: string; saleNo: string; totalAmount: number; paymentStatus: string; saleDate: string; customer?: { name: string } }>;
}

export default function Branch360Page({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [data, setData] = useState<Branch360Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "roster" | "vault" | "sales" | "crm">("overview");

  useEffect(() => {
    fetch(`/api/branches/${resolvedParams.id}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [resolvedParams.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] p-8 flex items-center justify-center">
        <div className="text-[#1E1E1E] font-medium animate-pulse">Loading Branch 360 Operational Dossier...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] p-8">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-[#E8E2D9] text-center">
          <h2 className="text-xl font-bold text-[#1E1E1E]">Branch Record Not Found</h2>
          <p className="text-sm text-neutral-500 mt-2">The requested showroom identifier could not be retrieved.</p>
          <Link href="/admin/dashboard" className="mt-4 inline-block px-4 py-2 bg-[#ED5425] text-white rounded-lg text-sm font-semibold">
            Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const totalSales = data.sales.reduce((sum, s) => sum + s.totalAmount, 0);
  const targetRevenue = data.targetMonthlyRevenue || 5000000;
  const targetProgress = Math.min(100, Math.round((totalSales / targetRevenue) * 100));

  return (
    <div className="min-h-screen bg-[#FAF8F5] p-8 text-[#1E1E1E]">
      {/* Top Header & Branding */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-[#ED5425]/10 text-[#ED5425] rounded text-xs font-bold uppercase tracking-wider">
              {data.type} SHOWROOM
            </span>
            <span className="text-xs text-neutral-400 font-mono">CODE: {data.code}</span>
          </div>
          <h1 className="text-3xl font-serif font-bold mt-1 text-[#1E1E1E] flex items-center gap-3">
            {data.name}
            <span className="text-sm font-sans font-normal text-neutral-500">({data.city})</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-1 font-mono">GSTIN: {data.gstNumber || "27AAACW1234F1Z5"}</p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/inventory" className="px-4 py-2 border border-[#E8E2D9] bg-white rounded-lg text-xs font-semibold hover:bg-neutral-50">
            Showroom Vault Inspector
          </Link>
          <Link href="/admin/dashboard" className="px-4 py-2 bg-[#ED5425] text-white rounded-lg text-xs font-semibold hover:bg-[#C83E13]">
            Back to Dashboard
          </Link>
        </div>
      </div>

      {/* Target Monthly Revenue KPI Card */}
      <div className="bg-white p-6 rounded-xl border border-[#E8E2D9] shadow-sm mb-8">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h3 className="text-xs font-bold text-neutral-400 uppercase tracking-wider">Target Monthly Revenue</h3>
            <div className="text-2xl font-bold font-serif text-[#1E1E1E] mt-0.5">
              ₹{totalSales.toLocaleString()} <span className="text-xs font-sans text-neutral-400 font-normal">/ ₹{targetRevenue.toLocaleString()} Target</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-2xl font-bold text-[#ED5425]">{targetProgress}%</span>
            <div className="text-xs text-neutral-400">Target Attained</div>
          </div>
        </div>
        <div className="w-full bg-neutral-100 rounded-full h-3 overflow-hidden">
          <div className="bg-[#ED5425] h-3 rounded-full transition-all duration-500" style={{ width: `${targetProgress}%` }}></div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-[#E8E2D9] mb-6 gap-6">
        {[
          { key: "overview", label: "Operational Summary" },
          { key: "roster", label: `Staff Roster (${data.employees.length})` },
          { key: "vault", label: "Showroom Vault & Showcase" },
          { key: "sales", label: `Sales Records (${data.sales.length})` },
          { key: "crm", label: `Lead Funnel (${data.leads.length})` }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`pb-3 text-sm font-semibold border-b-2 transition-colors ${
              activeTab === tab.key ? "border-[#ED5425] text-[#ED5425]" : "border-transparent text-neutral-500 hover:text-neutral-800"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-[#E8E2D9] shadow-sm">
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">Active Staff On Duty</h4>
            <div className="space-y-3">
              {data.employees.slice(0, 4).map((emp) => (
                <div key={emp.id} className="flex justify-between items-center border-b border-neutral-100 pb-2.5">
                  <div>
                    <div className="text-sm font-semibold text-[#1E1E1E]">{emp.user?.name || emp.employeeCode}</div>
                    <div className="text-xs text-neutral-400">{emp.designation?.name || "Store Executive"}</div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded">ON DUTY</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E8E2D9] shadow-sm">
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">Vault Locations</h4>
            <div className="space-y-3">
              {data.inventoryLocations.map((loc) => (
                <div key={loc.id} className="flex justify-between items-center border-b border-neutral-100 pb-2.5">
                  <div>
                    <div className="text-sm font-semibold text-[#1E1E1E]">{loc.name}</div>
                    <div className="text-xs text-neutral-400 font-mono">{loc.type}</div>
                  </div>
                  <span className="text-sm font-bold text-[#ED5425]">{loc.currentCount} Items</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl border border-[#E8E2D9] shadow-sm">
            <h4 className="text-xs font-bold text-neutral-400 uppercase tracking-wider mb-4">CRM Lead Pipeline</h4>
            <div className="space-y-3">
              {data.leads.slice(0, 4).map((lead) => (
                <div key={lead.id} className="flex justify-between items-center border-b border-neutral-100 pb-2.5">
                  <div>
                    <div className="text-sm font-semibold text-[#1E1E1E]">{lead.name}</div>
                    <div className="text-xs text-neutral-400">{lead.phone}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-[#1E1E1E]">₹{lead.estimatedBudget.toLocaleString()}</div>
                    <span className="text-[10px] text-amber-700 font-semibold uppercase">{lead.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Roster */}
      {activeTab === "roster" && (
        <div className="bg-white rounded-xl border border-[#E8E2D9] shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF8F5] border-b border-[#E8E2D9] text-xs font-bold uppercase text-neutral-500">
              <tr>
                <th className="p-4">Employee Code</th>
                <th className="p-4">Name & Email</th>
                <th className="p-4">Department</th>
                <th className="p-4">Designation</th>
                <th className="p-4">Attendance Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {data.employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-neutral-50">
                  <td className="p-4 font-mono text-xs font-bold">{emp.employeeCode}</td>
                  <td className="p-4 font-semibold text-[#1E1E1E]">
                    {emp.user?.name || "Showroom Executive"}
                    <div className="text-xs text-neutral-400 font-normal">{emp.user?.email}</div>
                  </td>
                  <td className="p-4 text-xs">{emp.department?.name || "Retail Operations"}</td>
                  <td className="p-4 text-xs font-medium">{emp.designation?.name || "Senior Sales Consultant"}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full">PRESENT</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Vault */}
      {activeTab === "vault" && (
        <div className="space-y-6">
          {data.inventoryLocations.map((loc) => (
            <div key={loc.id} className="bg-white rounded-xl border border-[#E8E2D9] shadow-sm overflow-hidden">
              <div className="p-4 bg-[#FAF8F5] border-b border-[#E8E2D9] flex justify-between items-center">
                <h3 className="text-sm font-bold text-[#1E1E1E] uppercase tracking-wider">{loc.name} ({loc.type})</h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 bg-[#ED5425]/10 text-[#ED5425] rounded">{loc.currentCount} Stocked Items</span>
              </div>
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 text-xs font-semibold uppercase text-neutral-500 border-b border-neutral-200">
                  <tr>
                    <th className="p-3">Item Code</th>
                    <th className="p-3">HUID</th>
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Purity</th>
                    <th className="p-3">Gross Wt</th>
                    <th className="p-3">Tag Price</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {loc.items.map((item) => (
                    <tr key={item.id} className="hover:bg-neutral-50">
                      <td className="p-3 font-mono text-xs font-bold text-[#1E1E1E]">{item.itemCode}</td>
                      <td className="p-3 font-mono text-xs text-neutral-500">{item.huid || "MH-HUID-PENDING"}</td>
                      <td className="p-3 font-medium">{item.product?.name || "Gold Jewellery"}</td>
                      <td className="p-3 text-xs">{item.purity}</td>
                      <td className="p-3 text-xs font-mono">{item.grossWeightGm}g</td>
                      <td className="p-3 text-xs font-bold text-[#1E1E1E]">₹{(item.tagPrice || 0).toLocaleString()}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                          item.status === "IN_STOCK" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                        }`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Sales */}
      {activeTab === "sales" && (
        <div className="bg-white rounded-xl border border-[#E8E2D9] shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF8F5] border-b border-[#E8E2D9] text-xs font-bold uppercase text-neutral-500">
              <tr>
                <th className="p-4">Sale Invoice No</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Total Amount</th>
                <th className="p-4">Payment Status</th>
                <th className="p-4">Sale Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {data.sales.map((sale) => (
                <tr key={sale.id} className="hover:bg-neutral-50">
                  <td className="p-4 font-mono text-xs font-bold text-[#1E1E1E]">{sale.saleNo}</td>
                  <td className="p-4 font-medium">{sale.customer?.name || "Walk-in Customer"}</td>
                  <td className="p-4 font-bold text-[#1E1E1E]">₹{sale.totalAmount.toLocaleString()}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full uppercase">{sale.paymentStatus}</span>
                  </td>
                  <td className="p-4 text-xs text-neutral-500 font-mono">{new Date(sale.saleDate).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 5: CRM Leads */}
      {activeTab === "crm" && (
        <div className="bg-white rounded-xl border border-[#E8E2D9] shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#FAF8F5] border-b border-[#E8E2D9] text-xs font-bold uppercase text-neutral-500">
              <tr>
                <th className="p-4">Lead Number</th>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Phone Number</th>
                <th className="p-4">Estimated Budget</th>
                <th className="p-4">Funnel Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {data.leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-neutral-50">
                  <td className="p-4 font-mono text-xs font-bold text-[#1E1E1E]">{lead.leadNo}</td>
                  <td className="p-4 font-semibold text-[#1E1E1E]">{lead.name}</td>
                  <td className="p-4 text-xs text-neutral-500 font-mono">{lead.phone}</td>
                  <td className="p-4 font-bold text-[#1E1E1E]">₹{lead.estimatedBudget.toLocaleString()}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full uppercase">{lead.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}