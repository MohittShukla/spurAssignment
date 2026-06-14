/** Who sent the message — enforced at the type level */
export enum MessageSender {
  User = "user",
  AI = "ai",
}

/** A single chat message as stored in the database */
export interface Message {
  id: string;
  conversationId: string;
  sender: MessageSender;
  text: string;
  timestamp: string; // ISO-8601
}

/** A conversation (session) record */
export interface Conversation {
  id: string;
  createdAt: string; // ISO-8601
}

/** Shape of the POST /chat/message request body */
export interface ChatRequestBody {
  message: string;
  sessionId?: string;
}

/** Shape of the POST /chat/message response */
export interface ChatResponseBody {
  reply: string;
  sessionId: string;
}

/** Standard error response envelope */
export interface ErrorResponse {
  error: string;
}

/** A single FAQ entry used for domain knowledge */
export interface FAQEntry {
  question: string;
  answer: string;
}
