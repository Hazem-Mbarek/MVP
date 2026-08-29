# LogHub - Instant Cloudflare Deployment

Deploy the entire LogHub application with Cloudflare tunnels in seconds.

## Quick Start

### Option 1: Double-Click (Easiest)
Simply double-click `start-cloudflare.bat` and wait ~10 seconds for the tunnels to initialize.

### Option 2: PowerShell Command
```powershell
cd C:\Users\kills\Desktop\MVP
.\start-cloudflare.ps1
```

### Option 3: PowerShell (with verbose output)
```powershell
cd C:\Users\kills\Desktop\MVP
.\start-cloudflare.ps1 -Verbose
```

## What It Does

The script automatically:
1. ✅ Verifies Node.js and cloudflared are installed
2. ✅ Installs dependencies if needed (backend & frontend)
3. ✅ Starts the backend Node.js server
4. ✅ Creates a Cloudflare tunnel for the backend
5. ✅ Starts the frontend Next.js dev server
6. ✅ Creates a Cloudflare tunnel for the frontend
7. ✅ Displays the public URL to share

## Output

You'll see something like:

```
╔════════════════════════════════════════════════════════════════╗
║                       🎉 LIVE & READY 🎉                      ║
╚════════════════════════════════════════════════════════════════╝

📋 SERVICE SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

BACKEND
  Local:    http://localhost:5000
  Process:  1234
  Tunnel:   https://reliability-determined-herald-offices.trycloudflare.com

FRONTEND
  Local:    http://localhost:3000
  Process:  5678
  Tunnel:   https://positions-fleece-substances-usa.trycloudflare.com

🌐 SHARE THIS LINK:
   https://positions-fleece-substances-usa.trycloudflare.com
```

## Important Notes

⚠️ **Keep Everything Running**

- **Do NOT close the PowerShell window** - it keeps all 4 services alive
- **Do NOT sleep your PC** - the tunnels will disconnect
- **Do NOT disconnect from the internet** - you'll lose the public link

The script monitors all 4 processes:
1. Backend Node.js server
2. Backend Cloudflare tunnel
3. Frontend Next.js dev server
4. Frontend Cloudflare tunnel

If any process crashes, the script will alert you and stop.

## Stopping Everything

Simply press **Ctrl+C** in the PowerShell window to cleanly shut down all services.

## Troubleshooting

### "cloudflared not found"
Install cloudflared:
```powershell
winget install --id Cloudflare.cloudflared
```

### "Node.js not found"
Install Node.js from https://nodejs.org (LTS recommended)

### Backend won't start
Check `%TEMP%\mvp-deploy\backend.log` for errors

### Frontend won't start
Check `%TEMP%\mvp-deploy\frontend.log` for errors

### Tunnel URL not showing
The script extracts the tunnel URL from the output. If it fails to extract, you can:
1. Wait a few seconds - URLs appear with a delay
2. Check the process logs in `%TEMP%\mvp-deploy\`
3. Look at the cloudflared output in the terminal

### "CORS not allowed" errors
The backend CORS is pre-configured for the frontend tunnel. If you see CORS errors:
1. Check that both tunnels are running
2. Verify the frontend and backend are communicating on the tunnel URLs

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                   Cloudflare Tunnels                     │
└─────────────────────────────────────────────────────────┘
           │                                 │
           ▼                                 ▼
   Backend Tunnel                    Frontend Tunnel
   (reliability-...)                (positions-...)
           │                                 │
           ▼                                 ▼
┌──────────────────────┐    ┌────────────────────────┐
│  Backend Server      │    │  Frontend Dev Server   │
│  localhost:5000      │    │  localhost:3000        │
│  - Express.js        │    │  - Next.js             │
│  - Knowledge APIs    │    │  - React Components    │
│  - Chat Routes       │    │  - Dashboard UI        │
└──────────────────────┘    └────────────────────────┘
           │
           ▼
┌──────────────────────┐
│  Local Services      │
│  - Embeddings        │
│  - Database          │
│  - File System       │
└──────────────────────┘
```

## Logs Location

Logs are saved to: `%TEMP%\mvp-deploy\`
- `backend.log` - Backend server output
- `frontend.log` - Frontend server output
- `backend-tunnel.log` - Backend tunnel output
- `frontend-tunnel.log` - Frontend tunnel output

View them with:
```powershell
Get-Content $env:TEMP\mvp-deploy\backend.log -Wait
```

## Next Steps

Once running:
1. Share the frontend tunnel URL with stakeholders
2. Test the knowledge base at `/knowledge-base`
3. Test the chat interface at `/`
4. Check process output for any errors

## Security Note

⚠️ **This is for demos/testing only**
- Cloudflare quick tunnels have no uptime guarantee
- CORS is configured for the frontend tunnel only
- APIs are exposed publicly during the demo window
- Do NOT use this for production

See `cloudflare.md` for more details on the Cloudflare tunnel setup.
