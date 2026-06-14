import { v4 as uuidv4 } from "uuid";
import { getDatabase } from "../models/database";
import { generateReply } from "./llmService";
import { Message, MessageSender, Conversation } from "../types";

/**
 * Creates a new conversation record and returns its ID.
 */
function createConversation(): string {
  const id = uuidv4();
  const db = getDatabase();
  db.prepare("INSERT INTO conversations (id) VALUES (?)").run(id);
  return id;
}

/**
 * Checks whether a conversation exists in the database.
 */
function conversationExists(sessionId: string): boolean {
  const db = getDatabase();
  const row = db
    .prepare("SELECT 1 FROM conversations WHERE id = ?")
    .get(sessionId);
  return row !== undefined;
}

/**
 * Persists a single message to the database.
 */
function saveMessage(
  conversationId: string,
  sender: MessageSender,
  text: string
): Message {
  const db = getDatabase();
  const id = uuidv4();
  const timestamp = new Date().toISOString();

  db.prepare(
    "INSERT INTO messages (id, conversation_id, sender, text, timestamp) VALUES (?, ?, ?, ?, ?)"
  ).run(id, conversationId, sender, text, timestamp);

  return { id, conversationId, sender, text, timestamp };
}

/**
 * Retrieves all messages for a conversation, ordered chronologically.
 */
export function getConversationMessages(conversationId: string): Message[] {
  const db = getDatabase();
  const rows = db
    .prepare(
      "SELECT id, conversation_id AS conversationId, sender, text, timestamp FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC"
    )
    .all(conversationId) as Message[];

  return rows;
}

/**
 * Core orchestration: receives a user message, persists it, calls the LLM,
 * persists the AI reply, and returns the result.
 *
 * If no sessionId is provided, a new conversation is created.
 * If an unknown sessionId is provided, a new conversation is created with a new ID.
 */
export async function handleUserMessage(
  userMessage: string,
  sessionId?: string
): Promise<{ reply: string; sessionId: string }> {
  // Resolve or create the conversation
  let activeSessionId: string;

  if (sessionId && conversationExists(sessionId)) {
    activeSessionId = sessionId;
  } else {
    activeSessionId = createConversation();
  }

  // Persist the user's message
  saveMessage(activeSessionId, MessageSender.User, userMessage);

  // Fetch history for context
  const history = getConversationMessages(activeSessionId);

  // Generate the AI reply (history already includes the user message we just saved)
  // Pass all messages except the last one (the current user message) as history
  const previousMessages = history.slice(0, -1);
  const aiReplyText = await generateReply(previousMessages, userMessage);

  // Persist the AI reply
  saveMessage(activeSessionId, MessageSender.AI, aiReplyText);

  return { reply: aiReplyText, sessionId: activeSessionId };
}
