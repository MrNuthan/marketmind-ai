import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'motion/react';
import {
  Bot,
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
      if (onCopySuccess) {
        onCopySuccess('Response copied to clipboard');
      }
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25 }}
        id={`chat-message-${message.id}`}
        className="flex justify-end gap-3 max-w-2xl ml-auto w-full group"
      >
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] text-slate-500">{formattedTime}</span>
            <span className="text-xs font-medium text-slate-400">You</span>
          </div>

          <div className="relative px-4 py-3 rounded-2xl rounded-tr-sm bg-gradient-to-br from-cyan-600 via-blue-600 to-indigo-700 text-white shadow-lg shadow-cyan-950/30 text-sm font-normal leading-relaxed border border-cyan-400/20 break-words max-w-xl">
            {message.content}
          </div>
        </div>

        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 border border-blue-400/30 flex items-center justify-center shrink-0 shadow-md mt-5">
          <User className="w-4 h-4 text-white" />
        </div>
      </motion.div>
    );
  }

  // AI Response
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25 }}
      id={`chat-message-${message.id}`}
      className="flex justify-start gap-3.5 max-w-4xl mr-auto w-full group"
    >
      {/* AI Avatar */}
      <div
        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-lg mt-1 border ${
          message.isError
            ? 'bg-rose-950/60 border-rose-500/40 text-rose-400'
            : 'bg-gradient-to-br from-emerald-500/20 via-cyan-500/20 to-blue-500/20 border-emerald-500/30 text-emerald-400 shadow-emerald-950/20'
        }`}
      >
        {message.isError ? <AlertTriangle className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      <div className="flex-1 min-w-0">
        {/* Header line */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              MarketMind AI
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Agent Intelligence</span>
          </div>
          <span className="text-[11px] text-slate-500">{formattedTime}</span>
        </div>

        {/* Message Card */}
        <div
          className={`p-5 rounded-2xl rounded-tl-sm border backdrop-blur-md shadow-xl text-sm leading-relaxed transition-all ${
            message.isError
              ? 'bg-rose-950/30 border-rose-800/50 text-rose-200'
              : 'bg-[#0D1322]/90 border-slate-800/90 text-slate-200 shadow-black/40'
          }`}
        >
          <div className="markdown-body space-y-3 prose prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-black/50 prose-pre:border prose-pre:border-slate-800">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ ...props }) => (
                  <h1 className="text-lg font-bold text-white border-b border-slate-800 pb-2 mb-3 mt-1 flex items-center gap-2" {...props} />
                ),
                h2: ({ ...props }) => (
                  <h2 className="text-base font-semibold text-slate-100 mt-4 mb-2 flex items-center gap-1.5" {...props} />
                ),
                h3: ({ ...props }) => (
                  <h3 className="text-sm font-semibold text-emerald-300 mt-3 mb-1" {...props} />
                ),
                p: ({ ...props }) => <p className="mb-2.5 text-slate-200 leading-relaxed" {...props} />,
                ul: ({ ...props }) => (
                  <ul className="list-disc list-outside ml-5 space-y-1.5 text-slate-300 mb-3" {...props} />
                ),
                ol: ({ ...props }) => (
                  <ol className="list-decimal list-outside ml-5 space-y-1.5 text-slate-300 mb-3" {...props} />
                ),
                li: ({ ...props }) => <li className="leading-relaxed" {...props} />,
                blockquote: ({ ...props }) => (
                  <blockquote
                    className="border-l-2 border-emerald-500/60 pl-3.5 py-1 text-slate-300/90 bg-emerald-950/20 rounded-r-md italic my-3"
                    {...props}
                  />
                ),
                table: ({ ...props }) => (
                  <div className="overflow-x-auto my-3 rounded-lg border border-slate-800">
                    <table className="w-full text-left border-collapse text-xs" {...props} />
                  </div>
                ),
                thead: ({ ...props }) => <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-300 font-semibold" {...props} />,
                tbody: ({ ...props }) => <tbody className="divide-y divide-slate-800/60" {...props} />,
                tr: ({ ...props }) => <tr className="hover:bg-slate-800/30 transition-colors" {...props} />,
                th: ({ ...props }) => <th className="p-2.5 font-medium text-slate-200" {...props} />,
                td: ({ ...props }) => <td className="p-2.5 text-slate-300" {...props} />,
                code: ({ className, children, ...props }) => {
                  const isBlock = Boolean(className);
                  return isBlock ? (
                    <code
                      className="block p-3 rounded-lg bg-black/60 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto"
                      {...props}
                    >
                      {children}
                    </code>
                  ) : (
                    <code
                      className="px-1.5 py-0.5 rounded bg-black/40 border border-slate-800 text-xs font-mono text-cyan-300"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                },
                a: ({ ...props }) => (
                  <a
                    className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors font-medium"
                    target="_blank"
                    rel="noreferrer noopener"
                    {...props}
                  />
                ),
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>

          {/* Action Bar (Copy, Regenerate, Helpful, Unhelpful) */}
          {!message.isError && (
            <div className="flex items-center justify-between pt-3 mt-4 border-t border-slate-800/70 text-xs text-slate-400">
              <div className="flex items-center gap-1">
                {/* Copy */}
                <button
                  id={`copy-button-${message.id}`}
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-slate-800/80 hover:text-slate-200 transition-colors"
                  title="Copy response to clipboard"
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
                    className="flex items-center gap-1.5 px-2 py-1 rounded-md hover:bg-slate-800/80 hover:text-slate-200 transition-colors disabled:opacity-40"
                    title="Resend previous query"
                    aria-label="Regenerate response"
                  >
                    <RotateCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
                    <span>Regenerate</span>
                  </button>
                )}
              </div>

              {/* Feedback */}
              {onFeedback && (
                <div className="flex items-center gap-1">
                  <button
                    id={`feedback-helpful-${message.id}`}
                    onClick={() => onFeedback(message.id, 'helpful')}
                    className={`p-1.5 rounded-md transition-colors ${
                      message.feedback === 'helpful'
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/50'
                        : 'hover:bg-slate-800/80 text-slate-500 hover:text-slate-300'
                    }`}
                    title="Helpful"
                    aria-label="Mark helpful"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    id={`feedback-unhelpful-${message.id}`}
                    onClick={() => onFeedback(message.id, 'unhelpful')}
                    className={`p-1.5 rounded-md transition-colors ${
                      message.feedback === 'unhelpful'
                        ? 'bg-rose-950/60 text-rose-400 border border-rose-800/50'
                        : 'hover:bg-slate-800/80 text-slate-500 hover:text-slate-300'
                    }`}
                    title="Not Helpful"
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
