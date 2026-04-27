import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { HourlyPrice } from '../utils/types';

const COIN_COLORS: Record<string, string> = {
  btc: '#06b6d4',
  eth: '#3b82f6',
  bnb: '#f59e0b',
};

const COIN_LABELS: Record<string, string> = {
  btc: 'BTC',
  eth: 'ETH',
  bnb: 'BNB',
};

export default function PriceChart({ data, loading }: { data: HourlyPrice[]; loading: boolean }) {
  const [selectedCoin, setSelectedCoin] = useState<string>('btc');

  if (loading) {
    return (
      <div className="rounded-2xl bg-slate-900/80 border border-slate-700/50 p-6">
        <div className="h-6 w-48 bg-slate-800 rounded animate-pulse mb-4" />
        <div className="h-64 bg-slate-800/50 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-700/50 p-6 backdrop-blur-sm">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <div className="w-1.5 h-5 rounded-full bg-blue-400" />
          Hourly Price Chart
        </h2>
        <div className="flex gap-1.5">
          {Object.keys(COIN_COLORS).map((coin) => (
            <button
              key={coin}
              onClick={() => setSelectedCoin(coin)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCoin === coin
                  ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  : 'bg-slate-800 text-slate-400 border border-slate-700/50 hover:text-white'
              }`}
            >
              {COIN_LABELS[coin]}
            </button>
          ))}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="hour"
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
          />
          <YAxis
            tick={{ fill: '#64748b', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#334155' }}
            tickFormatter={(v) => {
              if (selectedCoin === 'btc') return `${(v / 1000).toFixed(0)}K`;
              if (selectedCoin === 'eth') return `${v.toFixed(0)}`;
              return `${v.toFixed(0)}`;
            }}
            domain={['auto', 'auto']}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '12px',
              color: '#e2e8f0',
              fontSize: 12,
            }}
            labelStyle={{ color: '#94a3b8' }}
            formatter={(value: number) => [
              `$${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}`,
              COIN_LABELS[selectedCoin],
            ]}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey={selectedCoin}
            stroke={COIN_COLORS[selectedCoin]}
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
            name={COIN_LABELS[selectedCoin]}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
