import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar/Sidebar';
import { ChatWindow } from './components/Chat/ChatWindow';
import { Modal } from './components/UI/Modal';
import { Toast, ToastMessage } from './components/UI/Toast';
import { useSession } from './hooks/useSession';
import { useChat } from './hooks/useChat';
import { testConnection } from './services/n8n';
import { ConnectionStatusType } from './types/n8n';
import {
  Menu,
  Sparkles,
  Trash2,
  TrendingUp,
  Newspaper,
  Mail,
  BarChart2,
  ArrowDown,
} from 'lucide-react';

// ── Subtle financial background — static SVG grid, zero animation cost ──────
const FinancialBackground: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden -z-10" aria-hidden="true">
    {/* Very faint dot grid */}
    <svg
      width="100%"
      height="100%"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 opacity-[0.018]"
    >
      <defs>
        <pattern id="dot-grid" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
          <circle cx="1" cy="1" r="1" fill="#10b981" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#dot-grid)" />
    </svg>
    {/* Subtle ambient glows */}
    <div className="absolute top-0 right-1/4 w-[600px] h-[400px] bg-emerald-900/8 rounded-full blur-[140px]" />
    <div className="absolute bottom-1/4 left-1/3 w-[400px] h-[300px] bg-cyan-900/6 rounded-full blur-[120px]" />
  </div>
);

