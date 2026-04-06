@echo off
cd /d "%~dp0"
start "" cmd /k ""%~dp0start-growfi.bat""
timeout /t 3 /nobreak >nul
start "" "http://127.0.0.1:3000"

