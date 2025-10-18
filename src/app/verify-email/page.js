"use client";

import { useEffect, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useResendEmailMutation, useVerifyEmailQuery } from "../../store/api";
import { motion } from "framer-motion";

export default function VerifyEmailPage() {
  const params = useSearchParams();
  const router = useRouter();
  const args = useMemo(() => ({
    id: params.get("id"),
    hash: params.get("hash"),
    expires: params.get("expires"),
    signature: params.get("signature"),
  }), [params]);

  const shouldCall = Boolean(args.id && args.hash && args.expires && args.signature);
  const { data, isFetching, error: verifyError, isSuccess: verifySuccess } = useVerifyEmailQuery(args, { skip: !shouldCall });
  const [resend, { isLoading, isSuccess, error }] = useResendEmailMutation();

  useEffect(() => {
    if (verifySuccess) {
      const t = setTimeout(() => router.replace("/login"), 1200);
      return () => clearTimeout(t);
    }
  }, [verifySuccess, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg"
      >
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-8 shadow-xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-4">
              <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Verify Your Email</h1>
            <p className="text-slate-400">We sent a verification link to your inbox</p>
          </div>

          {/* Status Messages */}
          {verifySuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 text-emerald-400 text-sm mb-6 flex items-center gap-3"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Your email has been verified! Redirecting to login...</span>
            </motion.div>
          )}
          
          {verifyError && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 px-4 py-3 text-yellow-400 text-sm mb-6 flex items-center gap-3"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>The verification link is invalid or expired. You can resend below.</span>
            </motion.div>
          )}
          
          {!shouldCall && !verifySuccess && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-lg border border-blue-500/50 bg-blue-500/10 px-4 py-3 text-blue-400 text-sm mb-6 flex items-center gap-3"
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Please check your email for a link to verify your account.</span>
            </motion.div>
          )}
          
          {isFetching && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-lg border border-slate-600 bg-slate-700/50 px-4 py-3 text-slate-300 text-sm mb-6 flex items-center gap-3"
            >
              <svg className="w-5 h-5 flex-shrink-0 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Verifying your email...</span>
            </motion.div>
          )}

          {/* Resend Button */}
          <div className="flex items-center justify-center">
            <button
              onClick={() => resend()}
              disabled={isLoading}
              className="w-full rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-3 px-6 font-medium hover:shadow-lg hover:shadow-emerald-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Sending...
                </span>
              ) : (
                "Resend Verification Email"
              )}
            </button>
          </div>

          {/* Success/Error Messages */}
          {isSuccess && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-emerald-400 text-sm mt-4"
            >
              ✓ Verification email sent successfully!
            </motion.p>
          )}
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center text-red-400 text-sm mt-4"
            >
              {error?.data?.message || "Something went wrong"}
            </motion.p>
          )}

          {/* Back to Login */}
          <div className="text-center mt-6 pt-6 border-t border-slate-700">
            <a href="/login" className="text-sm text-slate-400 hover:text-emerald-400 transition">
              ← Back to Login
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


