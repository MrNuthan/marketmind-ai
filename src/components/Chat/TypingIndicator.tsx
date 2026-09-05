import React from 'react';
import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

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
      exit={{ opacity: 0, y: 4 }}
      transition={{ duration: 0.2 }}
      id="marketmind-typing-indicator"
      className="flex items-start gap-3 max-w-4xl"
    >
      {/* AI Avatar */}
      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-emerald-500/20 via-cyan-500/15 to-slate-800 border border-emerald-500/25 flex items-center justify-center shrink-0 shadow-md mt-0.5">
        <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
      </div>

      <div className="p-4 rounded-2xl rounded-tl-sm bg-[#0D1117]/90 border border-[#1e293b] shadow-lg shadow-black/20">
        {/* Name */}
        <div className="text-xs font-semibold text-emerald-400 mb-2.5">MarketMind AI</div>

        {/* Dots + status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            {[0, 0.18, 0.36].map((delay, i) => (
              <motion.span
                key={i}
                animate={{ opacity: [0.3, 1, 0.3], scale: [0.75, 1.1, 0.75] }}
                transition={{ repeat: Infinity, duration: 1.1, delay, ease: 'easeInOut' }}
                className={`block rounded-full ${
                  i === 0 ? 'w-1.5 h-1.5 bg-emerald-400' :
                  i === 1 ? 'w-1.5 h-1.5 bg-cyan-400' :
                            'w-1.5 h-1.5 bg-blue-400'
                }`}
              />
            ))}
          </div>

          <motion.span
            key={statusText}
            initial={{ opacity: 0, x: -4 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 4 }}
            transition={{ duration: 0.2 }}
            className="text-xs text-slate-400 font-medium"
          >
            {statusText}
          </motion.span>
        </div>
      </div>
    </motion.div>
  );
};
