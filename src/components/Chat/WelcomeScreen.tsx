import React from 'react';
import { motion } from 'motion/react';
import { QuickActions } from './QuickActions';
import { Sparkles, LineChart } from 'lucide-react';

interface WelcomeScreenProps {
  onSelectAction: (query: string) => void;
  disabled?: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectAction, disabled = false }) => {
  return (
    <div
      id="marketmind-welcome-screen"
      className="relative flex-1 flex flex-col items-center justify-center px-4 py-8 overflow-y-auto w-full max-w-5xl mx-auto"
    >
      {/* Subtle Financial Background Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10 flex items-center justify-center">
        {/* Subtle radial glow */}
        <div className="absolute w-[500px] h-[300px] bg-cyan-600/10 rounded-full blur-[100px] -top-10 left-1/2 -translate-x-1/2" />
        <div className="absolute w-[400px] h-[250px] bg-emerald-600/10 rounded-full blur-[90px] bottom-10 left-1/3 -translate-x-1/2" />

        {/* Faint financial grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.7) 1px, transparent 0)`,
            backgroundSize: '32px 32px',
          }}
        />

        {/* Faint animated market chart line SVG */}
        <svg
          className="absolute w-full max-w-4xl h-48 opacity-[0.07] text-emerald-400 stroke-current"
          viewBox="0 0 800 200"
          fill="none"
          preserveAspectRatio="none"
        >
          <motion.path
            d="M 0 150 Q 150 160 250 110 T 450 90 T 650 40 T 800 30"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2.5, ease: 'easeInOut' }}
          />
          <motion.path
            d="M 0 180 Q 200 120 350 140 T 550 80 T 750 60 T 800 50"
            strokeWidth="1.5"
            strokeDasharray="4 4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 3, delay: 0.5, ease: 'easeInOut' }}
          />
        </svg>
      </div>

      {/* Hero Badge */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs font-medium mb-6 backdrop-blur-md shadow-sm"
      >
        <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="tracking-wide">AI-Powered Financial Intelligence</span>
        <Sparkles className="w-3.5 h-3.5 text-emerald-400 ml-0.5" />
      </motion.div>

      {/* Main Logo & Title */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="text-center mb-8 max-w-2xl"
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/20 via-cyan-500/20 to-blue-500/20 border border-emerald-400/30 flex items-center justify-center shadow-xl shadow-emerald-950/30">
            <LineChart className="w-6 h-6 text-emerald-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            MARKETMIND <span className="text-emerald-400">AI</span>
          </h1>
        </div>

        <h2 className="text-xl sm:text-2xl font-semibold text-slate-200 mb-3 tracking-tight">
          "Understand the Market. Faster."
        </h2>

        <p className="text-sm sm:text-base text-slate-400 leading-relaxed max-w-xl mx-auto">
          MarketMind AI brings stock data, market news, and intelligent insights together through natural
          conversation. Ask anything about stocks, trading, market movements, and the latest financial developments.
        </p>
      </motion.div>

      {/* Quick Action Prompt Cards */}
      <div className="w-full mb-8">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="h-px w-10 bg-slate-800" />
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">
            Popular Market Inquiries
          </span>
          <span className="h-px w-10 bg-slate-800" />
        </div>
        <QuickActions onSelectAction={onSelectAction} disabled={disabled} />
      </div>
    </div>
  );
};
