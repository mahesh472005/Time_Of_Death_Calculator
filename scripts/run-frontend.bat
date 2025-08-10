@echo off
echo Starting TOD Calculator Frontend...
cd /d "%~dp0.."
cd frontend
echo.
echo Installing dependencies (if needed)...
call npm install
echo.
echo Starting Vite development server...
echo Frontend will be available at: http://localhost:5173
echo.
call npm run dev
pause
