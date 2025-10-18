"use client";

import GoldCandleChart from "../components/GoldCandleChart";
import LivePrices from "../components/LivePrices";
import { motion } from "framer-motion";

const marketData = [
  { symbol: "BTC/USD", price: "43,521.30", change: "+2.45%", isUp: true },
  { symbol: "ETH/USD", price: "2,287.90", change: "+1.87%", isUp: true },
  { symbol: "EUR/USD", price: "1.0892", change: "-0.23%", isUp: false },
  { symbol: "GBP/USD", price: "1.2654", change: "+0.45%", isUp: true },
];

const features = [
  {
    icon: "📊",
    title: "Real-time Charts",
    description: "Advanced charting tools with live market data and technical indicators"
  },
  {
    icon: "🔒",
    title: "Secure Trading",
    description: "Bank-level security with encrypted transactions and two-factor authentication"
  },
  {
    icon: "⚡",
    title: "Fast Execution",
    description: "Lightning-fast order execution with minimal slippage"
  },
  {
    icon: "📱",
    title: "Mobile Ready",
    description: "Trade on the go with our responsive mobile-friendly platform"
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-7xl px-12 py-12">
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10 text-center"
        >
          <h1 className="text-5xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent mb-3">
            Trading Platform
          </h1>
          <p className="text-gray-400 text-lg">Real-time gold price chart with live market data simulation</p>
        </motion.section>
        
        {/* Main Chart */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <GoldCandleChart />
        </motion.section>

        {/* Stats Cards */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-emerald-500/50 transition-colors">
            <div className="text-emerald-400 text-sm font-semibold mb-1">24H High</div>
            <div className="text-white text-2xl font-bold">$2,345.67</div>
            <div className="text-slate-400 text-xs mt-1">+3.2% from yesterday</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-red-500/50 transition-colors">
            <div className="text-red-400 text-sm font-semibold mb-1">24H Low</div>
            <div className="text-white text-2xl font-bold">$2,287.23</div>
            <div className="text-slate-400 text-xs mt-1">-1.8% from yesterday</div>
          </div>
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-cyan-500/50 transition-colors">
            <div className="text-cyan-400 text-sm font-semibold mb-1">Volume</div>
            <div className="text-white text-2xl font-bold">1,234.5K</div>
            <div className="text-slate-400 text-xs mt-1">Last 24 hours</div>
          </div>
        </motion.div>

        {/* Live Prices from Reverb */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-12"
        >
          <LivePrices />
        </motion.section>

        {/* Features Section */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.9 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Why Choose Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 hover:border-emerald-500/50 transition-all"
              >
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-400 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 1.3 }}
          className="mt-16 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-blue-500/10 border border-emerald-500/20 rounded-2xl p-12 text-center"
        >
          <h2 className="text-3xl font-bold text-white mb-4">Start Trading Today</h2>
          <p className="text-slate-400 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of traders worldwide. Open your account in minutes and start trading with confidence.
          </p>
          <div className="flex gap-4 justify-center">
            <a 
              href="/register"
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white font-semibold hover:shadow-lg hover:shadow-emerald-500/50 transition-all hover:scale-105"
            >
              Get Started
            </a>
            <a 
              href="/login"
              className="px-8 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white font-semibold hover:bg-slate-700 transition-all"
            >
              Sign In
            </a>
          </div>
        </motion.section>
      </div>
    </main>
  );
}
