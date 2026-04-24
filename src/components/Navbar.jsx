"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useLogoutMutation } from "../store/api";
import { clearAuth } from "../store/authSlice";
// Firebase (web v9 modular)
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";

export default function Navbar() {
  const dispatch = useDispatch();
  const router = useRouter();
  const token = useSelector((s) => s.auth.token);
  const user = useSelector((s) => s.auth.user);
  const [logout] = useLogoutMutation();
  const [mounted, setMounted] = useState(false);
  const [hasLoggedIn, setHasLoggedIn] = useState(false);

  // Lazy init Firebase app using env vars (Next.js public env)
  const getFirebaseAuth = () => {
    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    return getAuth(app);
  };

  const handleGoogleSignIn = async () => {
    try {
      const auth = getFirebaseAuth();
      // تأكد من تسجيل الخروج لتجديد التوكن وعدم استخدام جلسة قديمة
      try { await auth.signOut(); } catch (_) {}
      const provider = new GoogleAuthProvider();
      const { user: fbUser } = await signInWithPopup(auth, provider);
      console.log('firebase uid:', fbUser?.uid);
      const idToken = await fbUser.getIdToken(true);
      console.log('idToken:', idToken);
      const idTokenResult = await fbUser.getIdTokenResult(true);
      console.log('aud:', idTokenResult.claims.aud, 'iss:', idTokenResult.claims.iss);

      // Call backend Laravel endpoint
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || "https://cadeau.test"}/api/auth/firebase/google-sign-in`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_token: idToken }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Google sign-in failed");

      // Basic confirmation for now (integrate with your auth store as needed)
      localStorage.setItem("has_logged_in", "true");
      setHasLoggedIn(true);
      console.log("Google sign-in success:", data);
      router.push("/profile");
    } catch (err) {
      console.error("Google sign-in error:", err);
      alert(`Google sign-in error: ${err.message || err}`);
    }
  };

  useEffect(() => {
    setMounted(true);
    // Check if user has logged in (not just registered)
    const loginFlag = localStorage.getItem('has_logged_in');
    setHasLoggedIn(loginFlag === 'true');
  }, []);

  useEffect(() => {
    // Update login flag when token changes
    if (token && user) {
      const loginFlag = localStorage.getItem('has_logged_in');
      setHasLoggedIn(loginFlag === 'true');
    } else {
      setHasLoggedIn(false);
    }
  }, [token, user]);

  const handleLogout = async () => {
    try {
      await logout().unwrap();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      dispatch(clearAuth());
      localStorage.removeItem('has_logged_in');
      setHasLoggedIn(false);
      router.push("/login");
    }
  };

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="sticky top-0 z-30 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-lg"
    >
      <div className="mx-auto max-w-7xl px-12 py-4 flex items-center justify-between">
        <a href="/" className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Trading Platform
        </a>
        <nav className="flex items-center gap-6 text-sm">
          <a className="text-slate-300 hover:text-white transition-colors" href="/">Home</a>
          
          {!mounted ? (
            // Show placeholder during SSR to match initial render
            <>
              <a className="text-slate-300 hover:text-white transition-colors" href="/login">Login</a>
              <a className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium hover:shadow-lg hover:shadow-emerald-500/50 transition-all" href="/register">
                Register
              </a>
            </>
          ) : (
            <>
              {token && (
                <>
                  <a className="text-slate-300 hover:text-white transition-colors" href="/trading">Trading</a>
                  <a className="text-slate-300 hover:text-white transition-colors" href="/history">History</a>
                </>
              )}
              
              {!token ? (
                <>
                  <a className="text-slate-300 hover:text-white transition-colors" href="/login">Login</a>
                  <a className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-medium hover:shadow-lg hover:shadow-emerald-500/50 transition-all" href="/register">
                    Register
                  </a>
                  <button
                    onClick={handleGoogleSignIn}
                    className="px-4 py-2 rounded-lg border border-slate-700 text-slate-200 hover:bg-slate-800 transition-all flex items-center gap-2"
                    aria-label="Continue with Google"
                    title="Continue with Google"
                  >
                    <svg viewBox="0 0 533.5 544.3" className="w-4 h-4" xmlns="http://www.w3.org/2000/svg"><path fill="#4285F4" d="M533.5 278.4c0-18.6-1.7-37.1-5-55H272v104.2h147.1c-6.4 34.6-26.1 64-55.5 83.6v69.4h89.7c52.5-48.3 80.2-119.6 80.2-202.2z"/><path fill="#34A853" d="M272 544.3c72.8 0 134-24.1 178.6-65.7l-89.7-69.4c-24.9 16.7-56.8 26.5-88.9 26.5-68.3 0-126.3-46.1-147.1-108.1H32.4v67.9C76.3 492.8 168.6 544.3 272 544.3z"/><path fill="#FBBC05" d="M124.9 327.6c-10.8-32.2-10.8-67.1 0-99.3v-67.9H32.4c-43.1 86.2-43.1 189.1 0 275l92.5-67.8z"/><path fill="#EA4335" d="M272 106.7c37.4-.6 73.4 13.3 100.8 39.2l75.2-75.2C401.7 24.9 338 0 272 0 168.6 0 76.3 51.5 32.4 147.9l92.5 67.9C145.7 153 203.7 106.7 272 106.7z"/></svg>
                    Continue with Google
                  </button>
                </>
              ) : (
                <>
                  {hasLoggedIn ? (
                    <>
                      <a className="text-slate-300 hover:text-white transition-colors flex items-center gap-2" href="/profile">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-medium">{user?.name || "Profile"}</span>
                      </a>
                      <button
                        onClick={handleLogout}
                        className="px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-red-600 text-white font-medium hover:shadow-lg hover:shadow-red-500/50 transition-all"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <a className="text-slate-300 hover:text-white transition-colors" href="/profile">Profile</a>
                  )}
                </>
              )}
            </>
          )}
        </nav>
      </div>
    </motion.header>
  );
}


