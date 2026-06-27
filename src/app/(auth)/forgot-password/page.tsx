"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (data.success) {
        setStatus("sent");
        setMessage(data.data?.message ?? "Check your inbox for a reset link.");
      } else {
        setStatus("error");
        setMessage(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setMessage("Network error. Please try again.");
    }
  }

  if (status === "sent") {
    return (
      <>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h2>
        <p className="text-gray-500 text-sm mb-6">{message}</p>
        <p className="text-xs text-gray-400">
          Didn&apos;t get it? Check your spam folder, or{" "}
          <button
            onClick={() => setStatus("idle")}
            className="underline font-medium" style={{ color: "#CC5500" }}
          >
            try again
          </button>.
        </p>
        <p className="mt-5 text-center text-sm text-gray-500">
          <Link href="/login" className="font-medium hover:underline" style={{ color: "#CC5500" }}>
            Back to sign in
          </Link>
        </p>
      </>
    );
  }

  return (
    <>
      <h2 className="text-2xl font-bold text-gray-900 mb-1">Forgot your password?</h2>
      <p className="text-gray-500 text-sm mb-6">
        Enter your email and we&apos;ll send you a link to reset it.
      </p>

      {status === "error" && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="form-label">Email address</label>
          <input
            type="email"
            className="form-input"
            placeholder="you@example.com"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="btn-primary w-full"
        >
          {status === "loading" ? "Sending…" : "Send reset link"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-gray-500">
        Remember it?{" "}
        <Link href="/login" className="font-medium hover:underline" style={{ color: "#CC5500" }}>
          Back to sign in
        </Link>
      </p>
    </>
  );
}
