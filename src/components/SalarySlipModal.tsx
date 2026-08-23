"use client";

import Image from "next/image";
import { PayrollResult } from "@/lib/payrollEngine";
import { formatINR } from "@/lib/formatters";

interface SalarySlipModalProps {
  payroll: PayrollResult;
  onClose: () => void;
}

export default function SalarySlipModal({ payroll, onClose }: SalarySlipModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-8 shadow-2xl border border-amber-500/30 my-8">
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-6 border-neutral-200">
          <div className="flex items-center gap-4">
            <Image
              src="/assets/logo/whps_logo.png"
              alt="Waman Hari Pethe Sons Logo"
              width={140}
              height={45}
              className="object-contain"
            />
            <div className="border-l pl-4 border-neutral-300">
              <h2 className="text-xl font-serif font-bold text-[#1E1E1E]">WAMAN HARI PETHE SONS</h2>
              <p className="text-xs font-semibold text-[#ED5425] uppercase tracking-wider">
                CONFIDENTIAL SALARY SLIP • {payroll.payPeriod}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-neutral-100 hover:bg-neutral-200 flex items-center justify-center font-bold text-neutral-600 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Employee & Bank Info Grid */}
        <div className="grid grid-cols-2 gap-4 py-6 text-xs border-b border-neutral-200 bg-amber-50/40 p-4 rounded-xl my-4">
          <div>
            <p className="text-neutral-500 font-semibold">Employee Name</p>
            <p className="font-bold text-[#1E1E1E] text-sm">{payroll.employeeName}</p>
            <p className="text-neutral-500 mt-2 font-semibold">Employee ID / Code</p>
            <p className="font-mono font-bold text-[#ED5425]">{payroll.employeeCode}</p>
            <p className="text-neutral-500 mt-2 font-semibold">Designation & Department</p>
            <p className="font-semibold text-neutral-800">{payroll.designation} ({payroll.department})</p>
          </div>
          <div>
            <p className="text-neutral-500 font-semibold">Showroom Branch</p>
            <p className="font-bold text-[#1E1E1E]">{payroll.branchName}</p>
            <p className="text-neutral-500 mt-2 font-semibold">Bank Account & IFSC</p>
            <p className="font-mono text-neutral-800">{payroll.bankAccountNo}</p>
            <p className="text-neutral-500 mt-2 font-semibold">PAN Number</p>
            <p className="font-mono text-neutral-800">{payroll.panNo}</p>
          </div>
        </div>

        {/* Attendance Breakdown */}
        <div className="bg-neutral-50 p-4 rounded-xl mb-6 border border-neutral-200 text-xs flex justify-between items-center font-semibold">
          <div>
            <span className="text-neutral-500">Working Days: </span>
            <span className="text-[#1E1E1E] font-bold">{payroll.workingDaysInMonth}</span>
          </div>
          <div>
            <span className="text-neutral-500">Present: </span>
            <span className="text-emerald-700 font-bold">{payroll.daysPresent}</span>
          </div>
          <div>
            <span className="text-neutral-500">Paid Leave: </span>
            <span className="text-amber-700 font-bold">{payroll.paidLeaveDays}</span>
          </div>
          <div>
            <span className="text-neutral-500">LOP Days: </span>
            <span className="text-rose-700 font-bold">{payroll.lossOfPayDays}</span>
          </div>
          <div>
            <span className="text-neutral-500">OT Hours: </span>
            <span className="text-indigo-700 font-bold">{payroll.overtimeHours} hrs</span>
          </div>
        </div>

        {/* Earnings vs Deductions Table */}
        <div className="grid grid-cols-2 gap-6 text-xs">
          {/* Earnings Column */}
          <div className="border border-neutral-200 rounded-xl overflow-hidden">
            <div className="bg-emerald-800 text-white font-bold p-3 uppercase tracking-wider text-[11px]">
              Earnings
            </div>
            <div className="p-4 space-y-2.5">
              <div className="flex justify-between">
                <span>Basic Salary</span>
                <span className="font-mono font-semibold">₹{formatINR(payroll.basicPayEarned)}</span>
              </div>
              <div className="flex justify-between">
                <span>House Rent Allowance (HRA)</span>
                <span className="font-mono font-semibold">₹{formatINR(payroll.hraEarned)}</span>
              </div>
              <div className="flex justify-between">
                <span>Special Allowances</span>
                <span className="font-mono font-semibold">₹{formatINR(payroll.allowancesEarned)}</span>
              </div>
              <div className="flex justify-between">
                <span>Overtime Pay</span>
                <span className="font-mono font-semibold">₹{formatINR(payroll.overtimePay)}</span>
              </div>
              <div className="flex justify-between text-[#ED5425] font-semibold">
                <span>Sales Incentive / Commission</span>
                <span className="font-mono font-bold">₹{formatINR(payroll.salesCommissionIncentive)}</span>
              </div>
              <div className="flex justify-between pt-3 border-t font-bold text-sm text-emerald-900">
                <span>Gross Earnings</span>
                <span className="font-mono">₹{formatINR(payroll.grossEarnings)}</span>
              </div>
            </div>
          </div>

          {/* Deductions Column */}
          <div className="border border-neutral-200 rounded-xl overflow-hidden">
            <div className="bg-rose-800 text-white font-bold p-3 uppercase tracking-wider text-[11px]">
              Employee Deductions
            </div>
            <div className="p-4 space-y-2.5">
              <div className="flex justify-between">
                <span>Provident Fund (PF Employee 12%)</span>
                <span className="font-mono font-semibold">₹{formatINR(payroll.pfEmployeeDeduction)}</span>
              </div>
              <div className="flex justify-between">
                <span>Employee State Insurance (ESI 0.75%)</span>
                <span className="font-mono font-semibold">₹{formatINR(payroll.esiEmployeeDeduction)}</span>
              </div>
              <div className="flex justify-between">
                <span>Professional Tax (PT Maharashtra)</span>
                <span className="font-mono font-semibold">₹{formatINR(payroll.professionalTax)}</span>
              </div>
              <div className="flex justify-between pt-6 border-t font-bold text-sm text-rose-900">
                <span>Total Deductions</span>
                <span className="font-mono">₹{formatINR(payroll.totalEmployeeDeductions)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Net Salary Payable */}
        <div className="mt-6 bg-[#1E1E1E] text-white p-5 rounded-2xl flex justify-between items-center shadow-lg">
          <div>
            <p className="text-xs text-amber-400 font-bold uppercase tracking-widest">NET SALARY PAYABLE</p>
            <p className="text-[10px] text-neutral-400 mt-0.5">Rule Snapshot: {payroll.ruleSnapshot.ruleId} (v{payroll.ruleSnapshot.version})</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-mono font-bold text-emerald-400">₹{formatINR(payroll.netSalaryPayable)}</p>
            <p className="text-[10px] text-neutral-400">CTC: ₹{formatINR(payroll.totalCostToCompany)}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => window.print()}
            type="button"
            className="px-5 py-2.5 bg-[#ED5425] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-[#C83E13] transition-all shadow-md"
          >
            🖨️ Print Official Payslip
          </button>
          <button
            onClick={onClose}
            type="button"
            className="px-5 py-2.5 bg-neutral-200 text-neutral-800 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-neutral-300 transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}