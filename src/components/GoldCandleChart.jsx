"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

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

export default function GoldCandleChart() {
  const containerRef = useRef(null);
  const seriesRef = useRef(null);
  const dataRef = useRef([]);
  const timerRef = useRef(null);
  const [currentPrice, setCurrentPrice] = useState(2300);
  const [priceChange, setPriceChange] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let chart;
    let series;
    let onResize;
    const container = containerRef.current;
    if (!container) return;

    (async () => {
      const { createChart } = await import("lightweight-charts");
      
      chart = createChart(container, {
        width: container.clientWidth,
        height: 440,
        layout: { 
          background: { color: "transparent" }, 
          textColor: "#94a3b8" 
        },
        grid: { 
          vertLines: { color: "#1e293b", style: 1 }, 
          horzLines: { color: "#1e293b", style: 1 } 
        },
        rightPriceScale: { 
          borderColor: "#334155",
          textColor: "#94a3b8",
        },
        timeScale: { 
          borderColor: "#334155",
          textColor: "#94a3b8",
        },
        crosshair: { 
          mode: 1,
          vertLine: { color: "#475569", width: 1, style: 3 },
          horzLine: { color: "#475569", width: 1, style: 3 },
        },
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

      onResize = () => chart.applyOptions({ width: container.clientWidth });
      window.addEventListener("resize", onResize);

      // Live updates: modify last candle every 1s; start a new candle every 10s
      let tick = 0;
      timerRef.current = setInterval(() => {
        if (!series || !dataRef.current.length) return;
        const d = dataRef.current;
        const last = d[d.length - 1];
        const noise = (Math.random() - 0.5) * 2;
        const nextClose = Math.max(1, last.close + noise);
        const nextHigh = Math.max(last.high, nextClose) + Math.random() * 0.5;
        const nextLow = Math.min(last.low, nextClose) - Math.random() * 0.5;
        const updated = { ...last, high: nextHigh, low: nextLow, close: nextClose };
        d[d.length - 1] = updated;
        series.update(updated);
        setCurrentPrice(nextClose);
        setPriceChange(nextClose - last.open);
        tick++;
        if (tick % 10 === 0) {
          // advance 1 day for new candle
          const lastDate = new Date(`${last.time}T00:00:00Z`);
          if (!isNaN(lastDate.getTime())) {
            lastDate.setUTCDate(lastDate.getUTCDate() + 1);
            const open = updated.close;
            const close = Math.max(1, open + (Math.random() - 0.5) * 5);
            const high = Math.max(open, close) + Math.random() * 3;
            const low = Math.min(open, close) - Math.random() * 3;
            const newCandle = { time: formatDate(lastDate), open, high, low, close };
            d.push(newCandle);
            series.update(newCandle);
          }
        }
      }, 1000);
    })();

    return () => {
      clearInterval(timerRef.current);
      if (onResize) window.removeEventListener("resize", onResize);
      if (chart) chart.remove();
    };
  }, [mounted]);

  if (!mounted) {
    return (
      <div className="relative">
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
          <div className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  Gold (XAU/USD)
                </h2>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-white">$2,300.00</span>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4">
            <div className="w-full flex items-center justify-center" style={{ height: 440 }}>
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
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                  Gold (XAU/USD)
                </h2>
              </motion.div>
              <motion.div
                key={currentPrice}
                initial={{ scale: 1.2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="flex items-baseline gap-2"
              >
                <span className="text-2xl font-bold text-white">
                  ${currentPrice.toFixed(2)}
                </span>
                <span className={`text-sm font-semibold ${priceChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                  {priceChange >= 0 ? '↑' : '↓'} ${Math.abs(priceChange).toFixed(2)}
                </span>
              </motion.div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-emerald-500 rounded"></div>
                <span className="text-xs text-slate-400">Bull</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-xs text-slate-400">Bear</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4">
          <div ref={containerRef} className="w-full" style={{ height: 440 }} />
        </div>

        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-emerald-500/5 blur-3xl rounded-full"></div>
          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-cyan-500/5 blur-3xl rounded-full"></div>
        </div>
      </div>
    </div>
  );
}


