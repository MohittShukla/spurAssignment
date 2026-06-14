import { Request, Response, NextFunction } from "express";
import { config } from "../config";
import { ChatRequestBody, ErrorResponse } from "../types";

/** UUID v4 format: 8-4-4-4-12 hex digits */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Strips HTML tags to prevent stored XSS.
 * Chat messages are plain text — HTML is never needed.
 */
function stripHtmlTags(input: string): string {
  return input.replace(/<[^>]*>/g, "");
}

/**
 * Validates the POST /chat/message request body.
 * Returns a 400 response with a clear error if validation fails.
 */
export function validateChatMessage(
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
): void {
  const body = req.body as ChatRequestBody;

  // Reject non-object bodies (malformed JSON)
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    res.status(400).json({ error: "Invalid request body." });
    return;
  }

  // Must have a message field
  if (!body.message || typeof body.message !== "string") {
    res.status(400).json({ error: "Message is required and must be a string." });
    return;
  }

  // Sanitize: strip any HTML tags to prevent XSS
  const sanitized = stripHtmlTags(body.message).trim();

  // Reject empty / whitespace-only messages
  if (sanitized.length === 0) {
    res.status(400).json({ error: "Message cannot be empty." });
    return;
  }

  // Enforce max length to prevent abuse and control LLM costs
  if (sanitized.length > config.limits.maxMessageLength) {
    res.status(400).json({
      error: `Message is too long. Maximum ${config.limits.maxMessageLength} characters allowed.`,
    });
    return;
  }

  // Normalise the message so downstream code always works with clean text
  req.body.message = sanitized;

  // Validate sessionId format if provided — must be a valid UUID v4
  if (body.sessionId !== undefined) {
    if (typeof body.sessionId !== "string") {
      res.status(400).json({ error: "sessionId must be a string if provided." });
      return;
    }
    if (!UUID_REGEX.test(body.sessionId)) {
      res.status(400).json({ error: "sessionId must be a valid UUID." });
      return;
    }
  }

  next();
}

/**
 * Validates the sessionId URL parameter for GET requests.
 */
export function validateSessionIdParam(
  req: Request,
  res: Response<ErrorResponse>,
  next: NextFunction
): void {
  const { sessionId } = req.params;

  if (!sessionId || typeof sessionId !== "string") {
    res.status(400).json({ error: "sessionId is required." });
    return;
  }

  if (!UUID_REGEX.test(sessionId)) {
    res.status(400).json({ error: "sessionId must be a valid UUID." });
    return;
  }

  next();
}
