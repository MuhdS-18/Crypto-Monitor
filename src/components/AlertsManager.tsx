import React, { useState, useEffect } from 'react';
import { Bell, ArrowUpRight, ArrowDownRight, Plus, Trash2, X } from 'lucide-react';
import type { PriceAlert, CryptoAsset, TickerData, AlertCondition } from '../types';
import { format } from 'date-fns';

interface AlertsManagerProps {
  assets: Record<string, CryptoAsset>;
  tickers: Record<string, TickerData>;
}

export function AlertsManager({ assets, tickers }: AlertsManagerProps) {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newAlert, setNewAlert] = useState<{ symbol: string, condition: AlertCondition, targetPrice: string }>({
    symbol: 'BTCUSDT',
    condition: 'above',
    targetPrice: ''
  });

  // Check alerts against tickers
  useEffect(() => {
    if (alerts.length === 0) return;
    
    let changed = false;
    const updatedAlerts = alerts.map(alert => {
      if (alert.status === 'triggered') return alert;
      const ticker = tickers[alert.symbol];
      if (!ticker) return alert;

      let triggered = false;
      if (alert.condition === 'above' && ticker.price >= alert.targetPrice) {
        triggered = true;
      } else if (alert.condition === 'below' && ticker.price <= alert.targetPrice) {
        triggered = true;
      }

      if (triggered) {
        changed = true;
        return {
          ...alert,
          status: 'triggered' as const,
          triggeredAt: Date.now()
        };
      }
      return alert;
    });

    if (changed) {
      setAlerts(updatedAlerts);
    }
  }, [tickers, alerts]);

  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const target = parseFloat(newAlert.targetPrice);
    if (isNaN(target)) return;

    const alert: PriceAlert = {
      id: Date.now().toString(),
      symbol: newAlert.symbol,
      condition: newAlert.condition,
      targetPrice: target,
      status: 'active',
      createdAt: Date.now()
    };

    setAlerts(prev => [alert, ...prev]);
    setIsAdding(false);
    setNewAlert({ ...newAlert, targetPrice: '' });
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-neutral-100 flex items-center gap-2">
          <Bell className="w-5 h-5 text-neutral-400" />
          Active Alerts
        </h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-1.5 text-xs font-medium text-neutral-200 bg-neutral-800 hover:bg-neutral-700 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            New Alert
          </button>
        )}
      </div>

      <div className="flex flex-col gap-3">
        {isAdding && (
          <form onSubmit={handleAddAlert} className="p-4 rounded-xl border border-neutral-800 bg-neutral-900/60 flex flex-col sm:flex-row gap-4 sm:items-end">
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-neutral-500">Asset</label>
              <select
                value={newAlert.symbol}
                onChange={(e) => setNewAlert({ ...newAlert, symbol: e.target.value })}
                className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-sm font-medium rounded-lg px-3 py-2 outline-none focus:border-neutral-600"
              >
                {Object.values(assets).map(a => (
                  <option key={a.symbol} value={a.symbol}>{a.name} ({a.baseAsset})</option>
                ))}
              </select>
            </div>
            
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-neutral-500">Condition</label>
              <select
                value={newAlert.condition}
                onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value as AlertCondition })}
                className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-sm font-medium rounded-lg px-3 py-2 outline-none focus:border-neutral-600"
              >
                <option value="above">Crosses Above</option>
                <option value="below">Crosses Below</option>
              </select>
            </div>
            
            <div className="flex-1 space-y-1">
              <label className="text-xs font-medium text-neutral-500">Target Price (USD)</label>
              <input
                type="number"
                step="any"
                min="0"
                required
                value={newAlert.targetPrice}
                onChange={(e) => setNewAlert({ ...newAlert, targetPrice: e.target.value })}
                placeholder="e.g. 50000"
                className="w-full bg-neutral-950 border border-neutral-800 text-neutral-200 text-sm font-medium rounded-lg px-3 py-2 outline-none focus:border-neutral-600 placeholder:text-neutral-600"
              />
            </div>
            
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="p-2 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
              <button
                type="submit"
                className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-emerald-950 font-semibold text-sm rounded-lg transition-colors"
              >
                Save
              </button>
            </div>
          </form>
        )}

        {alerts.length === 0 && !isAdding && (
          <div className="p-8 rounded-xl border border-neutral-800 border-dashed flex flex-col items-center justify-center text-center">
            <Bell className="w-8 h-8 text-neutral-600 mb-3" />
            <p className="text-sm font-medium text-neutral-400 mb-1">No alerts set</p>
            <p className="text-xs text-neutral-500">Create an alert to get notified when assets hit your target prices.</p>
          </div>
        )}

        {alerts.map(alert => {
          const asset = assets[alert.symbol];
          const isTriggered = alert.status === 'triggered';
          const isAbove = alert.condition === 'above';
          
          return (
            <div key={alert.id} className="flex items-center justify-between p-4 rounded-xl border border-neutral-800 bg-neutral-900/40 hover:bg-neutral-800/50 transition-colors group">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 shrink-0 rounded-full flex items-center justify-center ${
                  isTriggered 
                    ? isAbove ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                    : 'bg-neutral-800 text-neutral-400'
                }`}>
                  {isAbove ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-200">
                    {asset?.baseAsset || alert.symbol} target {isAbove ? 'above' : 'below'} ${alert.targetPrice.toLocaleString()}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {isTriggered && alert.triggeredAt 
                      ? `Triggered at ${format(alert.triggeredAt, 'HH:mm:ss')}` 
                      : `Created ${format(alert.createdAt, 'MMM dd, HH:mm')}`
                    }
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs font-medium px-2.5 py-1 rounded-md ${
                  isTriggered 
                    ? 'text-emerald-500 bg-emerald-500/10' 
                    : 'text-neutral-400 bg-neutral-800'
                }`}>
                  {isTriggered ? 'Triggered' : 'Active'}
                </span>
                <button 
                  onClick={() => removeAlert(alert.id)}
                  className="p-1.5 text-neutral-500 hover:text-rose-400 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all rounded-md hover:bg-rose-500/10"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
