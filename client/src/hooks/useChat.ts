import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Message } from '../types';
import { chatService, ChatApiError } from '../services/chatApi';

const SESSION_STORAGE_KEY = 'spur_chat_session_id';

export function useChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(() => 
    localStorage.getItem(SESSION_STORAGE_KEY)
  );

  // Load history on mount if we have a session
  useEffect(() => {
    async function loadHistory() {
      const storedSessionId = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!storedSessionId) {
        // Welcome message for new users
        setMessages([
          {
            id: 'welcome',
            sender: 'ai',
            text: 'Hi there! Welcome to Spark & Co. How can I help you today?',
            timestamp: new Date().toISOString(),
          },
        ]);
        return;
      }

      try {
        setIsLoading(true);
        const data = await chatService.getHistory(storedSessionId);
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
        } else {
          // If the session exists but has no messages (e.g. wiped DB), show welcome
          setMessages([
            {
              id: 'welcome',
              sender: 'ai',
              text: 'Hi there! Welcome to Spark & Co. How can I help you today?',
              timestamp: new Date().toISOString(),
            },
          ]);
        }
      } catch (err) {
        // Don't show network error just for loading history, simply fail silently and start fresh
        console.error('Failed to load chat history:', err);
        setSessionId(null);
        localStorage.removeItem(SESSION_STORAGE_KEY);
        setMessages([
          {
            id: 'welcome',
            sender: 'ai',
            text: 'Hi there! Welcome to Spark & Co. How can I help you today?',
            timestamp: new Date().toISOString(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    }

    loadHistory();
  }, []); // Run only on mount

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // Optimistically add user message
    const tempUserMessage: Message = {
      id: uuidv4(), // Temporary ID until we reload history or keep it
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMessage]);
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatService.sendMessage(text, sessionId || undefined);
      
      // Store session ID if it's new
      if (response.sessionId !== sessionId) {
        setSessionId(response.sessionId);
        localStorage.setItem(SESSION_STORAGE_KEY, response.sessionId);
      }

      // Add AI reply
      const newAiMessage: Message = {
        id: uuidv4(),
        sender: 'ai',
        text: response.reply,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, newAiMessage]);
    } catch (err) {
      const errorMessage = err instanceof ChatApiError 
        ? err.message 
        : 'An unexpected error occurred.';
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  const clearChat = useCallback(() => {
    setSessionId(null);
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setMessages([
      {
        id: 'welcome',
        sender: 'ai',
        text: 'Hi there! Welcome to Spark & Co. How can I help you today?',
        timestamp: new Date().toISOString(),
      },
    ]);
    setError(null);
  }, []);

  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    sendMessage,
    clearChat,
    dismissError,
  };
}
