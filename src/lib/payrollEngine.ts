export interface PayrollInput {
  employeeCode: string;
  employeeName: string;
  department: string;
  designation: string;
  monthlyBasicSalary: number;
  monthlyHra: number;
  monthlyAllowances: number;
  workingDaysInMonth: number;
  daysPresent: number;
  paidLeaveDays: number;
  overtimeHours?: number;
  overtimeRatePerHour?: number;
  salesCommissionIncentive?: number;
}

export interface PayrollResult {
  employeeCode: string;
  employeeName: string;
  department: string;
  designation: string;
  payPeriod: string;
  
  workingDaysInMonth: number;
  payableDays: number;
  lossOfPayDays: number;
  
  // Earnings Breakdown
  basicPayEarned: number;
  hraEarned: number;
  allowancesEarned: number;
  overtimePay: number;
  salesCommissionIncentive: number;
  grossEarnings: number;
  
  // Deductions Breakdown
  pfDeduction: number;
  esiDeduction: number;
  professionalTax: number;
  totalDeductions: number;
  
  // Net Payable
  netSalaryPayable: number;
  status: "CALCULATED" | "APPROVED" | "DISBURSED";
}

/**
 * WHPS Executive HR & Payroll Reconciliation Engine
 * Calculates pro-rata salary, attendance LOPs, overtime, sales commissions, Statutory PF/ESI/PT, and net disbursement.
 */
export function calculateEmployeePayroll(input: PayrollInput): PayrollResult {
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

  // Statutory Deductions Math
  // 1. Employee PF: 12% of Basic, capped at ₹1,800/month
  const pfDeduction = Math.min(1800, Math.round(basicPayEarned * 0.12));

  // 2. Employee ESI: 0.75% of Gross if Gross <= ₹21,000
  const esiDeduction = grossEarnings <= 21000 ? Math.round(grossEarnings * 0.0075) : 0;

  // 3. Maharashtra Professional Tax (PT): Standard ₹200/month if Gross >= ₹10,000
  const professionalTax = grossEarnings >= 10000 ? 200 : 0;

  const totalDeductions = pfDeduction + esiDeduction + professionalTax;
  const netSalaryPayable = Math.max(0, grossEarnings - totalDeductions);

  const currentMonthName = new Date().toLocaleString('default', { month: 'short', year: 'numeric' });

  return {
    employeeCode: input.employeeCode,
    employeeName: input.employeeName,
    department: input.department,
    designation: input.designation,
    payPeriod: currentMonthName,
    workingDaysInMonth: totalDays,
    payableDays,
    lossOfPayDays,
    basicPayEarned,
    hraEarned,
    allowancesEarned,
    overtimePay,
    salesCommissionIncentive,
    grossEarnings,
    pfDeduction,
    esiDeduction,
    professionalTax,
    totalDeductions,
    netSalaryPayable,
    status: "CALCULATED"
  };
}