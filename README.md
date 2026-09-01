# LogHub MVP

An AI-powered logistics knowledge and workflow platform combining semantic search, real-time chat, job validation, and structured data access for a logistics company.

## Overview

LogHub is a full-stack application that uses generative AI to provide intelligent customer-facing and internal support. It integrates a knowledge base (FAQs, regulations, incoterms), a client database, shipment validation, and multi-agent task routing into a unified conversational interface.

**Status:** Production-ready MVP with Cloudflare tunneling for external access.

## Architecture

```
Frontend (Next.js 16 + React 19)
    ↓
Backend API (Express + TypeScript)
    ├→ Knowledge System
    │   ├─ Vector search (embeddings)
    │   ├─ YAML rules (incoterms, transport compatibility)
    │   └─ SQLite database (clients, jobs, shipments)
    ├→ External Chat (customer-facing)
    └→ Internal Chat (staff-facing)
    ↓
OpenRouter (gpt-oss-120b or compatible)
```

## Features

### Knowledge System
- **Semantic Search:** FAQ, CMR convention articles, and Incoterm definitions searchable via vector embeddings
- **YAML Lookups:** Instant comparisons and transport compatibility checks
- **Local Inference:** Embedding model runs locally (Xenova/bge-small-en-v1.5) — no external API calls needed for embeddings

### Customer Portal
- **Job Request Validation:** Clients submit shipment details (origin, destination, service, weight, dates) and receive availability confirmation instantly
- **Communication Agent:** Multi-turn chat for inquiries about services, policies, and logistics
- **Statement Downloads:** Financial records and shipment summaries available as PDF

### Staff Portal
- **Internal Chat:** Staff access to company data, shipment history, and operational queries with full database visibility
- **Task Routing:** Decomposed tasks routed to specialized agents (incoterms expert, CMR specialist, database query, FAQ, etc.)
- **Real-time Monitoring:** Pipeline status, agent logs, and processing metrics

### Extensible Task System
- **job_request:** Validates shipment requests against availability rules
- **faq:** Answers questions about company services and policies
- **opportunity_discovery:** Checks route feasibility and service availability
- **incoterms:** Compares trade terms and obligations
- **cmr:** Answers road carriage liability questions
- **database:** Queries shipment history, clients, pricing (row-scoped access control)
- **synthesis:** Combines results from multiple task types into customer-facing responses

## Getting Started

### Prerequisites
- Node.js 16+
- npm or yarn
- OpenRouter API key (free account sufficient)
- Cloudflare CLI (`cloudflared`) for tunneling

### Quick Start

**Backend:**
```bash
cd backend
npm install
npm run build-index  # ~5-10 min first time, cached after
npm run dev          # Starts on port 5000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev          # Starts on port 3000
```

**Public Tunneling (optional):**
```bash
# Terminal 1: Backend tunnel
cd backend && cloudflared tunnel --url http://127.0.0.1:5000

# Terminal 2: Frontend tunnel
cd frontend && cloudflared tunnel --url http://127.0.0.1:3000
```

Copy the generated tunnel URLs to `.env` files and rebuild.

### Configuration

**Backend (.env):**
```
PORT=5000
NODE_ENV=development
OPENROUTER_API_KEY=sk_...
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=openai/gpt-oss-120b
FRONTEND_URL=http://localhost:3000
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:5000
```

## Project Structure

```
MVP/
├── backend/                    # Express + TypeScript API
│   ├── src/
│   │   ├── index.ts           # Server entry
│   │   ├── knowledge/         # Knowledge system
│   │   │   ├── search.ts      # Vector search
│   │   │   ├── embeddings.ts  # ONNX embeddings
│   │   │   ├── database-tools.ts  # SQLite queries
│   │   │   ├── job-validation.ts  # Shipment validation
│   │   │   └── yaml-tools.ts  # Incoterm/transport rules
│   │   ├── services/          # Agent orchestration
│   │   │   ├── external-agent-orchestrator.ts
│   │   │   ├── external-agent-rules.ts
│   │   │   └── openrouter.service.ts
│   │   └── routes/            # API endpoints
│   ├── data/knowledge/        # Knowledge base (JSONL, YAML)
│   │   ├── faq/
│   │   ├── cmr/
│   │   ├── incoterms/
│   │   └── company/           # Client database
│   └── package.json
│
├── frontend/                  # Next.js 16 + React 19
│   ├── app/
│   │   └── agents/           # Agent pages
│   ├── components/
│   │   └── dashboard/        # Chat, inbox, job forms
│   ├── lib/
│   │   ├── openrouter.ts     # Chat client
│   │   ├── agent-store.ts    # Zustand state
│   │   └── pipeline-store.ts # Multi-agent pipeline
│   └── package.json
│
└── data/
    ├── embedding_service.py  # Python embedding utilities
    ├── generate_embeddings.py
    └── knowledge/           # Raw knowledge files
```

## Key Features

### Row-Level Access Control
- Customers see only their own shipments and data
- Staff see full database with optional field restrictions (employees, internal notes excluded from external view)
- Session identity validated on backend

### Knowledge System Performance
- 228 chunks indexed and searchable in-memory
- First startup: ~5-10 min (model download cached)
- Subsequent starts: <1 second
- No external API calls for embeddings

### Real-Time Chat
- Server-sent events for streaming responses
- Message history per session
- Multi-task decomposition and synthesis

## Testing

**Quick Test Questions:**
1. "What services do you offer?" → FAQ response
2. "Can you ship from Germany to France?" → Opportunity discovery
3. "Compare FCA and DDP" → Incoterms comparison
4. "Validate: FTL, Dortmund→Paris, 1500kg, Oct 20-23" → Job validation
5. "What's my shipment history?" → Database query (customer-scoped)

## Development

**Build Frontend:**
```bash
npm run build
```

**Build Backend:**
```bash
npm run build
```

**Rebuild Knowledge Index:**
```bash
npm run build-index
```

## Known Limitations

- Embedding model runs locally and requires ~500MB memory (cached after first run)
- SQLite is single-file and not suitable for high-concurrency scenarios
- Cloudflare tunnel URLs regenerate on restart (update .env and rebuild)
- No persistent session storage across server restarts
- Temperature-controlled and hazmat warehouse storage not yet supported

## Deployment

The MVP is currently optimized for demonstration and local development. For production:

1. Use a persistent database (PostgreSQL)
2. Implement proper session/authentication layer
3. Use named Cloudflare tunnels or traditional hosting
4. Add rate limiting and request validation
5. Implement audit logging
6. Use environment-specific configuration

## Support

For issues or questions:
- Backend logs: `npm run dev` output
- Frontend errors: Browser console
- Knowledge system: Check `src/knowledge/data/index.json` and JSONL files

---

**Version:** 1.0.0 MVP  
**Last Updated:** August 2026  
**Technology Stack:** Next.js, Express, TypeScript, SQLite, OpenRouter API, Cloudflare Tunnel
