# Spur AI Live Chat Agent

A full-stack AI-powered customer support chat widget built as a take-home assignment for Spur. A user can chat with an AI agent that answers questions about a fictional e-commerce store ("Spark & Co.") using Google Gemini.

---

## Features

- **Real-time AI Chat** — Powered by Google Gemini with seeded FAQ knowledge
- **Session Persistence** — Conversations are stored in SQLite and restored on reload
- **Floating Chat Widget** — Clean, responsive UI with typing indicators and auto-scroll
- **Security Hardened** — Rate limiting, CORS lockdown, XSS sanitisation, input validation, and zero secrets in code

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React, Vite, TailwindCSS v4, Lucide Icons |
| Backend | Node.js, Express, TypeScript |
| Database | SQLite (via `better-sqlite3`) |
| LLM | Google Gemini (`gemini-2.0-flash`) |

---

## Getting Started

### Prerequisites
- **Node.js** v18 or higher
- **A Gemini API Key** — get one free at [aistudio.google.com/apikey](https://aistudio.google.com/apikey)

### 1. Clone the repository
```bash
git clone https://github.com/MohittShukla/spurAssignment.git
cd spurAssignment
```

### 2. Set up environment variables
```bash
cp .env.example .env
```
Open `.env` and paste your Gemini API key:
```env
GEMINI_API_KEY=your-actual-key-here
```

### 3. Start the backend
```bash
cd server
npm install
npm run dev
```
> The SQLite database is automatically created on first startup. No migrations or seed scripts needed.

### 4. Start the frontend
Open a **second terminal**:
```bash
cd client
npm install
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## Architecture Overview

```
┌─────────────────────┐         REST API          ┌────────────────────────────┐
│    React Frontend   │ ◄──────────────────────►  │     Express Backend        │
│                     │   POST /chat/message       │                            │
│  ChatWidget         │   GET  /chat/:id/messages  │  Security Middleware       │
│  ├─ MessageBubble   │                            │  ├─ securityHeaders        │
│  ├─ InputBar        │                            │  ├─ rateLimiter            │
│  └─ TypingIndicator │                            │  ├─ CORS (origin-locked)   │
│                     │                            │  └─ validation (XSS/UUID)  │
│  useChat (hook)     │                            │                            │
│  chatApi (service)  │                            │  Routes → Services → DB    │
└─────────────────────┘                            │  chatService → llmService  │
                                                   │                            │
                                                   │  SQLite (better-sqlite3)   │
                                                   └────────────────────────────┘
```

### Backend Layers (Separation of Concerns)

| Layer | File | Responsibility |
|-------|------|----------------|
| **Routes** | `chatRoutes.ts` | HTTP interface — thin layer, delegates to services |
| **Services** | `chatService.ts` | Business logic — session management, message persistence |
| **LLM** | `llmService.ts` | Gemini integration — encapsulated, swappable |
| **Data** | `database.ts` | SQLite schema, queries, connection lifecycle |
| **Middleware** | `validation.ts`, `rateLimiter.ts`, `securityHeaders.ts`, `errorHandler.ts` | Cross-cutting concerns |
| **Config** | `config/index.ts` | Centralised env var loading with fail-fast validation |

### Data Model

```sql
conversations (id TEXT PK, created_at TEXT)
messages      (id TEXT PK, conversation_id TEXT FK, sender TEXT, text TEXT, timestamp TEXT)
```

---

## LLM Integration

- **Provider**: Google Gemini (`gemini-2.0-flash`)
- **Prompting Strategy**: System instruction containing a support agent persona + hardcoded FAQ knowledge about the fictional store
- **Safety**: Gemini's built-in safety filters are enabled at `BLOCK_MEDIUM_AND_ABOVE` for all harm categories
- **Prompt Injection Defense**: System prompt explicitly instructs the model to refuse attempts to override instructions or reveal internals
- **Cost Control**: Conversation history is capped at 20 messages, max response tokens capped at 512

---

## Security Measures

| Threat | Mitigation |
|--------|-----------|
| **Secrets in repo** | `.gitignore` blocks all `.env` variants, `*.pem`, `*.key`; config fails fast if `GEMINI_API_KEY` is missing |
| **XSS (Cross-Site Scripting)** | All user messages are HTML-stripped server-side before storage |
| **Injection via sessionId** | Session IDs are validated against UUID v4 regex before any DB query |
| **DDoS / Cost abuse** | Per-IP rate limiter (20 req/min default) on `/chat` routes |
| **CORS abuse** | Origin-locked to the frontend URL (configurable via `CORS_ORIGIN`) |
| **Payload bombs** | `express.json` limited to 50KB; messages capped at 2000 chars |
| **Server fingerprinting** | `X-Powered-By` header removed; security headers set (HSTS, X-Frame-Options, etc.) |
| **Error info leakage** | Error handler uses a whitelist — only pre-approved messages reach the client |
| **Prompt injection** | System prompt instructs Gemini to refuse override attempts; Gemini safety filters enabled |
| **Content-Type confusion** | POST routes reject non-`application/json` requests with 415 |

---

## Coding Principles Applied

1. **Readable Code** — Descriptive names like `handleUserMessage`, `validateChatMessage`, `generateReply`
2. **Single Responsibility** — Routes don't know about Gemini; the LLM service doesn't know about HTTP
3. **DRY** — Validation logic extracted into reusable middleware; `cn()` utility for class merging
4. **KISS** — SQLite instead of PostgreSQL/Docker; in-memory rate limiter instead of Redis
5. **No Premature Optimisation** — Correct first. WAL mode added for SQLite because it's a one-liner, not because we benchmarked
6. **Invalid States Impossible** — TypeScript enums for `MessageSender`; UUID regex for session IDs
7. **Minimal Global State** — Config is a frozen object; DB is a lazy singleton with explicit shutdown
8. **Explicit Error Handling** — Every LLM error maps to a friendly message; no silent failures
9. **Self-Documenting** — Code reads like prose; comments explain *why*, not *what*
10. **Small Functions** — Each function does one thing; the longest is ~30 lines

---

## Trade-offs & "If I Had More Time…"

- **Streaming Responses (SSE)** — Currently waits for the full LLM reply before displaying. SSE would let us stream tokens word-by-word for better perceived performance.
- **Redis Rate Limiter** — The in-memory rate limiter works for a single server instance but wouldn't scale horizontally. Redis would fix this.
- **RAG Pipeline** — The FAQ is hardcoded in the prompt. For a real store with thousands of products, I'd use a vector DB (Pinecone/pgvector) to retrieve relevant context dynamically.
- **WebSocket** — For a true "live chat" feel with agent handoff, WebSockets would be more appropriate than REST polling.
- **E2E Tests** — Would add Playwright tests for the chat flow and Jest/Vitest tests for the service layer.
- **Auth** — Sessions are anonymous. In production, I'd tie them to authenticated users.
