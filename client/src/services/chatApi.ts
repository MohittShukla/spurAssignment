import { ChatResponse, ChatHistoryResponse, ErrorResponse } from '../types';

/**
 * API base URL — reads from Vite env var at build time.
 * Falls back to localhost for local development.
 * In production, set VITE_API_URL in your deployment platform's environment.
 */
const API_BASE_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:3001'}/chat`;

export class ChatApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ChatApiError';
  }
}

/**
 * Handles communication with the chat backend.
 * All HTTP responses that aren't OK will throw a ChatApiError.
 */
export const chatService = {
  /**
   * Sends a new message and returns the AI's reply and the active sessionId.
   */
  async sendMessage(message: string, sessionId?: string): Promise<ChatResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message, sessionId }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse;
        throw new ChatApiError(errorData.error || 'Failed to send message');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ChatApiError) throw error;
      throw new ChatApiError('Network error. Please check your connection.');
    }
  },

  /**
   * Retrieves the full message history for a given session.
   */
  async getHistory(sessionId: string): Promise<ChatHistoryResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/${sessionId}/messages`);

      if (!response.ok) {
        const errorData = (await response.json()) as ErrorResponse;
        throw new ChatApiError(errorData.error || 'Failed to fetch history');
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ChatApiError) throw error;
      throw new ChatApiError('Network error. Please check your connection.');
    }
  },
};
