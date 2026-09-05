import React, { useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChatMessageItem, FeedbackStatus } from '../../types/chat';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { WelcomeScreen } from './WelcomeScreen';
import { ChatInput } from './ChatInput';
import { RotateCcw, AlertCircle } from 'lucide-react';

interface ChatWindowProps {
  messages: ChatMessageItem[];
  isLoading: boolean;
  loadingStatus?: string;
  errorMessage?: string | null;
  lastFailedQuery?: string | null;
  conversationTitle?: string;
  sessionId: string;
  onSendMessage: (query: string) => void;
  onRegenerateMessage: (messageId: string) => void;
  onFeedback: (messageId: string, feedback: FeedbackStatus) => void;
  onNewChat: () => void;
  onRetry: () => void;
  onCopySuccess: (text: string) => void;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  isLoading,
  loadingStatus,
  errorMessage,
  lastFailedQuery,
  sessionId,
  onSendMessage,
  onRegenerateMessage,
  onFeedback,
  onRetry,
  onCopySuccess,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasMessages = messages.length > 0;

  // Auto-scroll to bottom when messages/loading change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div
      id="marketmind-chat-window"
      className="relative flex-1 flex flex-col h-full bg-[#08090E] overflow-hidden"
    >
      {/* Hidden h1 for SEO / accessibility */}
      <h1 className="sr-only">MarketMind AI – Intelligent Market Assistant</h1>

      {/* Message area */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 flex flex-col">
        <AnimatePresence mode="wait">
          {!hasMessages ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex"
            >
              <WelcomeScreen onSelectAction={onSendMessage} disabled={isLoading} />
            </motion.div>
          ) : (
            <motion.div
              key="messages"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="w-full max-w-3xl mx-auto flex-1 flex flex-col space-y-5"
            >
              {messages.map((message, index) => (
                <ChatMessage
                  key={message.id}
                  message={message}
                  isLast={index === messages.length - 1}
                  isLoading={isLoading}
                  onRegenerate={onRegenerateMessage}
                  onFeedback={onFeedback}
                  onCopySuccess={onCopySuccess}
                />
              ))}

              {/* Loading indicator */}
              {isLoading && <TypingIndicator statusText={loadingStatus} />}

              {/* Error retry banner */}
              {errorMessage && lastFailedQuery && !isLoading && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/40 flex items-start justify-between gap-3 text-sm text-rose-200"
                >
                  <div className="flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-rose-300 text-sm">Request failed</p>
                      <p className="text-xs text-rose-200/70 mt-0.5">{errorMessage}</p>
                    </div>
                  </div>
                  <button
                    onClick={onRetry}
                    className="px-3 py-1.5 rounded-lg bg-rose-900/50 hover:bg-rose-800/60 text-xs font-medium text-rose-100 border border-rose-700/40 flex items-center gap-1.5 transition-colors shrink-0"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retry</span>
                  </button>
                </motion.div>
              )}

              <div ref={messagesEndRef} className="h-6" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input — fixed at bottom with gradient fade */}
      <div className="shrink-0 bg-gradient-to-t from-[#08090E] via-[#08090E]/95 to-transparent pt-3">
        <ChatInput onSend={onSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};

// Silence unused-prop lint for sessionId (kept for future use)
void ((_: string) => _);
