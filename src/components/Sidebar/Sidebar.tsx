import React from 'react';
import { Conversation } from '../../types/chat';
import { ConnectionStatusType } from '../../types/n8n';
import { ConversationHistory } from './ConversationHistory';
import { BackendStatus } from '../Connection/BackendStatus';
import {
  LineChart,
  Plus,
  Bot,
  Newspaper,
  TrendingUp,
  Compass,
  Settings as SettingsIcon,
  Info,
  X,
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
  onQuickQuery: (query: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeConversationId,
  backendStatus,
  backendLatency,
  backendLastChecked,
  backendErrorMessage,
  onNewChat,
  onSelectConversation,
  onRenameConversation,
  onDeleteConversation,
  onTestBackend,
  onOpenSettings,
  onOpenAbout,
  onQuickQuery,
  isOpenMobile,
  onCloseMobile,
}) => {
  const navItems = [
    {
      id: 'nav-assistant',
      label: 'Market Assistant',
      icon: Bot,
      action: () => onNewChat(),
      badge: 'Main',
    },
    {
      id: 'nav-news',
      label: 'Market News',
      icon: Newspaper,
      action: () => onQuickQuery('What is the latest stock market news?'),
      badge: 'Live',
    },
    {
      id: 'nav-stocks',
      label: 'Stock Analysis',
      icon: TrendingUp,
      action: () => onQuickQuery('Analyze NVIDIA and top tech stocks today'),
      badge: 'Deep',
    },
    {
      id: 'nav-trading',
      label: 'Trading Insights',
      icon: Compass,
      action: () => onQuickQuery("Give me today's trading insights"),
      badge: 'Trends',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        id="marketmind-sidebar"
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-72 bg-[#090D18]/95 lg:bg-[#090D18]/70 border-r border-slate-800/80 backdrop-blur-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 pb-3 border-b border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500/20 via-cyan-500/20 to-blue-500/20 border border-emerald-400/30 flex items-center justify-center shadow-md">
              <LineChart className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm tracking-tight text-white">MARKETMIND</span>
                <span className="text-[10px] font-bold px-1 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wide font-medium">
                AI Stock Market Intelligence
              </p>
            </div>
          </div>

          {/* Close button on mobile */}
          <button
            onClick={onCloseMobile}
            className="p-1 rounded-lg text-slate-400 hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Primary Action: New Chat */}
        <div className="p-3">
          <button
            id="sidebar-new-chat-button"
            onClick={() => {
              onNewChat();
              onCloseMobile();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-emerald-500/20 via-cyan-500/20 to-blue-500/10 hover:from-emerald-500/30 hover:to-cyan-500/30 text-white font-medium text-xs border border-emerald-500/40 shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>New Chat</span>
          </button>
        </div>

        {/* Navigation Section */}
        <div className="px-3 py-1 space-y-0.5">
          <span className="px-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Intelligence Modes
          </span>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                id={item.id}
                onClick={() => {
                  item.action();
                  onCloseMobile();
                }}
                className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
                  <span>{item.label}</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400 group-hover:text-cyan-400">
                  {item.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="my-2 border-t border-slate-800/60 mx-3" />

        {/* Conversation History */}
        <div className="flex-1 overflow-y-auto px-3 py-1 min-h-0">
          <div className="flex items-center justify-between px-2 pb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Recent Conversations
            </span>
            <span className="text-[10px] font-mono text-slate-400">{conversations.length}</span>
          </div>
          <ConversationHistory
            conversations={conversations}
            activeConversationId={activeConversationId}
            onSelectConversation={(id) => {
              onSelectConversation(id);
              onCloseMobile();
            }}
            onRenameConversation={onRenameConversation}
            onDeleteConversation={onDeleteConversation}
          />
        </div>

        {/* Footer Area: Backend Status & Actions */}
        <div className="p-3 border-t border-slate-800/80 bg-[#070A12]/80 space-y-2.5 shrink-0">
          {/* Real Backend Connection Status */}
          <BackendStatus
            status={backendStatus}
            latencyMs={backendLatency}
            lastChecked={backendLastChecked}
            errorMessage={backendErrorMessage}
            onTestBackend={onTestBackend}
            compact={true}
          />

          {/* Settings & About Buttons */}
          <div className="grid grid-cols-2 gap-1.5 pt-1">
            <button
              id="sidebar-settings-button"
              onClick={onOpenSettings}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800/70 border border-slate-800 transition-colors"
            >
              <SettingsIcon className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
            <button
              id="sidebar-about-button"
              onClick={onOpenAbout}
              className="flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-xs text-slate-400 hover:text-white hover:bg-slate-800/70 border border-slate-800 transition-colors"
            >
              <Info className="w-3.5 h-3.5" />
              <span>About</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
