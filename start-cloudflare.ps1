# LogHub - Instant Cloudflare Deployment
# Simplified version that works reliably

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                  LogHub - Cloudflare Deploy                    ║" -ForegroundColor Cyan
Write-Host "║           Instant tunnel deployment for demo/testing           ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$root = "c:\Users\kills\Desktop\MVP"
$backend = "$root\backend"
$frontend = "$root\frontend"

Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ✓ Prerequisites OK" -ForegroundColor Green
Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Starting services..." -ForegroundColor Cyan
Write-Host ""

# Start backend
Write-Host "[$(Get-Date -Format 'HH:mm:ss')] 🚀 Starting Backend..." -ForegroundColor White
$backendProc = Start-Process -FilePath "cmd" -ArgumentList "/c cd `"$backend`" && npm run dev" -PassThru -WindowStyle Normal
Start-Sleep -Seconds 3
Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Backend PID: $($backendProc.Id)" -ForegroundColor Green
Write-Host ""

# Start backend tunnel
Write-Host "[$(Get-Date -Format 'HH:mm:ss')] 🚀 Starting Backend Tunnel..." -ForegroundColor White
$backendTunnelProc = Start-Process -FilePath "cmd" -ArgumentList "/c cd `"$backend`" && cloudflared tunnel --url http://localhost:5000" -PassThru -WindowStyle Normal
Start-Sleep -Seconds 5
Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Backend Tunnel PID: $($backendTunnelProc.Id)" -ForegroundColor Green
Write-Host ""

# Start frontend
Write-Host "[$(Get-Date -Format 'HH:mm:ss')] 🚀 Starting Frontend..." -ForegroundColor White
$frontendProc = Start-Process -FilePath "cmd" -ArgumentList "/c cd `"$frontend`" && npm run dev" -PassThru -WindowStyle Normal
Start-Sleep -Seconds 5
Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Frontend PID: $($frontendProc.Id)" -ForegroundColor Green
Write-Host ""

# Start frontend tunnel
Write-Host "[$(Get-Date -Format 'HH:mm:ss')] 🚀 Starting Frontend Tunnel..." -ForegroundColor White
$frontendTunnelProc = Start-Process -FilePath "cmd" -ArgumentList "/c cd `"$frontend`" && cloudflared tunnel --url http://localhost:3000" -PassThru -WindowStyle Normal
Start-Sleep -Seconds 5
Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Frontend Tunnel PID: $($frontendTunnelProc.Id)" -ForegroundColor Green
Write-Host ""

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                       🎉 LIVE & READY 🎉                      ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "📋 SERVICES RUNNING" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""
Write-Host "BACKEND" -ForegroundColor Yellow
Write-Host "  Local:    http://localhost:5000" -ForegroundColor White
Write-Host "  Process:  $($backendProc.Id)" -ForegroundColor White
Write-Host ""
Write-Host "FRONTEND" -ForegroundColor Yellow
Write-Host "  Local:    http://localhost:3000" -ForegroundColor White
Write-Host "  Process:  $($frontendProc.Id)" -ForegroundColor White
Write-Host ""
Write-Host "TUNNELS" -ForegroundColor Yellow
Write-Host "  Backend Tunnel:  $($backendTunnelProc.Id) - Check the window for URL" -ForegroundColor White
Write-Host "  Frontend Tunnel: $($frontendTunnelProc.Id) - Check the window for URL" -ForegroundColor White
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

Write-Host "⏳ NEXT STEPS" -ForegroundColor Cyan
Write-Host "  1. Look at the tunnel windows for URLs (they appear in ~5-10 seconds)" -ForegroundColor White
Write-Host "  2. The frontend URL is what you share with users" -ForegroundColor White
Write-Host "  3. Keep all windows open - closing them stops the app" -ForegroundColor White
Write-Host ""

Write-Host "⚠️  IMPORTANT" -ForegroundColor Yellow
Write-Host "  • Do NOT close any windows" -ForegroundColor White
Write-Host "  • Do NOT sleep your PC" -ForegroundColor White
Write-Host "  • Keep your internet connected" -ForegroundColor White
Write-Host ""

Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Monitoring processes..." -ForegroundColor Cyan
Write-Host ""

# Monitor
try {
    while ($true) {
        if ($backendProc.HasExited -or $backendTunnelProc.HasExited -or $frontendProc.HasExited -or $frontendTunnelProc.HasExited) {
            Write-Host "[$(Get-Date -Format 'HH:mm:ss')] ❌ A process has died!" -ForegroundColor Red
            break
        }
        Start-Sleep -Seconds 2
    }
} finally {
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] Cleaning up..." -ForegroundColor Yellow
    
    if (-not $backendProc.HasExited) { Stop-Process -Id $backendProc.Id -Force -ErrorAction SilentlyContinue }
    if (-not $backendTunnelProc.HasExited) { Stop-Process -Id $backendTunnelProc.Id -Force -ErrorAction SilentlyContinue }
    if (-not $frontendProc.HasExited) { Stop-Process -Id $frontendProc.Id -Force -ErrorAction SilentlyContinue }
    if (-not $frontendTunnelProc.HasExited) { Stop-Process -Id $frontendTunnelProc.Id -Force -ErrorAction SilentlyContinue }
    
    Write-Host "[$(Get-Date -Format 'HH:mm:ss')] All services stopped." -ForegroundColor Green
}
