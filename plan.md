# Staff Knowledge Wiki — Build Instructions

## Objective
Build the staff-persona Knowledge/Wiki MVP: a grounded, source-cited Q&A tool layer over the company's regulatory/knowledge data. Expose it as tools for the existing Node/TypeScript chat backend, which already orchestrates via `openai/gpt-oss-120b` through OpenRouter.

You have liberty to pick the specific libraries/implementation for each piece below — this doc gives the architecture constraints and, where a choice matters, a ranked set of options. Pick whichever fits the existing codebase best.

## Scope (this phase only)
- Staff persona only. Read-only. No writes, no communication hub, no workflow automation yet.
- Data sources in play: `faq.jsonl`, `incoterms.jsonl`, `cmr.jsonl`, `incoterms_comparison.yaml`, `transport_compatibility.yaml`.
- The SQLite operational DB (clients, jobs, warehouses, etc.) is **out of scope** for this phase.

## Architecture principle — this is not pure RAG
- **The two YAML files are deterministic lookup tables.** Never embed them. Never let semantic search answer a compatibility or attribute-comparison question — load them into memory at startup and expose plain lookup functions instead.
- **The JSONL files (faq, incoterms, cmr) are unstructured/narrative.** Embed and retrieve these semantically.
- `incoterms.jsonl` has some structured fields that duplicate YAML logic (`mode_scope`, `road_compatible`, `category`). Treat these as metadata for filtering search results only — the YAML files remain the source of truth for any compatibility or attribute claim, to avoid the two sources ever disagreeing in an answer.

## Tools to expose to the chat backend
Use the same tool-schema shape (OpenAI-style function definitions) your backend already uses for `gpt-oss-120b` via OpenRouter, so these register alongside existing tools with no special-casing.

1. **`search_knowledge(query, source_filter?, top_k=5)`** — semantic search across embedded FAQ/incoterms/CMR chunks. Returns chunk text plus citation metadata (`id`, `source`, and `article_number` or `code` where applicable).
2. **`check_transport_compatibility(mode, incoterm)`** — deterministic lookup against `transport_compatibility.yaml`.
3. **`compare_incoterms(codes: string[])`** — deterministic lookup against `incoterms_comparison.yaml`, returns attributes side by side.

System prompt instruction for the backend: **always cite** id/source in the final answer, and **prefer the YAML tools over semantic search** whenever the question is about compatibility or a direct attribute comparison.

## Decision points — ranked options, pick what fits

### Embedding model (must be free, no paid API)
1. **Recommended:** `@huggingface/transformers` (npm) running `Xenova/bge-small-en-v1.5` — local ONNX inference in Node, no API key, no Python dependency.
2. `Xenova/gte-small` via the same package — lighter and faster, slightly lower retrieval quality.
3. Ollama running a local embedding model (e.g. `nomic-embed-text`) — fine if Ollama is already in the stack, but adds a separate process to manage.

Avoid paid embedding APIs (OpenAI, Voyage, Cohere) for this phase.

### Vector storage / search
1. **Recommended:** In-memory. Embed once at build time, persist as JSON (`id`, `text`, `metadata`, `vector`), load at boot, brute-force cosine similarity. The corpus is ~228 records total — this is fast and needs no extra infrastructure.
2. `sqlite-vec` — reasonable if you want persistence/SQL queryability or expect the corpus to grow significantly.
3. `LanceDB` (has a Node binding) — if you want a proper embedded vector index (HNSW) without running a separate server.

Don't reach for a hosted vector DB at this data size — it's unnecessary overhead.

### Chunking strategy
- `faq.jsonl`: one chunk per record (question + answer combined as embedding text).
- `incoterms.jsonl`: one chunk per section/subsection where present, else the full record. Keep `code`, `category`, `mode_scope` as metadata, not embedded text.
- `cmr.jsonl`: already paragraph-granular — one chunk per record. Keep `article_number`, `title` as metadata.

### YAML lookup implementation
1. **Recommended:** parse both YAML files at process startup (`js-yaml` or `yaml` npm package), hold as plain in-memory objects, expose pure functions.
2. Load into two small SQLite tables instead, if you want them queryable via SQL later — not needed for this phase.

### Tool-calling integration
1. **Recommended:** consolidate the three tool schema+handler pairs into one module (e.g. `src/knowledge/tools.ts`) and import it wherever the backend already registers tools for `gpt-oss-120b`.
2. If the existing backend has a plugin/tool-registry pattern, follow that pattern instead of introducing a new one.

## Citation requirement (non-negotiable)
Every answer touching retrieved or looked-up content must cite:
- JSONL-sourced content → `id`, `source` (faq/incoterms/cmr), plus `article_number` or `code` where applicable.
- YAML-sourced content → which file (`transport_compatibility.yaml` or `incoterms_comparison.yaml`).

This needs to be enforced via the system prompt, not just left to tool descriptions.

## Suggested file layout (adapt freely to existing conventions)
```
src/knowledge/
  embeddings.ts     // embedding model wrapper
  build-index.ts    // one-off script: read jsonl -> chunk -> embed -> write index file
  search.ts         // load index at boot, cosine-sim top-k
  yaml-tools.ts      // load both YAMLs, expose lookup functions
  tools.ts           // tool schemas + handlers for backend registration
  data/
    index.json        // generated embedding index
```

## Testing checklist before calling this done
- [ ] Single-source FAQ question returns a correctly cited answer
- [ ] Single-source CMR legal question returns the correct article citation
- [ ] Compatibility question ("Can I ship FOB by rail?") routes to `check_transport_compatibility`, not semantic search
- [ ] Comparison question ("CIP vs CIF") routes to `compare_incoterms`
- [ ] Cross-source question ("we're quoting FOB by road — is that valid, and what does CMR say about liability if not?") correctly chains multiple tool calls
- [ ] Questions with no supporting data are flagged as unanswered rather than hallucinated