"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("admin@whpjewellers.com");
  const [password, setPassword] = useState("Admin@12345");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    setLoading(false);

    if (data.success) {
      router.push("/admin/dashboard");
    } else {
      setError(data.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#1E1E1E] flex flex-col justify-center items-center px-6 font-sans">
      <div className="w-full max-w-md bg-white border border-[#E8E2D9] rounded-3xl p-8 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#ED5425] flex items-center justify-center font-bold text-white text-2xl mx-auto shadow-md shadow-amber-500/20">
            W
          </div>
          <h1 className="font-serif text-2xl font-bold text-[#1E1E1E]">Central Admin Authentication</h1>
          <p className="text-xs text-[#666666]">WHPS Digital Enterprise Platform • Shared Data Backbone</p>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs text-center font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block text-[#1E1E1E] font-semibold mb-1">Email Address</label>
            <input
              required
              type="email"
              className="w-full bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl px-4 py-2.5 text-[#1E1E1E] focus:border-[#ED5425] outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-[#1E1E1E] font-semibold mb-1">Password</label>
            <input
              required
              type="password"
              className="w-full bg-[#FAF8F5] border border-[#E8E2D9] rounded-xl px-4 py-2.5 text-[#1E1E1E] focus:border-[#ED5425] outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="p-3.5 bg-[#FFF2ED] border border-amber-500/20 rounded-xl text-[11px] text-[#1E1E1E] space-y-1">
            <p><strong>Demo Super Admin Credentials:</strong></p>
            <p>Email: <code className="text-[#ED5425] font-mono">admin@whpjewellers.com</code></p>
            <p>Password: <code className="text-[#ED5425] font-mono">Admin@12345</code></p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#ED5425] hover:bg-[#ED5425] text-white font-bold text-sm rounded-xl transition-colors shadow-lg shadow-amber-500/10"
          >
            {loading ? "Authenticating..." : "Log In to Enterprise Portal"}
          </button>
        </form>

        <div className="text-center">
          <Link href="/" className="text-xs text-[#666666] hover:text-[#ED5425] transition-colors">
            ← Return to Public Website
          </Link>
        </div>
      </div>
    </div>
  );
}