import dotenv from "dotenv";
import path from "path";
import fs from "fs";

/**
 * Load .env from the project root.
 * Tries multiple candidate paths since __dirname resolves differently
 * in tsx (development) vs compiled JS (production).
 */
const ENV_CANDIDATES = [
  path.resolve(__dirname, "../../.env"),     // from dist/config/
  path.resolve(__dirname, "../../../.env"),   // from src/config/ via tsx
  path.resolve(process.cwd(), ".env"),        // current working directory fallback
  path.resolve(process.cwd(), "../.env"),     // if running from /server, look in parent
];

const envPath = ENV_CANDIDATES.find((p) => fs.existsSync(p));
if (envPath) {
  dotenv.config({ path: envPath });
} else {
  console.warn("⚠️  No .env file found. Using system environment variables.");
}

/**
 * Centralised, validated configuration.
 * Fails fast on startup if a required value is missing.
 */

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${key}. ` +
      `Create a .env file in the project root (see .env.example).`
    );
  }
  return value;
}

function optionalEnv(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

function optionalInt(key: string, fallback: number): number {
  const raw = process.env[key];
  if (!raw) return fallback;
  const parsed = parseInt(raw, 10);
  if (Number.isNaN(parsed)) {
    throw new Error(`Environment variable ${key} must be a valid integer`);
  }
  return parsed;
}

export const config = {
  port: optionalInt("PORT", 3001),

  gemini: {
    apiKey: requireEnv("GEMINI_API_KEY"),
    model: optionalEnv("GEMINI_MODEL", "gemini-2.0-flash"),
  },

  corsOrigin: optionalEnv("CORS_ORIGIN", "http://localhost:5173"),

  database: {
    path: optionalEnv("DATABASE_PATH", "./spur_chat.db"),
  },

  limits: {
    maxResponseTokens: optionalInt("MAX_RESPONSE_TOKENS", 512),
    maxHistoryMessages: optionalInt("MAX_HISTORY_MESSAGES", 20),
    maxMessageLength: optionalInt("MAX_MESSAGE_LENGTH", 2000),
  },

  rateLimit: {
    windowMs: optionalInt("RATE_LIMIT_WINDOW_MS", 60_000),
    maxRequests: optionalInt("RATE_LIMIT_MAX_REQUESTS", 20),
  },
} as const;
