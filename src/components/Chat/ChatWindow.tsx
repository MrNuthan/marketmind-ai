import React, { useRef, useEffect } from 'react';
import { ChatMessageItem, FeedbackStatus } from '../../types/chat';
import { ChatMessage } from './ChatMessage';
import { TypingIndicator } from './TypingIndicator';
import { WelcomeScreen } from './WelcomeScreen';
import { ChatInput } from './ChatInput';
import { Sparkles, RotateCcw, AlertCircle } from 'lucide-react';

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
  conversationTitle,
  sessionId,
  onSendMessage,
  onRegenerateMessage,
  onFeedback,
  onNewChat,
  onRetry,
  onCopySuccess,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const hasMessages = messages.length > 0;

  return (
    <div
      id="marketmind-chat-window"
      className="relative flex-1 flex flex-col h-full bg-[#080B11] overflow-hidden"
    >
      {/* Top Header Bar */}
      <header
        id="marketmind-chat-header"
        className="h-14 border-b border-slate-800/80 bg-[#0A0E17]/80 backdrop-blur-xl px-4 sm:px-6 flex items-center justify-between z-10 shrink-0"
      >
        {/* Issue #9: visually-hidden h1 satisfies the single-h1 SEO requirement */}
        <h1 className="sr-only">MarketMind AI – Stock Market Intelligence</h1>
        <div className="flex items-center gap-3 min-w-0">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            {/* Issue #2: make the conversation title h2 visually distinct at 14px, body at 12px */}
            <h2 className="text-sm font-semibold text-slate-100 truncate">
              {conversationTitle || 'MarketMind AI Assistant'}
            </h2>
            {/* Issue #7: bump from 11px → 12px (text-xs) */}
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span className="truncate max-w-[150px] sm:max-w-[220px]" title={sessionId}>
                Session: {sessionId}
              </span>
            </div>
          </div>
        </div>

        {/* Issue #10: header duplicate "New Chat" removed; primary button is in the sidebar. */}
        <div className="flex items-center gap-2" />
      </header>

      {/* Main Content Area: Welcome or Conversation */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 flex flex-col space-y-6"
      >
        {!hasMessages ? (
          <WelcomeScreen onSelectAction={onSendMessage} disabled={isLoading} />
        ) : (
          <div className="w-full max-w-4xl mx-auto flex-1 flex flex-col space-y-6">
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

            {/* Typing status indicator */}
            {isLoading && <TypingIndicator statusText={loadingStatus} />}

            {/* Error banner with retry option */}
            {errorMessage && lastFailedQuery && !isLoading && (
              <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 flex items-start justify-between gap-3 text-sm text-rose-200">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-rose-300">Request couldn't be completed</p>
                    <p className="text-xs text-rose-200/80 mt-0.5">{errorMessage}</p>
                  </div>
                </div>
                <button
                  onClick={onRetry}
                  className="px-3 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-800 text-xs font-medium text-rose-100 border border-rose-700/50 flex items-center gap-1.5 transition-colors shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Retry Query</span>
                </button>
              </div>
            )}

            <div ref={messagesEndRef} className="h-4" />
          </div>
        )}
      </div>

      {/* Fixed Chat Input Area */}
      <div className="shrink-0 bg-gradient-to-t from-[#080B11] via-[#080B11]/90 to-transparent pt-2">
        <ChatInput onSend={onSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
};
