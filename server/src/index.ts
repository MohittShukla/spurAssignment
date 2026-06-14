import express from "express";
import cors from "cors";
import { config } from "./config";
import chatRoutes from "./routes/chatRoutes";
import { globalErrorHandler } from "./middleware/errorHandler";
import { securityHeaders } from "./middleware/securityHeaders";
import { rateLimiter } from "./middleware/rateLimiter";
import { closeDatabase } from "./models/database";

const app = express();

// ── Security Middleware (applied first) ──────────────────────
app.use(securityHeaders);

// ── CORS — locked to specific origins ────────────────────────
app.use(
  cors({
    origin: config.corsOrigin.split(",").map((o) => o.trim()),
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    maxAge: 86400, // Cache preflight for 24h
  })
);

// ── Body parsing with strict size limit ──────────────────────
app.use(express.json({ limit: "50kb" }));

// Reject non-JSON content types on POST routes
app.use((req, res, next) => {
  if (req.method === "POST" && !req.is("application/json")) {
    res.status(415).json({ error: "Content-Type must be application/json." });
    return;
  }
  next();
});

// ── Rate limiting — protects the expensive LLM endpoint ──────
app.use("/chat", rateLimiter);

// ── Health check (no sensitive info exposed) ─────────────────
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// ── Routes ───────────────────────────────────────────────────
app.use("/chat", chatRoutes);

// ── 404 handler for unknown routes ───────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Not found." });
});

// ── Global error handler (must be registered last) ───────────
app.use(globalErrorHandler);

// ── Start server ─────────────────────────────────────────────
const server = app.listen(config.port, () => {
  console.log(`🚀 Spur Chat Server running on http://localhost:${config.port}`);
  console.log(`   LLM model: ${config.gemini.model}`);
  console.log(`   CORS origin: ${config.corsOrigin}`);
});

// ── Graceful shutdown ────────────────────────────────────────
function shutdown() {
  console.log("\n🛑 Shutting down gracefully…");
  closeDatabase();
  server.close(() => {
    console.log("   Server closed.");
    process.exit(0);
  });
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

export default app;
