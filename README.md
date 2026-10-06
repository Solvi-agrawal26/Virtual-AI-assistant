# Nova AI — Full-Stack Virtual AI Assistant

A modern, production-ready Virtual AI Assistant web application featuring low-latency Server-Sent Events (SSE) streaming, Anthropic Claude 3.5 Sonnet integration, Web Speech API voice input and text-to-speech replies, conversation memory, customizable intelligence personas, and secure JWT authentication.

---

## 1. Architecture & Folder Structure

```
web1/
├── package.json               # Root workspace scripts (npm run dev, build, test)
├── .env.example               # Master environment template
├── .gitignore
├── README.md
│
├── server/                    # Node.js + Express + TypeScript Backend
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env.example
│   ├── prisma/
│   │   ├── schema.prisma      # PostgreSQL schema (User, Conversation, Message, Settings)
│   │   └── schema.sqlite.prisma # Optional SQLite schema for zero-dependency local runs
│   ├── src/
│   │   ├── index.ts           # Server entry point, graceful shutdown
│   │   ├── app.ts             # Express app, Helmet, CORS, Rate Limit, Error Handling
│   │   ├── config/
│   │   │   ├── env.ts         # Zod validated environment variables
│   │   │   └── prisma.ts      # Prisma client singleton & connection manager
│   │   ├── types/             # Shared TypeScript types
│   │   ├── utils/
│   │   │   ├── appError.ts    # Standardized operational error class
│   │   │   ├── logger.ts      # Structured colored logger
│   │   │   ├── password.ts    # Bcrypt password hashing & comparison
│   │   │   ├── jwt.ts         # JWT access & refresh token signing/verification
│   │   │   └── sanitize.ts    # Prompt safety check & XSS sanitization
│   │   ├── middlewares/
│   │   │   ├── auth.middleware.ts        # Bearer header & httpOnly cookie JWT auth
│   │   │   ├── validate.middleware.ts    # Zod schema request validation
│   │   │   ├── rateLimiter.middleware.ts # Express rate limiters for API, Auth & Chat
│   │   │   └── errorHandler.middleware.ts# Centralized error handler
│   │   ├── services/
│   │   │   └── claude.service.ts         # Anthropic Claude SDK streaming & smart mock fallback
│   │   ├── validators/
│   │   │   ├── auth.validator.ts         # Auth Zod schemas
│   │   │   ├── chat.validator.ts         # Chat and conversation Zod schemas
│   │   │   └── user.validator.ts         # Assistant customization Zod schemas
│   │   ├── controllers/
│   │   │   ├── auth.controller.ts        # Register, login, refresh, logout, me
│   │   │   ├── conversation.controller.ts# List, create, rename, delete
│   │   │   ├── message.controller.ts     # History retrieval, delete message
│   │   │   ├── chat.controller.ts        # SSE streaming with conversation memory
│   │   │   ├── user.controller.ts        # Settings & profile
│   │   │   └── admin.controller.ts       # Usage statistics
│   │   └── routes/
│   │       ├── auth.routes.ts
│   │       ├── conversation.routes.ts
│   │       ├── chat.routes.ts
│   │       ├── user.routes.ts
│   │       ├── admin.routes.ts
│   │       └── index.ts
│   └── tests/
│       ├── auth.test.ts       # Auth integration tests
│       └── chat.test.ts       # Chat & security tests
│
└── client/                    # React 18 + Vite + TypeScript + Tailwind CSS Frontend
    ├── package.json
    ├── tsconfig.json
    ├── vite.config.ts         # Vite bundler config with /api reverse proxy
    ├── tailwind.config.js     # Custom design system with sleek dark mode
    ├── postcss.config.js
    ├── index.html
    └── src/
        ├── main.tsx           # React entry point
        ├── App.tsx            # View switching (Landing Page vs Chat Dashboard)
        ├── index.css          # Glassmorphism, animations, custom scrollbars
        ├── types/             # Frontend interfaces
        ├── services/
        │   ├── api.ts         # Fetch API client with auto-refresh & SSE reader
        │   └── speech.ts      # Web Speech API recognition & speech synthesis
        ├── context/
        │   ├── AuthContext.tsx    # User session, login, signup, logout
        │   ├── ThemeContext.tsx   # Dark/Light mode toggle with persistence
        │   ├── SettingsContext.tsx# Persona, voice toggles, custom prompt
        │   └── ChatContext.tsx    # Message stream, conversations, search
        └── components/
            ├── common/        # Button, Modal
            ├── auth/          # AuthModal (Login/Signup tabbed modal)
            ├── landing/       # LandingPage with interactive preview & hero
            ├── layout/        # Navbar, Sidebar (history grouped by date)
            ├── chat/          # ChatArea, MessageBubble, ChatInput, EmptyState,
            │                  # MarkdownRenderer (syntax highlighting + copy),
            │                  # TypingIndicator, ChatContainer
            └── settings/      # SettingsModal (persona selector, voice toggles,
                               # temperature slider, custom prompt)
```

---

## 2. Database Schema (Prisma ORM)

The relational schema maps out users, token lifecycle, assistant customizations, conversations, and individual chat messages:

