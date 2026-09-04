import React, { useState, useRef, useEffect, KeyboardEvent } from 'react';
import { Send, Sparkles, Mail, CornerDownLeft } from 'lucide-react';

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  isLoading,
  placeholder = "Ask about stocks, markets, trading, or today's news...",
}) => {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-focus on mount & after load
  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isLoading]);

  // Dynamic textarea height
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

  return (
    <div id="marketmind-chat-input-container" className="w-full max-w-4xl mx-auto px-4 pb-4 pt-2">
      {/* Quick query shortcut chips */}
      <div className="flex items-center gap-2 mb-2 overflow-x-auto no-scrollbar py-0.5">
        <button
          type="button"
          onClick={() => {
            setInput('Send today\'s market summary to my email.');
            if (textareaRef.current) textareaRef.current.focus();
          }}
          className="text-[11px] px-2.5 py-1 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 flex items-center gap-1.5 shrink-0 transition-colors"
        >
          <Mail className="w-3 h-3 text-cyan-400" />
          <span>Email Market Summary</span>
        </button>
        <button
          type="button"
          onClick={() => {
            setInput('What is the current NVIDIA stock price?');
            if (textareaRef.current) textareaRef.current.focus();
          }}
          className="text-[11px] px-2.5 py-1 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 shrink-0 transition-colors"
        >
          NVDA Price & Movements
        </button>
        <button
          type="button"
          onClick={() => {
            setInput('Give me today\'s trading insights');
            if (textareaRef.current) textareaRef.current.focus();
          }}
          className="text-[11px] px-2.5 py-1 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 shrink-0 transition-colors"
        >
          Key Technical Themes
        </button>
      </div>

      <form onSubmit={handleSubmit} className="relative group">
        <div className="relative flex items-end rounded-2xl bg-[#0C111E]/95 border border-slate-800 focus-within:border-emerald-500/50 shadow-2xl focus-within:shadow-emerald-950/20 focus-within:ring-1 focus-within:ring-emerald-500/40 transition-all">
          <div className="pl-4 pb-3.5 text-slate-500">
            <Sparkles className="w-5 h-5 text-emerald-400/70 group-focus-within:text-emerald-400 transition-colors" />
          </div>

          <textarea
            ref={textareaRef}
            id="chat-input-textarea"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder={placeholder}
            rows={1}
            className="w-full py-3.5 px-3 bg-transparent text-slate-100 placeholder-slate-500 text-sm md:text-base resize-none focus:outline-none max-h-[180px] leading-relaxed"
          />

          <div className="p-2 flex items-center gap-1.5 shrink-0">
            <button
              type="submit"
              id="chat-submit-button"
              disabled={!input.trim() || isLoading}
              className={`p-2.5 rounded-xl transition-all flex items-center justify-center ${
                input.trim() && !isLoading
                  ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 hover:brightness-110 shadow-lg shadow-emerald-500/25 active:scale-95 cursor-pointer'
                  : 'bg-slate-800/80 text-slate-600 cursor-not-allowed'
              }`}
              title="Send query (Enter)"
              aria-label="Send message to MarketMind AI"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Enter instruction */}
        <div className="flex items-center justify-between px-2 pt-2 text-[11px] text-slate-500">
          <span className="truncate max-w-md">
            MarketMind AI provides informational insights for educational purposes and does not constitute financial advice.
          </span>
          <span className="hidden sm:flex items-center gap-1 shrink-0 font-mono text-[10px] text-slate-600">
            <span>Shift + Enter for new line</span>
            <CornerDownLeft className="w-2.5 h-2.5" />
          </span>
        </div>
      </form>
    </div>
  );
};
