import { useState, useEffect, useCallback, useRef } from 'react';
import { ChatMessageItem, Conversation, FeedbackStatus } from '../types/chat';
import { sendMessage } from '../services/n8n';
import {
  loadConversationsFromStorage,
  saveConversationsToStorage,
  loadActiveConversationId,
  saveActiveConversationId,
  generateTitleFromQuery,
} from '../utils/storage';

const LOADING_STATUSES = [
  'Connecting to MarketMind AI agent...',
  'Fetching market intelligence...',
  'Analyzing market information...',
  'Reviewing market news...',
  'Synthesizing insights...',
];

export function useChat(sessionId: string) {
  const [conversations, setConversations] = useState<Conversation[]>(() => loadConversationsFromStorage());
  const [activeConversationId, setActiveConversationId] = useState<string | null>(() => loadActiveConversationId());
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStatusIndex, setLoadingStatusIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastFailedQuery, setLastFailedQuery] = useState<string | null>(null);

  // Interval ref for cycling loading statuses
  const statusTimerRef = useRef<number | null>(null);

  // Sync conversations to localStorage
  useEffect(() => {
    saveConversationsToStorage(conversations);
  }, [conversations]);

  // Sync activeConversationId to localStorage
  useEffect(() => {
    saveActiveConversationId(activeConversationId);
  }, [activeConversationId]);

  // Manage loading text rotation
  useEffect(() => {
    if (isLoading) {
      setLoadingStatusIndex(0);
      statusTimerRef.current = window.setInterval(() => {
        setLoadingStatusIndex((prev) => (prev + 1) % LOADING_STATUSES.length);
      }, 2500);
    } else {
      if (statusTimerRef.current) {
        clearInterval(statusTimerRef.current);
        statusTimerRef.current = null;
      }
    }
    return () => {
      if (statusTimerRef.current) {
        clearInterval(statusTimerRef.current);
      }
    };
  }, [isLoading]);

  // Current active conversation
  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null;
  const messages = activeConversation ? activeConversation.messages : [];

  // Create a brand new conversation
  const createNewChat = useCallback(() => {
    setActiveConversationId(null);
    setErrorMessage(null);
    setLastFailedQuery(null);
  }, []);

  // Switch conversation
  const selectConversation = useCallback((id: string) => {
    setActiveConversationId(id);
    setErrorMessage(null);
    setLastFailedQuery(null);
  }, []);

  // Rename conversation
  const renameConversation = useCallback((id: string, newTitle: string) => {
    const trimmed = newTitle.trim();
    if (!trimmed) return;
    setConversations((prev) =>
      prev.map((conv) => (conv.id === id ? { ...conv, title: trimmed, updatedAt: new Date().toISOString() } : conv))
    );
  }, []);

  // Delete conversation
  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const filtered = prev.filter((c) => c.id !== id);
        return filtered;
      });
      if (activeConversationId === id) {
        setActiveConversationId(null);
      }
    },
    [activeConversationId]
  );

  // Set message feedback
  const setFeedback = useCallback(
    (messageId: string, feedback: FeedbackStatus) => {
      if (!activeConversationId) return;
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id !== activeConversationId) return conv;
          return {
            ...conv,
            messages: conv.messages.map((m) =>
              m.id === messageId ? { ...m, feedback: m.feedback === feedback ? null : feedback } : m
            ),
          };
        })
      );
    },
    [activeConversationId]
  );

  // Send query
  const sendQuery = useCallback(
    async (queryText: string) => {
      const cleanQuery = queryText.trim();
      if (!cleanQuery || isLoading) return;

      setErrorMessage(null);
      setLastFailedQuery(null);
      setIsLoading(true);

      const userMessageId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const userMessage: ChatMessageItem = {
        id: userMessageId,
        role: 'user',
        content: cleanQuery,
        timestamp: new Date().toISOString(),
      };

      let currentConvId = activeConversationId;
      const nowIso = new Date().toISOString();

      // If no active conversation, create one
      if (!currentConvId) {
        currentConvId = `conv-${Date.now()}`;
        const newConversation: Conversation = {
          id: currentConvId,
          title: generateTitleFromQuery(cleanQuery),
          messages: [userMessage],
          createdAt: nowIso,
          updatedAt: nowIso,
        };

        setConversations((prev) => [newConversation, ...prev]);
        setActiveConversationId(currentConvId);
      } else {
        // Append user message to current conversation
        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id !== currentConvId) return conv;
            return {
              ...conv,
              updatedAt: nowIso,
              messages: [...conv.messages, userMessage],
            };
          })
        );
      }

      try {
        const responseData = await sendMessage(cleanQuery, sessionId);
        const assistantMessageId = `ai-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

        const assistantMessage: ChatMessageItem = {
          id: assistantMessageId,
          role: 'assistant',
          content: responseData.answer,
          timestamp: responseData.timestamp || new Date().toISOString(),
          queryUsed: cleanQuery,
        };

        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id !== currentConvId) return conv;
            return {
              ...conv,
              updatedAt: new Date().toISOString(),
              messages: [...conv.messages, assistantMessage],
            };
          })
        );
      } catch (err) {
        const errorText = err instanceof Error ? err.message : 'Failed to communicate with MarketMind AI backend.';
        setErrorMessage(errorText);
        setLastFailedQuery(cleanQuery);

        // Also append an error message block in the chat
        const errorMsgId = `err-${Date.now()}`;
        const errorChatMessage: ChatMessageItem = {
          id: errorMsgId,
          role: 'assistant',
          content: `⚠️ **Connection Alert**: ${errorText}\n\nPlease verify your internet connection or backend status. You can retry sending your query below.`,
          timestamp: new Date().toISOString(),
          isError: true,
          queryUsed: cleanQuery,
        };

        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id !== currentConvId) return conv;
            return {
              ...conv,
              updatedAt: new Date().toISOString(),
              messages: [...conv.messages, errorChatMessage],
            };
          })
        );
      } finally {
        setIsLoading(false);
      }
    },
    [activeConversationId, isLoading, sessionId]
  );

  // Regenerate response
  const regenerateResponse = useCallback(
    async (targetMessageId: string) => {
      if (!activeConversation || isLoading) return;

      const targetMsgIndex = activeConversation.messages.findIndex((m) => m.id === targetMessageId);
      if (targetMsgIndex === -1) return;

      // Find the query used or look at preceding user message
      let queryToResend = activeConversation.messages[targetMsgIndex].queryUsed;
      if (!queryToResend) {
        for (let i = targetMsgIndex - 1; i >= 0; i--) {
          if (activeConversation.messages[i].role === 'user') {
            queryToResend = activeConversation.messages[i].content;
            break;
          }
        }
      }

      if (!queryToResend) return;

      setIsLoading(true);
      setErrorMessage(null);

      try {
        const responseData = await sendMessage(queryToResend, sessionId);

        setConversations((prev) =>
          prev.map((conv) => {
            if (conv.id !== activeConversation.id) return conv;
            const updated = [...conv.messages];
            updated[targetMsgIndex] = {
              ...updated[targetMsgIndex],
              content: responseData.answer,
              timestamp: responseData.timestamp || new Date().toISOString(),
              isError: false,
              feedback: null,
            };
            return {
              ...conv,
              updatedAt: new Date().toISOString(),
              messages: updated,
            };
          })
        );
      } catch (err) {
        const errText = err instanceof Error ? err.message : 'Regeneration failed';
        setErrorMessage(errText);
      } finally {
        setIsLoading(false);
      }
    },
    [activeConversation, isLoading, sessionId]
  );

  // Retry last failed query
  const retryLast = useCallback(() => {
    if (lastFailedQuery) {
      sendQuery(lastFailedQuery);
    }
  }, [lastFailedQuery, sendQuery]);

  return {
    conversations,
    activeConversationId,
    activeConversation,
    messages,
    isLoading,
    loadingStatus: LOADING_STATUSES[loadingStatusIndex],
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
  };
}
