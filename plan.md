# Task: Expose local frontend + backend via Cloudflare Tunnel

## Objective
Make this local monorepo reachable over public HTTPS for a ~2-day live demo, using free Cloudflare quick tunnels. Repo layout: `frontend/` (Next.js) and `backend/` (Node/TS service with `chat.routes`, `external-chat.routes`, `knowledge.routes`, `agent-orchestrator`, `external-agent-orchestrator`, `openrouter.service`, and a `knowledge/` module with `embeddings`, `build-index`, `search`, `database-tools`), each currently only reachable on localhost.

Do not guess ports, env var names, calling patterns, or config locations — inspect the actual files in this repo before acting, since values differ per project and this doc was written without reading the source.

## Tasks (execute in order)

### 1. Verify/install cloudflared
- Check: `cloudflared --version`
- If missing:
  - macOS: `brew install cloudflared`
  - Linux: download the appropriate `.deb`/`.rpm`/binary from `https://github.com/cloudflare/cloudflared/releases`
  - Windows: `winget install --id Cloudflare.cloudflared`
- No login or Cloudflare account is required for a quick tunnel (`cloudflared tunnel --url ...`).

### 2. Determine the backend's port
- Check `backend/.env` and `backend/.env.example` for a `PORT` variable.
- Cross-check against source: `grep -rn "\.listen(" backend/src` to find the port actually used at runtime.
- Record this value as `BACKEND_PORT`.

### 3. Start the backend
- `cd backend && npm install` (if `node_modules` is missing or stale)
- Run the start script from `backend/package.json` (typically `npm run dev` or `npm start`)
- Confirm it's listening: `curl http://localhost:$BACKEND_PORT`

### 4. Tunnel the backend
- In a new process: `cloudflared tunnel --url http://localhost:$BACKEND_PORT`
- Capture the printed `https://<random-words>.trycloudflare.com` URL as `BACKEND_TUNNEL_URL`
- This process must keep running uninterrupted for the full demo window.

### 5. Determine the frontend's calling pattern (this decides the networking approach)
Inspect `frontend/lib/api.ts` and any files under `frontend/app/api/` (if present). Two possible patterns exist — identify which one this repo uses:

- **Pattern A — Server-side proxy:** `frontend/app/api/*/route.ts` files exist and `lib/api.ts` calls relative paths (e.g. `fetch('/api/chat')`) from client components. The Next.js server itself forwards the request to the backend server-side.
- **Pattern B — Direct client calls:** `lib/api.ts` calls an absolute backend URL (e.g. `fetch(process.env.NEXT_PUBLIC_API_URL + '/chat')`) directly from browser/client-component code, with no Next.js proxy route in between.

