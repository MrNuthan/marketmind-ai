import React, { useState } from 'react';
import { Conversation } from '../../types/chat';
import { MessageSquare, MoreHorizontal, Pencil, Trash2, Check, X } from 'lucide-react';

interface ConversationHistoryProps {
  conversations: Conversation[];
  activeConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onDeleteConversation: (id: string) => void;
}

export const ConversationHistory: React.FC<ConversationHistoryProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onRenameConversation,
  onDeleteConversation,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  const startEditing = (conv: Conversation, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(conv.id);
    setEditTitle(conv.title);
    setMenuOpenId(null);
  };

  const handleSaveRename = (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteConversation(id);
    setMenuOpenId(null);
  };

  if (conversations.length === 0) {
    return (
      <div className="px-3 py-6 text-center text-xs text-slate-500 border border-dashed border-slate-800/80 rounded-xl bg-slate-900/30">
        <p className="font-medium text-slate-400">No active conversations</p>
        <p className="mt-1 text-[11px] text-slate-500">
          Ask a question or select a quick action to start your first session.
        </p>
      </div>
    );
  }

  return (
    <div id="marketmind-conversation-list" className="space-y-1">
      {conversations.map((conv) => {
        const isActive = conv.id === activeConversationId;
        const isEditing = conv.id === editingId;
        const isMenuOpen = conv.id === menuOpenId;

        if (isEditing) {
          return (
            <form
              key={conv.id}
              onSubmit={(e) => handleSaveRename(conv.id, e)}
              className="flex items-center gap-1.5 p-1.5 bg-slate-800 rounded-lg border border-cyan-500/50"
            >
              <input
                type="text"
                autoFocus
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full bg-transparent text-xs text-white focus:outline-none px-1.5"
              />
              <button
                type="submit"
                className="p-1 text-emerald-400 hover:bg-slate-700 rounded"
                title="Save title"
              >
                <Check className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="p-1 text-slate-400 hover:bg-slate-700 rounded"
                title="Cancel"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </form>
          );
        }

        return (
          <div
            key={conv.id}
            id={`conversation-item-${conv.id}`}
            onClick={() => onSelectConversation(conv.id)}
            className={`group relative flex items-center justify-between px-3 py-2 rounded-xl text-xs cursor-pointer transition-all ${
              isActive
                ? 'bg-gradient-to-r from-emerald-950/40 via-cyan-950/30 to-slate-900/40 border border-emerald-500/30 text-emerald-200 font-medium shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0 pr-2">
              <MessageSquare
                className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}
              />
              {/* Issue #6: title tooltip exposes full text when truncated */}
              <span className="truncate" title={conv.title}>{conv.title}</span>
            </div>

            <div className="relative shrink-0 flex items-center">
              <button
                id={`conversation-menu-btn-${conv.id}`}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpenId(isMenuOpen ? null : conv.id);
                }}
                className={`p-1 rounded text-slate-500 hover:text-white transition-opacity ${
                  isActive || isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                }`}
                title="Options"
              >
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>

              {/* Dropdown Options */}
              {isMenuOpen && (
                <div
                  className="absolute right-0 top-7 z-30 w-28 bg-[#0F1422] border border-slate-700 rounded-lg shadow-2xl py-1 text-[11px]"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={(e) => startEditing(conv, e)}
                    className="w-full px-2.5 py-1.5 text-left text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                  >
                    <Pencil className="w-3 h-3 text-cyan-400" />
                    <span>Rename</span>
                  </button>
                  <button
                    onClick={(e) => handleDelete(conv.id, e)}
                    className="w-full px-2.5 py-1.5 text-left text-rose-400 hover:bg-rose-950/50 flex items-center gap-2"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
