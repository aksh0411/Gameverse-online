@echo off
title GameVerse Local Server
echo ===================================================
echo           Starting GameVerse Server
echo ===================================================
echo.
cd /d "%~dp0backend"

:: Automatically free port 8000 if occupied by a stale process
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    echo Port 8000 is occupied by PID %%a. Freeing port...
    taskkill /F /PID %%a >nul 2>&1
)

if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
)
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
pause
