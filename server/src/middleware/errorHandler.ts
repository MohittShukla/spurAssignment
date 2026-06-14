import { Request, Response, NextFunction } from "express";
import { ErrorResponse } from "../types";

/**
 * Set of error messages that are safe to expose to the client,
 * along with their appropriate HTTP status codes.
 * Any message NOT in this map will be replaced with a generic 500.
 * This prevents leaking internal details like file paths, SQL errors, or stack traces.
 */
const SAFE_ERRORS: Record<string, number> = {
  "Message is required and must be a string.": 400,
  "Message cannot be empty.": 400,
  "sessionId must be a string if provided.": 400,
  "sessionId must be a valid UUID.": 400,
  "sessionId is required.": 400,
  "Invalid request body.": 400,
  "AI service authentication failed. Please contact support.": 503,
  "AI service is temporarily busy. Please try again in a moment.": 429,
  "The AI took too long to respond. Please try again.": 503,
  "I'm unable to respond to that request. Please try rephrasing your question.": 422,
  "AI model configuration error. Please contact support.": 503,
  "Something went wrong while generating a response. Please try again.": 500,
  "LLM returned an empty response": 502,
};

const GENERIC_ERROR = "An unexpected error occurred. Please try again later.";

/**
 * Global error handler — catches anything that slips through route handlers.
 * Ensures the server never crashes on unhandled errors and always returns
 * a safe JSON response that doesn't expose internals.
 */
export function globalErrorHandler(
  err: Error,
  _req: Request,
  res: Response<ErrorResponse>,
  _next: NextFunction
): void {
  // Always log the full error server-side for debugging
  console.error("[Error]", err.message, err.stack);

  // Check for exact match in the safe errors map
  if (err.message in SAFE_ERRORS) {
    res.status(SAFE_ERRORS[err.message]).json({ error: err.message });
    return;
  }

  // Handle dynamic "Message is too long." errors (include the configured limit)
  if (err.message.startsWith("Message is too long.")) {
    res.status(400).json({ error: err.message });
    return;
  }

  // Unknown errors get a generic 500 response
  res.status(500).json({ error: GENERIC_ERROR });
}

