@echo off
REM LogHub - Instant Cloudflare Deployment
REM Double-click this file to start the entire app with Cloudflare tunnels

cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0start-cloudflare.ps1"
pause
