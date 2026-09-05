import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, Sparkles, CornerDownLeft } from 'lucide-react';
import { motion } from 'motion/react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  isLoading,
  placeholder = 'Ask about stocks, markets, or financial news...',
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus on mount & after loading completes
  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  // Dynamic textarea height — up to 180px
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 180);
      textarea.style.height = `${Math.max(newHeight, 52)}px`;
    }
  }, [input]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    onSend(trimmed);
    setInput('');

    if (textareaRef.current) {
      textareaRef.current.style.height = '52px';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const canSubmit = Boolean(input.trim()) && !isLoading;

  return (
    <div id="marketmind-chat-input-container" className="w-full max-w-3xl mx-auto px-4 pb-5 pt-2">
      <form onSubmit={handleSubmit} className="relative">
        {/* Input card */}
        <div className="relative flex items-end rounded-2xl bg-[#0D1117] border border-[#1e293b] focus-within:border-emerald-500/40 focus-within:ring-1 focus-within:ring-emerald-500/20 shadow-2xl shadow-black/40 transition-all duration-200">
          {/* Leading icon */}
          <div className="pl-4 pb-[14px] shrink-0">
            <Sparkles className="w-5 h-5 text-slate-600 group-focus-within:text-emerald-400 transition-colors" />
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            id="chat-input-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={placeholder}
            rows={1}
            aria-label="Type your market question"
            className="flex-1 py-[14px] px-3 bg-transparent text-slate-100 placeholder-slate-600 text-sm leading-relaxed resize-none focus:outline-none max-h-[180px] disabled:opacity-60"
          />

          {/* Send button */}
          <div className="p-2 shrink-0">
            <motion.button
              type="submit"
              id="chat-submit-button"
              disabled={!canSubmit}
              whileTap={canSubmit ? { scale: 0.92 } : {}}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                canSubmit
                  ? 'bg-gradient-to-br from-emerald-500 to-cyan-500 text-slate-950 shadow-lg shadow-emerald-500/25 hover:brightness-110 cursor-pointer'
                  : 'bg-slate-800/60 text-slate-600 cursor-not-allowed'
              }`}
              title="Send (Enter)"
              aria-label="Send message to MarketMind AI"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between px-1 pt-2 text-[11px] text-slate-600">
          <span>MarketMind AI · For informational purposes only · Not financial advice</span>
          <span className="hidden sm:flex items-center gap-1 font-mono shrink-0">
            <CornerDownLeft className="w-2.5 h-2.5" />
            <span>Shift+Enter for new line</span>
          </span>
        </div>
      </form>
    </div>
  );
};
