import { NewsItem } from '../utils/types';
import { ExternalLink, Newspaper } from 'lucide-react';

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function LatestNews({ items, loading }: { items: NewsItem[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="rounded-2xl bg-slate-900/80 border border-slate-700/50 p-6">
        <div className="h-6 w-48 bg-slate-800 rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-16 bg-slate-800/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-700/50 p-6 backdrop-blur-sm">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <div className="w-1.5 h-5 rounded-full bg-rose-400" />
        Latest Crypto News
      </h2>
      <div className="space-y-2">
        {items.slice(0, 5).map((item, idx) => (
          <a
            key={item.hash || idx}
            href={item.link}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-start gap-3 p-3 rounded-xl hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-700/50"
          >
            <div className="mt-0.5 p-2 rounded-lg bg-slate-800 border border-slate-700/50 group-hover:border-cyan-500/30 transition-colors">
              <Newspaper className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 transition-colors" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-200 group-hover:text-white transition-colors line-clamp-2">
                {item.title}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-xs text-slate-500">{item.source}</span>
                <span className="text-xs text-slate-600">|</span>
                <span className="text-xs text-slate-500">{timeAgo(item.pubDate)}</span>
              </div>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors mt-1 shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
}
