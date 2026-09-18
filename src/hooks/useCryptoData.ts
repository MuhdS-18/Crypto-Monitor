import { useEffect, useState, useRef, useCallback } from 'react';
import type { TickerData, ChartDataPoint, TimeInterval, CryptoAsset } from '../types';

export const AVAILABLE_ASSETS: Record<string, CryptoAsset> = {
  'BTCUSDT': { symbol: 'BTCUSDT', name: 'Bitcoin', baseAsset: 'BTC', color: '#F7931A' },
  'ETHUSDT': { symbol: 'ETHUSDT', name: 'Ethereum', baseAsset: 'ETH', color: '#627EEA' },
  'SOLUSDT': { symbol: 'SOLUSDT', name: 'Solana', baseAsset: 'SOL', color: '#14F195' },
  'BNBUSDT': { symbol: 'BNBUSDT', name: 'Binance Coin', baseAsset: 'BNB', color: '#F3BA2F' },
  'XRPUSDT': { symbol: 'XRPUSDT', name: 'Ripple', baseAsset: 'XRP', color: '#23292F' },
  'ADAUSDT': { symbol: 'ADAUSDT', name: 'Cardano', baseAsset: 'ADA', color: '#0033AD' },
  'DOGEUSDT': { symbol: 'DOGEUSDT', name: 'Dogecoin', baseAsset: 'DOGE', color: '#C2A633' },
  'AVAXUSDT': { symbol: 'AVAXUSDT', name: 'Avalanche', baseAsset: 'AVAX', color: '#E84142' },
  'LINKUSDT': { symbol: 'LINKUSDT', name: 'Chainlink', baseAsset: 'LINK', color: '#2A5ADA' },
  'DOTUSDT': { symbol: 'DOTUSDT', name: 'Polkadot', baseAsset: 'DOT', color: '#E6007A' },
  'MATICUSDT': { symbol: 'MATICUSDT', name: 'Polygon', baseAsset: 'MATIC', color: '#8247E5' },
};

const WS_BASE_URL = 'wss://stream.binance.com:9443/stream';
const REST_BASE_URL = 'https://api.binance.com/api/v3';

export function useCryptoData(selectedSymbol: string, interval: TimeInterval) {
  const [activeSymbols, setActiveSymbols] = useState<string[]>([
    'BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'BNBUSDT'
  ]);
  const [tickers, setTickers] = useState<Record<string, TickerData>>({});
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [isLoadingChart, setIsLoadingChart] = useState(false);
  const [wsStatus, setWsStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  
  const wsRef = useRef<WebSocket | null>(null);

  const addAsset = useCallback((symbol: string) => {
    if (!AVAILABLE_ASSETS[symbol]) return;
    setActiveSymbols(prev => {
      if (prev.includes(symbol)) return prev;
      return [...prev, symbol];
    });
  }, []);

  const removeAsset = useCallback((symbol: string) => {
    setActiveSymbols(prev => prev.filter(s => s !== symbol));
  }, []);

  // Fetch historical data for charts
  useEffect(() => {
    let isMounted = true;
    const fetchHistoricalData = async () => {
      setIsLoadingChart(true);
      try {
        const res = await fetch(`${REST_BASE_URL}/klines?symbol=${selectedSymbol}&interval=${interval}&limit=100`);
        const data = await res.json();
        
        if (isMounted) {
          const formattedData: ChartDataPoint[] = data.map((d: any) => ({
            time: d[0],
            open: parseFloat(d[1]),
            high: parseFloat(d[2]),
            low: parseFloat(d[3]),
            close: parseFloat(d[4]),
            volume: parseFloat(d[5]),
          }));
          setChartData(formattedData);
        }
      } catch (err) {
        console.error('Failed to fetch historical data', err);
      } finally {
        if (isMounted) setIsLoadingChart(false);
      }
    };

    fetchHistoricalData();

    return () => {
      isMounted = false;
    };
  }, [selectedSymbol, interval]);

  // Connect WebSocket for live tickers
  useEffect(() => {
    if (activeSymbols.length === 0) return;

    if (wsRef.current) {
      wsRef.current.close();
    }

    const streams = activeSymbols.map(sym => `${sym.toLowerCase()}@ticker`).join('/');
    const url = `${WS_BASE_URL}?streams=${streams}`;
    
    setWsStatus('connecting');
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      setWsStatus('connected');
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.data && message.data.e === '24hrTicker') {
        const d = message.data;
        setTickers(prev => ({
          ...prev,
          [d.s]: {
            symbol: d.s,
            price: parseFloat(d.c),
            priceChange: parseFloat(d.p),
            priceChangePercent: parseFloat(d.P),
            volume: parseFloat(d.v),
            quoteVolume: parseFloat(d.q),
            high24h: parseFloat(d.h),
            low24h: parseFloat(d.l),
          }
        }));
      }
    };

    ws.onclose = () => {
      setWsStatus('disconnected');
    };

    return () => {
      if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
        wsRef.current.close();
      }
    };
  }, [activeSymbols]);

  const activeAssetsRecord = activeSymbols.reduce((acc, sym) => {
    acc[sym] = AVAILABLE_ASSETS[sym];
    return acc;
  }, {} as Record<string, CryptoAsset>);

  return {
    assets: activeAssetsRecord,
    availableAssets: AVAILABLE_ASSETS,
    tickers,
    chartData,
    isLoadingChart,
    wsStatus,
    addAsset,
    removeAsset,
  };
}
