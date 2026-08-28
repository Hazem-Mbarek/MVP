# Knowledge System Setup

The LogHub backend includes a staff knowledge wiki system with semantic search, transport compatibility checks, and incoterm comparisons.

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Build the embedding index
Before running the backend for the first time, build the vector search index from the JSONL files:

```bash
npm run build-index
```

This will:
- Load and initialize the embedding model (`Xenova/bge-small-en-v1.5`)
- Read all JSONL files (FAQ, incoterms, CMR)
- Embed each chunk using local ONNX inference (no API calls)
- Save the index to `src/knowledge/data/index.json`

The first run takes ~5-10 minutes to download and initialize the embedding model. Subsequent runs will be much faster.

### 3. Start the backend
```bash
npm run dev
```

The backend will automatically:
- Initialize the embedding model
- Load the search index
- Parse the YAML lookup tables
- Start listening for chat requests on port 5000

## How It Works

### Tools

The chat endpoint exposes three tools to the OpenRouter model:

1. **`search_knowledge(query, source_filter?, top_k=5)`**
   - Semantic search across FAQ, incoterms, and CMR articles
   - Returns top-k chunks with similarity scores and citation metadata
   - Use for general knowledge questions

2. **`check_transport_compatibility(mode, incoterm)`**
   - Deterministic lookup in `transport_compatibility.yaml`
   - Answers "Can I ship [mode] with [incoterm]?"
   - Returns exact compatibility and valid modes

3. **`compare_incoterms(codes)`**
   - Side-by-side comparison from `incoterms_comparison.yaml`
   - Answers "What's the difference between FOB and CIF?"
   - Returns attributes for all requested codes

### Architecture

```
Frontend (Chat UI)
    ↓
Backend API (/api/chat)
    ↓
OpenRouter Chat (gpt-oss-120b)
    ├→ search_knowledge() → Vector search (in-memory)
    ├→ check_transport_compatibility() → YAML lookup
    └→ compare_incoterms() → YAML lookup
    ↓
Final cited answer back to frontend
```

### Data Flow

- **Embedding Model:** Xenova/transformers running locally (ONNX)
- **Vector Storage:** In-memory JSON index (fast for 228 records)
- **YAML Lookups:** Parsed at startup, held in memory
- **Tool Calls:** Handled in the chat message loop (continuation on tool results)

## Configuration

No special configuration needed. The system expects:

- JSONL files in `data/knowledge/*/`
- YAML files in `data/knowledge/incoterms/`
- OpenRouter API key in `backend/.env` (for chat, not embeddings)

## Troubleshooting

### Index not building
- Ensure JSONL files exist in `data/knowledge/faq/`, `data/knowledge/incoterms/`, and `data/knowledge/cmr/`
- Check file permissions and encoding (should be UTF-8)
- Run: `npm run build-index` again

### Chat not using tools
- Verify `backend/.env` has a valid `OPENROUTER_API_KEY`
- Check backend logs for tool call execution
- Ensure the model supports function calling (gpt-oss-120b does)

### Slow first startup
- The embedding model (~500MB) downloads on first run
- This is cached after the first run
- Subsequent starts will be much faster

## Next Steps

Once running, test the chat with:

- FAQ question: "What are your operating hours?"
- Compatibility: "Can I use FOB for rail shipments?"
- Comparison: "Compare CIF and DDP"
- Cross-source: "What's the cost responsibility under FOB, and does CMR cover this?"

The model will automatically select the right tool(s) and cite sources.
