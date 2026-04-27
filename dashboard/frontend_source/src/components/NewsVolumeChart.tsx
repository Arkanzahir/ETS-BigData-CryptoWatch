import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { NewsVolume } from '../utils/types';

export default function NewsVolumeChart({ data, loading }: { data: NewsVolume[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="rounded-2xl bg-slate-900/80 border border-slate-700/50 p-6">
        <div className="h-6 w-48 bg-slate-800 rounded animate-pulse mb-4" />
        <div className="h-64 bg-slate-800/50 rounded-lg animate-pulse" />
      </div>
    );
  }

  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-700/50 p-6 backdrop-blur-sm">
      <h2 className="text-lg font-semibold text-white mb-1 flex items-center gap-2">
        <div className="w-1.5 h-5 rounded-full bg-emerald-400" />
        News Volume
      </h2>
      <p className="text-xs text-slate-500 mb-5">Crypto news articles published per hour</p>
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
            allowDecimals={false}
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
            formatter={(value: number) => [`${value} articles`, 'News']}
          />
          <Bar dataKey="count" name="News" radius={[4, 4, 0, 0]} maxBarSize={20}>
            {data.map((entry, idx) => (
              <Cell
                key={idx}
                fill={entry.count === maxCount && maxCount > 0 ? '#34d399' : '#10b981'}
                opacity={entry.count === maxCount && maxCount > 0 ? 1 : 0.5}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
