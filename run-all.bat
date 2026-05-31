@echo off
start "Backend" cmd /k "cd /d "%~dp0backend" && node index.js"
start "Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"
echo Starting Kingstone Investments...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
pause
