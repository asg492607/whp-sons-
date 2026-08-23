"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { calculateEmployeePayroll, PayrollResult } from "@/lib/payrollEngine";
import SalarySlipModal from "@/components/SalarySlipModal";
import { formatINR } from "@/lib/formatters";

export default function AdminHRPage() {
  const [data, setData] = useState<{ leaveRequests: any[]; leaveTypes: any[]; employees: any[] }>({
    leaveRequests: [],
    leaveTypes: [],
    employees: []
  });
  const [loading, setLoading] = useState(true);
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollResult | null>(null);

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
      alert("Leave request logged in database!");
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
      alert(`Leave status updated to ${status}`);
      loadData();
    }
  };

  // Generate versioned payroll items for active employees
  const samplePayrolls: PayrollResult[] = (data.employees.length > 0 ? data.employees : [
    { employeeCode: "WHP-EMP-1001", user: { name: "Vikram Patil" }, department: { name: "Retail Operations" }, designation: { name: "Senior Showroom Consultant" } },
    { employeeCode: "WHP-EMP-1002", user: { name: "Rajesh Shinde" }, department: { name: "Vault Operations" }, designation: { name: "Chief Custodian" } },
    { employeeCode: "WHP-EMP-1003", user: { name: "Meena Kulkarni" }, department: { name: "Customer Relations" }, designation: { name: "Senior CRM Manager" } }
  ]).map((emp, index) =>
    calculateEmployeePayroll({
      employeeCode: emp.employeeCode || `WHP-EMP-${1001 + index}`,
      employeeName: emp.user?.name || "Showroom Executive",
      branchName: "Dadar Flagship",
      department: emp.department?.name || "Retail Operations",
      designation: emp.designation?.name || "Senior Sales Consultant",
      monthlyBasicSalary: 35000 + index * 5000,
      monthlyHra: 14000 + index * 2000,
      monthlyAllowances: 6000,
      workingDaysInMonth: 26,
      daysPresent: 25 - index,
      paidLeaveDays: 1,
      overtimeHours: index * 4,
      salesCommissionIncentive: 8500 + index * 3000
    })
  );

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E1E1E] p-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 border-b pb-4 border-[#E8E2D9]">
        <div>
          <span className="text-xs font-bold text-[#ED5425] uppercase tracking-widest">
            HUMAN RESOURCES & PAYROLL GOVERNANCE
          </span>
          <h1 className="text-3xl font-serif font-bold text-[#1E1E1E] mt-1">
            Executive HR, Attendance & Payroll System
          </h1>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/recruitment"
            className="px-4 py-2 bg-white border border-neutral-300 rounded-lg text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-all shadow-sm"
          >
            Recruitment →
          </Link>
          <Link
            href="/admin/dashboard"
            className="px-4 py-2 bg-[#ED5425] text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#C83E13] transition-all shadow-md"
          >
            Enterprise Dashboard
          </Link>
        </div>
      </div>

      {/* Versioned Statutory Rule Master Badge */}
      <div className="mb-8 bg-amber-50 border border-amber-300 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow">
            ⚖️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-sm text-amber-950">Statutory Rule Master Active:</span>
              <span className="px-2.5 py-0.5 bg-amber-200 text-amber-900 rounded font-mono font-bold text-xs">
                STAT-MH-2026-V1 (v1.0)
              </span>
            </div>
            <p className="text-xs text-amber-800 mt-0.5">
              PF: 12% (Cap ₹1,800) • ESI: 0.75% (Cap ₹21,000) • PT: Maharashtra Slabs • Effective: 01-Apr-2026 (Approved by Board Finance)
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full border border-emerald-300">
            AUDIT LOCKED & FROZEN
          </span>
        </div>
      </div>

      {/* Main Grid: Leave Management & Payroll Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Apply Leave Form */}
        <div className="bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-sm h-fit">
          <h2 className="text-lg font-serif font-bold text-[#1E1E1E] mb-4">
            Apply Official Leave Request
          </h2>
          <form onSubmit={handleApply} className="space-y-4 text-xs">
            <div>
              <label className="block text-neutral-500 font-semibold mb-1">Select Employee</label>
              <select
                value={applyForm.employeeId}
                onChange={(e) => setApplyForm({ ...applyForm, employeeId: e.target.value })}
                className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-semibold"
              >
                {data.employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.user?.name} ({emp.employeeCode})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-neutral-500 font-semibold mb-1">Leave Type</label>
              <select
                value={applyForm.leaveTypeId}
                onChange={(e) => setApplyForm({ ...applyForm, leaveTypeId: e.target.value })}
                className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs font-semibold"
              >
                {data.leaveTypes.map((lt) => (
                  <option key={lt.id} value={lt.id}>
                    {lt.name} (Max {lt.allowedDays} days/yr)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-neutral-500 font-semibold mb-1">From Date</label>
                <input
                  type="date"
                  value={applyForm.fromDate}
                  onChange={(e) => setApplyForm({ ...applyForm, fromDate: e.target.value })}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs"
                  required
                />
              </div>
              <div>
                <label className="block text-neutral-500 font-semibold mb-1">To Date</label>
                <input
                  type="date"
                  value={applyForm.toDate}
                  onChange={(e) => setApplyForm({ ...applyForm, toDate: e.target.value })}
                  className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-neutral-500 font-semibold mb-1">Reason for Leave</label>
              <textarea
                value={applyForm.reason}
                onChange={(e) => setApplyForm({ ...applyForm, reason: e.target.value })}
                placeholder="Personal / Health reason..."
                className="w-full p-2.5 bg-neutral-50 border border-neutral-300 rounded-lg text-xs h-20"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#ED5425] text-white font-bold rounded-lg uppercase tracking-wider hover:bg-[#C83E13] transition-all shadow"
            >
              Submit Leave Request
            </button>
          </form>
        </div>

        {/* Right 2 Columns: Executive Payroll Table & Salary Slips */}
        <div className="lg:col-span-2 space-y-8">
          {/* Executive Payroll Table */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-serif font-bold text-[#1E1E1E]">
                  Monthly Payroll Reconciliation Pipeline
                </h2>
                <p className="text-xs text-neutral-500">
                  Attendance-linked LOPs, Sales Incentives, Employee Deductions, Employer Liabilities & Salary Slips
                </p>
              </div>
              <span className="px-3 py-1 bg-[#1E1E1E] text-amber-400 font-mono text-xs font-bold rounded-lg">
                Current Cycle: Aug 2026
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-100 border-b border-neutral-200 text-neutral-600 uppercase text-[10px] tracking-wider">
                    <th className="p-3">Employee</th>
                    <th className="p-3">Attendance (LOP)</th>
                    <th className="p-3">Gross Earnings</th>
                    <th className="p-3">Statutory Deductions</th>
                    <th className="p-3">Net Salary</th>
                    <th className="p-3">Employer CTC</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {samplePayrolls.map((pay) => (
                    <tr key={pay.payrollId} className="hover:bg-amber-50/40 transition-colors">
                      <td className="p-3">
                        <div className="font-bold text-[#1E1E1E]">{pay.employeeName}</div>
                        <div className="text-[10px] font-mono text-[#ED5425]">{pay.employeeCode}</div>
                        <div className="text-[10px] text-neutral-500">{pay.designation}</div>
                      </td>
                      <td className="p-3">
                        <div><strong className="text-emerald-700">{pay.daysPresent}</strong> / {pay.workingDaysInMonth} Days</div>
                        {pay.lossOfPayDays > 0 ? (
                          <span className="text-[10px] text-rose-600 font-bold">({pay.lossOfPayDays} LOP)</span>
                        ) : (
                          <span className="text-[10px] text-emerald-600 font-bold">(Full Pay)</span>
                        )}
                      </td>
                      <td className="p-3 font-mono font-semibold text-[#1E1E1E]" suppressHydrationWarning>
                        ₹{formatINR(pay.grossEarnings)}
                      </td>
                      <td className="p-3 font-mono text-rose-700 font-semibold" suppressHydrationWarning>
                        - ₹{formatINR(pay.totalEmployeeDeductions)}
                      </td>
                      <td className="p-3 font-mono font-bold text-emerald-700 text-sm" suppressHydrationWarning>
                        ₹{formatINR(pay.netSalaryPayable)}
                      </td>
                      <td className="p-3 font-mono text-neutral-600 text-[11px]" suppressHydrationWarning>
                        ₹{formatINR(pay.totalCostToCompany)}
                      </td>
                      <td className="p-3 text-right">
                        <button
                          onClick={() => setSelectedPayroll(pay)}
                          type="button"
                          className="px-3 py-1.5 bg-[#ED5425] text-white font-bold text-[11px] rounded-lg hover:bg-[#C83E13] transition-all shadow-sm"
                        >
                          📄 View Payslip
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Leave Requests Table */}
          <div className="bg-white p-6 rounded-2xl border border-[#E8E2D9] shadow-sm">
            <h2 className="text-lg font-serif font-bold text-[#1E1E1E] mb-4">
              Active Employee Leave Requests
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-neutral-100 border-b border-neutral-200 text-neutral-600 uppercase text-[10px] tracking-wider">
                    <th className="p-3">Employee</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Dates & Days</th>
                    <th className="p-3">Reason</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {data.leaveRequests.map((req) => (
                    <tr key={req.id}>
                      <td className="p-3 font-bold text-[#1E1E1E]">{req.employee?.user?.name}</td>
                      <td className="p-3 text-neutral-600">{req.leaveType?.name}</td>
                      <td className="p-3">
                        {new Date(req.fromDate).toLocaleDateString()} - {new Date(req.toDate).toLocaleDateString()} ({req.days}d)
                      </td>
                      <td className="p-3 text-neutral-500 italic max-w-xs truncate">{req.reason || "N/A"}</td>
                      <td className="p-3 font-bold">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            req.status === "APPROVED"
                              ? "bg-emerald-100 text-emerald-800"
                              : req.status === "REJECTED"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {req.status}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        {req.status === "PENDING" && (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleStatusChange(req.id, "APPROVED")}
                              className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatusChange(req.id, "REJECTED")}
                              className="px-2 py-1 bg-rose-600 text-white rounded text-[10px] font-bold"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                  {data.leaveRequests.length === 0 && (
                    <tr>
                      <td colSpan={6} className="p-4 text-center text-neutral-400 italic">
                        No pending leave requests found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Salary Slip Printable Inspector Modal */}
      {selectedPayroll && (
        <SalarySlipModal
          payroll={selectedPayroll}
          onClose={() => setSelectedPayroll(null)}
        />
      )}
    </div>
  );
}