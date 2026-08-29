# Task: Expose local frontend + backend via Cloudflare Tunnel

## Objective
Make this local monorepo reachable over public HTTPS for a ~2-day live demo, using free Cloudflare quick tunnels. Repo layout: `frontend/` (Next.js) and `backend/` (Node/Express-style service), each currently only reachable on localhost.

Do not guess ports, env var names, or config locations — inspect the actual files in this repo before acting, since values differ per project.

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
- Cross-check against the actual source: `grep -rn "\.listen(" backend/src` to find the port used at runtime (env defaults can be missing or overridden).
- Record this value as `BACKEND_PORT`.

### 3. Start the backend
- `cd backend && npm install` (if `node_modules` is missing or stale)
- Run the start script from `backend/package.json` (typically `npm run dev` or `npm start`)
- Confirm it's listening: check terminal output, or `curl http://localhost:$BACKEND_PORT`

### 4. Tunnel the backend
- In a new process: `cloudflared tunnel --url http://localhost:$BACKEND_PORT`
- Capture the printed `https://<random-words>.trycloudflare.com` URL as `BACKEND_TUNNEL_URL`
- This process must keep running uninterrupted — do not kill it after this step.

### 5. Point the frontend at the backend tunnel
- Inspect `frontend/lib/api.ts` to find the exact env var name used for the API base URL (commonly something like `NEXT_PUBLIC_API_URL`, but confirm from the actual code — do not assume).
- Set that variable to `BACKEND_TUNNEL_URL` in `frontend/.env.local` (create the file if it doesn't exist).
- If `frontend/lib/api.ts` hardcodes `localhost` instead of reading from an env var, either refactor it to read from an env var, or directly substitute `BACKEND_TUNNEL_URL` in place of the hardcoded value.

### 6. Update backend CORS
- Locate CORS config: `grep -rn "cors(" backend/src`
- For this short-lived test window, set CORS to allow all origins (simplest option, acceptable tradeoff given the temporary nature of this deployment) — or, if stricter config is preferred, come back after step 8 and add `FRONTEND_TUNNEL_URL` explicitly as an allowed origin.
- Restart the backend process after making this change.

### 7. Start the frontend
- `cd frontend && npm install` (if needed)
- `npm run dev` — confirm the port from terminal output (Next.js defaults to 3000, but verify).

### 8. Tunnel the frontend
- In a new process: `cloudflared tunnel --url http://localhost:<frontend-port>`
- Capture the printed URL as `FRONTEND_TUNNEL_URL`.

### 9. Verify end-to-end
- Load `FRONTEND_TUNNEL_URL` and exercise a feature that calls the backend API.
- If it fails, check in this order:
  1. Backend tunnel process still running
  2. Frontend dev server was restarted after editing `.env.local` (env vars aren't hot-reloaded)
  3. CORS origin mismatch (recheck step 6)

### 10. Report back
Output all of the following to the user:
- `BACKEND_TUNNEL_URL`
- `FRONTEND_TUNNEL_URL` (this is the link to share)
- A note that four things must stay running uninterrupted for ~2 days: the backend process, the backend tunnel, the frontend process, and the frontend tunnel — and that the host machine must not sleep or lose network connectivity during that window.

## Constraints
- This is a temporary demo setup, not a production deployment. CORS wildcarding and plaintext `.env` values are acceptable tradeoffs only for this short window — flag this explicitly in the final report, don't silently apply production-grade hardening or skip it without mentioning the tradeoff.
- Free Cloudflare quick tunnels require no authentication and have no session time limit (unlike ngrok's free tier, which disconnects after ~8 hours).