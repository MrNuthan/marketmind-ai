import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Conversation } from '../../types/chat';
import { MessageSquare, MoreHorizontal, Pencil, Trash2, Check, X } from 'lucide-react';

interface ConversationHistoryProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  collapsed?: boolean;
  onSelectConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
}

/** Bucket conversations into Today / Yesterday / Older — O(n) */
function groupConversations(conversations: Conversation[]) {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;

  const groups: { label: string; items: Conversation[] }[] = [];
  const today: Conversation[] = [];
  const yesterday: Conversation[] = [];
  const older: Conversation[] = [];

  for (const conv of conversations) {
    const ts = new Date(conv.updatedAt || conv.createdAt).getTime();
    if (ts >= todayStart) today.push(conv);
    else if (ts >= yesterdayStart) yesterday.push(conv);
    else older.push(conv);
  }

  if (today.length) groups.push({ label: 'Today', items: today });
  if (yesterday.length) groups.push({ label: 'Yesterday', items: yesterday });
  if (older.length) groups.push({ label: 'Older', items: older });

  return groups;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  conversations,
  activeConversationId,
  collapsed = false,
  onSelectConversation,
  onRenameConversation,
  onDeleteConversation,
}) => {
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editTitle, setEditTitle] = React.useState('');
  const [menuOpenId, setMenuOpenId] = React.useState<string | null>(null);

  const groups = useMemo(() => groupConversations(conversations), [conversations]);

  const startEditing = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
    setMenuOpenId(null);
  };

  const handleSaveRename = (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editTitle.trim()) onRenameConversation(id, editTitle.trim());
    setEditingId(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteConversation(id);
    setMenuOpenId(null);
  };

  if (conversations.length === 0) {
    if (collapsed) return null;
    return (
      <div className="px-2 py-5 text-center">
        <p className="text-xs text-slate-500">No conversations yet</p>
        <p className="text-[11px] text-slate-600 mt-1">Start chatting to build history</p>
      </div>
    );
  }

  // ── Collapsed: show icon buttons for recent conversations ──
  if (collapsed) {
    return (
      <div className="flex flex-col gap-1 items-center py-1">
        {conversations.slice(0, 8).map((conv) => {
          const isActive = conv.id === activeConversationId;
          return (
            <button
              key={conv.id}
              id={`conversation-item-${conv.id}`}
              onClick={() => onSelectConversation(conv.id)}
              title={conv.title}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                isActive
                  ? 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-400'
                  : 'text-slate-600 hover:text-slate-300 hover:bg-[#111827] border border-transparent'
              }`}
              aria-label={conv.title}
            >
              <MessageSquare className="w-4 h-4" />
            </button>
          );
        })}
      </div>
    );
  }

  // ── Expanded: grouped list ──────────────────────────────────
  return (
    <div id="marketmind-conversation-list" className="space-y-3">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-2.5 mb-1">
            {group.label}
          </p>
          <div className="space-y-0.5">
            {group.items.map((conv, i) => {
              const isActive = conv.id === activeConversationId;
              const isEditing = conv.id === editingId;
              const isMenuOpen = conv.id === menuOpenId;

              if (isEditing) {
                return (
                  <form
                    key={conv.id}
                    onSubmit={(e) => handleSaveRename(conv.id, e)}
                    className="flex items-center gap-1 p-1.5 bg-[#0D1117] rounded-lg border border-cyan-500/40"
                  >
                    <input
                      type="text"
                      autoFocus
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="flex-1 bg-transparent text-xs text-white focus:outline-none px-1.5 min-w-0"
                    />
                    <button
                      type="submit"
                      className="p-1 text-emerald-400 hover:bg-slate-700 rounded transition-colors"
                      title="Save"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="p-1 text-slate-500 hover:bg-slate-700 rounded transition-colors"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </form>
                );
              }

              return (
                <motion.div
                  key={conv.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.18, delay: i * 0.025, ease: 'easeOut' }}
                  id={`conversation-item-${conv.id}`}
                  onClick={() => onSelectConversation(conv.id)}
                  className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl text-xs cursor-pointer transition-all duration-150 ${
                    isActive
                      ? 'bg-emerald-950/30 border border-emerald-500/20 text-emerald-200'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-[#111827] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-1">
                    <MessageSquare
                      className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-600'}`}
                    />
                    <span className="truncate" title={conv.title}>
                      {conv.title}
                    </span>
                  </div>

                  <div className="relative shrink-0">
                    <button
                      id={`conversation-menu-btn-${conv.id}`}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(isMenuOpen ? null : conv.id);
                      }}
                      className={`p-1 rounded text-slate-600 hover:text-white transition-all ${
                        isActive || isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                      title="Options"
                    >
                      <MoreHorizontal className="w-3.5 h-3.5" />
                    </button>

                    <AnimatePresence>
                      {isMenuOpen && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -4 }}
                          transition={{ duration: 0.12 }}
                          className="absolute right-0 top-7 z-30 w-28 bg-[#0D1117] border border-[#1e293b] rounded-xl shadow-2xl py-1 text-[11px]"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            onClick={(e) => startEditing(conv, e)}
                            className="w-full px-2.5 py-1.5 text-left text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2 transition-colors rounded-t-xl"
                          >
                            <Pencil className="w-3 h-3 text-cyan-400" />
                            <span>Rename</span>
                          </button>
                          <button
                            onClick={(e) => handleDelete(conv.id, e)}
                            className="w-full px-2.5 py-1.5 text-left text-rose-400 hover:bg-rose-950/40 flex items-center gap-2 transition-colors rounded-b-xl"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Delete</span>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
