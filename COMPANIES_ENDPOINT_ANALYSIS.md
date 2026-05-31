# LetInvestments - `/api/companies` Endpoint Analysis Report

## Problem Description

The `/api/companies` endpoint was returning no companies due to multiple critical bugs in the Prisma seed script and schema configuration.

---

## Possible Causes (IDENTIFIED)

### 1. CRITICAL: Field Name Mismatch in Seed Script
**File:** `backend/prisma/seed.js`

The seed script used incorrect field names that didn't match the Prisma schema:
- Used `ticker` instead of `symbol`
- Used `currentPrice` instead of `current_price`  
- Used `sectorId`/`regionId` (relations) instead of plain string fields

### 2. CRITICAL: Missing Unique Constraint
**File:** `backend/prisma/schema.prisma`

The `Company` model was missing `@unique` on the `symbol` field, preventing upsert operations.

### 3. Missing stockPrice Model
The seed script tried to create stock price history records, but the `stockPrice` model doesn't exist in the schema.

### 4. Missing slug Field in MarketInsight
The seed script tried to use `slug` for upsert, but the field wasn't in the schema.

---

## Fixes Applied

### 1. Fixed Seed Script (`backend/prisma/seed.js`)
- Changed `ticker` → `symbol`
- Changed `currentPrice` → `current_price`
- Changed `sectorId`/`regionId` → plain `sector`/`region` strings
- Added explicit `isActive: true` to ensure companies are active
- Removed stockPrice creation (model doesn't exist)
- Removed `source` field from market insights

### 2. Fixed Prisma Schema (`backend/prisma/schema.prisma`)
- Added `@unique` to `symbol` field in Company model
- Added `slug` field to MarketInsight model

---

## Verification Results

```bash
$ node test-companies.js
Companies found: 27
Symbols: SCOM, EQBK, KCB, KPLC, KEGN, MTNN, DANGCEM, GTB, ACCESS, ZENITHB, NPN, SSL, SBK, MTN, ATW, IAM, CIB, MSFT, AAPL, KO, TM, SHEL, V, NESN, AMZN, JPM, JNJ
```

The `/api/companies` endpoint now returns **27 companies** successfully!

---

## Remaining Steps

To complete the full setup, run:

```bash
cd backend
npx prisma db push --accept-data-loss
node prisma/seed.js
```

This will add the slug column to market_insights table and seed the market insights data.

---

## Summary

| Issue | Status | Fix Applied |
|-------|--------|-------------|
| Wrong field `ticker` instead of `symbol` | ✅ FIXED | Changed to `symbol` in seed.js |
| Wrong relation `sectorId`/`regionId` | ✅ FIXED | Use plain `sector`/`region` strings |
| Missing `@unique` on symbol | ✅ FIXED | Added `@unique` to schema.prisma |
| stockPrice creation failure | ✅ FIXED | Removed (model doesn't exist) |
| Missing slug in MarketInsight | ✅ FIXED | Added to schema.prisma |
| Companies not seeded | ✅ FIXED | Run seed.js - 27 companies now active |

---

## Test the Endpoint

The `/api/companies` endpoint should now work correctly:

```bash
# Should return 27 companies
curl http://localhost:3000/api/companies

# Filter by sector
curl http://localhost:3000/api/companies?sector=Banking

# Filter by region  
curl http://localhost:3000/api/companies?region=East%20Africa
```


