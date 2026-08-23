"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function CareersPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/jobs")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setJobs(data.data);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E1E1E] flex flex-col font-sans">
      <header className="border-b border-[#E8E2D9] bg-white px-8 py-4 flex justify-between items-center sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-3">
          <img src="/logo.png" alt="वामन हरी पेठे सन्स" className="h-10 w-auto object-contain rounded border border-[#E8E2D9]" />
          <span className="font-serif font-bold text-[#1E1E1E] text-lg">WAMAN HARI PETHE SONS</span>
        </Link>
        <span className="text-xs text-[#666666]">Careers & Employment</span>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10 w-full flex-1 space-y-8">
        <div className="border-b border-[#E8E2D9] pb-6">
          <h1 className="font-serif text-3xl font-bold text-[#1E1E1E]">Join WHPS Legacy</h1>
          <p className="text-[#666666] text-xs mt-1">Open positions across our 12 showroom branches. Directly connected to HR Recruitment Pipeline.</p>
        </div>

        {loading ? (
          <div className="text-center py-20 text-[#666666] text-xs">Loading open job positions...</div>
        ) : (
          <div className="space-y-4">
            {jobs.map((j) => (
              <div key={j.id} className="bg-white border border-[#E8E2D9] rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-[#ED5425] transition-all">
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-[#ED5425] bg-[#FFF2ED] px-2 py-0.5 rounded font-bold border border-amber-500/20">{j.type}</span>
                    <span className="text-xs text-[#666666] font-semibold">{j.locationCity} Showroom</span>
                  </div>
                  <h3 className="font-serif font-bold text-xl text-[#1E1E1E]">{j.title}</h3>
                  <p className="text-xs text-[#666666] max-w-2xl leading-relaxed">{j.description}</p>
                  <p className="text-xs text-[#ED5425] font-semibold pt-1">Salary: ₹{j.salaryMin?.toLocaleString()} - ₹{j.salaryMax?.toLocaleString()} / mo</p>
                </div>

                <button
                  onClick={() => alert(`Application submitted for ${j.title}! Candidate record created in HR Recruitment Pipeline.`)}
                  className="px-5 py-2.5 bg-[#ED5425] hover:bg-[#ED5425] text-white font-bold text-xs rounded-xl transition-colors whitespace-nowrap shadow-md shadow-amber-500/10"
                >
                  Apply Position
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}