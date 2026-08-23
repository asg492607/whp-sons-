"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/audit")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setLogs(data.data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E1E1E] flex flex-col font-sans">
      <header className="border-b border-[#E8E2D9] bg-white px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="w-8 h-8 rounded-lg bg-[#ED5425] flex items-center justify-center font-bold text-white">W</Link>
          <div>
            <h1 className="font-bold text-[#1E1E1E] text-sm font-serif">Enterprise System Audit Trail</h1>
            <p className="text-[10px] text-[#666666] font-mono">Immutable Compliance Log • Security & Operations Tracking</p>
          </div>
        </div>
        <Link href="/admin/dashboard" className="text-xs text-[#666666] hover:text-[#ED5425]">Back to Admin</Link>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 w-full flex-1 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold font-serif text-[#1E1E1E]">Audit Events Log ({logs.length})</h2>
          <span className="text-xs text-[#666666] font-mono">Table: audit_events</span>
        </div>

        {loading ? (
          <p className="text-[#666666] text-xs text-center py-20">Loading audit trail...</p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="p-4 rounded-2xl bg-white border border-[#E8E2D9] text-xs flex justify-between items-center gap-4 shadow-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold font-mono text-[#ED5425]">{log.action}</span>
                    <span className="px-2 py-0.5 bg-[#FFF2ED] rounded text-[10px] text-[#ED5425] font-semibold">{log.module}</span>
                    <span className="text-[10px] text-[#666666] font-mono">{log.entityType} ({log.entityId || "N/A"})</span>
                  </div>
                  <p className="text-[#666666]">Executed by: <strong className="text-[#1E1E1E]">{log.user?.name || "System Admin"}</strong> ({log.user?.email || "internal"})</p>
                </div>
                <span className="text-[10px] text-[#666666] font-mono">{new Date(log.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}