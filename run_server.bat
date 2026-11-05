@echo off
title DeepGuard AI — Forensic Command Center
echo ========================================================
echo DeepGuard AI — Multimodal Synthetic Media Forensic Platform
echo Lead Architect: Mohan Abhishek Gupta
echo ========================================================
echo.
echo Launching Cyber Forensic Command Center UI in browser...
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://127.0.0.1:8000/dashboard/"
echo.
echo Starting FastAPI Orchestration Core on http://127.0.0.1:8000 ...
python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
pause
