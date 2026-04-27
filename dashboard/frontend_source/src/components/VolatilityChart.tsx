import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { HourlyVolatility } from '../utils/types';

const COIN_COLORS: Record<string, string> = {
  btc: '#06b6d4',
  eth: '#3b82f6',
  bnb: '#f59e0b',
};

export default function VolatilityChart({ data, loading }: { data: HourlyVolatility[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="rounded-2xl bg-slate-900/80 border border-slate-700/50 p-6">
        <div className="h-6 w-48 bg-slate-800 rounded animate-pulse mb-4" />
        <div className="h-64 bg-slate-800/50 rounded-lg animate-pulse" />
      </div>
    );
  }

  const maxBtc = Math.max(...data.map(d => d.btc));
  const maxEth = Math.max(...data.map(d => d.eth));
  const maxBnb = Math.max(...data.map(d => d.bnb));

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-700/50 p-6 backdrop-blur-sm">
      <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
        <div className="w-1.5 h-5 rounded-full bg-amber-400" />
        Hourly Volatility
      </h2>
      <p className="text-xs text-slate-500 mb-5">Absolute 24h change magnitude by hour</p>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
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
            tickFormatter={(v) => `${v.toFixed(1)}%`}
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
            cursor={{ fill: 'transparent' }}
            formatter={(value: number, name: string) => [
              `${value.toFixed(2)}%`,
              name.toUpperCase(),
            ]}
          />
          <Bar dataKey="btc" name="BTC" radius={[4, 4, 0, 0]} maxBarSize={12}>
            {data.map((entry, idx) => (
              <Cell
                key={idx}
                fill={entry.btc === maxBtc ? '#22d3ee' : COIN_COLORS.btc}
                opacity={entry.btc === maxBtc ? 1 : 0.6}
              />
            ))}
          </Bar>
          <Bar dataKey="eth" name="ETH" radius={[4, 4, 0, 0]} maxBarSize={12}>
            {data.map((entry, idx) => (
              <Cell
                key={idx}
                fill={entry.eth === maxEth ? '#60a5fa' : COIN_COLORS.eth}
                opacity={entry.eth === maxEth ? 1 : 0.6}
              />
            ))}
          </Bar>
          <Bar dataKey="bnb" name="BNB" radius={[4, 4, 0, 0]} maxBarSize={12}>
            {data.map((entry, idx) => (
              <Cell
                key={idx}
                fill={entry.bnb === maxBnb ? '#fbbf24' : COIN_COLORS.bnb}
                opacity={entry.bnb === maxBnb ? 1 : 0.6}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
