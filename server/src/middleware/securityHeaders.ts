import { Request, Response, NextFunction } from "express";

/**
 * Sets security-related HTTP headers on every response.
 * Lightweight alternative to helmet — no extra dependency, full control.
 */
export function securityHeaders(
  _req: Request,
  res: Response,
  next: NextFunction
): void {
  // Prevent MIME-type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");

  // Enable XSS filter in older browsers
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Don't send the Referrer header on navigations
  res.setHeader("Referrer-Policy", "no-referrer");

  // Remove the X-Powered-By header so attackers can't fingerprint the server
  res.removeHeader("X-Powered-By");

  // Strict Transport Security — enforce HTTPS in production
  res.setHeader(
    "Strict-Transport-Security",
    "max-age=31536000; includeSubDomains"
  );

  // Restrict what the browser is allowed to do
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  next();
}
