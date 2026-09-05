import React from 'react';
import { RefreshCw } from 'lucide-react';
import { ConnectionStatusType } from '../../types/n8n';
import { motion } from 'motion/react';

interface BackendStatusProps {
  status: ConnectionStatusType;
  latencyMs?: number;
  lastChecked?: string;
  errorMessage?: string;
  onTestBackend: () => Promise<void>;
  compact?: boolean;
}

const statusConfig = {
  connected: {
    dot: 'bg-emerald-500',
    ping: 'bg-emerald-400',
    label: 'Backend Connected',
    textColor: 'text-emerald-400',
    showPing: true,
  },
  offline: {
    dot: 'bg-rose-500',
    ping: '',
    label: 'Backend Offline',
    textColor: 'text-rose-400',
    showPing: false,
  },
  testing: {
    dot: 'bg-cyan-500',
    ping: '',
    label: 'Pinging...',
    textColor: 'text-cyan-400',
    showPing: false,
  },
  idle: {
    dot: 'bg-slate-600',
    ping: '',
    label: 'Backend Unverified',
    textColor: 'text-slate-400',
    showPing: false,
  },
} as const;

export const BackendStatus: React.FC<BackendStatusProps> = ({
  status,
  latencyMs,
  onTestBackend,
  compact = false,
}) => {
  const cfg = statusConfig[status] ?? statusConfig.idle;

  if (compact) {
    return (
      <div
        id="marketmind-compact-backend-status"
        className="flex items-center justify-between px-3 py-2 rounded-xl bg-[#0D1117] border border-[#1e293b] min-h-[38px]"
      >
        {/* Status indicator */}
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2 shrink-0">
            {cfg.showPing && (
              <motion.span
                animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
                transition={{ repeat: Infinity, duration: 1.6, ease: 'easeOut' }}
                className={`absolute inset-0 rounded-full ${cfg.ping}`}
              />
            )}
            <span className={`relative inline-flex h-2 w-2 rounded-full ${cfg.dot}`} />
          </span>
          <span className={`text-xs font-medium ${cfg.textColor}`}>{cfg.label}</span>
          {status === 'connected' && latencyMs !== undefined && (
            <span className="text-[10px] text-slate-500 font-mono">({latencyMs}ms)</span>
          )}
        </div>

        {/* Test button */}
        <button
          id="test-backend-compact-button"
          onClick={onTestBackend}
          disabled={status === 'testing'}
          className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700/50 transition-colors flex items-center gap-1.5 disabled:opacity-50 shrink-0"
          title="Test n8n backend connection"
        >
          <RefreshCw
            className={`w-3 h-3 ${status === 'testing' ? 'animate-spin' : ''}`}
          />
          <span>Test</span>
        </button>
      </div>
    );
  }

  // Non-compact fallback (used in settings modal)
  return (
    <div id="marketmind-backend-status-card" className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2 shrink-0">
          {cfg.showPing && (
            <motion.span
              animate={{ scale: [1, 1.8], opacity: [0.6, 0] }}
              transition={{ repeat: Infinity, duration: 1.6, ease: 'easeOut' }}
              className={`absolute inset-0 rounded-full ${cfg.ping}`}
            />
          )}
          <span className={`relative inline-flex h-2 w-2 rounded-full ${cfg.dot}`} />
        </span>
        <span className={`text-xs font-medium ${cfg.textColor}`}>{cfg.label}</span>
        {status === 'connected' && latencyMs !== undefined && (
          <span className="text-[10px] text-slate-500 font-mono">({latencyMs}ms)</span>
        )}
      </div>
      <button
        id="test-backend-full-button"
        onClick={onTestBackend}
        disabled={status === 'testing'}
        className="w-full py-1.5 px-3 rounded-lg text-xs font-medium bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/50 transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${status === 'testing' ? 'animate-spin' : ''}`} />
        <span>{status === 'testing' ? 'Testing...' : 'Test Backend'}</span>
      </button>
    </div>
  );
};
