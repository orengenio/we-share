"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const refCode = searchParams.get("ref") ?? "";
  const leaderRef = searchParams.get("leader") ?? "";
  const typeParam = searchParams.get("type");
  const initialType: "AFFILIATE" | "PARTNER" =
    typeParam === "PARTNER" ? "PARTNER" : "AFFILIATE";

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    type: initialType,
    referralCode: refCode,
    leaderCode: leaderRef,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [agreed, setAgreed] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error ?? "Registration failed");
        return;
      }

      const { role } = data.data.user;
      router.push(role === "ADMIN" ? "/admin" : role === "PARTNER" ? "/partner" : "/affiliate");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Create your account</h2>
      <p className="text-gray-500 text-sm mb-6">Free to join. No credit card required.</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
          {error}
        </div>
      )}

      {/* Account type toggle */}
      <div className="flex rounded-lg border border-gray-200 p-1 mb-5 bg-gray-50">
        {(["AFFILIATE", "PARTNER"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setForm({ ...form, type: t })}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors ${
              form.type === t
                ? "bg-[#00254B] text-white shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {t === "AFFILIATE" ? "Referral Partner" : "Sales Partner"}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="form-label">Full name</label>
          <input
            type="text"
            className="form-input"
            placeholder="Jane Smith"
            required
            minLength={2}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="form-label">Email</label>
          <input
            type="email"
            className="form-input"
            placeholder="you@example.com"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
        </div>
        <div>
          <label className="form-label">Password</label>
          <input
            type="password"
            className="form-input"
            placeholder="8+ characters"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
        </div>
        {form.type === "AFFILIATE" && (
          <div>
            <label className="form-label">Referral code <span className="text-gray-400">(optional)</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="Referral code"
              value={form.referralCode}
              onChange={(e) => setForm({ ...form, referralCode: e.target.value })}
            />
          </div>
        )}
        {form.type === "PARTNER" && (
          <div>
            <label className="form-label">Leader code <span className="text-gray-400">(optional)</span></label>
            <input
              type="text"
              className="form-input"
              placeholder="Partner Leader who invited you"
              value={form.leaderCode}
              onChange={(e) => setForm({ ...form, leaderCode: e.target.value })}
            />
          </div>
        )}
        <label className="flex items-start gap-2.5 text-xs text-gray-600 leading-relaxed cursor-pointer">
          <input
            type="checkbox"
            required
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 accent-[#CC5500]"
          />
          <span>
            I am at least 18 years old and I agree to the{" "}
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#CC5500] font-medium hover:underline"
            >
              Program Terms
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#CC5500] font-medium hover:underline"
            >
              Privacy Policy
            </a>
            . I understand commissions are earned only on real customer sales and
            that any earnings figures shown are illustrative projections, not
            guarantees.
          </span>
        </label>

        <button
          type="submit"
          disabled={loading || !agreed}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-gray-500">
        Already have an account?{" "}
        <Link href="/login" className="text-[#CC5500] font-medium hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterForm />
    </Suspense>
  );
}
