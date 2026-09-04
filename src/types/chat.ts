export type MessageRole = 'user' | 'assistant';

export type FeedbackStatus = 'helpful' | 'unhelpful' | null;

export interface ChatMessageItem {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  feedback?: FeedbackStatus;
  isError?: boolean;
  queryUsed?: string; // original query for regeneration
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessageItem[];
  createdAt: string;
  updatedAt: string;
}

export interface QuickActionItem {
  id: string;
  title: string;
  description: string;
  query: string;
  iconName: 'TrendingUp' | 'Search' | 'Zap' | 'BarChart3';
  badge: string;
}
