"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useGetWalletQuery, useGetPositionsQuery } from "../store/api";
import { useSelector } from "react-redux";
import { getEcho } from "../lib/echo";

export default function WalletDisplay() {
  const { data: wallet, isLoading, error } = useGetWalletQuery();
  const { data: positions = [] } = useGetPositionsQuery();
  const [liveBalance, setLiveBalance] = useState(null);
  const [livePositions, setLivePositions] = useState([]);
  const userId = useSelector((s) => s.auth.user?.id);
  const token = useSelector((s) => s.auth.token);
  const user = useSelector((s) => s.auth.user);

  useEffect(() => {
    if (positions && positions.length >= 0) {
      setLivePositions([...positions]);
    }
  }, [positions.length]);

  useEffect(() => {
    if (wallet) {
      setLiveBalance(parseFloat(wallet.balance));
    }
  }, [wallet]);

  useEffect(() => {
    if (!userId || !token) return;

    const echo = getEcho(token);
    if (!echo) return;

    const walletChannel = echo.private(`wallet.${userId}`);
    const positionsChannel = echo.private(`positions.${userId}`);

    walletChannel.listen('.wallet.updated', (data) => {
      console.log('Wallet update received:', data);
      setLiveBalance(parseFloat(data.balance));
    });

    positionsChannel.listen('.position.updated', (data) => {
      console.log('Position update for wallet:', data);
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
      walletChannel.stopListening('.wallet.updated');
      positionsChannel.stopListening('.position.updated');
      echo.leave(`wallet.${userId}`);
      echo.leave(`positions.${userId}`);
    };
  }, [userId, token]);

  if (isLoading) {
    return (
      <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-slate-700 rounded w-20 mb-2"></div>
          <div className="h-6 bg-slate-700 rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (error?.status === 403) {
    return (
      <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-lg p-4">
        <div className="text-xs font-medium text-yellow-400 mb-1">Email Not Verified</div>
        <div className="text-sm text-yellow-300">Please verify your email to view wallet</div>
      </div>
    );
  }

  const baseBalance = liveBalance !== null ? liveBalance : (wallet?.balance ? parseFloat(wallet.balance) : 0);
  
  // Calculate unrealized P&L from open positions
  const unrealizedPnL = livePositions
    .filter(p => p.status === 'open')
    .reduce((sum, p) => sum + parseFloat(p.profit_loss || 0), 0);
  
  const totalBalance = baseBalance + unrealizedPnL;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/30 rounded-lg p-4"
    >
      <div className="text-xs font-medium text-emerald-400 mb-1">Wallet Balance</div>
      <motion.div
        key={totalBalance}
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        className="text-2xl font-bold text-white"
      >
        ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </motion.div>
      <div className="flex items-center justify-between mt-2">
        <div className="text-xs text-slate-400">{wallet?.currency || "USD"}</div>
        {unrealizedPnL !== 0 && (
          <motion.div
            key={unrealizedPnL}
            initial={{ scale: 1.2 }}
            animate={{ scale: 1 }}
            className={`text-xs font-semibold ${unrealizedPnL >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
          >
            {unrealizedPnL >= 0 ? '+' : ''}${unrealizedPnL.toFixed(2)} P&L
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

