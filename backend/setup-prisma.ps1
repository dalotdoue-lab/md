# Prisma Setup Script for Kingstone Investments
# Run this in PowerShell

Write-Host "=== Prisma Setup for Kingstone Investments ===" -ForegroundColor Cyan

# Step 1: Install dependencies
Write-Host "`n[1/5] Installing npm dependencies..." -ForegroundColor Yellow
npm install

# Step 2: Generate Prisma Client
Write-Host "`n[2/5] Generating Prisma Client..." -ForegroundColor Yellow
npx prisma generate

# Step 3: Pull database schema (if database exists)
Write-Host "`n[3/5] Pulling database schema..." -ForegroundColor Yellow
npx prisma db pull

# Step 4: Create initial migration
Write-Host "`n[4/5] Running migration..." -ForegroundColor Yellow
npx prisma migrate dev --name init

# Step 5: Verify Prisma Client
Write-Host "`n[5/5] Verifying Prisma Client..." -ForegroundColor Yellow
node -e "const { prisma } = require('./prisma/prisma.config'); console.log('Prisma Client loaded successfully!');"

Write-Host "`n=== Setup Complete ===" -ForegroundColor Green

