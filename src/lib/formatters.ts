/**
 * WHPS Currency & Date Formatting Utilities
 * Deterministic formatting to prevent React SSR/Client Hydration Mismatches across locales.
 */
export function formatINR(amount?: number | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) return "0";
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 }).format(amount);
}
