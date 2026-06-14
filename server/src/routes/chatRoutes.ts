import { Router, Request, Response, NextFunction } from "express";
import { handleUserMessage, getConversationMessages } from "../services/chatService";
import { validateChatMessage, validateSessionIdParam } from "../middleware/validation";
import { ChatRequestBody, ChatResponseBody, ErrorResponse } from "../types";

const router = Router();

/**
 * POST /chat/message
 * Accepts a user message, generates an AI reply, and returns both the reply and sessionId.
 */
router.post(
  "/message",
  validateChatMessage,
  async (
    req: Request<{}, ChatResponseBody | ErrorResponse, ChatRequestBody>,
    res: Response<ChatResponseBody | ErrorResponse>,
    next: NextFunction
  ) => {
    try {
      const { message, sessionId } = req.body;
      const result = await handleUserMessage(message, sessionId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /chat/:sessionId/messages
 * Fetches the full message history for a given conversation/session.
 * Enables chat persistence across page reloads.
 */
router.get(
  "/:sessionId/messages",
  validateSessionIdParam,
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sessionId } = req.params;
      const messages = getConversationMessages(sessionId as string);
      res.json({ messages, sessionId });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
