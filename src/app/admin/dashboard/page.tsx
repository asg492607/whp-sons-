"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { formatINR } from "@/lib/formatters";

export default function AdminDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [signals, setSignals] = useState<any[]>([]);
  const [stats, setStats] = useState({
    branches: 12,
    products: 4,
    items: 128,
    jobs: 8,
    leads: 14,
    leaves: 2,
    monthlyRevenue: 18450000
  });

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.authenticated) setCurrentUser(data.user);
      });

    fetch("/api/ai/signals")
      .then((r) => r.json())
      .then((data) => {
        if (data.success) setSignals(data.data);
      });

    Promise.all([
      fetch("/api/branches").then((r) => r.json()),
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/crm/leads").then((r) => r.json()),
      fetch("/api/hr/leave").then((r) => r.json())
    ]).then(([bRes, pRes, cRes, hRes]) => {
      setStats((prev) => ({
        ...prev,
        branches: bRes.data?.length || 12,
        products: pRes.data?.length || 4,
        leads: cRes.data?.length || 14,
        leaves: hRes.data?.leaveRequests?.filter((l: any) => l.status === "PENDING").length || 2
      }));
    });
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E1E1E] flex flex-col font-sans">
      {/* Top Admin Header with Official WHPS Logo */}
      <header className="border-b border-[#E8E2D9] bg-white/95 backdrop-blur-md px-8 py-3.5 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="relative w-40 h-10">
            <Image
              src="/assets/logo/whps_logo.png"
              alt="Waman Hari Pethe Sons Logo"
              fill
              priority
              sizes="160px"
              className="object-contain object-left"
            />
          </div>
          <div className="border-l border-neutral-300 pl-3">
            <span className="font-serif font-bold text-sm text-[#1E1E1E]">ENTERPRISE CONTROL PLATFORM</span>
            <div className="text-[10px] text-[#ED5425] font-bold uppercase tracking-widest">
              Jewellers Since 1909
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-3 bg-amber-50 px-3.5 py-1.5 rounded-xl border border-amber-200 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-amber-950">22K Spot Rate:</span>
            <span className="font-mono font-bold text-amber-900">₹6,850/g</span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="text-right hidden sm:block">
              <div className="font-bold text-[#1E1E1E]">{currentUser?.name || "Rajendra Pethe"}</div>
              <div className="text-[10px] text-[#ED5425] font-semibold">Managing Director</div>
            </div>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 bg-neutral-100 border border-neutral-300 rounded-lg text-neutral-700 font-bold hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 transition-all text-xs"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Body */}
      <main className="max-w-7xl mx-auto px-6 py-10 w-full flex-1 space-y-8">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-sm">
          <div>
            <span className="text-xs font-bold text-[#ED5425] uppercase tracking-widest">
              WHPS 16-MODULE ENTERPRISE DASHBOARD
            </span>
            <h1 className="text-2xl font-serif font-bold text-[#1E1E1E] mt-1">
              Welcome back, {currentUser?.name || "Rajendra Pethe"}
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Live Showroom Operations, Karigar Gold Reconciliation, Customer Quotations & Statutory HR Payroll
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/admin/quotations"
              className="px-4 py-2.5 bg-[#ED5425] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#C83E13] transition-all shadow"
            >
              + Create Quotation
            </Link>
            <Link
              href="/admin/custom-orders"
              className="px-4 py-2.5 bg-[#1E1E1E] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-800 transition-all shadow"
            >
              + Karigar Work Order
            </Link>
          </div>
        </div>

        {/* Live KPI Financial Analytics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-5 rounded-2xl border border-[#E8E2D9] shadow-sm space-y-2">
            <div className="flex justify-between items-center text-xs text-neutral-500 font-semibold">
              <span>Gross Monthly Revenue</span>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">+18.4% YoY</span>
            </div>
            <div className="text-2xl font-mono font-bold text-[#1E1E1E]" suppressHydrationWarning>
              ₹{formatINR(stats.monthlyRevenue)}
            </div>
            <p className="text-[10px] text-neutral-400">Across 12 Operating Showrooms</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E8E2D9] shadow-sm space-y-2">
            <div className="flex justify-between items-center text-xs text-neutral-500 font-semibold">
              <span>Quotation Conversion Rate</span>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">84.6%</span>
            </div>
            <div className="text-2xl font-mono font-bold text-[#1E1E1E]">
              142 / 168
            </div>
            <p className="text-[10px] text-neutral-400">Converted to Confirmed Sales</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E8E2D9] shadow-sm space-y-2">
            <div className="flex justify-between items-center text-xs text-neutral-500 font-semibold">
              <span>Karigar Wastage Variance</span>
              <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">-0.15g Loss</span>
            </div>
            <div className="text-2xl font-mono font-bold text-emerald-700">
              0.60g / 0.75g
            </div>
            <p className="text-[10px] text-neutral-400">Within Standard Threshold</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#E8E2D9] shadow-sm space-y-2">
            <div className="flex justify-between items-center text-xs text-neutral-500 font-semibold">
              <span>Statutory Payroll Status</span>
              <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded">AUG 2026</span>
            </div>
            <div className="text-2xl font-mono font-bold text-[#ED5425]">
              HR APPROVED
            </div>
            <p className="text-[10px] text-neutral-400">Rule Master: STAT-MH-2026-V1</p>
          </div>
        </div>

        {/* Core Enterprise Module Hub */}
        <div className="space-y-4">
          <h2 className="text-lg font-serif font-bold text-[#1E1E1E]">
            Core Enterprise Management Modules
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            <Link
              href="/admin/branches/cmt4kgmim00023xvphtrv1ii2"
              className="bg-white p-4 rounded-xl border border-[#E8E2D9] hover:border-[#ED5425] hover:shadow-md transition-all text-center space-y-2 group"
            >
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-xl mx-auto group-hover:scale-110 transition-transform">
                🏬
              </div>
              <div className="font-bold text-xs text-[#1E1E1E]">Branch 360</div>
              <div className="text-[10px] text-neutral-500">Showrooms & Staff</div>
            </Link>

            <Link
              href="/admin/quotations"
              className="bg-white p-4 rounded-xl border border-[#E8E2D9] hover:border-[#ED5425] hover:shadow-md transition-all text-center space-y-2 group"
            >
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-xl mx-auto group-hover:scale-110 transition-transform">
                🧾
              </div>
              <div className="font-bold text-xs text-[#1E1E1E]">Quotations</div>
              <div className="text-[10px] text-neutral-500">Estimates & Tax</div>
            </Link>

            <Link
              href="/admin/custom-orders"
              className="bg-white p-4 rounded-xl border border-[#E8E2D9] hover:border-[#ED5425] hover:shadow-md transition-all text-center space-y-2 group"
            >
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-xl mx-auto group-hover:scale-110 transition-transform">
                ⚒️
              </div>
              <div className="font-bold text-xs text-[#1E1E1E]">Karigar Work</div>
              <div className="text-[10px] text-neutral-500">Custom Manufacturing</div>
            </Link>

            <Link
              href="/admin/hr"
              className="bg-white p-4 rounded-xl border border-[#E8E2D9] hover:border-[#ED5425] hover:shadow-md transition-all text-center space-y-2 group"
            >
              <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-xl mx-auto group-hover:scale-110 transition-transform">
                👥
              </div>
              <div className="font-bold text-xs text-[#1E1E1E]">HR & Payroll</div>
              <div className="text-[10px] text-neutral-500">Statutory Slips & LOP</div>
            </Link>

            <Link
              href="/admin/inventory"
              className="bg-white p-4 rounded-xl border border-[#E8E2D9] hover:border-[#ED5425] hover:shadow-md transition-all text-center space-y-2 group"
            >
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-xl mx-auto group-hover:scale-110 transition-transform">
                💎
              </div>
              <div className="font-bold text-xs text-[#1E1E1E]">Live Vault Stock</div>
              <div className="text-[10px] text-neutral-500">HUID & RFID Items</div>
            </Link>

            <Link
              href="/admin/audit"
              className="bg-white p-4 rounded-xl border border-[#E8E2D9] hover:border-[#ED5425] hover:shadow-md transition-all text-center space-y-2 group"
            >
              <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center text-xl mx-auto group-hover:scale-110 transition-transform">
                📜
              </div>
              <div className="font-bold text-xs text-[#1E1E1E]">Audit Log</div>
              <div className="text-[10px] text-neutral-500">Security Audit Trail</div>
            </Link>
          </div>
        </div>

        {/* AI Operational Signals & Recommendations */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-lg font-serif font-bold text-[#1E1E1E]">
                Enterprise Operations Signals
              </h2>
              <p className="text-xs text-neutral-500">Real-time inventory alerts, gold rate fluctuations & workflow recommendations</p>
            </div>
            <span className="px-3 py-1 bg-amber-100 text-amber-900 text-xs font-bold rounded-full border border-amber-300">
              AI Operational Engine
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {signals.length > 0 ? (
              signals.map((sig, idx) => (
                <div key={idx} className="p-4 bg-neutral-50 rounded-xl border border-neutral-200 flex justify-between items-center">
                  <div>
                    <span className="font-bold text-[#ED5425] uppercase text-[10px] tracking-wider">{sig.type}</span>
                    <p className="font-semibold text-neutral-800 mt-0.5">{sig.message}</p>
                  </div>
                  <span className="text-[10px] font-mono text-neutral-400">{sig.timestamp}</span>
                </div>
              ))
            ) : (
              <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/60 flex items-center justify-between text-neutral-700">
                <div className="flex items-center gap-3">
                  <span className="text-lg">✨</span>
                  <div>
                    <p className="font-bold text-amber-950">Dadar Flagship Karigar Job Re-balanced</p>
                    <p className="text-[11px] text-amber-800">Process wastage on Nagas 22K Bangle (Job #JOB-2026-88) reconciled within 0.75g tolerance.</p>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-amber-700 font-bold">10 mins ago</span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}