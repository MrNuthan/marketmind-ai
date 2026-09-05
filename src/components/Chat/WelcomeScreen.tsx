import React from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  Newspaper,
  Mail,
  BarChart2,
  Sparkles,
} from 'lucide-react';

interface WelcomeScreenProps {
  onSelectAction: (query: string) => void;
  disabled?: boolean;
}

const suggestions = [
  {
    id: 'suggestion-market-today',
    icon: TrendingUp,
    iconColor: 'text-emerald-400',
    iconBg: 'bg-emerald-500/10 border-emerald-500/20',
    label: 'What is happening in the market today?',
    query: 'What is happening in the market today?',
  },
  {
    id: 'suggestion-nvidia',
    icon: BarChart2,
    iconColor: 'text-cyan-400',
    iconBg: 'bg-cyan-500/10 border-cyan-500/20',
    label: 'Analyze NVIDIA stock',
    query: 'Analyze NVIDIA stock in detail today',
  },
  {
    id: 'suggestion-news',
    icon: Newspaper,
    iconColor: 'text-violet-400',
    iconBg: 'bg-violet-500/10 border-violet-500/20',
    label: 'What is the latest market news?',
    query: 'What is the latest stock market news?',
  },
  {
    id: 'suggestion-email',
    icon: Mail,
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/10 border-amber-500/20',
    label: 'Send me a market summary by email',
    query: "Send today's market summary to my email.",
  },
] as const;

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onSelectAction,
  disabled = false,
}) => {
  return (
    <div
      id="marketmind-welcome-screen"
      className="relative flex-1 flex flex-col items-center justify-center px-6 py-12 w-full max-w-3xl mx-auto overflow-hidden"
    >
      {/* Ambient background glows — static, no animation */}
      <div className="absolute inset-0 pointer-events-none -z-10">
        <div className="absolute w-[480px] h-[280px] rounded-full bg-emerald-600/6 blur-[120px] top-1/4 left-1/2 -translate-x-1/2" />
        <div className="absolute w-[320px] h-[200px] rounded-full bg-cyan-600/5 blur-[100px] bottom-1/3 left-1/4" />
      </div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="text-center mb-10"
      >
        {/* Logo mark */}
        <div className="flex items-center justify-center mb-5">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-cyan-500/15 to-slate-800 border border-emerald-500/25 flex items-center justify-center shadow-2xl shadow-emerald-950/30">
              <Sparkles className="w-6 h-6 text-emerald-400" />
            </div>
            {/* Subtle glow ring */}
            <div className="absolute inset-0 rounded-2xl ring-1 ring-emerald-400/10 scale-110" />
          </div>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-white mb-3 leading-none">
          MARKET
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
            MIND
          </span>{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
            AI
          </span>
        </h1>

        <p className="text-base sm:text-lg font-medium text-slate-300 mb-3 tracking-tight">
          Understand the Market. Faster.
        </p>

        <p className="text-sm text-slate-500 leading-relaxed max-w-xs sm:max-w-sm mx-auto">
          Ask anything about stocks, market movements, or financial news.
        </p>
      </motion.div>

      {/* Suggestion cards — 2×2 grid */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.12, ease: 'easeOut' }}
        className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3"
      >
        {suggestions.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.button
              key={s.id}
              id={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.15 + i * 0.07, ease: 'easeOut' }}
              whileHover={{ scale: 1.02, transition: { duration: 0.15 } }}
              whileTap={{ scale: 0.98 }}
              disabled={disabled}
              onClick={() => onSelectAction(s.query)}
              className="group flex items-start gap-3.5 p-4 rounded-xl bg-[#0D1117]/80 hover:bg-[#111827]/90 border border-[#1e293b] hover:border-slate-700/80 text-left transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md hover:shadow-black/20 backdrop-blur-sm"
            >
              <div
                className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${s.iconBg}`}
              >
                <Icon className={`w-4 h-4 ${s.iconColor}`} />
              </div>
              <span className="text-sm text-slate-300 group-hover:text-slate-100 font-medium leading-snug transition-colors">
                {s.label}
              </span>
            </motion.button>
          );
        })}
      </motion.div>

      {/* Subtle bottom hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-8 text-xs text-slate-600 text-center"
      >
        Powered by n8n · Real market intelligence · No fabricated data
      </motion.p>
    </div>
  );
};
