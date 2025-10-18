"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useLogoutMutation } from "../store/api";
import { clearAuth } from "../store/authSlice";

export default function Navbar() {
  const dispatch = useDispatch();
  const router = useRouter();
  const token = useSelector((s) => s.auth.token);
  const user = useSelector((s) => s.auth.user);
  const [logout] = useLogoutMutation();
  const [mounted, setMounted] = useState(false);
  const [hasLoggedIn, setHasLoggedIn] = useState(false);

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


