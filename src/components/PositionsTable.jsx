"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGetPositionsQuery, useClosePositionMutation } from "../store/api";
import { useSelector } from "react-redux";
import { getEcho } from "../lib/echo";

export default function PositionsTable() {
  const { data: positions = [], refetch } = useGetPositionsQuery();
  const [closePosition] = useClosePositionMutation();
  const [livePositions, setLivePositions] = useState([]);
  const userId = useSelector((s) => s.auth.user?.id);
  const token = useSelector((s) => s.auth.token);

  useEffect(() => {
    if (positions && positions.length >= 0) {
      setLivePositions([...positions]);
    }
  }, [positions.length]);

  useEffect(() => {
    if (!userId || !token) return;

    const echo = getEcho(token);
    if (!echo) return;

    const channel = echo.private(`positions.${userId}`);

    channel.listen(".position.updated", (data) => {
      console.log("Position update received:", data);
      setLivePositions((prev) => {
        const updated = [...prev];
        const index = updated.findIndex((p) => p.id === data.position.id);
        if (index !== -1) {
          updated[index] = data.position;
        }
        return updated;
      });
    });

    return () => {
      channel.stopListening(".position.updated");
      echo.leave(`positions.${userId}`);
    };
  }, [userId, token]);

  const handleClose = async (id) => {
    try {
      await closePosition(id).unwrap();
      refetch();
    } catch (err) {
      console.error("Failed to close position:", err);
    }
  };

  const openPositions = livePositions.filter((p) => p.status === "open");
  const closedPositions = livePositions.filter((p) => p.status === "closed").slice(0, 5);

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">Positions</h3>

      {/* Open Positions */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-slate-400 mb-3">Open Positions</h4>
        {openPositions.length === 0 ? (
          <p className="text-slate-500 text-center py-8">No open positions</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-slate-400 border-b border-slate-700">
                  <th className="pb-2">Symbol</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Entry</th>
                  <th className="pb-2">Current</th>
                  <th className="pb-2">Qty</th>
                  <th className="pb-2">SL</th>
                  <th className="pb-2">TP</th>
                  <th className="pb-2">P&L</th>
                  <th className="pb-2">Action</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {openPositions.map((pos) => (
                    <motion.tr
                      key={pos.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-slate-700/50 hover:bg-slate-700/30"
                    >
                      <td className="py-3 text-white font-medium">{pos.symbol}</td>
                      <td className="py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            pos.type === "BUY"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {pos.type}
                        </span>
                      </td>
                      <td className="py-3 text-slate-300">${parseFloat(pos.entry_price).toFixed(2)}</td>
                      <td className="py-3 text-slate-300">
                        ${pos.current_price ? parseFloat(pos.current_price).toFixed(2) : "-"}
                      </td>
                      <td className="py-3 text-slate-300">{parseFloat(pos.quantity).toFixed(4)}</td>
                      <td className="py-3 text-slate-300">
                        {pos.stop_loss ? `$${parseFloat(pos.stop_loss).toFixed(2)}` : "-"}
                      </td>
                      <td className="py-3 text-slate-300">
                        {pos.take_profit ? `$${parseFloat(pos.take_profit).toFixed(2)}` : "-"}
                      </td>
                      <td className="py-3">
                        <motion.span
                          key={pos.profit_loss}
                          initial={{ scale: 1.2 }}
                          animate={{ scale: 1 }}
                          className={`font-bold ${
                            parseFloat(pos.profit_loss) >= 0 ? "text-emerald-400" : "text-red-400"
                          }`}
                        >
                          {parseFloat(pos.profit_loss) >= 0 ? "+" : ""}$
                          {parseFloat(pos.profit_loss).toFixed(2)}
                        </motion.span>
                      </td>
                      <td className="py-3">
                        <button
                          onClick={() => handleClose(pos.id)}
                          className="bg-slate-700 hover:bg-slate-600 text-white text-xs px-3 py-1 rounded transition-colors"
                        >
                          Close
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Closed Positions */}
      {closedPositions.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-slate-400 mb-3">Recent Closed</h4>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-left text-xs text-slate-400 border-b border-slate-700">
                  <th className="pb-2">Symbol</th>
                  <th className="pb-2">Type</th>
                  <th className="pb-2">Entry</th>
                  <th className="pb-2">Exit</th>
                  <th className="pb-2">SL</th>
                  <th className="pb-2">TP</th>
                  <th className="pb-2">P&L</th>
                  <th className="pb-2">Closed At</th>
                </tr>
              </thead>
              <tbody>
                {closedPositions.map((pos) => (
                  <tr key={pos.id} className="border-b border-slate-700/50 text-sm">
                    <td className="py-2 text-slate-300">{pos.symbol}</td>
                    <td className="py-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs ${
                          pos.type === "BUY"
                            ? "bg-emerald-500/10 text-emerald-400"
                            : "bg-red-500/10 text-red-400"
                        }`}
                      >
                        {pos.type}
                      </span>
                    </td>
                    <td className="py-2 text-slate-400">${parseFloat(pos.entry_price).toFixed(2)}</td>
                    <td className="py-2 text-slate-400">
                      ${pos.current_price ? parseFloat(pos.current_price).toFixed(2) : "-"}
                    </td>
                    <td className="py-2 text-slate-400">
                      {pos.stop_loss ? `$${parseFloat(pos.stop_loss).toFixed(2)}` : "-"}
                    </td>
                    <td className="py-2 text-slate-400">
                      {pos.take_profit ? `$${parseFloat(pos.take_profit).toFixed(2)}` : "-"}
                    </td>
                    <td className="py-2">
                      <span
                        className={`font-semibold ${
                          parseFloat(pos.profit_loss) >= 0 ? "text-emerald-400" : "text-red-400"
                        }`}
                      >
                        {parseFloat(pos.profit_loss) >= 0 ? "+" : ""}$
                        {parseFloat(pos.profit_loss).toFixed(2)}
                      </span>
                    </td>
                    <td className="py-2 text-slate-400 text-xs">
                      {new Date(pos.closed_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

