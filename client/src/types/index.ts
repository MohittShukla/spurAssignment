export interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface ChatResponse {
  reply: string;
  sessionId: string;
}

export interface ChatHistoryResponse {
  messages: Message[];
  sessionId: string;
}

export interface ErrorResponse {
  error: string;
}
