import React, { useState } from 'react';
import { useCryptoData } from './hooks/useCryptoData';
import { StatCard } from './components/StatCard';
import { MarketChart } from './components/MarketChart';
import { SentimentGauge } from './components/SentimentGauge';
import { AlertsManager } from './components/AlertsManager';
import type { TimeInterval } from './types';
import { Activity, Clock, BarChart3, Wifi, WifiOff } from 'lucide-react';

export default function App() {
  const [selectedAsset, setSelectedAsset] = useState<string>('BTCUSDT');
  const [interval, setInterval] = useState<TimeInterval>('1h');
  
  const { assets, availableAssets, tickers, chartData, isLoadingChart, wsStatus, addAsset, removeAsset } = useCryptoData(selectedAsset, interval);

  // Fallback to first available asset if selectedAsset is removed
  const activeAsset = assets[selectedAsset] || Object.values(assets)[0];
  const currentSelectedAsset = activeAsset?.symbol || 'BTCUSDT';
  const activeTicker = tickers[currentSelectedAsset];

  const formatPrice = (price?: number) => {
    if (price === undefined) return '---';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(price);
  };

  const formatVolume = (vol?: number) => {
    if (vol === undefined) return '---';
    if (vol > 1000000) return `${(vol / 1000000).toFixed(2)}M`;
    if (vol > 1000) return `${(vol / 1000).toFixed(2)}K`;
    return vol.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 font-sans selection:bg-neutral-800">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300">
              <Activity size={16} className="sm:w-[18px] sm:h-[18px]" />
            </div>
            <h1 className="text-base sm:text-lg font-semibold tracking-tight text-neutral-100 hidden sm:block">
              Crypto Monitor
            </h1>
            <h1 className="text-base font-semibold tracking-tight text-neutral-100 sm:hidden">
              Crypto
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[10px] sm:text-xs font-medium text-neutral-400 bg-neutral-900 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full border border-neutral-800">
              {wsStatus === 'connected' ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                  Live Data
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-rose-500" />
                  Connecting...
                </>
              )}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 space-y-6 sm:space-y-8">
        {/* Main Chart Area (TOP) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col rounded-2xl border border-neutral-800 bg-neutral-900/40 p-1">
            
            {/* Chart Header Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3 sm:p-4 border-b border-neutral-800/50 gap-4 sm:gap-0">
              <div className="flex items-center justify-between sm:justify-start w-full sm:w-auto gap-4">
                <select
                  value={currentSelectedAsset}
                  onChange={(e) => setSelectedAsset(e.target.value)}
                  className="bg-neutral-900 border border-neutral-800 text-neutral-200 text-xs sm:text-sm font-medium rounded-lg focus:ring-1 focus:ring-neutral-700 focus:border-neutral-700 block px-2.5 py-1.5 sm:px-3 sm:py-1.5 outline-none cursor-pointer flex-1 sm:flex-none"
                >
                  {Object.values(assets).map(a => (
                    <option key={a.symbol} value={a.symbol}>
                      {a.name} ({a.baseAsset})
                    </option>
                  ))}
                </select>

                <div className="flex items-baseline gap-2">
                  <h2 className="text-lg sm:text-xl font-semibold text-neutral-100">
                    {formatPrice(activeTicker?.price)}
                  </h2>
                </div>
              </div>

              {/* Timeframe selector */}
              <div className="flex items-center p-1 rounded-lg bg-neutral-950 border border-neutral-800 w-full sm:w-auto justify-between sm:justify-start">
                {(['15m', '1h', '4h', '1d'] as TimeInterval[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setInterval(t)}
                    className={`px-3 py-1.5 sm:py-1 text-xs font-medium rounded-md transition-colors flex-1 sm:flex-none ${
                      interval === t 
                        ? 'bg-neutral-800 text-neutral-100' 
                        : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* Chart Canvas */}
            <div className="h-[280px] sm:h-[400px] w-full p-2 sm:p-4">
              <MarketChart 
                data={chartData} 
                color={activeAsset.color} 
                isLoading={isLoadingChart}
              />
            </div>
          </div>

          {/* Analytics Sidebar */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl border border-neutral-800 bg-neutral-900/40 p-4 sm:p-5">
              <h3 className="text-sm font-medium text-neutral-400 flex items-center gap-2 mb-4 sm:mb-6">
                <BarChart3 className="w-4 h-4" />
                24h Market Analytics
              </h3>
              
              <div className="flex flex-col gap-5 sm:gap-6">
                <SentimentGauge priceChangePercent={activeTicker?.priceChangePercent} />
                
                <div className="h-px bg-neutral-800/50 w-full hidden sm:block" />

                <div className="grid grid-cols-2 sm:grid-cols-1 gap-y-4 gap-x-2 sm:gap-y-6">
                  <div>
                    <p className="text-[10px] sm:text-xs font-medium text-neutral-500 mb-1">Trading Volume</p>
                    <p className="text-sm sm:text-lg font-semibold text-neutral-200">
                      {formatVolume(activeTicker?.volume)} {activeAsset.baseAsset}
                    </p>
                  </div>
                  
                  <div className="h-px bg-neutral-800/50 w-full hidden sm:block" />
                  
                  <div>
                    <p className="text-[10px] sm:text-xs font-medium text-neutral-500 mb-1">24h High</p>
                    <p className="text-sm sm:text-lg font-medium text-neutral-300">
                      {formatPrice(activeTicker?.high24h)}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-[10px] sm:text-xs font-medium text-neutral-500 mb-1">24h Low</p>
                    <p className="text-sm sm:text-lg font-medium text-neutral-300">
                      {formatPrice(activeTicker?.low24h)}
                    </p>
                  </div>
                  
                  <div className="h-px bg-neutral-800/50 w-full hidden sm:block" />

                  <div>
                    <p className="text-[10px] sm:text-xs font-medium text-neutral-500 mb-1">24h Change</p>
                    <p className={`text-sm sm:text-lg font-semibold ${
                      activeTicker?.priceChange && activeTicker.priceChange > 0 
                        ? 'text-emerald-400' 
                        : 'text-rose-400'
                    }`}>
                      {activeTicker?.priceChange && activeTicker.priceChange > 0 ? '+' : ''}
                      {formatPrice(activeTicker?.priceChange)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quick Info Box */}
            <div className="rounded-2xl border border-neutral-800/60 bg-neutral-800/20 p-4 sm:p-5">
               <h3 className="text-sm font-medium text-neutral-400 flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4" />
                Real-time Sync
              </h3>
              <p className="text-[10px] sm:text-xs text-neutral-500 leading-relaxed">
                Market prices and analytics are streamed securely via WebSocket. Charts represent historical candles up to the current interval.
              </p>
            </div>
          </div>
        </div>

        {/* Asset Selection & Overview (PRICES - BOTTOM) */}
        <div>
          <div className="flex items-center justify-between mb-3 sm:mb-4">
            <h3 className="text-base sm:text-lg font-medium text-neutral-100">Market Prices</h3>
            <select
              value=""
              onChange={(e) => {
                if (e.target.value) addAsset(e.target.value);
              }}
              className="bg-neutral-900 border border-neutral-800 text-neutral-400 text-xs sm:text-sm font-medium rounded-lg focus:ring-1 focus:ring-neutral-700 focus:border-neutral-700 block px-2.5 py-1.5 outline-none cursor-pointer hover:bg-neutral-800 transition-colors"
            >
              <option value="">+ Add Asset</option>
              {Object.values(availableAssets)
                .filter(a => !assets[a.symbol])
                .map(a => (
                  <option key={a.symbol} value={a.symbol}>
                    {a.name} ({a.baseAsset})
                  </option>
                ))}
            </select>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {Object.values(assets).map((asset) => {
              const ticker = tickers[asset.symbol];
              return (
                <StatCard
                  key={asset.symbol}
                  title={asset.name}
                  subtitle={`${asset.baseAsset} / USDT`}
                  value={formatPrice(ticker?.price)}
                  trend={ticker?.priceChangePercent}
                  icon={
                    <div 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: asset.color }} 
                    />
                  }
                  active={currentSelectedAsset === asset.symbol}
                  onClick={() => setSelectedAsset(asset.symbol)}
                  onRemove={() => removeAsset(asset.symbol)}
                  className="cursor-pointer"
                />
              );
            })}
          </div>
        </div>

        {/* Alerts Section (BELOW PRICES) */}
        <AlertsManager assets={assets} tickers={tickers} />
      </main>
    </div>
  );
}

