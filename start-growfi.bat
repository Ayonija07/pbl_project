@echo off
cd /d "%~dp0"
title GrowFi Local Server
for /f "tokens=5" %%p in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
    taskkill /PID %%p /F >nul 2>&1
)
echo Starting GrowFi on http://127.0.0.1:3000
echo Keep this window open while using the website.
echo.
npm.cmd start
