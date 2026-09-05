import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Conversation } from '../../types/chat';
import { ConnectionStatusType } from '../../types/n8n';
import { ConversationHistory } from './ConversationHistory';
import { BackendStatus } from '../Connection/BackendStatus';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import {
  Sparkles,
  Plus,
  Settings as SettingsIcon,
  Info,
  X,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';

interface SidebarProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  backendStatus: ConnectionStatusType;
  backendLatency?: number;
  backendLastChecked?: string;
  backendErrorMessage?: string;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
  onTestBackend: () => Promise<void>;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

// Tooltips are handled via native `title` attribute on IconBtn below.

// Simple tooltip using title + CSS (reliable cross-browser)
const IconBtn: React.FC<{
  id?: string;
  label: string;
  onClick: () => void;
  active?: boolean;
  className?: string;
  children: React.ReactNode;
}> = ({ id, label, onClick, active = false, className = '', children }) => (
  <button
    id={id}
    onClick={onClick}
    title={label}
    aria-label={label}
    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-150 ${
      active
        ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-400'
        : 'text-slate-500 hover:text-white hover:bg-[#111827] border border-transparent'
    } ${className}`}
  >
    {children}
  </button>
);

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  backendStatus,
  backendLatency,
  backendErrorMessage,
  onNewChat,
  onSelectConversation,
  onRenameConversation,
  onDeleteConversation,
  onTestBackend,
  onOpenSettings,
  onOpenAbout,
  isOpenMobile,
  onCloseMobile,
}) => {
  // Persist collapsed state in localStorage
  const [collapsed, setCollapsed] = useLocalStorage<boolean>('marketmind_sidebar_collapsed', false);

  const toggleCollapsed = () => setCollapsed((prev) => !prev);

  const statusDotColor =
    backendStatus === 'connected'
      ? 'bg-emerald-500'
      : backendStatus === 'offline'
      ? 'bg-rose-500'
      : backendStatus === 'testing'
      ? 'bg-cyan-400'
      : 'bg-slate-600';

  const statusLabel =
    backendStatus === 'connected'
      ? `Backend Connected${backendLatency !== undefined ? ` (${backendLatency}ms)` : ''}`
      : backendStatus === 'offline'
      ? 'Backend Offline'
      : backendStatus === 'testing'
      ? 'Testing...'
      : 'Backend Unverified';

  return (
    <>
      {/* ── Mobile backdrop ─────────────────────────────── */}
      <AnimatePresence>
        {isOpenMobile && (
          <motion.div
            key="sidebar-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onCloseMobile}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* ── Sidebar panel ──────────────────────────────── */}
      {/* Desktop: animated width via motion. Mobile: fixed drawer (always full width) */}
      <motion.aside
        id="marketmind-sidebar"
        initial={false}
        animate={{ width: collapsed ? 68 : 260 }}
        transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
        className={`
          hidden lg:flex flex-col h-full
          bg-[#0A0B10]/95 border-r border-[#1e293b]/80 backdrop-blur-2xl
          overflow-hidden shrink-0
        `}
        style={{ minWidth: collapsed ? 68 : 260 }}
      >
        <CollapsedOrExpanded
          collapsed={collapsed}
          conversations={conversations}
          activeConversationId={activeConversationId}
          backendStatus={backendStatus}
          backendLatency={backendLatency}
          backendErrorMessage={backendErrorMessage}
          statusDotColor={statusDotColor}
          statusLabel={statusLabel}
          onNewChat={onNewChat}
          onSelectConversation={onSelectConversation}
          onRenameConversation={onRenameConversation}
          onDeleteConversation={onDeleteConversation}
          onTestBackend={onTestBackend}
          onOpenSettings={onOpenSettings}
          onOpenAbout={onOpenAbout}
          onToggle={toggleCollapsed}
          onCloseMobile={() => {}} // no-op for desktop
        />
      </motion.aside>

      {/* ── Mobile drawer (full width, no collapse logic) ─── */}
      <motion.aside
        id="marketmind-sidebar-mobile"
        initial={false}
        className={`
          fixed top-0 bottom-0 left-0 z-50 w-[260px]
          lg:hidden flex flex-col
          bg-[#0A0B10]/97 border-r border-[#1e293b]/80 backdrop-blur-2xl
          transition-transform duration-300 ease-in-out
          ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <CollapsedOrExpanded
          collapsed={false}
          conversations={conversations}
          activeConversationId={activeConversationId}
          backendStatus={backendStatus}
          backendLatency={backendLatency}
          backendErrorMessage={backendErrorMessage}
          statusDotColor={statusDotColor}
          statusLabel={statusLabel}
          onNewChat={onNewChat}
          onSelectConversation={onSelectConversation}
          onRenameConversation={onRenameConversation}
          onDeleteConversation={onDeleteConversation}
          onTestBackend={onTestBackend}
          onOpenSettings={onOpenSettings}
          onOpenAbout={onOpenAbout}
          onToggle={() => {}} // no collapse on mobile
          onCloseMobile={onCloseMobile}
          isMobile
        />
      </motion.aside>
    </>
  );
};

// ── Inner content — shared between desktop + mobile ────────────────────────────
interface InnerProps {
  collapsed: boolean;
  conversations: Conversation[];
  activeConversationId: string | null;
  backendStatus: ConnectionStatusType;
  backendLatency?: number;
  backendErrorMessage?: string;
  statusDotColor: string;
  statusLabel: string;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
  onTestBackend: () => Promise<void>;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
  onToggle: () => void;
  onCloseMobile: () => void;
  isMobile?: boolean;
}

const CollapsedOrExpanded: React.FC<InnerProps> = ({
  collapsed,
  conversations,
  activeConversationId,
  backendStatus,
  backendLatency,
  backendErrorMessage,
  statusDotColor,
  statusLabel,
  onNewChat,
  onSelectConversation,
  onRenameConversation,
  onDeleteConversation,
  onTestBackend,
  onOpenSettings,
  onOpenAbout,
  onToggle,
  onCloseMobile,
  isMobile = false,
}) => {
  if (collapsed) {
    // ── COLLAPSED DESKTOP ──────────────────────────────────────────────────
    return (
      <div className="flex flex-col items-center h-full py-3 gap-1">
        {/* Logo icon */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500/20 via-cyan-500/15 to-slate-800 border border-emerald-500/25 flex items-center justify-center shadow-lg mb-2">
          <Sparkles className="w-4 h-4 text-emerald-400" />
        </div>

        {/* New Chat */}
        <IconBtn id="sidebar-new-chat-button" label="New Chat" onClick={onNewChat}>
          <Plus className="w-4 h-4 text-emerald-400" />
        </IconBtn>

        {/* Divider */}
        <div className="w-6 h-px bg-[#1e293b] my-1" />

        {/* Conversation history icons */}
        <div className="flex-1 overflow-y-auto w-full min-h-0 flex flex-col items-center">
          <ConversationHistory
            conversations={conversations}
            activeConversationId={activeConversationId}
            collapsed
            onSelectConversation={onSelectConversation}
            onRenameConversation={onRenameConversation}
            onDeleteConversation={onDeleteConversation}
          />
        </div>

        {/* Divider */}
        <div className="w-6 h-px bg-[#1e293b] my-1" />

        {/* Status dot */}
        <button
          onClick={onTestBackend}
          title={statusLabel}
          aria-label={statusLabel}
          className="w-9 h-9 rounded-xl flex items-center justify-center hover:bg-[#111827] transition-colors"
        >
          <span className={`w-2 h-2 rounded-full ${statusDotColor}`} />
        </button>

        {/* About */}
        <IconBtn id="sidebar-about-button" label="About MarketMind AI" onClick={onOpenAbout}>
          <Info className="w-4 h-4" />
        </IconBtn>

        {/* Settings */}
        <IconBtn id="sidebar-settings-button" label="Settings" onClick={onOpenSettings}>
          <SettingsIcon className="w-4 h-4" />
        </IconBtn>

        {/* Expand button */}
        <button
          onClick={onToggle}
          title="Expand sidebar"
          aria-label="Expand sidebar"
          className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-[#111827] transition-colors mt-1"
        >
          <PanelLeftOpen className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // ── EXPANDED (desktop + mobile) ────────────────────────────────────────
  return (
    <div className="flex flex-col h-full">
      {/* Brand header */}
      <div className="px-4 pt-5 pb-4 border-b border-[#1e293b]/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500/20 via-cyan-500/15 to-slate-800 border border-emerald-500/25 flex items-center justify-center shadow-lg shrink-0">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="min-w-0"
            >
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-sm tracking-tight text-white">MarketMind</span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/25 leading-none shrink-0">
                  AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5 truncate">
                Market Intelligence
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Mobile close / Desktop collapse toggle */}
        {isMobile ? (
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800/60 transition-colors shrink-0"
            aria-label="Close sidebar"
          >
            <X className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800/60 transition-colors shrink-0"
            aria-label="Collapse sidebar"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* New Chat */}
      <div className="px-3 pt-3 pb-2 shrink-0">
        <motion.button
          id="sidebar-new-chat-button"
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            onNewChat();
            onCloseMobile();
          }}
          className="w-full py-2.5 px-3 rounded-xl bg-[#0D1117] hover:bg-[#111827] border border-[#1e293b] hover:border-emerald-500/30 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
        >
          <Plus className="w-4 h-4 text-emerald-400" />
          <span>New Chat</span>
        </motion.button>
      </div>

      {/* Conversation history */}
      <div className="flex-1 overflow-y-auto px-3 py-1 min-h-0">
        {conversations.length > 0 && (
          <div className="flex items-center justify-between px-1 pb-2 pt-1">
            <span className="text-[11px] font-medium text-slate-500 tracking-wide">Chats</span>
            <span className="text-[10px] font-mono text-slate-600">{conversations.length}</span>
          </div>
        )}
        <ConversationHistory
          conversations={conversations}
          activeConversationId={activeConversationId}
          collapsed={false}
          onSelectConversation={(id) => {
            onSelectConversation(id);
            onCloseMobile();
          }}
          onRenameConversation={onRenameConversation}
          onDeleteConversation={onDeleteConversation}
        />
      </div>

      {/* Footer */}
      <div className="px-3 pb-4 pt-3 border-t border-[#1e293b]/60 space-y-2 shrink-0">
        <BackendStatus
          status={backendStatus}
          latencyMs={backendLatency}
          errorMessage={backendErrorMessage}
          onTestBackend={onTestBackend}
          compact
        />

        <div className="grid grid-cols-2 gap-1.5">
          <button
            id="sidebar-about-button"
            onClick={onOpenAbout}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs text-slate-500 hover:text-white hover:bg-[#111827] border border-[#1e293b] transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            <span>About</span>
          </button>
          <button
            id="sidebar-settings-button"
            onClick={onOpenSettings}
            className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-xl text-xs text-slate-500 hover:text-white hover:bg-[#111827] border border-[#1e293b] transition-colors"
          >
            <SettingsIcon className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};

// Re-export so consumers don't need to import separately
export { IconBtn };