- **`User`**: ID, email, hashed password, name, role (`USER` | `ADMIN`), timestamps.
- **`RefreshToken`**: ID, hashed token, userId, expiry timestamp (enables secure token rotation and revocation).
- **`AssistantSettings`**: 1-to-1 relation with User. Stores assistant name, chosen persona (`general`, `coding`, `business`, `academic`, `creative`, `custom`), custom system prompt, voice enabled toggle, auto-speak toggle, language, and temperature.
- **`Conversation`**: ID, title (auto-generated from first message or customizable), userId, pinned flag, timestamps.
- **`Message`**: ID, conversationId, role (`user` | `assistant`), content (Markdown formatted), token count, timestamp.

---

## 3. Quick Start & Setup

### Prerequisites
- **Node.js** v18+ (tested on Node v20 LTS)
- **PostgreSQL** database (Local instance or hosted like Neon, Supabase, or Render)

### Step 1: Install All Dependencies
From the root directory:
```bash
npm run install:all
```

### Step 2: Configure Environment Variables
Copy `.env.example` to `server/.env`:
```bash
cp .env.example server/.env
```

Update your `DATABASE_URL` and `ANTHROPIC_API_KEY`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# PostgreSQL connection string
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/ai_assistant?schema=public

# Anthropic Claude API Key
# (Leave blank to use Smart Mock AI Streaming mode for instant local testing!)
ANTHROPIC_API_KEY=sk-ant-api03-...
ANTHROPIC_MODEL=claude-3-5-sonnet-20241022

JWT_ACCESS_SECRET=your_super_secret_access_jwt_key_at_least_32_characters_long
JWT_REFRESH_SECRET=your_super_secret_refresh_jwt_key_at_least_32_characters_long
```

### Step 3: Run Database Migrations
```bash
npm run db:migrate
```
*(Optional: inspect your data anytime with Prisma Studio via `npm run db:studio`)*

### Step 4: Start Development Servers
Start both the backend server (port 5000) and frontend client (port 5173) in one terminal:
```bash
npm run dev
```

Open your browser to:
**http://localhost:5173**

---

## 4. Key Features & How They Work

### 🎙️ Voice Input & Text-to-Speech Output
- **Speech-to-Text**: Click the microphone icon in the input area to speak. The Web Speech API captures your words in real time.
- **Text-to-Speech**: AI replies have an audio speaker icon to read responses aloud.
- **Auto-Speak**: Toggle "Auto-Speak Responses" in Settings to automatically listen to every response.

### 🎭 Customizable Intelligence Personas
Select purpose-built personas or configure custom prompt behavior:
1. **General Assistant**: Balanced, concise, helpful.
2. **Coding Mentor**: Senior Staff Architect providing production-grade TypeScript/Python code, security review, and explanations.
3. **Business Strategist**: Executive advisor delivering ROI trade-offs and strategic plans.
4. **Academic Tutor**: Scholarly breakdowns for complex math, physics, or philosophy.
5. **Creative Muse**: Vivid copywriting and storytelling.
6. **Custom System Prompt**: Provide your own rules and behavior guidelines.

### ⚡ Low-Latency SSE Streaming
The `/api/v1/chat/stream` endpoint uses HTTP Server-Sent Events (`text/event-stream`). Responses stream token-by-token directly to the UI with blinking cursor animations and instant cancellation support.

### 🛡️ Enterprise Security & Protection
- **HttpOnly Cookies**: Refresh and access tokens can be stored in secure cookies preventing XSS token theft.
- **Input Sanitization**: Control character stripping and prompt injection inspection.
- **Rate Limiting**: Protects against brute-force attacks on auth and spamming on the chat endpoint.
- **Helmet & CORS**: Strict header security and origin validation.

---

## 5. Deployment Guide

### Backend Deployment (Render / Railway / Fly.io)
1. Push your repository to GitHub.
2. In **Render** or **Railway**, create a new **Web Service** pointing to `/server`.
3. Set the build command:
   ```bash
   npm install && npm run build
   ```
4. Set the start command:
   ```bash
   npm start
   ```
5. Add your environment variables (`DATABASE_URL`, `ANTHROPIC_API_KEY`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL`).
6. Run `npx prisma migrate deploy` in the release phase.

### Frontend Deployment (Vercel / Netlify)
1. Import the repository in **Vercel** or **Netlify**.
2. Set Root Directory to `client`.
3. Set the build command:
   ```bash
   npm run build
   ```
4. Set the output directory:
   ```bash
   dist
   ```
5. Add environment variable:
   ```env
   VITE_API_URL=https://your-backend-api.onrender.com/api/v1
   ```

---

## 6. Future Improvements Roadmap

- [ ] **Multi-modal file & image attachments**: Upload PDF documents, screenshots, and CSVs for Claude analysis.
- [ ] **Redis Caching & Vector Memory**: Semantic similarity search across old conversations using pgvector.
- [ ] **Audio file upload / Whisper API**: Support recording high-fidelity audio blobs for server-side Whisper transcription.
- [ ] **Export Conversations**: Download chats as PDF, Markdown, or JSON.
- [ ] **OAuth 2.0**: Social login with Google and GitHub.
