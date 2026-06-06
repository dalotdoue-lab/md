@echo off
cd /d "C:\Users\Administrator\Downloads\md"

echo === Configuring git ===
git config user.email "dalotdoue@gmail.com"
git config user.name "Dalot Doue"

echo === Staging all changes ===
git add -A
git status

echo === Committing ===
git commit -m "Setup: correct Firebase credentials, Supabase keys, fix next.config.js, create .env.local"

echo === Pushing to GitHub (using credential manager) ===
git push origin main
echo Git push exit code: %errorlevel%

echo === Installing frontend dependencies ===
cd frontend
call npm install
echo NPM install done

echo === Starting Next.js dev server ===
start "Next.js Dev Server" cmd /k "npm run dev"

echo === Done! Check the new window for dev server output ===
pause
