import { CryptoPrice } from '../utils/types';
import { TrendingUp, TrendingDown } from 'lucide-react';

function formatUSD(n: number) {
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
}

function formatIDR(n: number) {
  return 'Rp ' + n.toLocaleString('id-ID', { maximumFractionDigits: 0 });
}

const COIN_IMAGES: Record<string, string> = {
  BTC: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png',
  ETH: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png',
  BNB: 'https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png',
};

export default function CryptoPriceTable({ data, loading }: { data: CryptoPrice[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="rounded-2xl bg-slate-900/80 border border-slate-700/50 p-6">
        <div className="h-6 w-48 bg-slate-800 rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-14 bg-slate-800/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-700/50 p-6 backdrop-blur-sm">
      <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
        <div className="w-1.5 h-5 rounded-full bg-cyan-400" />
        Real-Time Crypto Prices
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-800">
              <th className="text-left pb-3 pr-4">Symbol</th>
              <th className="text-right pb-3 pr-4">Price (USD)</th>
              <th className="text-right pb-3 pr-4">Price (IDR)</th>
              <th className="text-right pb-3">Change 24h</th>
            </tr>
          </thead>
          <tbody>
            {data.map((coin) => {
              const isUp = coin.change_24h >= 0;
              return (
                <tr
                  key={coin.symbol}
                  className="border-b border-slate-800/50 last:border-0 hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700/50 flex items-center justify-center overflow-hidden">
                        <img
                          src={COIN_IMAGES[coin.symbol] || ''}
                          alt={coin.symbol}
                          className="w-6 h-6 object-contain"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = `<span class="text-sm font-bold text-cyan-400">${coin.symbol[0]}</span>`;
                          }}
                        />
                      </div>
                      <div>
                        <span className="font-semibold text-white">{coin.symbol}</span>
                        <span className="block text-xs text-slate-500">
                          {coin.symbol === 'BTC' ? 'Bitcoin' : coin.symbol === 'ETH' ? 'Ethereum' : 'BNB Chain'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 pr-4 text-right font-mono text-white text-sm">
                    {formatUSD(coin.price_usd)}
                  </td>
                  <td className="py-3.5 pr-4 text-right font-mono text-slate-400 text-sm">
                    {formatIDR(coin.price_idr)}
                  </td>
                  <td className="py-3.5 text-right">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${
                        isUp
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}
                    >
                      {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {isUp ? '+' : ''}{coin.change_24h.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
