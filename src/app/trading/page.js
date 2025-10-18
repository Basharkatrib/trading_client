"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import TradingChart from "../../components/TradingChart";
import OrderForm from "../../components/OrderForm";
import PositionsTable from "../../components/PositionsTable";
import WalletDisplay from "../../components/WalletDisplay";

const AVAILABLE_PAIRS = [
  { symbol: "BTC/USD", name: "Bitcoin" },
  { symbol: "ETH/USD", name: "Ethereum" },
  { symbol: "XAU/USD", name: "Gold" },
  { symbol: "EUR/USD", name: "Euro" },
  { symbol: "GBP/USD", name: "British Pound" },
  { symbol: "JPY/USD", name: "Japanese Yen" },
];

export default function TradingPage() {
  const router = useRouter();
  const token = useSelector((s) => s.auth.token);
  const [selectedSymbol, setSelectedSymbol] = useState("BTC/USD");

  useEffect(() => {
    if (!token) {
      router.replace("/login");
    }
  }, [token, router]);

  if (!token) return null;

  return (
    <div className="min-h-screen overflow-y-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="mx-auto max-w-[1800px] px-12 py-10">
        <div className="flex gap-6">
          {/* Sidebar */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-64 flex-shrink-0"
          >
            <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4 sticky top-6">
              <h2 className="text-lg font-bold text-white mb-4">Currency Pairs</h2>
              <div className="space-y-2">
                {AVAILABLE_PAIRS.map((pair) => (
                  <button
                    key={pair.symbol}
                    onClick={() => setSelectedSymbol(pair.symbol)}
                    className={`w-full text-left px-3 py-2 rounded-lg transition-all ${
                      selectedSymbol === pair.symbol
                        ? "bg-emerald-500 text-white"
                        : "bg-slate-700/50 text-slate-300 hover:bg-slate-700"
                    }`}
                  >
                    <div className="font-semibold">{pair.symbol}</div>
                    <div className="text-xs opacity-75">{pair.name}</div>
                  </button>
                ))}
              </div>
              
              <div className="mt-6">
                <WalletDisplay />
              </div>
            </div>
          </motion.aside>

          {/* Main Content */}
          <div className="flex-1 space-y-6">
            {/* Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <TradingChart symbol={selectedSymbol} height={420}  />
            </motion.div>

            {/* Order Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <OrderForm symbol={selectedSymbol} />
            </motion.div>

            {/* Positions Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <PositionsTable />
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

