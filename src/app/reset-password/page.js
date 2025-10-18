"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useResetPasswordMutation } from "../../store/api";
import { motion } from "framer-motion";

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") || "";
  const email = params.get("email") || "";
  const [password, setPassword] = useState("");
  const [password_confirmation, setPasswordConfirmation] = useState("");
  const [reset, { isLoading, isSuccess, error }] = useResetPasswordMutation();

  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => router.replace("/login"), 2000);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, router]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await reset({ token, email, password, password_confirmation }).unwrap();
    } catch (_) {}
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/30 mb-4">
              <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
            <p className="text-slate-400">Enter a new password for {email || "your account"}</p>
          </div>

          {/* Success Message */}
          {isSuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-emerald-400 text-sm flex items-center gap-3"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Password has been reset! Redirecting to login...</span>
            </motion.div>
          )}

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-6 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-400 text-sm flex items-center gap-3"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              <span>{error?.data?.message || "Something went wrong"}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition"
              />
              <p className="text-xs text-slate-500 mt-1">Must be at least 8 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
              <input
                type="password"
                value={password_confirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
                minLength={8}
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="w-full rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white py-3 px-6 font-medium hover:shadow-lg hover:shadow-purple-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Resetting...
                </span>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="text-center mt-6 pt-6 border-t border-slate-700">
            <a href="/login" className="text-sm text-slate-400 hover:text-purple-400 transition">
              ← Back to Login
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


