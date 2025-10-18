"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getEcho } from "../lib/echo";

export default function LivePrices() {
  const [prices, setPrices] = useState([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const echo = getEcho();
    if (!echo) return;

    console.log('Connecting to prices channel...');
    const channel = echo.channel('prices');
    
    // Try listening to all events
    channel.listen('.price.updated', (data) => {
      console.log('Received .price.updated:', data);
      setPrices(data.prices);
      setIsConnected(true);
    });
    
    channel.listen('PriceUpdated', (data) => {
      console.log('Received PriceUpdated:', data);
      setPrices(data.prices);
      setIsConnected(true);
    });
    
    channel.listen('App\\Events\\PriceUpdated', (data) => {
      console.log('Received App\\Events\\PriceUpdated:', data);
      setPrices(data.prices);
      setIsConnected(true);
    });

    channel.subscribed(() => {
      console.log('Successfully subscribed to prices channel');
    });

    channel.error((error) => {
      console.error('Channel error:', error);
    });

    return () => {
      channel.stopListening('price.updated');
      echo.leaveChannel('prices');
    };
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Live Market Prices</h2>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}`}></div>
          <span className="text-sm text-slate-400">
            {isConnected ? 'Connected' : 'Connecting...'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {prices.map((item) => (
            <motion.div
              key={item.symbol}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-5 hover:border-slate-600 transition-all"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="text-slate-400 text-sm font-medium">{item.symbol}</div>
                <motion.div
                  key={item.changePercent}
                  initial={{ scale: 1.3, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`text-xs font-semibold px-2 py-1 rounded ${
                    item.changePercent >= 0 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}
                >
                  {item.changePercent >= 0 ? '↑' : '↓'} {Math.abs(item.changePercent).toFixed(2)}%
                </motion.div>
              </div>
              
              <motion.div
                key={item.price}
                initial={{ scale: 1.1, color: item.change >= 0 ? '#10b981' : '#ef4444' }}
                animate={{ scale: 1, color: '#ffffff' }}
                transition={{ duration: 0.5 }}
                className="text-2xl font-bold text-white mb-2"
              >
                ${item.price.toLocaleString()}
              </motion.div>
              
              <div className={`text-sm font-medium ${
                item.change >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {item.change >= 0 ? '+' : ''}{item.change.toFixed(4)}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {!isConnected && prices.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mb-4"></div>
          <p className="text-slate-400">Waiting for live data...</p>
        </div>
      )}
    </div>
  );
}

