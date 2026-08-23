"use client";

import { useState } from "react";
import Link from "next/link";

export default function CustomerQuotationsPage() {
  const [customerName, setCustomerName] = useState("Anjali Deshmukh");
  const [customerPhone, setCustomerPhone] = useState("+91 98230 44556");
  const [grossWeight, setGrossWeight] = useState("25.0");
  const [goldRate, setGoldRate] = useState("6850");
  const [makingRate, setMakingRate] = useState("500");
  const [stoneVal, setStoneVal] = useState("12000");
  const [exchangeCredit, setExchangeCredit] = useState("0");
  const [quotation, setQuotation] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/quotations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          items: [
            {
              description: "22K Custom Nagas Temple Necklace",
              metalType: "GOLD",
              purity: "22KT",
              grossWeightGm: Number(grossWeight),
              netMetalWeightGm: Number(grossWeight) - 0.5,
              goldRatePerGm: Number(goldRate),
              makingChargeRatePerGm: Number(makingRate),
              stoneValue: Number(stoneVal)
            }
          ],
          exchangeCreditVoucherValue: Number(exchangeCredit)
        })
      });
      const json = await res.json();
      if (json.success) setQuotation(json.data);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] p-8 text-[#1E1E1E]">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <span className="px-2.5 py-1 bg-[#ED5425]/10 text-[#ED5425] rounded text-xs font-bold uppercase tracking-wider">
            SALES & ESTIMATES
          </span>
          <h1 className="text-3xl font-serif font-bold mt-1 text-[#1E1E1E]">
            Official Customer Quotation & Price Breakup
          </h1>
          <p className="text-xs text-neutral-500 mt-1 font-mono">
            Itemized raw metal value, making charges, stone value, 3% GST & trade-in deductions
          </p>
        </div>

        <Link href="/admin/dashboard" className="px-4 py-2 border border-[#E8E2D9] bg-white rounded-lg text-xs font-semibold hover:bg-neutral-50">
          Back to Dashboard
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Panel */}
        <div className="bg-white p-6 rounded-xl border border-[#E8E2D9] shadow-sm">
          <h3 className="text-sm font-bold text-[#1E1E1E] uppercase tracking-wider mb-4">Quotation Parameters</h3>
          <form onSubmit={handleGenerate} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase block mb-1">Customer Name</label>
              <input
                type="text"
                required
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full p-2.5 text-xs border border-[#E8E2D9] rounded-lg focus:outline-none focus:border-[#ED5425]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase block mb-1">Phone Number</label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full p-2.5 text-xs border border-[#E8E2D9] rounded-lg focus:outline-none focus:border-[#ED5425]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-neutral-500 uppercase block mb-1">Gross Wt (g)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={grossWeight}
                  onChange={(e) => setGrossWeight(e.target.value)}
                  className="w-full p-2.5 text-xs border border-[#E8E2D9] rounded-lg focus:outline-none focus:border-[#ED5425]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-500 uppercase block mb-1">Gold Rate (₹/g)</label>
                <input
                  type="number"
                  required
                  value={goldRate}
                  onChange={(e) => setGoldRate(e.target.value)}
                  className="w-full p-2.5 text-xs border border-[#E8E2D9] rounded-lg focus:outline-none focus:border-[#ED5425]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-neutral-500 uppercase block mb-1">Making Rate (₹/g)</label>
                <input
                  type="number"
                  required
                  value={makingRate}
                  onChange={(e) => setMakingRate(e.target.value)}
                  className="w-full p-2.5 text-xs border border-[#E8E2D9] rounded-lg focus:outline-none focus:border-[#ED5425]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-500 uppercase block mb-1">Stone Value (₹)</label>
                <input
                  type="number"
                  value={stoneVal}
                  onChange={(e) => setStoneVal(e.target.value)}
                  className="w-full p-2.5 text-xs border border-[#E8E2D9] rounded-lg focus:outline-none focus:border-[#ED5425]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-neutral-500 uppercase block mb-1">Trade-in Exchange Credit (₹)</label>
              <input
                type="number"
                value={exchangeCredit}
                onChange={(e) => setExchangeCredit(e.target.value)}
                className="w-full p-2.5 text-xs border border-[#E8E2D9] rounded-lg focus:outline-none focus:border-[#ED5425]"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#ED5425] text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-[#C83E13] transition-colors"
            >
              {loading ? "Calculating..." : "Generate Official Quotation"}
            </button>
          </form>
        </div>

        {/* Printable Document Preview Panel */}
        <div className="lg:col-span-2">
          {quotation ? (
            <div className="bg-white p-8 rounded-xl border border-[#E8E2D9] shadow-sm font-serif">
              <div className="flex justify-between items-start border-b border-neutral-200 pb-6 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#1E1E1E]">वामन हरी पेटे सन्स</h2>
                  <div className="text-xs font-sans text-neutral-500">Jewellers Since 1909 • Tax Estimate</div>
                  <div className="text-xs font-sans text-neutral-400 mt-1">{quotation.branchName}</div>
                </div>
                <div className="text-right font-sans">
                  <div className="text-sm font-bold text-[#ED5425]">{quotation.quotationNo}</div>
                  <div className="text-xs text-neutral-400 font-mono">Date: {new Date(quotation.quotationDate).toLocaleDateString()}</div>
                  <div className="text-[10px] text-emerald-700 font-semibold mt-1">Valid Until: {new Date(quotation.validUntil).toLocaleDateString()}</div>
                </div>
              </div>

              <div className="mb-6 font-sans text-xs flex justify-between bg-[#FAF8F5] p-3 rounded-lg border border-[#E8E2D9]">
                <div><span className="text-neutral-400 font-semibold uppercase">Client:</span> {quotation.customerName}</div>
                <div><span className="text-neutral-400 font-semibold uppercase">Phone:</span> {quotation.customerPhone}</div>
              </div>

              {/* Items Table */}
              <table className="w-full text-left font-sans text-xs mb-6">
                <thead className="bg-[#FAF8F5] border-b border-[#E8E2D9] uppercase text-neutral-500 font-bold">
                  <tr>
                    <th className="p-3">Description</th>
                    <th className="p-3">Gross Wt</th>
                    <th className="p-3">Raw Metal</th>
                    <th className="p-3">Making Charges</th>
                    <th className="p-3">Stones</th>
                    <th className="p-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {quotation.items.map((item: any, idx: number) => (
                    <tr key={idx}>
                      <td className="p-3 font-semibold text-[#1E1E1E]">
                        {item.description}
                        <div className="text-[10px] text-neutral-400 font-mono">HUID: {item.huid}</div>
                      </td>
                      <td className="p-3 font-mono">{item.grossWeightGm}g</td>
                      <td className="p-3">₹{item.rawMetalValue.toLocaleString()}</td>
                      <td className="p-3">₹{item.makingCharges.toLocaleString()}</td>
                      <td className="p-3">₹{item.stoneValue.toLocaleString()}</td>
                      <td className="p-3 text-right font-bold">₹{item.lineSubtotal.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Price Breakup Totals */}
              <div className="border-t border-neutral-200 pt-4 font-sans text-xs space-y-2 max-w-xs ml-auto">
                <div className="flex justify-between text-neutral-600">
                  <span>Raw Metal Total:</span>
                  <span className="font-semibold">₹{quotation.rawMetalTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Making Charges Total:</span>
                  <span className="font-semibold">₹{quotation.makingChargesTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Stone Value Total:</span>
                  <span className="font-semibold">₹{quotation.stoneValueTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-neutral-800 font-bold border-t border-neutral-200 pt-2">
                  <span>Taxable Subtotal:</span>
                  <span>₹{quotation.taxableSubtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-neutral-500">
                  <span>CGST (1.5% Metal / 9% Making) + SGST (1.5% Metal / 9% Making):</span>
                  <span>₹{quotation.taxBreakdown.totalGst.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#1E1E1E] text-sm font-bold border-t border-neutral-300 pt-2">
                  <span>Grand Total (Incl. GST):</span>
                  <span>₹{quotation.grandTotal.toLocaleString()}</span>
                </div>
                {quotation.exchangeCreditDeduction > 0 && (
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Less: Trade-in Credit:</span>
                    <span>- ₹{quotation.exchangeCreditDeduction.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-[#ED5425] text-base font-bold border-t-2 border-[#ED5425] pt-2">
                  <span>Net Payable:</span>
                  <span>₹{quotation.netPayableAmount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white p-12 rounded-xl border border-[#E8E2D9] text-center text-neutral-400 text-sm">
              Configure quotation parameters on the left and click <span className="font-semibold text-[#1E1E1E]">Generate Official Quotation</span> to preview the estimate document.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}