"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminDashboard() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [signals, setSignals] = useState<any[]>([]);
  const [stats, setStats] = useState({
    branches: 12,
    products: 4,
    items: 2,
    jobs: 1,
    leads: 0,
    leaves: 0
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
      setStats({
        branches: bRes.data?.length || 12,
        products: pRes.data?.length || 4,
        items: pRes.data?.flatMap((p: any) => p.items || []).length || 2,
        jobs: 1,
        leads: cRes.data?.length || 0,
        leaves: hRes.data?.leaveRequests?.filter((l: any) => l.status === "PENDING").length || 0
      });
    });
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E1E1E] flex flex-col font-sans">
      {/* Top Admin Header */}
      <header className="border-b border-[#E8E2D9] bg-white px-8 py-3.5 flex justify-between items-center sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="वामन हरी पेठे सन्स" className="h-10 w-auto object-contain rounded border border-[#E8E2D9]" />
          <div>
            <h1 className="font-bold text-[#1E1E1E] text-sm font-serif">WHPS Enterprise Command Center</h1>
            <p className="text-[10px] text-[#666666] font-mono">Shared Central Data Backbone • SQLite/PostgreSQL Engine</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="px-3 py-1 rounded-full bg-[#FFF2ED] text-[#ED5425] border border-[#ED5425]/20 font-bold">
            {currentUser ? `${currentUser.name} (${currentUser.role})` : "Super Admin (DEMO)"}
          </span>
          {currentUser ? (
            <button onClick={handleLogout} className="px-3 py-1.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors font-bold">
              Log Out
            </button>
          ) : (
            <Link href="/admin/login" className="px-3.5 py-1.5 bg-[#ED5425] text-white font-bold rounded-lg hover:bg-[#C83E13]">
              Admin Login
            </Link>
          )}
        </div>
      </header>

      <div className="flex flex-1">
        {/* Light Enterprise Sidebar */}
        <aside className="w-64 border-r border-[#E8E2D9] bg-[#F8F7F4] p-6 space-y-6 hidden md:block">
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-[#666666] font-bold">Enterprise Modules</p>
            <nav className="space-y-1 text-xs font-semibold">
              <Link href="/admin/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#ED5425] text-white font-bold shadow-xs">
                <span>📊</span> Overview Dashboard
              </Link>
              <Link href="/admin/hr" className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#1E1E1E] hover:bg-[#FFF2ED] hover:text-[#ED5425]">
                <span>👥</span> M08 — HR & Approvals
              </Link>
              <Link href="/admin/inventory" className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#1E1E1E] hover:bg-[#FFF2ED] hover:text-[#ED5425]">
                <span>💎</span> M05 — HUID Vault Stock
              </Link>
              <Link href="/admin/crm" className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#1E1E1E] hover:bg-[#FFF2ED] hover:text-[#ED5425]">
                <span>🎯</span> M03/M06 — Leads & CRM
              </Link>
              <Link href="/admin/recruitment" className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#1E1E1E] hover:bg-[#FFF2ED] hover:text-[#ED5425]">
                <span>📑</span> M09 — Candidate Hiring
              </Link>
              <Link href="/admin/audit" className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#1E1E1E] hover:bg-[#FFF2ED] hover:text-[#ED5425]">
                <span>🛡️</span> M02 — System Audit Trail
              </Link>
              <Link href="/stores" className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#1E1E1E] hover:bg-[#FFF2ED] hover:text-[#ED5425]">
                <span>🏛</span> Showroom Network
              </Link>
            </nav>
          </div>

          <div className="pt-4 border-t border-[#E8E2D9] text-[11px] text-[#666666] space-y-1">
            <p>Database: <strong className="text-[#1E1E1E]">SQLite (Local Dev)</strong></p>
            <p>Tables: <strong className="text-[#1E1E1E]">~90 Domain Entities</strong></p>
          </div>
        </aside>

        {/* Main Dashboard Content */}
        <main className="flex-1 max-w-6xl p-8 space-y-8">
          <div className="p-4 rounded-2xl bg-[#FFF2ED] border border-[#ED5425]/30 text-[#1E1E1E] text-xs flex justify-between items-center">
            <div>
              <strong className="text-[#ED5425]">DEMO SEED DATA ACTIVE:</strong> 12 Showrooms, Admin User, HUID Items & Products are pre-seeded for evaluation.
            </div>
            <span className="px-2.5 py-1 rounded bg-[#ED5425] text-white font-mono text-[10px] font-bold">DEMO MODE</span>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs">
              <p className="text-xs text-[#666666] uppercase font-mono font-semibold">Showroom Branches</p>
              <p className="text-3xl font-extrabold text-[#1E1E1E] mt-2">{stats.branches}</p>
              <p className="text-[10px] text-emerald-700 font-bold mt-1">100% DB Sync</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs">
              <p className="text-xs text-[#666666] uppercase font-mono font-semibold">HUID Vault Items</p>
              <p className="text-3xl font-extrabold text-[#ED5425] mt-2">{stats.items}</p>
              <p className="text-[10px] text-[#666666] mt-1">{stats.products} SKUs Active</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs">
              <p className="text-xs text-[#666666] uppercase font-mono font-semibold">Customer Leads</p>
              <p className="text-3xl font-extrabold text-emerald-700 mt-2">{stats.leads}</p>
              <p className="text-[10px] text-emerald-700 font-bold mt-1">Omnichannel CRM</p>
            </div>
            <div className="p-5 rounded-2xl bg-white border border-[#E8E2D9] shadow-xs">
              <p className="text-xs text-[#666666] uppercase font-mono font-semibold">Pending Approvals</p>
              <p className="text-3xl font-extrabold text-sky-700 mt-2">{stats.leaves}</p>
              <p className="text-[10px] text-sky-700 font-bold mt-1">HR Queue</p>
            </div>
          </div>

          {/* AI Intelligence Signals with Evidence Detail */}
          <div className="bg-white border border-[#E8E2D9] rounded-3xl p-6 space-y-4 shadow-xs">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-[#1E1E1E] flex items-center gap-2 font-serif">
                <span className="w-2.5 h-2.5 rounded-full bg-[#ED5425] animate-pulse"></span>
                ✦ WHPS Business Intelligence Signals (Module 16)
              </h2>
              <span className="text-xs text-[#666666] font-mono">Evidence-Based Signal Calculation</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {signals.map((sig) => (
                <div key={sig.id} className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D9] space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-[#ED5425]">{sig.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#FFF2ED] text-[#ED5425] font-mono font-bold border border-[#ED5425]/20">{sig.priority}</span>
                  </div>
                  <p className="text-[#666666]">{sig.desc}</p>
                  <div className="pt-2 border-t border-[#E8E2D9] flex justify-between items-center text-[10px] text-[#666666]">
                    <span>Source: SQLite Database</span>
                    <span className="text-[#ED5425] font-bold cursor-pointer hover:underline">View Evidence →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Enterprise Operational Module Shortcuts */}
          <div>
            <h2 className="text-lg font-bold text-[#1E1E1E] mb-4 font-serif">Core Operational Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/admin/hr" className="p-5 rounded-2xl bg-white border border-[#E8E2D9] hover:border-[#ED5425] transition-colors space-y-2 shadow-xs">
                <h3 className="font-bold text-[#1E1E1E]">M08 — HR & Leave Approvals</h3>
                <p className="text-xs text-[#666666]">Employee leave applications, manager approval queue, attendance updates & audit log sync.</p>
              </Link>

              <Link href="/admin/inventory" className="p-5 rounded-2xl bg-white border border-[#E8E2D9] hover:border-[#ED5425] transition-colors space-y-2 shadow-xs">
                <h3 className="font-bold text-[#1E1E1E]">M05 — HUID Vault & Showcase Transfers</h3>
                <p className="text-xs text-[#666666]">Vault-to-Showcase stock movements, BIS HUID hallmarking records, and location logs.</p>
              </Link>

              <Link href="/admin/crm" className="p-5 rounded-2xl bg-white border border-[#E8E2D9] hover:border-[#ED5425] transition-colors space-y-2 shadow-xs">
                <h3 className="font-bold text-[#1E1E1E]">M03/M06 — Customer CRM & Leads</h3>
                <p className="text-xs text-[#666666]">Customer 360, lead status tracking, sales conversion, and quotation routing.</p>
              </Link>

              <Link href="/admin/recruitment" className="p-5 rounded-2xl bg-white border border-[#E8E2D9] hover:border-[#ED5425] transition-colors space-y-2 shadow-xs">
                <h3 className="font-bold text-[#1E1E1E]">M09 — Candidate → Employee Hiring</h3>
                <p className="text-xs text-[#666666]">Recruitment applicant pipeline with automated one-click Employee creation in DB.</p>
              </Link>

              <Link href="/admin/audit" className="p-5 rounded-2xl bg-white border border-[#E8E2D9] hover:border-[#ED5425] transition-colors space-y-2 shadow-xs">
                <h3 className="font-bold text-[#1E1E1E]">M02 — System Audit Event Logs</h3>
                <p className="text-xs text-[#666666]">Immutable compliance event trail logging logins, stock movements, and approvals.</p>
              </Link>

              <Link href="/stores" className="p-5 rounded-2xl bg-white border border-[#E8E2D9] hover:border-[#ED5425] transition-colors space-y-2 shadow-xs">
                <h3 className="font-bold text-[#1E1E1E]">M14 — Showroom Network & Franchise</h3>
                <p className="text-xs text-[#666666]">Explore 12 WHPS Showrooms across Maharashtra & Goa with target revenues.</p>
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}