import { Conversation } from '../types/chat';

export const STORAGE_KEYS = {
  CONVERSATIONS: 'marketmind_conversations_v1',
  ACTIVE_CONVERSATION_ID: 'marketmind_active_conv_id',
  FEEDBACK: 'marketmind_message_feedback',
} as const;

export function loadConversationsFromStorage(): Conversation[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CONVERSATIONS);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (e) {
    console.error('Failed to load conversations from localStorage', e);
    return [];
  }
}

export function saveConversationsToStorage(conversations: Conversation[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONVERSATIONS, JSON.stringify(conversations));
  } catch (e) {
    console.error('Failed to save conversations to localStorage', e);
  }
}

export function loadActiveConversationId(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEYS.ACTIVE_CONVERSATION_ID);
  } catch {
    return null;
  }
}

export function saveActiveConversationId(id: string | null): void {
  try {
    if (id) {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_CONVERSATION_ID, id);
    } else {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_CONVERSATION_ID);
    }
  } catch (e) {
    console.error('Failed to save active conversation id', e);
  }
}

export function generateTitleFromQuery(query: string): string {
  const cleaned = query.trim().replace(/^["']|["']$/g, '');
  if (cleaned.length <= 36) {
    return cleaned;
  }
  return cleaned.substring(0, 36).trim() + '...';
}
