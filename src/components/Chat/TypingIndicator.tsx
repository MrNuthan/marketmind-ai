import React from 'react';
import { motion } from 'motion/react';
import { Bot, Sparkles } from 'lucide-react';

interface TypingIndicatorProps {
  statusText?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  statusText = 'Analyzing market information...',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 5 }}
      transition={{ duration: 0.25 }}
      id="marketmind-typing-indicator"
      className="flex items-start gap-3.5 max-w-2xl"
    >
      {/* AI Avatar */}
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/20 via-cyan-500/20 to-blue-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-950/20 mt-0.5">
        <Bot className="w-4 h-4 text-emerald-400" />
      </div>

      <div className="p-4 rounded-2xl bg-[#0D1322]/90 border border-slate-800/90 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            MarketMind AI
          </span>
          <span className="text-[10px] text-slate-400 font-mono">Agent Reasoning</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Animated dots */}
          <div className="flex items-center gap-1.5 py-1">
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.15, 0.8] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: 0 }}
              className="w-2 h-2 rounded-full bg-emerald-400"
            />
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.15, 0.8] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: 0.2 }}
              className="w-2 h-2 rounded-full bg-cyan-400"
            />
            <motion.span
              animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.15, 0.8] }}
              transition={{ repeat: Infinity, duration: 1.2, delay: 0.4 }}
              className="w-2 h-2 rounded-full bg-blue-400"
            />
          </div>

          <motion.span
            key={statusText}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 4 }}
            className="text-xs text-slate-300 font-medium tracking-wide"
          >
            {statusText}
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
};
