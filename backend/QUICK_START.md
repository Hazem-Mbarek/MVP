# Quick Start: Run LogHub Backend

## Prerequisites
- Node.js 16+
- OpenRouter API key (free account OK)

## 3-Step Setup

### 1️⃣ Install & Build Index
```bash
npm install
npm run build-index
```
*Takes ~5-10 min first time (downloads 500MB embedding model). Cached after.*

### 2️⃣ Configure API Key
Create or update `.env`:
```
OPENROUTER_API_KEY=sk_...your-key...
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=gpt-oss-120b
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3️⃣ Start Server
```bash
npm run dev
```

Expected output:
```
[KNOWLEDGE] Initializing knowledge system...
[EMBEDDINGS] Initializing embedding model...
[EMBEDDINGS] Model initialized successfully
[YAML-TOOLS] Loaded transport compatibility and incoterms comparison
[SEARCH] Loaded 228 chunks from index
[KNOWLEDGE] ✓ Knowledge system initialized

============================================================
🚀 LogHub Backend running on http://localhost:5000
📝 Environment: development
🔌 OpenRouter Model: gpt-oss-120b
🌐 Frontend URL: http://localhost:3000
============================================================
```

## Quick Test

### Test 1: Simple Chat
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is FOB?"}'
```
Expected: Answer with FAQ/incoterms citation

### Test 2: Compatibility Check
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Can I use CIF for air shipments?"}'
```
Expected: Direct yes/no with modes listed

### Test 3: Comparison
```bash
curl -X POST http://localhost:5000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Compare DDP and CIP"}'
```
Expected: Side-by-side attributes

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `OPENROUTER_API_KEY not configured` | Add key to `.env` |
| `Index not found, will need to build embeddings` | Run `npm run build-index` |
| `Failed to get response from OpenRouter` | Check API key validity, network |
| `Slow startup` | First run only; model caches after |
| Chat doesn't use tools | Check backend logs, verify model supports function calling |

## How It Works

1. Frontend sends chat message to `/api/chat`
2. Backend passes message + tools to OpenRouter
3. Model selects which tool(s) to use:
   - `search_knowledge` → Vector search (FAQ/incoterms/CMR)
   - `check_transport_compatibility` → YAML lookup
   - `compare_incoterms` → YAML lookup
4. Backend executes tools, returns results to model
5. Model generates cited answer
6. Response sent back to frontend

## Next Steps

- Start frontend: `cd frontend && npm run dev`
- Open chat at http://localhost:3000
- Ask about logistics, regulations, transport modes
- System will auto-cite sources (id, article number, etc.)
