export interface StatutoryRule {
  ruleId: string;
  version: number;
  effectiveFrom: string;
  effectiveTo?: string;
  state: string;
  approvedBy: string;
  
  // Employee Provident Fund (PF)
  pfEmployeeRate: number; // 0.12 (12%)
  pfWageCap: number; // 15000
  pfMaxEmployeeDeduction: number; // 1800
  pfEmployerRate: number; // 0.12 (12%)

  // Employee State Insurance (ESI)
  esiEmployeeRate: number; // 0.0075 (0.75%)
  esiGrossWageCap: number; // 21000
  esiEmployerRate: number; // 0.0325 (3.25%)

  // Professional Tax (PT - Maharashtra)
  ptSlabs: Array<{ minGross: number; maxGross: number; ptAmount: number }>;
}

export const ACTIVE_STATUTORY_RULE_MASTER: StatutoryRule = {
  ruleId: "STAT-MH-2026-V1",
  version: 1,
  effectiveFrom: "2026-04-01",
  state: "MAHARASHTRA",
  approvedBy: "FINANCE_BOARD",
  pfEmployeeRate: 0.12,
  pfWageCap: 15000,
  pfMaxEmployeeDeduction: 1800,
  pfEmployerRate: 0.12,
  esiEmployeeRate: 0.0075,
  esiGrossWageCap: 21000,
  esiEmployerRate: 0.0325,
  ptSlabs: [
    { minGross: 0, maxGross: 7500, ptAmount: 0 },
    { minGross: 7501, maxGross: 10000, ptAmount: 175 },
    { minGross: 10001, maxGross: Infinity, ptAmount: 200 }
  ]
};

export interface PayrollInput {
  employeeCode: string;
  employeeName: string;
  branchName?: string;
  department: string;
  designation: string;
  bankAccountNo?: string;
  ifscCode?: string;
  panNo?: string;
  
  monthlyBasicSalary: number;
  monthlyHra: number;
  monthlyAllowances: number;
  workingDaysInMonth: number;
  daysPresent: number;
  paidLeaveDays: number;
  overtimeHours?: number;
  overtimeRatePerHour?: number;
  salesCommissionIncentive?: number;
  statutoryRule?: StatutoryRule;
}

export interface PayrollResult {
  payrollId: string;
  employeeCode: string;
  employeeName: string;
  branchName: string;
  department: string;
  designation: string;
  bankAccountNo: string;
  ifscCode: string;
  panNo: string;
  payPeriod: string;
  
  // Attendance Breakdown
  workingDaysInMonth: number;
  daysPresent: number;
  paidLeaveDays: number;
  payableDays: number;
  lossOfPayDays: number;
  overtimeHours: number;
  
  // Earnings Component
  basicPayEarned: number;
  hraEarned: number;
  allowancesEarned: number;
  overtimePay: number;
  salesCommissionIncentive: number;
  grossEarnings: number;
  
  // Employee Statutory Deductions
  pfEmployeeDeduction: number;
  esiEmployeeDeduction: number;
  professionalTax: number;
  totalEmployeeDeductions: number;

  // Net Salary Payable to Employee
  netSalaryPayable: number;

  // Employer Statutory Contributions (Company Liabilities)
  pfEmployerContribution: number;
  esiEmployerContribution: number;
  totalEmployerContributions: number;
  totalCostToCompany: number; // Gross + Employer Contributions

  // Frozen Version Snapshot & Governance
  ruleSnapshot: StatutoryRule;
  approvalStatus: "DRAFT" | "ATTENDANCE_LOCKED" | "INCENTIVE_APPROVED" | "HR_APPROVED" | "FINANCE_APPROVED" | "DISBURSED";
  approvedByHr?: string;
  approvedByFinance?: string;
  disbursedAt?: string;
}

/**
 * WHPS Versioned Executive Payroll Engine
 * Computes pro-rata pay, LOPs, overtime, sales commissions, versioned statutory rules, employee deductions vs employer liabilities, and governance state.
 */
