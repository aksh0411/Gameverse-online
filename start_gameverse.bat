@echo off
title GameVerse Local Server
echo ===================================================
echo           Starting GameVerse Server
echo ===================================================
echo.
cd /d "%~dp0backend"
if exist venv\Scripts\activate.bat (
    call venv\Scripts\activate.bat
)
python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000
pause
