"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useOpenPositionMutation } from "../store/api";
import { getEcho } from "../lib/echo";

export default function OrderForm({ symbol }) {
  const [openPosition, { isLoading }] = useOpenPositionMutation();
  const [quantity, setQuantity] = useState("0.01");
  const [stopLoss, setStopLoss] = useState("");
  const [takeProfit, setTakeProfit] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentPrice, setCurrentPrice] = useState(null);

  // Listen to live prices
  useEffect(() => {
    const echo = getEcho();
    if (!echo) return;

    const channel = echo.channel('prices');
    
    const handlePriceUpdate = (data) => {
      const priceData = data.prices?.find(p => p.symbol === symbol);
      if (priceData) {
        setCurrentPrice(priceData.price);
      }
    };
    
    channel.listen('.price.updated', handlePriceUpdate);

    return () => {
      channel.stopListening('.price.updated', handlePriceUpdate);
    };
  }, [symbol]);

  const handleSubmit = async (type) => {
    setError("");
    setSuccess("");

    if (!currentPrice) {
      setError("Waiting for price data...");
      return;
    }

    const entryPrice = currentPrice;

    try {
      const payload = {
        symbol,
        type,
        entry_price: entryPrice,
        quantity: parseFloat(quantity),
      };

      if (stopLoss) payload.stop_loss = parseFloat(stopLoss);
      if (takeProfit) payload.take_profit = parseFloat(takeProfit);

      const result = await openPosition(payload).unwrap();
      setSuccess(`${type} position opened successfully!`);
      setQuantity("0.01");
      setStopLoss("");
      setTakeProfit("");
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      if (err?.status === 403 && err?.data?.email_verified === false) {
        setError("Please verify your email to open positions");
      } else {
        setError(err?.data?.message || "Failed to open position");
      }
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-white">Open Position</h3>
        {currentPrice && (
          <div className="text-sm">
            <span className="text-slate-400">Current Price: </span>
            <span className="text-white font-bold">${currentPrice.toFixed(2)}</span>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Quantity
          </label>
          <input
            type="number"
            step="0.0001"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
            placeholder="0.01"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Stop Loss (Optional)
          </label>
          <input
            type="number"
            step="0.01"
            value={stopLoss}
            onChange={(e) => setStopLoss(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-300 mb-2">
            Take Profit (Optional)
          </label>
          <input
            type="number"
            step="0.01"
            value={takeProfit}
            onChange={(e) => setTakeProfit(e.target.value)}
            className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-emerald-500"
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleSubmit("BUY")}
          disabled={isLoading}
          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Opening..." : "BUY"}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleSubmit("SELL")}
          disabled={isLoading}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Opening..." : "SELL"}
        </motion.button>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-red-500/20 border border-red-500 text-red-400 px-4 py-2 rounded-lg"
        >
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 bg-emerald-500/20 border border-emerald-500 text-emerald-400 px-4 py-2 rounded-lg"
        >
          {success}
        </motion.div>
      )}
    </div>
  );
}

