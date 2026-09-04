# MarketMind AI

> *"Understand the Market. Faster."*

A production-quality, presentation-ready web application providing an AI-powered stock market and trading assistant experience. MarketMind AI serves as the modern frontend interface connected to an n8n Generative AI backend orchestrating real-time stock news, equity data analysis, and email reporting workflows.

---

## Architecture Overview

MarketMind AI enforces a strict **Zero-Fabrication Data Flow**. The frontend contains no mock datasets, no hardcoded ticker prices, and no simulated financial responses. Every single query is routed directly to the live n8n production webhook.

```
USER
  │
  ▼
MARKETMIND AI FRONTEND (React + TypeScript + Tailwind + Framer Motion)
  │
  ▼  POST { "query": "USER_MESSAGE", "sessionId": "SESSION_ID" }
  │  Content-Type: application/json
  │
N8N PRODUCTION WEBHOOK (https://nuthan45.app.n8n.cloud/webhook/ai-market-agent)
  │
  ▼
GENERATIVE AI AGENT
  ├── Stock Market News Tool
  ├── Stock Market Data Tool
  └── Gmail Tool
  │
  ▼
N8N WEBHOOK RESPONSE
  │  { "success": true, "answer": "...", "timestamp": "..." }
  ▼
MARKETMIND AI FRONTEND
  │
  ▼
RENDER AI RESPONSE (Markdown, Financial Cards, Tables & Scan-Friendly Layout)
```

---

## Core Capabilities

- **Real-Time Financial Intelligence**: Natural language inquiries regarding Wall Street developments, earnings sentiment, macroeconomic events, and corporate updates.
- **Stock Analysis**: Comprehensive equity evaluations (e.g., *"What is the current NVIDIA stock price?"*, *"Analyze Apple's current stock situation"*).
- **Trading Insights & Market Movers**: Trend evaluations, volatility assessments, and technical commentary.
- **Email Delivery via n8n Gmail Tool**: Natural language queries like *"Send today's market summary to my email"* are handled seamlessly by n8n.
- **Conversation State & Memory**: Persistent browser session IDs (`marketmind-[id]`) maintain multi-turn conversational context in n8n memory.
- **Active Backend Verification**: Live "Test Backend" feature to ping the n8n webhook and measure response latency in milliseconds without mock assumptions.
- **Local History Management**: Create, switch, rename, and delete conversations locally with full localStorage persistence.
- **Responsive & Accessible Design**: Optimized for desktop workstations, laptops, tablets, and mobile devices with collapsible navigation.

---

## Technology Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 6
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion (`motion/react`)
- **Icons**: Lucide React
- **Markdown & Tables**: `react-markdown` + `remark-gfm`

---

## Environment Configuration

The application uses standard Vite environment variables. See `.env.example`:

```env
# Production n8n Generative AI Webhook Endpoint
VITE_N8N_WEBHOOK_URL=https://nuthan45.app.n8n.cloud/webhook/ai-market-agent
```

If `VITE_N8N_WEBHOOK_URL` is omitted, the frontend automatically defaults to `https://nuthan45.app.n8n.cloud/webhook/ai-market-agent`.

---

## Running Locally

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The application will boot at `http://localhost:3000`.

### 3. Production Build
```bash
npm run build
```

---

## n8n Integration Specifications

### 1. HTTP Request
- **Method**: `POST`
- **URL**: `https://nuthan45.app.n8n.cloud/webhook/ai-market-agent`
- **Headers**:
  ```http
  Content-Type: application/json
  ```
- **Body Payload**:
  ```json
  {
    "query": "What is the latest stock market news?",
    "sessionId": "marketmind-abc123"
  }
  ```
  *(Note: The key MUST strictly be `"query"`, not `"message"` or `"prompt"`).*

### 2. HTTP Response
- **Expected Payload**:
  ```json
  {
    "success": true,
    "answer": "AI generated response in markdown format...",
    "timestamp": "2026-09-04T12:00:00Z"
  }
  ```
- **Rendering**: The frontend renders `data.answer` using full markdown formatting (headers, bold/italic highlights, bullet points, and data tables).

---

## Troubleshooting & FAQ

### 1. Webhook Offline / CORS Errors
- **Symptom**: "MarketMind AI couldn't connect to the backend" or browser console displays `Cross-Origin Request Blocked (CORS)`.
- **Solution in n8n**:
  1. Open your n8n workflow containing the Webhook node (`/webhook/ai-market-agent`).
  2. In the Webhook node settings, ensure **Response Mode** is set to `Using 'Respond to Webhook' Node` or `When Last Node Finishes`.
  3. Under **Options**, add **Allowed Origins (CORS)** and set it to `*` (or your specific domain).
  4. Ensure the workflow is **Active** (not in draft test mode) so the production URL `/webhook/` is listening.

### 2. Request Timeout
- If the AI Agent takes more than 60 seconds to retrieve news, query equity APIs, and format the answer, verify that the n8n cloud instance has sufficient resources and tool execution timeouts are tuned.

---

## Disclaimer

MarketMind AI provides informational insights for educational purposes and does not constitute financial advice. All analysis originates from automated AI agents and external market tools.
