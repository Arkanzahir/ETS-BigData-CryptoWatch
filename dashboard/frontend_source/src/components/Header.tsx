import { useState, useEffect } from 'react';
import { Activity } from 'lucide-react';

export default function Header() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border border-cyan-500/20 p-6 mb-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-cyan-500/10 via-transparent to-blue-500/5" />
      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
            <Activity className="w-7 h-7 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Crypto Big Data Dashboard
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">Real-time Analytics & News Monitoring</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/80 border border-slate-700/50">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-emerald-400 font-medium">LIVE</span>
          </div>
          <div className="px-4 py-2 rounded-lg bg-slate-800/80 border border-slate-700/50">
            <span className="text-sm font-mono text-slate-300">
              {time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
            </span>
            <span className="text-sm font-mono text-cyan-400 ml-2">
              {time.toLocaleTimeString('en-US', { hour12: false })}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
