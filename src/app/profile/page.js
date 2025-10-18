"use client";

import { useEffect, useState } from "react";
import { useMeQuery, useLogoutMutation, useResendEmailMutation } from "../../store/api";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { clearAuth } from "../../store/authSlice";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const router = useRouter();
  const token = useSelector((s) => s.auth.token);
  const { data: me, isLoading } = useMeQuery(undefined, { skip: !token });
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [resendEmail, { isLoading: isResending, isSuccess: resendSuccess }] = useResendEmailMutation();
  const dispatch = useDispatch();
  const [showResendSuccess, setShowResendSuccess] = useState(false);

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);

  const onLogout = async () => {
    try {
      await logout().unwrap();
    } catch (_) {}
    dispatch(clearAuth());
    localStorage.removeItem('has_logged_in');
    router.replace("/login");
  };

  const handleResendEmail = async () => {
    try {
      await resendEmail().unwrap();
      setShowResendSuccess(true);
      setTimeout(() => setShowResendSuccess(false), 5000);
    } catch (err) {
      console.error("Resend failed:", err);
    }
  };

  useEffect(() => {
    if (resendSuccess) {
      setShowResendSuccess(true);
      const timer = setTimeout(() => setShowResendSuccess(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [resendSuccess]);

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-12">
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-3xl"
      >
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Profile</h1>
          <p className="text-slate-400 mt-2">Manage your account information</p>
        </div>

        <div className="grid gap-6">
          {/* Account Info Card */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Account Information
              </h2>
              <button
                onClick={onLogout}
                disabled={isLoggingOut}
                className="px-4 py-2 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm font-medium hover:bg-red-500/20 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoggingOut ? "Logging out..." : "Logout"}
              </button>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                <div className="animate-pulse">
                  <div className="h-4 bg-slate-700 rounded w-1/4 mb-2"></div>
                  <div className="h-6 bg-slate-700 rounded w-3/4"></div>
                </div>
                <div className="animate-pulse">
                  <div className="h-4 bg-slate-700 rounded w-1/4 mb-2"></div>
                  <div className="h-6 bg-slate-700 rounded w-2/3"></div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
                  <div className="text-lg text-white font-medium">{me?.name || "N/A"}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                  <div className="text-lg text-white font-medium">{me?.email || "N/A"}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Email Verification</label>
                  <div className="flex items-center gap-3">
                    {me?.email_verified_at ? (
                      <>
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-sm font-medium">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Verified
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-400 text-sm font-medium">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                          </svg>
                          Not Verified
                        </span>
                        <button
                          onClick={handleResendEmail}
                          disabled={isResending}
                          className="px-4 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isResending ? 'Sending...' : 'Resend Email'}
                        </button>
                      </>
                    )}
                  </div>
                  {showResendSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 text-sm text-emerald-400"
                    >
                      ✓ Verification email sent successfully!
                    </motion.div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Member Since</label>
                  <div className="text-lg text-white font-medium">
                    {me?.created_at ? new Date(me.created_at).toLocaleDateString() : "N/A"}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Quick Actions
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <a
                href="/trading"
                className="flex items-center gap-3 p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition group"
              >
                <div className="p-2 rounded-lg bg-emerald-500/20 group-hover:bg-emerald-500/30 transition">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-white">Start Trading</div>
                  <div className="text-xs text-slate-400">Open new positions</div>
                </div>
              </a>
              <a
                href="/forgot-password"
                className="flex items-center gap-3 p-4 rounded-lg bg-slate-700/30 border border-slate-600 hover:bg-slate-700/50 transition group"
              >
                <div className="p-2 rounded-lg bg-slate-700/50 group-hover:bg-slate-700/70 transition">
                  <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-white">Change Password</div>
                  <div className="text-xs text-slate-400">Update your password</div>
                </div>
              </a>
            </div>
          </div>
        </div>
      </motion.main>
    </div>
  );
}
