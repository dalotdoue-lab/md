# Prisma Setup Guide - Kingstone Investments

## Fixed Files

### 1. schema.prisma (Fixed)
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 2. .env file (Required)
Create/update `backend/.env` with:
```
DATABASE_URL="postgresql://let:Mboka@2024@localhost:5432/let"
```

### 3. package.json (Fixed)
Updated `prisma` from v5.8.0 to v5.22.0 to match `@prisma/client`

### 4. prisma.config.js (Created)
New CommonJS-compatible config file:
```javascript
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

module.exports = { prisma };
```

---

## PowerShell Commands to Run (Copy-Paste Ready)

### Option 1: Run all at once
```powershell
# Navigate to backend and run setup
cd c:\Users\Carsie\Desktop\KingstoneInvestments\backend

# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Pull database schema (if database exists)
npx prisma db push

# Create and run initial migration
npx prisma migrate dev --name init
```

### Option 2: Run the script file
```powershell
c:\Users\Carsie\Desktop\KingstoneInvestments\backend\setup-prisma.ps1
```

### To Create Database (if not exists)
```powershell
# Connect to PostgreSQL and create database
psql -U postgres -c "CREATE DATABASE let;"
```

---

## Verify Setup
After setup, verify with:
```powershell
node -e "const { prisma } = require('./prisma/prisma.config'); console.log('Prisma Client loaded successfully!');"
```

---

## Import Prisma Client
In your code, use:
```javascript
const { prisma } = require('./prisma/prisma.config');
```

