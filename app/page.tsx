'use client';

import { useEffect, useMemo, useState } from 'react';

type Tab = 'Home' | 'Edges' | 'History' | 'Model';

type EdgeRow = {
  CommenceTime?: string;
  Matchup?: string;
  Book?: string;
  Market?: string;
  Player?: string;
  Side?: string;
  Line?: number | string;
  Odds?: number | string;
  pWin?: number;
  ProjectionRaw?: number;
  ProjectionAdj?: number;
  AdjMinusLine?: number;
  ['Stake$']?: number;
  Ease?: number;
  L10_ClearRate?: string;
};

const API_URL =
  'https://script.google.com/macros/s/AKfycby5ia4YwLBQ_LTDeZEtKiyEJa5vZILBhCWDgV7cH0iUspdEp4vCJhAtQzj_4FN2Q0uYHw/exec';

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>('Edges');
  const [allEdges, setAllEdges] = useState<EdgeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [marketFilter, setMarketFilter] = useState('All');

  useEffect(() => {
  const fetchData = () => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        setAllEdges(data);
        setLoading(false);
      })
      .catch(console.error);
  };

  fetchData();

  const interval = setInterval(fetchData, 60000); // every 60 sec

  return () => clearInterval(interval);
}, []);

  const marketOptions = useMemo(() => {
    const markets = Array.from(
      new Set(allEdges.map((e) => e.Market).filter(Boolean))
    ) as string[];

    return ['All', ...markets];
  }, [allEdges]);

  const filteredEdges = useMemo(() => {
    const base =
      marketFilter === 'All'
        ? allEdges
        : allEdges.filter((edge) => edge.Market === marketFilter);

    return [...base]
      .sort((a, b) => Number(b['Stake$'] ?? 0) - Number(a['Stake$'] ?? 0))
      .slice(0, 25);
  }, [allEdges, marketFilter]);

  const topThree = useMemo(() => {
    return [...allEdges]
      .sort((a, b) => Number(b['Stake$'] ?? 0) - Number(a['Stake$'] ?? 0))
      .slice(0, 3);
  }, [allEdges]);

  const formatMarketLabel = (market: string) => {
    if (market === 'All') return 'All';
    return market.replace('player_', '').replaceAll('_', ' ');
  };

  const HomeScreen = () => (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-3xl bg-zinc-800 p-4 border border-zinc-700">
          <div className="text-xs text-zinc-400">Loaded edges</div>
          <div className="text-2xl font-semibold mt-1">{allEdges.length}</div>
        </div>
        <div className="rounded-3xl bg-zinc-800 p-4 border border-zinc-700">
          <div className="text-xs text-zinc-400">Markets</div>
          <div className="text-2xl font-semibold mt-1">
            {Math.max(marketOptions.length - 1, 0)}
          </div>
        </div>
      </div>

      <section>
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-zinc-300">Top Plays</h2>
          <button
            className="text-xs text-emerald-300"
            onClick={() => setActiveTab('Edges')}
          >
            View all
          </button>
        </div>

        <div className="space-y-3">
          {topThree.map((edge, i) => (
            <div
              key={`${edge.Player}-${edge.Market}-${i}`}
              className="rounded-3xl bg-zinc-800 p-4 border border-zinc-700"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold">{edge.Player}</div>
                  <div className="text-sm text-zinc-400">
                    {formatMarketLabel(edge.Market || '')} • {edge.Side} {edge.Line}
                  </div>
                </div>
                <div className="rounded-full px-2.5 py-1 text-xs font-medium bg-emerald-500/15 text-emerald-300">
                  Top
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <div className="rounded-2xl bg-zinc-900 p-2">
                  <div className="text-[10px] uppercase text-zinc-500">Edge</div>
                  <div className="font-semibold text-emerald-300">
                    {Number(edge.AdjMinusLine ?? 0).toFixed(2)}
                  </div>
                </div>
                <div className="rounded-2xl bg-zinc-900 p-2">
                  <div className="text-[10px] uppercase text-zinc-500">pWin</div>
                  <div className="font-semibold">
                    {(Number(edge.pWin ?? 0) * 100).toFixed(1)}%
                  </div>
                </div>
                <div className="rounded-2xl bg-zinc-900 p-2">
                  <div className="text-[10px] uppercase text-zinc-500">Stake</div>
                  <div className="font-semibold">
                    ${Number(edge['Stake$'] ?? 0).toFixed(0)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );

  const EdgesScreen = () => {
  if (loading) {
    return <div className="p-4 text-zinc-400">Loading edges...</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {marketOptions.map((market) => (
          <button
            key={market}
            onClick={() => setMarketFilter(market)}
            className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${
              marketFilter === market
                ? 'bg-emerald-500/15 text-emerald-300'
                : 'bg-zinc-800 text-zinc-300'
            }`}
          >
            {formatMarketLabel(market)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filteredEdges.map((edge, i) => {
          const stake = Number(edge['Stake$'] ?? 0);

          const tierColor =
            stake > 30
              ? 'text-green-400'
              : stake > 15
              ? 'text-emerald-300'
              : 'text-zinc-300';

          return (
            <div
              key={`${edge.Player}-${edge.Market}-${i}`}
              className="rounded-3xl bg-zinc-800 p-4 border border-zinc-700"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold">{edge.Player}</div>
                  <div className="text-sm text-zinc-400">
                    {formatMarketLabel(edge.Market || '')} • {edge.Side} {edge.Line} • {edge.Odds}
                  </div>
                </div>
                <div className={`text-xs ${tierColor}`}>${stake.toFixed(0)}</div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <div className="bg-zinc-900 p-2 rounded-2xl">
                  <div className="text-xs text-zinc-500">Edge</div>
                  <div className={`font-semibold ${tierColor}`}>
                    {Number(edge.AdjMinusLine ?? 0).toFixed(2)}
                  </div>
                </div>

                <div className="bg-zinc-900 p-2 rounded-2xl">
                  <div className="text-xs text-zinc-500">pWin</div>
                  <div className="font-semibold">
                    {(Number(edge.pWin ?? 0) * 100).toFixed(1)}%
                  </div>
                </div>

                <div className="bg-zinc-900 p-2 rounded-2xl">
                  <div className="text-xs text-zinc-500">Stake</div>
                  <div className={`font-semibold ${tierColor}`}>
                    ${stake.toFixed(0)}
                  </div>
                </div>
              </div>

              <div className="mt-3 text-xs text-zinc-500">{edge.Matchup}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

  const HistoryScreen = () => (
    <div className="p-4">
      <div className="rounded-3xl bg-zinc-800 p-4 border border-zinc-700 text-zinc-400">
        Bet history screen coming next.
      </div>
    </div>
  );

  const ModelScreen = () => (
    <div className="p-4">
      <div className="rounded-3xl bg-zinc-800 p-4 border border-zinc-700 text-zinc-400">
        Model health screen coming next.
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col items-center p-6 pb-24">
      <div className="w-full max-w-sm">
        <h1 className="text-xl font-bold mb-4">Pocket Aces</h1>

        <div className="rounded-[2rem] border border-zinc-800 bg-zinc-900 shadow-2xl overflow-hidden">
          {activeTab === 'Home' && <HomeScreen />}
          {activeTab === 'Edges' && <EdgesScreen />}
          {activeTab === 'History' && <HistoryScreen />}
          {activeTab === 'Model' && <ModelScreen />}
        </div>
      </div>

      <div className="fixed bottom-0 w-full max-w-sm bg-zinc-900 border-t border-zinc-700 grid grid-cols-4 text-center py-3">
        {(['Home', 'Edges', 'History', 'Model'] as Tab[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={activeTab === tab ? 'text-emerald-400' : 'text-gray-400'}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}