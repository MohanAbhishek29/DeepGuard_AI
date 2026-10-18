@echo off
echo ========================================================
echo Starting DeepGuard AI Backend Orchestrator...
echo Project Lead: Mohan Abhishek Gupta (K3C0175)
echo ========================================================
echo.
python -m uvicorn backend.app.main:app --reload --host 127.0.0.1 --port 8000
pause
