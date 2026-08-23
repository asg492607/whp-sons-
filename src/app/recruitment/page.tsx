"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminRecruitmentPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadApps = () => {
    fetch("/api/recruitment/applications")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setApplications(data.data);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadApps();
  }, []);

  const handleHire = async (appId: string) => {
    const res = await fetch("/api/recruitment/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ applicationId: appId, offeredCtc: "600000" })
    });
    const result = await res.json();
    if (result.success) {
      alert(`Candidate onboarded! New Employee Record created (${result.data.employee.employeeCode}) & User Account created!`);
      loadApps();
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E1E1E] flex flex-col font-sans">
      <header className="border-b border-[#E8E2D9] bg-white px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-xs">
        <div className="flex items-center gap-3">
          <Link href="/admin/dashboard" className="w-8 h-8 rounded-lg bg-[#ED5425] flex items-center justify-center font-bold text-white">W</Link>
          <div>
            <h1 className="font-bold text-[#1E1E1E] text-sm font-serif">Module 09: Candidate → Employee Onboarding</h1>
            <p className="text-[10px] text-[#666666] font-mono">Zero Re-keying • Direct Employee Creation in DB</p>
          </div>
        </div>
        <Link href="/admin/dashboard" className="text-xs text-[#666666] hover:text-[#ED5425]">Back to Admin</Link>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 w-full flex-1 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold font-serif text-[#1E1E1E]">Job Applications ({applications.length})</h2>
          <span className="text-xs text-[#666666]">Recruitment Pipeline</span>
        </div>

        {loading ? (
          <p className="text-[#666666] text-xs text-center py-20">Loading applications...</p>
        ) : applications.length === 0 ? (
          <p className="text-[#666666] text-xs text-center py-20">No candidate applications currently received.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {applications.map((app) => (
              <div key={app.id} className="bg-white border border-[#E8E2D9] rounded-2xl p-5 space-y-3 text-xs shadow-xs">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-base text-[#1E1E1E] font-serif">{app.applicantName}</h3>
                    <p className="text-[#666666] text-xs">{app.job?.title} ({app.job?.locationCity})</p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded font-bold text-[10px] ${
                    app.status === "JOINED" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-sky-50 text-sky-700 border border-sky-200"
                  }`}>
                    {app.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[#666666]">
                  <p>📧 Email: <strong className="text-[#1E1E1E]">{app.email}</strong></p>
                  <p>📞 Phone: <strong className="text-[#1E1E1E]">{app.phone}</strong></p>
                  <p>💼 Experience: <strong className="text-[#1E1E1E]">{app.experienceYears} Years</strong></p>
                  <p>💰 Expected CTC: <strong className="text-[#ED5425]">₹{app.expectedCtc?.toLocaleString()}</strong></p>
                </div>

                {app.status !== "JOINED" && (
                  <div className="pt-3 border-t border-[#E8E2D9]">
                    <button
                      onClick={() => handleHire(app.id)}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors shadow-xs"
                    >
                      Hire & Create Employee Record
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}