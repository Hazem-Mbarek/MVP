# LogHub - All-in-One Cloudflare Deploy
# Runs everything through Kiro terminals

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                   LogHub - Kiro Deployment                     ║" -ForegroundColor Cyan
Write-Host "║             Running backend + frontend + tunnels               ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$root = "c:\Users\kills\Desktop\MVP"
$backend = "$root\backend"
$frontend = "$root\frontend"

Write-Host "Terminal 1: Backend Server + Backend Tunnel" -ForegroundColor Yellow
Write-Host "  Run this command in Kiro terminal:" -ForegroundColor White
Write-Host "  cd backend && npm run dev & cloudflared tunnel --url http://localhost:5000" -ForegroundColor Green
Write-Host ""

Write-Host "Terminal 2: Frontend Server + Frontend Tunnel" -ForegroundColor Yellow
Write-Host "  Run this command in Kiro terminal:" -ForegroundColor White
Write-Host "  cd frontend && npm run dev & cloudflared tunnel --url http://localhost:3000" -ForegroundColor Green
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

Write-Host "Or just copy this entire command:" -ForegroundColor Cyan
Write-Host ""
Write-Host "cd $backend && npm run dev & cloudflared tunnel --url http://localhost:5000" -ForegroundColor Magenta
Write-Host ""
Write-Host "cd $frontend && npm run dev & cloudflared tunnel --url http://localhost:3000" -ForegroundColor Magenta
Write-Host ""

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

Write-Host "ℹ️  After both start, you'll see tunnel URLs like:" -ForegroundColor Cyan
Write-Host "   https://your-random-words.trycloudflare.com" -ForegroundColor Green
Write-Host ""
Write-Host "Share that frontend URL!" -ForegroundColor Green
Write-Host ""
