import { Request, Response, NextFunction } from "express";
import { config } from "../config";
import { ErrorResponse } from "../types";

/**
 * Simple in-memory rate limiter per IP address.
 * No external dependency required — suitable for a single-instance server.
 *
 * In production, swap this for a Redis-backed rate limiter to handle
 * multiple server instances behind a load balancer.
 */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const ipRequestMap = new Map<string, RateLimitEntry>();

// Periodically clean up expired entries to prevent memory leaks
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of ipRequestMap) {
    if (now > entry.resetTime) {
      ipRequestMap.delete(ip);
    }
  }
}, CLEANUP_INTERVAL_MS);

export function rateLimiter(
  req: Request,
  res: Response<ErrorResponse>,
  _next: NextFunction
): void {
  // Use X-Forwarded-For if behind a proxy, otherwise fall back to socket address
  const clientIp =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown";

  const now = Date.now();
  const windowMs = config.rateLimit.windowMs;
  const maxRequests = config.rateLimit.maxRequests;

  const existing = ipRequestMap.get(clientIp);

  if (!existing || now > existing.resetTime) {
    // First request in a new window
    ipRequestMap.set(clientIp, { count: 1, resetTime: now + windowMs });
    _next();
    return;
  }

  existing.count++;

  if (existing.count > maxRequests) {
    const retryAfterSeconds = Math.ceil((existing.resetTime - now) / 1000);
    res.setHeader("Retry-After", String(retryAfterSeconds));
    res.status(429).json({
      error: `Too many requests. Please try again in ${retryAfterSeconds} seconds.`,
    });
    return;
  }

  _next();
}
