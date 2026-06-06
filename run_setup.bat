@echo off
cd /d "C:\Users\Administrator\Downloads\md"

echo === Configuring git ===
git config user.email "dalotdoue@gmail.com"
git config user.name "Dalot Doue"

echo === Staging all changes ===
git add -A

echo === Git status ===
git status

echo === Committing ===
git commit -m "Setup: correct Firebase credentials, Supabase keys, fix next.config.js, create .env.local"

echo === Pushing to GitHub ===
git push https://dalotdoue-lab:Mboka%402024@github.com/dalotdoue-lab/md.git main

echo === Starting Next.js dev server ===
cd frontend
start cmd /k "npm run dev"

echo === Done! Dev server starting in new window ===
pause
