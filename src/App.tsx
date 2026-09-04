import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar/Sidebar';
import { ChatWindow } from './components/Chat/ChatWindow';
import { Modal } from './components/UI/Modal';
import { Toast, ToastMessage } from './components/UI/Toast';
import { useSession } from './hooks/useSession';
import { useChat } from './hooks/useChat';
import { testConnection, getN8nWebhookUrl, DEFAULT_N8N_WEBHOOK_URL } from './services/n8n';
import { ConnectionStatusType } from './types/n8n';
import {
  Menu,
  LineChart,
  RefreshCw,
  Trash2,
  Cpu,
  Layers,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';

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

  // Mobile sidebar state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals state
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  // Backend connection state (starts as 'idle' - prompt mandates NOT always displaying "Connected"!)
  const [backendStatus, setBackendStatus] = useState<ConnectionStatusType>('idle');
  const [backendLatency, setBackendLatency] = useState<number | undefined>(undefined);
  const [backendLastChecked, setBackendLastChecked] = useState<string | undefined>(undefined);
  const [backendErrorMessage, setBackendErrorMessage] = useState<string | undefined>(undefined);

  // Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Backend verification handler
  const handleTestBackend = useCallback(async () => {
    setBackendStatus('testing');
    setBackendErrorMessage(undefined);

    const result = await testConnection(sessionId);
    setBackendLatency(result.latencyMs);
    setBackendLastChecked(new Date().toISOString());

    if (result.success) {
      setBackendStatus('connected');
      addToast('success', `✓ n8n Backend Connected (${result.latencyMs}ms)`);
    } else {
      setBackendStatus('offline');
      setBackendErrorMessage(result.error);
      addToast('error', `✕ n8n Backend Offline: ${result.error || 'Connection failed'}`);
    }
  }, [sessionId, addToast]);

  // If a chat query finishes successfully or fails, update connection state organically
  useEffect(() => {
    if (errorMessage) {
      setBackendStatus('offline');
      setBackendErrorMessage(errorMessage);
    }
  }, [errorMessage]);

  const handleResetSession = () => {
    const newId = renewSession();
    createNewChat();
    addToast('info', `New session generated: ${newId}`);
  };

  const handleClearAllHistory = () => {
    if (window.confirm('Are you sure you want to clear all chat history? This cannot be undone.')) {
      conversations.forEach((c) => deleteConversation(c.id));
      createNewChat();
      addToast('info', 'Chat history cleared.');
    }
  };

  const webhookUrl = getN8nWebhookUrl();

  return (
    <div className="flex h-screen w-screen bg-[#080B11] text-slate-100 overflow-hidden select-none font-sans">
      {/* Toast Notifications */}
      <Toast toasts={toasts} onDismiss={dismissToast} />

      {/* Glassmorphism Sidebar */}
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
        onQuickQuery={sendQuery}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden relative">
        {/* Mobile Header Bar */}
        <div className="lg:hidden h-14 border-b border-slate-800/80 bg-[#090D18]/90 backdrop-blur-xl px-4 flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 flex items-center justify-center">
                <LineChart className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="font-bold text-sm tracking-tight text-white">MarketMind AI</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Connection status indicator on mobile */}
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                backendStatus === 'connected'
                  ? 'bg-emerald-400'
                  : backendStatus === 'offline'
                  ? 'bg-rose-500'
                  : 'bg-slate-500'
              }`}
              title={`Status: ${backendStatus}`}
            />
          </div>
        </div>

        {/* Chat Window */}
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

      {/* Settings Modal */}
      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="MarketMind AI Configuration"
        id="settings-modal"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Production n8n Webhook Endpoint
            </label>
            <div className="p-2.5 rounded-lg bg-black/40 border border-slate-800 text-xs font-mono text-emerald-400 break-all select-text">
              {webhookUrl}
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Configured via <code className="text-slate-400">VITE_N8N_WEBHOOK_URL</code>. Fallback defaults to the production endpoint.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Active Browser Session ID
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-1 p-2 rounded-lg bg-black/40 border border-slate-800 text-xs font-mono text-cyan-300 truncate select-text">
                {sessionId}
              </div>
              <button
                onClick={handleResetSession}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors shrink-0"
              >
                Reset
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Used by n8n Generative AI memory nodes to maintain multi-turn context.
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Connection Diagnostics
            </label>
            <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900/50 border border-slate-800 mb-2">
              <div className="flex items-center gap-2">
                {backendStatus === 'connected' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : backendStatus === 'offline' ? (
                  <XCircle className="w-4 h-4 text-rose-400" />
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />
                )}
                <span className="text-xs font-medium text-slate-200">
                  {backendStatus === 'connected'
                    ? `Connected (${backendLatency}ms)`
                    : backendStatus === 'offline'
                    ? 'Offline'
                    : 'Not Verified'}
                </span>
              </div>
              <button
                onClick={handleTestBackend}
                disabled={backendStatus === 'testing'}
                className="px-3 py-1.5 rounded-lg bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 text-xs font-medium border border-cyan-700/50 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3 h-3 ${backendStatus === 'testing' ? 'animate-spin' : ''}`} />
                <span>{backendStatus === 'testing' ? 'Testing...' : 'Test Backend'}</span>
              </button>
            </div>
            {backendLastChecked && (
              <p className="text-[10px] text-slate-500 font-mono">
                Last checked: {new Date(backendLastChecked).toLocaleTimeString()}
              </p>
            )}
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Storage Management
            </label>
            <button
              onClick={handleClearAllHistory}
              className="w-full py-2 px-3 rounded-lg bg-rose-950/20 hover:bg-rose-950/40 text-rose-300 border border-rose-900/40 text-xs font-medium flex items-center justify-center gap-2 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Local Conversation History</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* About Modal */}
      <Modal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
        title="About MarketMind AI"
        id="about-modal"
      >
        <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-emerald-950/30 via-cyan-950/20 to-slate-900 border border-slate-800">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500/20 to-cyan-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <LineChart className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">MarketMind AI</h4>
              <p className="text-emerald-400 text-[11px] font-medium">"Understand the Market. Faster."</p>
            </div>
          </div>

          <p>
            MarketMind AI is a presentation-grade AI stock market and trading assistant frontend designed for a
            Generative AI capstone showcase.
          </p>

          <div className="space-y-2 p-3 rounded-lg bg-black/40 border border-slate-800">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold">
              <Layers className="w-3.5 h-3.5" />
              <span>System Architecture</span>
            </div>
            <p className="text-[11px] text-slate-400">
              User Prompt → Frontend POST <code className="text-slate-300">/webhook/ai-market-agent</code> →
              n8n Orchestrator → Generative AI Agent with Stock Market News Tool, Stock Market Data Tool & Gmail Tool
              → Structured Response → Client Render.
            </p>
          </div>

          <div className="space-y-2 p-3 rounded-lg bg-black/40 border border-slate-800">
            <div className="flex items-center gap-2 text-emerald-400 font-semibold">
              <Cpu className="w-3.5 h-3.5" />
              <span>Zero-Fabrication Guarantee</span>
            </div>
            <p className="text-[11px] text-slate-400">
              The frontend never simulates mock financial indicators, prices, or market news. Every data point
              originates directly from the live n8n AI agent.
            </p>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-500">
            <p className="font-semibold text-slate-400 mb-0.5">Disclaimer</p>
            MarketMind AI provides informational insights for educational purposes and does not constitute financial advice.
          </div>
        </div>
      </Modal>
    </div>
  );
}
