@echo off
cd /d "%~dp0"
echo Cleaning Prisma cache...
if exist node_modules\.prisma rmdir /s /q node_modules\.prisma
if exist prisma\client rmdir /s /q prisma\client
echo Running Prisma generate...
npx prisma generate
echo.
echo Done. Press any key to exit...
pause >nul

