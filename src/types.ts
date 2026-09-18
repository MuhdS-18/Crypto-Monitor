export interface CryptoAsset {
  symbol: string;
  name: string;
  baseAsset: string;
  color: string;
}

export interface TickerData {
  symbol: string;
  price: number;
  priceChange: number;
  priceChangePercent: number;
  volume: number;
  quoteVolume: number;
  high24h: number;
  low24h: number;
}

export interface ChartDataPoint {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type TimeInterval = '15m' | '1h' | '4h' | '1d';

export type AlertCondition = 'above' | 'below';
export type AlertStatus = 'active' | 'triggered';

export interface PriceAlert {
  id: string;
  symbol: string;
  targetPrice: number;
  condition: AlertCondition;
  status: AlertStatus;
  createdAt: number;
  triggeredAt?: number;
}