export function calculateEmployeePayroll(input: PayrollInput): PayrollResult {
  const rule = input.statutoryRule || ACTIVE_STATUTORY_RULE_MASTER;
  const totalDays = Math.max(1, input.workingDaysInMonth || 26);
  const present = Math.max(0, input.daysPresent || 0);
  const paidLeave = Math.max(0, input.paidLeaveDays || 0);
  
  const payableDays = Math.min(totalDays, present + paidLeave);
  const lossOfPayDays = Math.max(0, totalDays - payableDays);
  const proRataRatio = payableDays / totalDays;

  const basicPayEarned = Math.round((input.monthlyBasicSalary || 35000) * proRataRatio);
  const hraEarned = Math.round((input.monthlyHra || 14000) * proRataRatio);
  const allowancesEarned = Math.round((input.monthlyAllowances || 6000) * proRataRatio);

  const otHours = Math.max(0, input.overtimeHours || 0);
  const otRate = input.overtimeRatePerHour !== undefined ? input.overtimeRatePerHour : 250;
  const overtimePay = Math.round(otHours * otRate);

  const salesCommissionIncentive = Math.max(0, input.salesCommissionIncentive || 0);

  const grossEarnings = basicPayEarned + hraEarned + allowancesEarned + overtimePay + salesCommissionIncentive;

  // 1. Employee Statutory Deductions
  // PF: 12% of Basic, capped at rule.pfMaxEmployeeDeduction
  const pfEmployeeDeduction = Math.min(
    rule.pfMaxEmployeeDeduction,
    Math.round(basicPayEarned * rule.pfEmployeeRate)
  );

  // ESI: 0.75% of Gross if Gross <= rule.esiGrossWageCap
  const esiEmployeeDeduction = grossEarnings <= rule.esiGrossWageCap
    ? Math.round(grossEarnings * rule.esiEmployeeRate)
    : 0;

  // PT: Maharashtra Slabs matching
  let professionalTax = 0;
  for (const slab of rule.ptSlabs) {
    if (grossEarnings >= slab.minGross && grossEarnings <= slab.maxGross) {
      professionalTax = slab.ptAmount;
      break;
    }
  }

  const totalEmployeeDeductions = pfEmployeeDeduction + esiEmployeeDeduction + professionalTax;
  const netSalaryPayable = Math.max(0, grossEarnings - totalEmployeeDeductions);

  // 2. Employer Statutory Contributions (Company Liabilities)
  const pfEmployerContribution = Math.min(
    rule.pfMaxEmployeeDeduction,
    Math.round(basicPayEarned * rule.pfEmployerRate)
  );

  const esiEmployerContribution = grossEarnings <= rule.esiGrossWageCap
    ? Math.round(grossEarnings * rule.esiEmployerRate)
    : 0;

  const totalEmployerContributions = pfEmployerContribution + esiEmployerContribution;
  const totalCostToCompany = grossEarnings + totalEmployerContributions;

  const currentMonthName = new Date().toLocaleString('default', { month: 'short', year: 'numeric' });
  const payrollId = `PAY-${input.employeeCode}-${Date.now().toString().slice(-4)}`;

  return {
    payrollId,
    employeeCode: input.employeeCode,
    employeeName: input.employeeName,
    branchName: input.branchName || "Dadar Flagship",
    department: input.department,
    designation: input.designation,
    bankAccountNo: input.bankAccountNo || "HDFC0001234 - 50100234567890",
    ifscCode: input.ifscCode || "HDFC0001234",
    panNo: input.panNo || "ABCDE1234F",
    payPeriod: currentMonthName,
    
    workingDaysInMonth: totalDays,
    daysPresent: present,
    paidLeaveDays: paidLeave,
    payableDays,
    lossOfPayDays,
    overtimeHours: otHours,
    
    basicPayEarned,
    hraEarned,
    allowancesEarned,
    overtimePay,
    salesCommissionIncentive,
    grossEarnings,

    pfEmployeeDeduction,
    esiEmployeeDeduction,
    professionalTax,
    totalEmployeeDeductions,

    netSalaryPayable,

    pfEmployerContribution,
    esiEmployerContribution,
    totalEmployerContributions,
    totalCostToCompany,

    ruleSnapshot: rule,
    approvalStatus: "HR_APPROVED",
    approvedByHr: "Sujata Pethe (HR Director)",
    approvedByFinance: "Rajendra Pethe (Managing Director)"
  };
}