This determines which of steps 6a/6b applies. **Prefer Pattern A if you have the choice** — it avoids CORS entirely (browser only ever talks to the frontend's own origin) and keeps the backend's tunnel URL private, which matters here since this backend also exposes `knowledge.routes` (search/embeddings) that shouldn't need to be browser-reachable at all.

### 6a. If Pattern A (server-side proxy)
- In `frontend/.env.local`, set the internal backend URL (e.g. `BACKEND_URL=$BACKEND_TUNNEL_URL`, or keep it as `http://localhost:$BACKEND_PORT` — since this fetch happens server-side inside the Next.js process, it can reach the backend either via the tunnel URL or directly via localhost if both processes run on the same machine; localhost is actually simpler and skips a network hop).
- No CORS changes needed — the browser only ever calls the frontend's own origin (`/api/...`), and the frontend server relays to the backend behind the scenes.
- Confirm any streaming routes (see step 6c) are also being correctly relayed by the Next.js API route (i.e. it pipes the backend's stream through rather than buffering it — check for `await backendResponse.body` being piped, not `await backendResponse.json()` on a streaming endpoint).

### 6b. If Pattern B (direct client calls)
- In `frontend/.env.local`, set the API base URL env var (exact name confirmed from `lib/api.ts`, e.g. `NEXT_PUBLIC_API_URL`) to `BACKEND_TUNNEL_URL`. It must be the `https://...trycloudflare.com` URL, not `http://localhost` — the frontend will be served over HTTPS via its own tunnel, and browsers block HTTP calls from an HTTPS page (mixed content).
- On the backend, locate CORS config: `grep -rn "cors(" backend/src`. Set `Access-Control-Allow-Origin` to the frontend's tunnel URL specifically once known (step 8) — not `*`, if any request uses cookies/credentials (see below). For the initial setup before the frontend tunnel exists, a temporary wildcard is acceptable for this short test window, but note this tradeoff in the final report.
- Check whether requests carry auth cookies (`grep -rn "credentials" frontend/lib` and check for session/cookie-based auth in `backend/src`). If so:
  - Frontend fetch calls need `credentials: 'include'`.
  - Backend CORS needs `Access-Control-Allow-Credentials: true` and an explicit origin (not `*`, which is invalid alongside credentials).
  - Any auth cookie set by the backend needs `SameSite=None; Secure`, since frontend and backend now sit on different subdomains (cross-site, not just cross-origin).
- `external-chat.routes` and `external-agent-orchestrator` look like they're meant for server-to-server calls (an external service hitting the backend directly), not the browser. Confirm this by checking what calls them — if nothing in `frontend/` references them, they don't need browser CORS treatment at all; leave their access rules separate from the browser-facing `chat.routes`.

### 6c. Streaming responses (chat/agent endpoints)
`chat.routes` and `agent-orchestrator` strongly suggest token-by-token streaming (SSE or chunked responses) for chat output. This needs explicit handling:
- Check `backend/src` for `text/event-stream`, `res.write(`, or WebSocket upgrade handling to confirm the transport used.
- **If SSE/chunked HTTP streaming:** Cloudflare quick tunnels support this, but confirm the backend response isn't buffered — response headers should include `Content-Type: text/event-stream` and `Cache-Control: no-cache`, and the handler should flush per chunk rather than building the full response before sending.
- **If WebSockets:** `cloudflared tunnel --url` does proxy WebSocket upgrade traffic, but if a Pattern B CORS setup is used, confirm the backend's WS server doesn't reject connections based on `Origin` header mismatch (a common default check) — it needs to allow the frontend's tunnel origin explicitly, same as HTTP CORS.
- Either way, test this specific path end-to-end (send an actual chat message through the tunnel) in step 9 — it's the piece most likely to silently break, since a non-streaming health check (`curl /health`) won't catch it.

### 6d. Long-running knowledge/embedding operations
`knowledge/build-index` and `knowledge/embeddings` suggest operations that may take longer than a typical request. If any route synchronously builds or rebuilds an index / generates embeddings inline:
- Check whether this is invoked via a route that a browser request would wait on directly. Cloudflare's edge has a request timeout (order of ~100 seconds by default) — a long synchronous build could get cut off with no useful error.
- If such an operation can run long, prefer triggering it as a background/async job with a separate status-check or polling endpoint, rather than one blocking request. If it already works this way, no change needed — just flag it as verified.

### 7. Start the frontend
- `cd frontend && npm install` (if needed)
- `npm run dev` — confirm the port from terminal output (Next.js defaults to 3000).
- If `.env.local` was edited after the dev server was already running, restart it — env vars aren't hot-reloaded.

### 8. Tunnel the frontend
- In a new process: `cloudflared tunnel --url http://localhost:<frontend-port>`
- Capture the printed URL as `FRONTEND_TUNNEL_URL`.
- If Pattern B was used in step 6b with a temporary wildcard CORS origin, go back now and lock it to this exact `FRONTEND_TUNNEL_URL`.

### 9. Verify end-to-end
Test in this order, since each layer can fail independently of the others:
1. `curl` the backend tunnel directly (`curl $BACKEND_TUNNEL_URL/health` or equivalent) — confirms the tunnel and backend process are up.
2. Load `FRONTEND_TUNNEL_URL` in a browser — confirms the frontend tunnel and static rendering work.
3. Trigger an actual chat/agent interaction through the UI, and watch for streaming output specifically — confirms steps 6a-6c are correct. Check the browser network tab / backend logs for CORS errors or a response that arrives all-at-once instead of streaming (buffering issue).
4. If a knowledge-base/build-index feature is exposed in the UI, trigger it and confirm it doesn't hang or time out per step 6d.

### 10. Report back
Output all of the following:
- `BACKEND_TUNNEL_URL` and `FRONTEND_TUNNEL_URL` (the link to share is the frontend one)
- Which pattern (A or B) was used, and why
- Whether streaming was confirmed working end-to-end, not just via a plain health check
- A note that the backend process, backend tunnel, frontend process, and frontend tunnel must all stay running uninterrupted, and the host machine must not sleep, for the full ~2-day window

## Constraints
- This is a temporary demo setup, not a production deployment. CORS wildcarding (if used temporarily) and plaintext `.env` values are acceptable tradeoffs only for this short window — flag this explicitly in the final report rather than silently applying or skipping production-grade hardening.
- Free Cloudflare quick tunnels require no authentication and have no session time limit (unlike ngrok's free tier, which disconnects after ~8 hours).