"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminHRPage() {
  const [data, setData] = useState<{ leaveRequests: any[]; leaveTypes: any[]; employees: any[] }>({
    leaveRequests: [],
    leaveTypes: [],
    employees: []
  });
  const [loading, setLoading] = useState(true);
  const [applyForm, setApplyForm] = useState({
    employeeId: "",
    leaveTypeId: "",
    fromDate: "",
    toDate: "",
    days: "1",
    reason: ""
  });

  const loadData = () => {
    fetch("/api/hr/leave")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success) {
          setData(resData.data);
          if (resData.data.employees.length > 0 && !applyForm.employeeId) {
            setApplyForm((f) => ({
              ...f,
              employeeId: resData.data.employees[0].id,
              leaveTypeId: resData.data.leaveTypes[0]?.id || ""
            }));
          }
        }
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/hr/leave", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(applyForm)
    });
    const result = await res.json();
    if (result.success) {
      alert("Leave applied and logged in database!");
      loadData();
    }
  };

  const handleStatusChange = async (requestId: string, status: string) => {
    const res = await fetch("/api/hr/leave", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, status })
    });
    const result = await res.json();
    if (result.success) {
      alert(`Leave request ${status} successfully! Attendance & Audit Event updated.`);
      loadData();
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E1E1E] flex flex-col font-sans">
      <header className="border-b border-[#E8E2D9] bg-white px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="w-8 h-8 rounded-lg bg-[#ED5425] flex items-center justify-center font-bold text-white">W</Link>
          <div>
            <h1 className="font-bold text-[#1E1E1E] text-sm font-serif">Module 08: HR & Leave Management</h1>
            <p className="text-[10px] text-[#666666] font-mono">Real Approval Chains • Attendance Updates • Audit Log Sync</p>
          </div>
        </div>
        <Link href="/admin/dashboard" className="text-xs text-[#666666] hover:text-[#ED5425]">Back to Admin</Link>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 w-full flex-1 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-[#E8E2D9] rounded-3xl p-6 h-fit space-y-4 shadow-xs">
            <h2 className="font-serif font-bold text-lg text-[#1E1E1E]">Submit Leave Application</h2>
            <form onSubmit={handleApply} className="space-y-3 text-xs">
              <div>
                <label className="block text-[#666666] font-semibold mb-1">Select Employee</label>
                <select
                  className="w-full bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl px-3 py-2 text-[#1E1E1E] outline-none"
                  value={applyForm.employeeId}
                  onChange={(e) => setApplyForm({ ...applyForm, employeeId: e.target.value })}
                >
                  {data.employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>{emp.user.name} ({emp.employeeCode})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#666666] font-semibold mb-1">Leave Type</label>
                <select
                  className="w-full bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl px-3 py-2 text-[#1E1E1E] outline-none"
                  value={applyForm.leaveTypeId}
                  onChange={(e) => setApplyForm({ ...applyForm, leaveTypeId: e.target.value })}
                >
                  {data.leaveTypes.map((lt) => (
                    <option key={lt.id} value={lt.id}>{lt.name} ({lt.code})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[#666666] font-semibold mb-1">From Date</label>
                  <input
                    required
                    type="date"
                    className="w-full bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl px-3 py-2 text-[#1E1E1E] outline-none"
                    value={applyForm.fromDate}
                    onChange={(e) => setApplyForm({ ...applyForm, fromDate: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[#666666] font-semibold mb-1">To Date</label>
                  <input
                    required
                    type="date"
                    className="w-full bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl px-3 py-2 text-[#1E1E1E] outline-none"
                    value={applyForm.toDate}
                    onChange={(e) => setApplyForm({ ...applyForm, toDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#666666] font-semibold mb-1">Reason</label>
                <textarea
                  rows={2}
                  className="w-full bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl px-3 py-2 text-[#1E1E1E] outline-none resize-none"
                  placeholder="Reason for leave request..."
                  value={applyForm.reason}
                  onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                />
              </div>

              <button type="submit" className="w-full py-2.5 bg-[#ED5425] hover:bg-[#ED5425] text-white font-bold rounded-xl transition-colors shadow-md">
                Apply Leave Request
              </button>
            </form>
          </div>

          <div className="md:col-span-2 bg-white border border-[#E8E2D9] rounded-3xl p-6 space-y-4 shadow-xs">
            <h2 className="font-serif font-bold text-lg text-[#1E1E1E]">Manager Approval Queue ({data.leaveRequests.length})</h2>

            {loading ? (
              <p className="text-[#666666] text-xs py-10 text-center">Loading leave requests...</p>
            ) : data.leaveRequests.length === 0 ? (
              <p className="text-[#666666] text-xs py-10 text-center">No leave requests currently in queue.</p>
            ) : (
              <div className="space-y-3">
                {data.leaveRequests.map((lr) => (
                  <div key={lr.id} className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#E8E2D9] flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <strong className="text-[#1E1E1E]">{lr.employee?.user?.name}</strong>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-[#FFF2ED] text-[#ED5425] font-semibold">{lr.employee?.department?.name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                          lr.status === "APPROVED" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                          lr.status === "REJECTED" ? "bg-rose-50 text-rose-700 border border-rose-200" : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}>
                          {lr.status}
                        </span>
                      </div>
                      <p className="text-[#666666]">
                        {lr.leaveType?.name} ({lr.days} days): {new Date(lr.fromDate).toLocaleDateString()} → {new Date(lr.toDate).toLocaleDateString()}
                      </p>
                      {lr.reason && <p className="text-[#666666] italic">"{lr.reason}"</p>}
                    </div>

                    {lr.status === "PENDING" && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleStatusChange(lr.id, "APPROVED")}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleStatusChange(lr.id, "REJECTED")}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}