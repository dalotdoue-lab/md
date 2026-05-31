@echo off
cd /d "%~dp0"
npx prisma generate
pause

