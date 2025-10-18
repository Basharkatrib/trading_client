"use client";

import { useState } from "react";
import { useRegisterMutation } from "../../store/api";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password_confirmation, setPasswordConfirmation] = useState("");
  const [register, { isLoading, error }] = useRegisterMutation();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await register({ name, email, password, password_confirmation }).unwrap();
      router.push("/verify-email");
    } catch (_) {}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Create Account</h1>
            <p className="text-slate-400 mt-2">Start trading with $10,000 free balance</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm"
            >
              {error?.data?.message || "Registration failed. Please try again."}
            </motion.div>
          )}

          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="John Doe"
                className="w-full rounded-lg border border-slate-600 bg-slate-900/50 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

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
              <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-600 bg-slate-900/50 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Confirm Password</label>
              <input
                type="password"
                value={password_confirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full rounded-lg border border-slate-600 bg-slate-900/50 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 text-white py-3 font-semibold hover:from-emerald-600 hover:to-emerald-700 transition shadow-lg shadow-emerald-500/30 disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <div className="text-center text-sm text-slate-400 mt-6">
            Already have an account?
            <a href="/login" className="text-emerald-400 font-medium hover:text-emerald-300 ml-1 transition">
              Sign in
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
