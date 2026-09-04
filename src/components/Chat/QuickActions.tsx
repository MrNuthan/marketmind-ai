import React from 'react';
import { motion } from 'motion/react';
import { Newspaper, TrendingUp, Activity, Compass, ArrowUpRight } from 'lucide-react';

interface QuickActionsProps {
  onSelectAction: (query: string) => void;
  disabled?: boolean;
}

const ACTION_CARDS = [
  {
    id: 'market-news',
    title: 'Latest Market News',
    query: 'What is happening in the market today?',
    description: 'Wall Street updates, macroeconomic developments & breaking headlines',
    badge: 'Real-Time News',
    icon: Newspaper,
    accentColor: 'from-emerald-500/15 to-teal-500/5 hover:border-emerald-500/50',
    iconColor: 'text-emerald-400',
    tagColor: 'text-emerald-300 bg-emerald-950/60 border-emerald-800/40',
  },
  {
    id: 'stock-analysis',
    title: 'Stock Analysis',
    query: 'Analyze NVIDIA stock',
    description: 'Detailed financial performance, momentum drivers & sentiment',
    badge: 'Deep Dive',
    icon: TrendingUp,
    accentColor: 'from-cyan-500/15 to-blue-500/5 hover:border-cyan-500/50',
    iconColor: 'text-cyan-400',
    tagColor: 'text-cyan-300 bg-cyan-950/60 border-cyan-800/40',
  },
  {
    id: 'market-movers',
    title: 'Market Movers',
    query: 'Which stocks are moving today?',
    description: 'Top gainers, notable volume surges & volatile sector rotations',
    badge: 'Volatility',
    icon: Activity,
    accentColor: 'from-blue-500/15 to-indigo-500/5 hover:border-blue-500/50',
    iconColor: 'text-blue-400',
    tagColor: 'text-blue-300 bg-blue-950/60 border-blue-800/40',
  },
  {
    id: 'trading-insights',
    title: 'Trading Insights',
    query: 'Give me today\'s trading insights',
    description: 'Key support & resistance themes, market tone & strategy takeaways',
    badge: 'Strategy',
    icon: Compass,
    accentColor: 'from-purple-500/15 to-pink-500/5 hover:border-purple-500/50',
    iconColor: 'text-purple-400',
    tagColor: 'text-purple-300 bg-purple-950/60 border-purple-800/40',
  },
];

export const QuickActions: React.FC<QuickActionsProps> = ({ onSelectAction, disabled = false }) => {
  return (
    <div id="marketmind-quick-actions" className="w-full max-w-4xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {ACTION_CARDS.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.button
              key={card.id}
              id={`quick-action-${card.id}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.07 }}
              onClick={() => onSelectAction(card.query)}
              disabled={disabled}
              className={`group relative text-left p-4 rounded-xl border border-slate-800/80 bg-gradient-to-br bg-[#0B0F19]/80 backdrop-blur-md shadow-lg shadow-black/40 transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${card.accentColor}`}
            >
              <div className="flex items-start justify-between gap-2 mb-2.5">
                <div className="flex items-center gap-2.5">
                  <div className={`p-2 rounded-lg bg-black/40 border border-slate-800 ${card.iconColor}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-slate-100 group-hover:text-white transition-colors">
                      {card.title}
                    </h4>
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${card.tagColor}`}>
                      {card.badge}
                    </span>
                  </div>
                </div>

                <div className="p-1 rounded-md text-slate-500 group-hover:text-slate-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>

              <p className="text-xs text-slate-400 font-normal leading-relaxed line-clamp-2">
                "{card.query}"
              </p>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
