"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { getEcho } from "../lib/echo";

function formatDate(d) {
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function generateInitialData(count = 60, start = 2300) {
  const candles = [];
  let date = new Date();
  date.setUTCDate(date.getUTCDate() - count);
  let price = start;
  for (let i = 0; i < count; i++) {
    const o = price;
    const delta = (Math.random() - 0.5) * 10;
    const c = Math.max(1, o + delta);
    const h = Math.max(o, c) + Math.random() * 5;
    const l = Math.min(o, c) - Math.random() * 5;
    candles.push({ time: formatDate(date), open: o, high: h, low: l, close: c });
    date.setUTCDate(date.getUTCDate() + 1);
    price = c;
  }
  return candles;
}

export default function TradingChart({ symbol, height }) {
  const containerRef = useRef(null);
  const seriesRef = useRef(null);
  const dataRef = useRef([]);
  const timerRef = useRef(null);
  const resizeObserverRef = useRef(null);
  const currentPriceRef = useRef(2300);
  const priceChangeRef = useRef(0);
  const [currentPrice, setCurrentPrice] = useState(2300);
  const [priceChange, setPriceChange] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen to live prices from Reverb
  useEffect(() => {
    if (!mounted) return;
    
    const echo = getEcho();
    if (!echo) return;

    const channel = echo.channel('prices');
    
    const handlePriceUpdate = (data) => {
      const priceData = data.prices?.find(p => p.symbol === symbol);
      if (priceData && dataRef.current.length > 0) {
        const series = seriesRef.current;
        if (!series) return;

        const d = dataRef.current;
        const last = d[d.length - 1];
        const newPrice = priceData.price;
        
        // Update current candle with new price
        const updated = { 
          time: last.time, 
          open: last.open, 
          high: Math.max(last.high, newPrice), 
          low: Math.min(last.low, newPrice), 
          close: newPrice 
        };
        d[d.length - 1] = updated;
        series.update(updated);
        
        currentPriceRef.current = newPrice;
        priceChangeRef.current = newPrice - last.open;
        
        // Update state
        setCurrentPrice(newPrice);
        setPriceChange(newPrice - last.open);
      }
    };
    
    channel.listen('.price.updated', handlePriceUpdate);

    return () => {
      channel.stopListening('.price.updated', handlePriceUpdate);
    };
  }, [symbol, mounted]);

  useEffect(() => {
    if (!mounted) return;
    let chart;
    let series;
    let onResize;
    const container = containerRef.current;
    if (!container) return;

    (async () => {
      const { createChart } = await import("lightweight-charts");
      
      const computeHeight = () => {
        if (typeof height === 'number') return height;
        // Responsive auto-height: 60% of width clamped between 260 and 520
        const h = Math.round(container.clientWidth * 0.6);
        return Math.max(260, Math.min(520, h));
      };

      chart = createChart(container, {
        width: container.clientWidth,
        height: computeHeight(),
        layout: { background: { color: "#111827" }, textColor: "#94a3b8" },
        grid: { vertLines: { color: "#1e293b", style: 1 }, horzLines: { color: "#1e293b", style: 1 } },
        rightPriceScale: { borderColor: "#334155", textColor: "#94a3b8" },
        timeScale: { borderColor: "#334155", textColor: "#94a3b8" },
        crosshair: { mode: 1, vertLine: { color: "#475569", width: 1, style: 3 }, horzLine: { color: "#475569", width: 1, style: 3 } },
      });

      series = chart.addCandlestickSeries({
        upColor: "#10b981",
        downColor: "#ef4444",
        wickUpColor: "#10b981",
        wickDownColor: "#ef4444",
        borderUpColor: "#10b981",
        borderDownColor: "#ef4444",
      });
      
      seriesRef.current = series;
      dataRef.current = generateInitialData();
      series.setData(dataRef.current);
      chart.timeScale().fitContent();

      // Keep chart responsive to container width (and recompute height)
      onResize = () => {
        chart.applyOptions({ width: container.clientWidth, height: computeHeight() });
      };
      window.addEventListener("resize", onResize);

      // ResizeObserver for container resize (e.g., orientation, layout changes)
      resizeObserverRef.current = new ResizeObserver(() => onResize());
      resizeObserverRef.current.observe(container);

      // Apply once on mount
      onResize();

      // Create new candle every 10 seconds
      let candleCount = 0;
      timerRef.current = setInterval(() => {
        if (!series || !dataRef.current.length) return;
        const d = dataRef.current;
        const last = d[d.length - 1];
        
        candleCount++;
        if (candleCount >= 10) {
          // Create new candle
          const lastDate = new Date(`${last.time}T00:00:00Z`);
          if (!isNaN(lastDate.getTime())) {
            lastDate.setUTCDate(lastDate.getUTCDate() + 1);
            const open = last.close;
            const newCandle = { 
              time: formatDate(lastDate), 
              open, 
              high: open, 
              low: open, 
              close: open 
            };
            d.push(newCandle);
            series.update(newCandle);
            candleCount = 0;
          }
        }
      }, 1000);
    })();

    return () => {
      clearInterval(timerRef.current);
      if (onResize) window.removeEventListener("resize", onResize);
      if (resizeObserverRef.current) {
        try { resizeObserverRef.current.disconnect(); } catch (e) {}
        resizeObserverRef.current = null;
      }
      if (chart) chart.remove();
    };
  }, [symbol, mounted]);

  if (!mounted) {
    return (
      <div className="relative">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
          <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  {symbol}
                </h2>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">Loading...</span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="w-full flex items-center justify-center" style={{ height: 500 }}>
              <div className="text-slate-400">Loading chart...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
        <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  {symbol}
                </h2>
              </motion.div>
              <motion.div key={currentPrice} initial={{ scale: 1.2, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }} className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-white">${currentPrice.toFixed(2)}</span>
                <span className={`text-sm font-semibold ${priceChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {priceChange >= 0 ? '↑' : '↓'} ${Math.abs(priceChange).toFixed(2)}
                </span>
              </motion.div>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div ref={containerRef} className="w-full" style={{ height: height || 'auto' }} />
        </div>
      </div>
    </div>
  );
}

