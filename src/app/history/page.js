"use client";

import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { useGetPositionsQuery } from "../../store/api";
import { motion } from "framer-motion";

export default function HistoryPage() {
  const router = useRouter();
  const token = useSelector((s) => s.auth.token);
  const { data: positions = [], isLoading } = useGetPositionsQuery(undefined, { skip: !token });
  const [timeFilter, setTimeFilter] = useState("all"); // all, week, month, 3months

  useEffect(() => {
    if (!token) router.replace("/login");
  }, [token, router]);

  // Filter closed positions by time
  const filteredPositions = useMemo(() => {
    const closedPositions = positions.filter(p => p.status === 'closed');
    
    if (timeFilter === "all") return closedPositions;
    
    const now = new Date();
    const filterDate = new Date();
    
    switch (timeFilter) {
      case "week":
        filterDate.setDate(now.getDate() - 7);
        break;
      case "month":
        filterDate.setMonth(now.getMonth() - 1);
        break;
      case "3months":
        filterDate.setMonth(now.getMonth() - 3);
        break;
      default:
        return closedPositions;
    }
    
    return closedPositions.filter(p => new Date(p.closed_at) >= filterDate);
  }, [positions, timeFilter]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalTrades = filteredPositions.length;
    const profitableTrades = filteredPositions.filter(p => parseFloat(p.profit_loss) > 0).length;
    const losingTrades = filteredPositions.filter(p => parseFloat(p.profit_loss) < 0).length;
    const totalPnL = filteredPositions.reduce((sum, p) => sum + parseFloat(p.profit_loss || 0), 0);
    const winRate = totalTrades > 0 ? (profitableTrades / totalTrades * 100) : 0;
    
    return { totalTrades, profitableTrades, losingTrades, totalPnL, winRate };
  }, [filteredPositions]);

  if (!token) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-12 py-12">
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-7xl"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Trading History</h1>
          <p className="text-slate-400">View your past trading performance</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
            <div className="text-sm text-slate-400 mb-1">Total Trades</div>
            <div className="text-2xl font-bold text-white">{stats.totalTrades}</div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
            <div className="text-sm text-slate-400 mb-1">Profitable</div>
            <div className="text-2xl font-bold text-emerald-400">{stats.profitableTrades}</div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
            <div className="text-sm text-slate-400 mb-1">Losing</div>
            <div className="text-2xl font-bold text-red-400">{stats.losingTrades}</div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
            <div className="text-sm text-slate-400 mb-1">Win Rate</div>
            <div className="text-2xl font-bold text-cyan-400">{stats.winRate.toFixed(1)}%</div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
            <div className="text-sm text-slate-400 mb-1">Total P&L</div>
            <div className={`text-2xl font-bold ${stats.totalPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              ${stats.totalPnL.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Time Filter */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 mb-6">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setTimeFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                timeFilter === "all"
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setTimeFilter("week")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                timeFilter === "week"
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              Last Week
            </button>
            <button
              onClick={() => setTimeFilter("month")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                timeFilter === "month"
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              Last Month
            </button>
            <button
              onClick={() => setTimeFilter("3months")}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                timeFilter === "3months"
                  ? "bg-emerald-500 text-white"
                  : "bg-slate-700 text-slate-300 hover:bg-slate-600"
              }`}
            >
              Last 3 Months
            </button>
          </div>
        </div>

        {/* Positions Table */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-8 text-center text-slate-400">Loading history...</div>
            ) : filteredPositions.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="w-16 h-16 mx-auto mb-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-slate-400">No trading history found for this period</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-slate-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Symbol</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Type</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Entry</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Exit</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">Quantity</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">SL</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">TP</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-400 uppercase">P&L</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400 uppercase">Closed At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredPositions.map((position) => (
                    <motion.tr
                      key={position.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-slate-700/30 transition"
                    >
                      <td className="px-4 py-3 text-sm font-medium text-white">{position.symbol}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded ${
                          position.type === 'BUY' 
                            ? 'bg-emerald-500/20 text-emerald-400' 
                            : 'bg-red-500/20 text-red-400'
                        }`}>
                          {position.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-slate-300">
                        ${parseFloat(position.entry_price).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-slate-300">
                        ${parseFloat(position.current_price).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-slate-300">
                        {parseFloat(position.quantity).toFixed(4)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-slate-400">
                        {position.stop_loss ? `$${parseFloat(position.stop_loss).toFixed(2)}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right text-slate-400">
                        {position.take_profit ? `$${parseFloat(position.take_profit).toFixed(2)}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-medium">
                        <span className={parseFloat(position.profit_loss) >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                          {parseFloat(position.profit_loss) >= 0 ? '+' : ''}${parseFloat(position.profit_loss).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-400">
                        {new Date(position.closed_at).toLocaleString()}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </motion.main>
    </div>
  );
}

