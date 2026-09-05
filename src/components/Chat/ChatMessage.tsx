import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'motion/react';
import {
  User,
  Copy,
  Check,
  RotateCw,
  ThumbsUp,
  ThumbsDown,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';
import { ChatMessageItem, FeedbackStatus } from '../../types/chat';

interface ChatMessageProps {
  message: ChatMessageItem;
  onRegenerate?: (messageId: string) => void;
  onFeedback?: (messageId: string, feedback: FeedbackStatus) => void;
  onCopySuccess?: (text: string) => void;
  isLast?: boolean;
  isLoading?: boolean;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onRegenerate,
  onFeedback,
  onCopySuccess,
  isLoading = false,
}) => {
  const [copied, setCopied] = useState(false);
  const isUser = message.role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      onCopySuccess?.('Response copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard access denied — silent fail
    }
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  // ── User message ──────────────────────────────────────────────
  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        id={`chat-message-${message.id}`}
        className="flex justify-end max-w-2xl ml-auto w-full"
      >
        <div className="flex flex-col items-end max-w-[85%]">
          <div className="flex items-center gap-2 mb-1.5 pr-1">
            <span className="text-[11px] text-slate-500 font-mono">{formattedTime}</span>
            <span className="text-xs font-medium text-slate-400">You</span>
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 border border-blue-400/20 flex items-center justify-center shadow-sm">
              <User className="w-3.5 h-3.5 text-white" />
            </div>
          </div>
          <div className="px-4 py-3 rounded-2xl rounded-tr-sm bg-gradient-to-br from-blue-600/90 via-indigo-600/90 to-violet-700/80 text-white text-sm leading-relaxed shadow-lg shadow-blue-950/30 border border-blue-400/15 break-words">
            {message.content}
          </div>
        </div>
      </motion.div>
    );
  }

  // ── AI message ────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      id={`chat-message-${message.id}`}
      className="flex items-start gap-3 max-w-4xl mr-auto w-full group"
    >
      {/* AI avatar */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-md mt-0.5 border ${
          message.isError
            ? 'bg-rose-950/60 border-rose-500/30 text-rose-400'
            : 'bg-gradient-to-br from-emerald-500/20 via-cyan-500/15 to-slate-800 border-emerald-500/25 text-emerald-400'
        }`}
      >
        {message.isError ? (
          <AlertTriangle className="w-3.5 h-3.5" />
        ) : (
          <Sparkles className="w-3.5 h-3.5" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        {/* Name + time */}
        <div className="flex items-center gap-2.5 mb-2">
          <span
            className={`text-xs font-semibold ${
              message.isError ? 'text-rose-400' : 'text-emerald-400'
            }`}
          >
            MarketMind AI
          </span>
          <span className="text-[11px] text-slate-600 font-mono">{formattedTime}</span>
        </div>

        {/* Message card */}
        <div
          className={`rounded-2xl rounded-tl-sm border text-sm leading-relaxed ${
            message.isError
              ? 'bg-rose-950/25 border-rose-800/40 text-rose-200 p-4'
              : 'bg-[#0D1117]/90 border-[#1e293b] text-slate-200 p-5 shadow-lg shadow-black/20'
          }`}
        >
          <div className="mm-prose">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ ...props }) => <h1 {...props} />,
                h2: ({ ...props }) => <h2 {...props} />,
                h3: ({ ...props }) => <h3 {...props} />,
                p: ({ ...props }) => <p {...props} />,
                ul: ({ ...props }) => <ul {...props} />,
                ol: ({ ...props }) => <ol {...props} />,
                li: ({ ...props }) => <li {...props} />,
                blockquote: ({ ...props }) => <blockquote {...props} />,
                table: ({ ...props }) => (
                  <div className="overflow-x-auto rounded-lg border border-[#1e293b] my-3">
                    <table {...props} />
                  </div>
                ),
                thead: ({ ...props }) => <thead {...props} />,
                tbody: ({ ...props }) => <tbody {...props} />,
                tr: ({ ...props }) => <tr {...props} />,
                th: ({ ...props }) => <th {...props} />,
                td: ({ ...props }) => <td {...props} />,
                code: ({ className, children, ...props }) => {
                  const isBlock = Boolean(className);
                  return isBlock ? (
                    <pre>
                      <code {...props}>{children}</code>
                    </pre>
                  ) : (
                    <code {...props}>{children}</code>
                  );
                },
                a: ({ ...props }) => (
                  <a target="_blank" rel="noreferrer noopener" {...props} />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Action bar — shown on hover for AI messages */}
          {!message.isError && (
            <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#1e293b]/80 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              <div className="flex items-center gap-0.5">
                {/* Copy */}
                <button
                  id={`copy-button-${message.id}`}
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-200 hover:bg-slate-800/60 transition-colors"
                  title="Copy response"
                  aria-label="Copy AI response"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                {/* Regenerate */}
                {onRegenerate && (
                  <button
                    id={`regenerate-button-${message.id}`}
                    onClick={() => onRegenerate(message.id)}
                    disabled={isLoading}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-200 hover:bg-slate-800/60 transition-colors disabled:opacity-40"
                    title="Regenerate response"
                    aria-label="Regenerate response"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Regenerate</span>
                  </button>
                )}
              </div>

              {/* Feedback */}
              {onFeedback && (
                <div className="flex items-center gap-0.5">
                  <button
                    id={`feedback-helpful-${message.id}`}
                    onClick={() => onFeedback(message.id, 'helpful')}
                    className={`p-1.5 rounded-lg transition-colors ${
                      message.feedback === 'helpful'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/40'
                        : 'text-slate-600 hover:text-slate-300 hover:bg-slate-800/60'
                    }`}
                    title="Helpful"
                    aria-label="Mark helpful"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    id={`feedback-unhelpful-${message.id}`}
                    onClick={() => onFeedback(message.id, 'unhelpful')}
                    className={`p-1.5 rounded-lg transition-colors ${
                      message.feedback === 'unhelpful'
                        ? 'bg-rose-950/60 text-rose-400 border border-rose-800/40'
                        : 'text-slate-600 hover:text-slate-300 hover:bg-slate-800/60'
                    }`}
                    title="Not helpful"
                    aria-label="Mark unhelpful"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
