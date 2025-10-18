"use client";

import { useState } from "react";
import { useLoginMutation, useResendVerificationMutation } from "../../store/api";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading, error }] = useLoginMutation();
  const [resendVerification, { isLoading: isResending, isSuccess: resendSuccess }] = useResendVerificationMutation();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await login({ email, password }).unwrap();
      localStorage.setItem('has_logged_in', 'true');
      router.push("/trading");
    } catch (_) {}
  };

  const handleResendVerification = async () => {
    if (!email) {
      alert("Please enter your email address first");
      return;
    }
    try {
      await resendVerification({ email }).unwrap();
    } catch (err) {
      console.error("Resend failed:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <div className="inline-block p-3 bg-emerald-500/10 rounded-full mb-4">
              <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Welcome Back</h1>
            <p className="text-slate-400 mt-2">Sign in to your trading account</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`mb-4 p-3 rounded-lg border text-sm ${
                error?.status === 403
                  ? "bg-yellow-500/10 border-yellow-500/50 text-yellow-400"
                  : "bg-red-500/10 border-red-500/50 text-red-400"
              }`}
            >
              {error?.data?.message || "Invalid credentials. Please try again."}
              {error?.status === 403 && (
                <div className="mt-3 pt-3 border-t border-yellow-500/30">
                  <p className="text-xs mb-2">Check your email inbox for the verification link.</p>
                  <button
                    type="button"
                    onClick={handleResendVerification}
                    disabled={isResending}
                    className="text-xs font-medium text-yellow-300 hover:text-yellow-200 underline disabled:opacity-50"
                  >
                    {isResending ? "Sending..." : "Resend verification email"}
                  </button>
                </div>
              )}
            </motion.div>
          )}

          {resendSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/50 text-emerald-400 text-sm"
            >
              Verification email sent! Please check your inbox.
            </motion.div>
          )}

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
                className="w-full rounded-lg border border-slate-600 bg-slate-900/50 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-slate-300">Password</label>
                <a href="/forgot-password" className="text-sm text-emerald-400 hover:text-emerald-300 transition">
                  Forgot password?
                </a>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-600 bg-slate-900/50 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 font-semibold hover:from-emerald-600 hover:to-emerald-700 transition shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="text-center text-sm text-slate-400 mt-6">
            Don't have an account?
            <a href="/register" className="text-emerald-400 font-medium hover:text-emerald-300 ml-1 transition">
              Create account
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
