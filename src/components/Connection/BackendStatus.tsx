import React, { useState } from 'react';
import { RefreshCw, CheckCircle2, XCircle, Activity, Globe } from 'lucide-react';
import { ConnectionStatusType } from '../../types/n8n';
import { getN8nWebhookUrl } from '../../services/n8n';

interface BackendStatusProps {
  status: ConnectionStatusType;
  latencyMs?: number;
  lastChecked?: string;
  errorMessage?: string;
  onTestBackend: () => Promise<void>;
  compact?: boolean;
}

export const BackendStatus: React.FC<BackendStatusProps> = ({
  status,
  latencyMs,
  lastChecked,
  errorMessage,
  onTestBackend,
  compact = false,
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const webhookUrl = getN8nWebhookUrl();

  const handleTest = async () => {
    if (isTesting) return;
    setIsTesting(true);
    try {
      await onTestBackend();
    } finally {
      setIsTesting(false);
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return (
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium text-xs">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>✓ n8n Backend Connected</span>
          </span>
        );
      case 'offline':
        return (
          <span className="flex items-center gap-1.5 text-rose-400 font-medium text-xs">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            <span>✕ n8n Backend Offline</span>
          </span>
        );
      case 'testing':
        return (
          <span className="flex items-center gap-1.5 text-cyan-400 font-medium text-xs">
            <RefreshCw className="w-3 h-3 animate-spin text-cyan-400" />
            <span>Pinging Webhook...</span>
          </span>
        );
      case 'idle':
      default:
        return (
          <span className="flex items-center gap-1.5 text-slate-400 font-medium text-xs">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-slate-500"></span>
            <span>● Backend Untested</span>
          </span>
        );
    }
  };

  if (compact) {
    return (
      <div
        id="marketmind-compact-backend-status"
        className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs"
      >
        <div className="flex items-center gap-2 overflow-hidden">
          {getStatusBadge()}
          {latencyMs !== undefined && status === 'connected' && (
            <span className="text-[10px] text-slate-400 font-mono">({latencyMs}ms)</span>
          )}
        </div>
        <button
          id="test-backend-compact-button"
          onClick={handleTest}
          disabled={isTesting || status === 'testing'}
          className="text-[11px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition-colors flex items-center gap-1 disabled:opacity-50"
          title="Send test request to n8n webhook"
        >
          <RefreshCw className={`w-2.5 h-2.5 ${isTesting || status === 'testing' ? 'animate-spin' : ''}`} />
          <span>Test</span>
        </button>
      </div>
    );
  }

  return (
    <div
      id="marketmind-backend-status-card"
      className="p-4 rounded-xl bg-[#0F1422]/90 border border-slate-800 backdrop-blur-md shadow-lg"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Backend Connection
          </span>
        </div>
        <div>{getStatusBadge()}</div>
      </div>

      <div className="space-y-1.5 text-xs text-slate-400 mb-3 bg-black/30 p-2.5 rounded-lg border border-slate-800/60">
        <div className="flex items-center justify-between">
          <span className="text-slate-400">Endpoint:</span>
          <span
            className="text-[11px] font-mono text-slate-300 truncate max-w-[180px]"
            title={webhookUrl}
          >
            {webhookUrl.replace('https://', '')}
          </span>
        </div>
        {status === 'connected' && latencyMs !== undefined && (
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Latency:</span>
            <span className="text-emerald-400 font-mono font-medium">{latencyMs} ms</span>
          </div>
        )}
        {lastChecked && (
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Last Verified:</span>
            <span className="text-slate-400">{new Date(lastChecked).toLocaleTimeString()}</span>
          </div>
        )}
        {status === 'offline' && errorMessage && (
          <div className="pt-1 text-[11px] text-rose-300/90 leading-tight">
            Error: {errorMessage}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          id="test-backend-full-button"
          onClick={handleTest}
          disabled={isTesting || status === 'testing'}
          className="flex-1 py-1.5 px-3 rounded-lg text-xs font-medium bg-cyan-950/40 hover:bg-cyan-900/50 text-cyan-300 border border-cyan-700/50 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isTesting || status === 'testing' ? 'animate-spin' : ''}`} />
          <span>{isTesting || status === 'testing' ? 'Testing Webhook...' : 'Test Backend'}</span>
        </button>
        <a
          href={webhookUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/60 transition-colors"
          title="Open Webhook URL directly"
        >
          <Globe className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
};