export default function App() {
  const { sessionId, renewSession } = useSession();
  const {
    conversations,
    activeConversationId,
    activeConversation,
    messages,
    isLoading,
    loadingStatus,
    errorMessage,
    lastFailedQuery,
    sendQuery,
    createNewChat,
    selectConversation,
    renameConversation,
    deleteConversation,
    setFeedback,
    regenerateResponse,
    retryLast,
  } = useChat(sessionId);

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Backend connection — starts 'idle'; only updated by real requests
  const [backendStatus, setBackendStatus] = useState<ConnectionStatusType>('idle');
  const [backendLatency, setBackendLatency] = useState<number | undefined>(undefined);
  const [backendLastChecked, setBackendLastChecked] = useState<string | undefined>(undefined);
  const [backendErrorMessage, setBackendErrorMessage] = useState<string | undefined>(undefined);

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const handleTestBackend = useCallback(async () => {
    setBackendStatus('testing');
    setBackendErrorMessage(undefined);
    const result = await testConnection(sessionId);
    setBackendLatency(result.latencyMs);
    setBackendLastChecked(new Date().toISOString());
    if (result.success) {
      setBackendStatus('connected');
      addToast('success', `✓ Backend Connected (${result.latencyMs}ms)`);
    } else {
      setBackendStatus('offline');
      setBackendErrorMessage(result.error);
      addToast('error', `Backend offline — please try again`);
    }
  }, [sessionId, addToast]);

  // Organically update connection status from chat outcomes
  useEffect(() => {
    if (errorMessage) {
      setBackendStatus('offline');
      setBackendErrorMessage(errorMessage);
    }
  }, [errorMessage]);

  useEffect(() => {
    if (!isLoading && !errorMessage && messages.length > 0) {
      const last = messages[messages.length - 1];
      if (last.role === 'assistant' && !last.isError) setBackendStatus('connected');
    }
  }, [isLoading, errorMessage, messages]);

  const handleClearHistory = () => {
    if (window.confirm('Clear all conversation history? This cannot be undone.')) {
      conversations.forEach((c) => deleteConversation(c.id));
      createNewChat();
      addToast('info', 'Conversation history cleared.');
    }
  };

  return (
    <div className="flex h-screen w-screen bg-[#08090E] text-slate-100 overflow-hidden select-none font-sans relative">
      <FinancialBackground />
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Desktop sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        backendStatus={backendStatus}
        backendLatency={backendLatency}
        backendLastChecked={backendLastChecked}
        backendErrorMessage={backendErrorMessage}
        onNewChat={createNewChat}
        onSelectConversation={selectConversation}
        onRenameConversation={renameConversation}
        onDeleteConversation={deleteConversation}
        onTestBackend={handleTestBackend}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main content column */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Mobile top bar */}
        <div className="lg:hidden h-12 border-b border-[#1e293b]/80 bg-[#08090E]/95 backdrop-blur-xl px-4 flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800/60 transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-emerald-500/20 to-cyan-500/15 border border-emerald-500/25 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="font-bold text-sm tracking-tight text-white">MarketMind AI</span>
            </div>
          </div>
          <span
            className={`w-2 h-2 rounded-full ${
              backendStatus === 'connected'
                ? 'bg-emerald-400'
                : backendStatus === 'offline'
                ? 'bg-rose-500'
                : 'bg-slate-600'
            }`}
            title={`Backend: ${backendStatus}`}
          />
        </div>

        {/* Chat window */}
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          loadingStatus={loadingStatus}
          errorMessage={errorMessage}
          lastFailedQuery={lastFailedQuery}
          conversationTitle={activeConversation?.title}
          sessionId={sessionId}
          onSendMessage={sendQuery}
          onRegenerateMessage={regenerateResponse}
          onFeedback={setFeedback}
          onNewChat={createNewChat}
          onRetry={retryLast}
          onCopySuccess={(msg) => addToast('success', msg)}
        />
      </div>

      {/* ── Settings Modal ─────────────────────────── */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Settings"
        id="settings-modal"
      >
        <div className="space-y-5">
          {/* Conversation */}
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Conversation
            </label>
            <button
              onClick={() => {
                handleClearHistory();
                setIsSettingsOpen(false);
              }}
              className="w-full py-2.5 px-3 rounded-xl bg-rose-950/20 hover:bg-rose-950/40 text-rose-300 border border-rose-900/40 text-sm font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              <span>Clear Chat History</span>
            </button>
          </div>

          {/* Backend */}
          <div className="pt-2 border-t border-[#1e293b]/80">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              Backend
            </label>
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#0D1117] border border-[#1e293b]">
              <div className="flex items-center gap-2.5">
                <span
                  className={`w-2 h-2 rounded-full shrink-0 ${
                    backendStatus === 'connected'
                      ? 'bg-emerald-500'
                      : backendStatus === 'offline'
                      ? 'bg-rose-500'
                      : 'bg-slate-600'
                  }`}
                />
                <span className="text-sm text-slate-200">
                  {backendStatus === 'connected'
                    ? `Connected${backendLatency ? ` · ${backendLatency}ms` : ''}`
                    : backendStatus === 'offline'
                    ? 'Offline'
                    : backendStatus === 'testing'
                    ? 'Testing…'
                    : 'Not verified'}
                </span>
              </div>
              <button
                onClick={handleTestBackend}
                disabled={backendStatus === 'testing'}
                className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/60 transition-colors disabled:opacity-50"
              >
                {backendStatus === 'testing' ? 'Testing…' : 'Test'}
              </button>
            </div>
            {backendLastChecked && (
              <p className="text-[11px] text-slate-600 mt-1.5 px-1">
                Last checked {new Date(backendLastChecked).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      </Modal>

      {/* ── About Modal ────────────────────────────── */}
      <Modal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        title="About MarketMind AI"
        id="about-modal"
      >
        <div className="space-y-5">
          {/* Hero */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-cyan-950/20 to-[#0D1117] border border-[#1e293b]">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/25 to-cyan-500/15 border border-emerald-500/25 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">MarketMind AI</h3>
              <p className="text-emerald-400 text-sm font-medium mt-0.5">
                "Understand the Market. Faster."
              </p>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-slate-300 leading-relaxed">
            MarketMind AI is a Generative AI-powered stock market assistant that helps you quickly
            understand stock prices, market movements, and the latest financial news through
            natural-language conversations.
          </p>

          {/* What it can do */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              What it can do
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                {
                  icon: TrendingUp,
                  color: 'text-emerald-400',
                  bg: 'bg-emerald-500/10',
                  title: 'Stock Information',
                  desc: 'Prices and recent movements',
                },
                {
                  icon: Newspaper,
                  color: 'text-cyan-400',
                  bg: 'bg-cyan-500/10',
                  title: 'Market News',
                  desc: 'Latest financial headlines',
                },
                {
                  icon: BarChart2,
                  color: 'text-violet-400',
                  bg: 'bg-violet-500/10',
                  title: 'AI Analysis',
                  desc: 'Complex trends simplified',
                },
                {
                  icon: Mail,
                  color: 'text-amber-400',
                  bg: 'bg-amber-500/10',
                  title: 'Email Reports',
                  desc: 'Send summaries via email',
                },
              ].map(({ icon: Icon, color, bg, title, desc }) => (
                <div
                  key={title}
                  className="p-3 rounded-xl bg-[#0D1117] border border-[#1e293b] flex flex-col gap-2"
                >
                  <div className={`w-7 h-7 rounded-lg ${bg} flex items-center justify-center`}>
                    <Icon className={`w-3.5 h-3.5 ${color}`} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
              How it works
            </p>
            <div className="flex flex-col items-center gap-1 text-sm">
              {['Your question', 'AI Agent', 'Market data & news', 'AI analysis', 'Clear response'].map(
                (step, i, arr) => (
                  <React.Fragment key={step}>
                    <div className="px-4 py-2 rounded-xl bg-[#0D1117] border border-[#1e293b] text-slate-300 font-medium text-center w-full">
                      {step}
                    </div>
                    {i < arr.length - 1 && (
                      <ArrowDown className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                    )}
                  </React.Fragment>
                )
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="pt-2 border-t border-[#1e293b]/80 space-y-2">
            <p className="text-[11px] text-slate-500 text-center">
              Built with React, n8n, Google Gemini, and Generative AI.
            </p>
            <p className="text-[11px] text-slate-600 text-center leading-relaxed">
              MarketMind AI provides informational insights for educational purposes and does not
              constitute financial advice.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
}
