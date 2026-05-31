# Let Investments Backend - Setup Guide

This document provides step-by-step instructions to set up and run the Let Investments backend.

## Prerequisites

1. **Node.js** (v14 or higher)
2. **PostgreSQL** (v12 or higher)
3. **npm** or **yarn**

## Database Setup

### Step 1: Install PostgreSQL

If you don't have PostgreSQL installed, download and install it from:
- macOS: `brew install postgresql`
- Windows: Download from https://www.postgresql.org/download/
- Linux: `sudo apt-get install postgresql postgresql-contrib`

### Step 2: Create Database

```bash
# Start PostgreSQL
brew services start postgresql  # macOS
# or
sudo systemctl start postgresql  # Linux

# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE Let_db;

# Create user
CREATE USER let WITH PASSWORD 'Mboka@2024';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE Let_db TO let;
GRANT ALL ON SCHEMA public TO let;
```

### Step 3: Environment Variables

The backend is already configured with the following default values in `.env`:

```
DATABASE_URL="postgresql://let:Mboka@2024@localhost:5432/Let_db?schema=public"
JWT_SECRET=Let_investments_jwt_secret_key_2024_change_in_production
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

## Backend Setup

### Step 1: Navigate to Backend Directory

```bash
cd backend
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Generate Prisma Client

```bash
npx prisma generate
```

### Step 4: Run Database Migrations

```bash
# Option A: Push schema to database (recommended for development)
npx prisma db push

# Option B: Create and apply migrations
npx prisma migrate dev --name init
```

### Step 5: Seed Database

```bash
npm run seed
```

This will populate the database with:
- 11 sectors (Telecommunications, Banking, Energy, etc.)
- 5 regions (East Africa, West Africa, South Africa, North Africa, Global Markets)
- 30 companies (African and global companies)
- 8 market insights articles
- 1 demo user (email: demo@Letinvestments.com, password: demo123)
- 1 admin user (email: admin@Letinvestments.com, password: admin123)

## Running the Backend

### Development Mode

```bash
npm run dev
```

The server will start on http://localhost:5000

### Production Mode

```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get current user profile (protected)

### Companies
- `GET /api/companies` - Get all companies (supports `?sector=`, `?region=`, `?search=`)
- `GET /api/companies/:id` - Get company by ID
- `GET /api/companies/ticker/:ticker` - Get company by ticker
- `GET /api/companies/sectors` - Get all sectors
- `GET /api/companies/regions` - Get all regions

### Sectors & Regions
- `GET /api/sectors` - Get all sectors
- `GET /api/regions` - Get all regions

### Investments (Protected)
- `POST /api/invest/buy` - Buy shares
- `POST /api/invest/sell` - Sell shares
- `GET /api/investments` - Get user's investments

### Portfolio (Protected)
- `GET /api/portfolio` - Get user's portfolio
- `GET /api/portfolio/summary` - Get portfolio summary

### Transactions (Protected)
- `GET /api/transactions` - Get transaction history

### Watchlist (Protected)
- `GET /api/watchlist` - Get user's watchlist
- `POST /api/watchlist` - Add to watchlist
- `DELETE /api/watchlist/:companyId` - Remove from watchlist

### Market Insights
- `GET /api/insights` - Get all insights
- `GET /api/insights/featured` - Get featured insights
- `GET /api/insights/:slug` - Get insight by slug
- `GET /api/insights/categories` - Get all categories
- `GET /api/insights/regions` - Get all regions

### Ads
- `GET /api/ads` - Get active ads

## Testing the API

### Using curl

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@Letinvestments.com","password":"demo123"}'

# Get companies
curl http://localhost:5000/api/companies

# Get sectors
curl http://localhost:5000/api/sectors
```

### Using Postman

1. Download Postman from https://www.postman.com/
2. Import the API endpoints above
3. Test each endpoint

## Stock Price Simulation

The backend includes a simulated stock price engine that runs every 5 minutes.

- It randomly adjusts stock prices by -3% to +3%
- Updates company prices and stock price history
- Recalculates portfolio values

You can view the simulation logs in the console.

## Demo Accounts

| Email | Password | Role |
|-------|----------|------|
| demo@Letinvestments.com | demo123 | client |
| admin@Letinvestments.com | admin123 | admin |

## Troubleshooting

### Database Connection Error

```bash
# Check if PostgreSQL is running
brew services list  # macOS
sudo systemctl status postgresql  # Linux
```

### Port Already in Use

Change the PORT in `.env` or kill the process using port 5000:

```bash
lsof -i :5000
kill -9 <PID>
```

### Prisma Errors

```bash
# Reset Prisma
rm -rf node_modules/.prisma
npx prisma generate
npx prisma db push
```

## Project Structure

```
backend/
├── config/
│   └── database.js      # Prisma client
├── controllers/         # Business logic
│   ├── authController.js
│   ├── companiesController.js
│   ├── investmentsController.js
│   ├── portfolioController.js
│   ├── transactionsController.js
│   ├── marketInsightsController.js
│   ├── watchlistController.js
│   ├── adsController.js
│   ├── sectorsController.js
│   └── regionsController.js
├── middleware/
│   └── auth.js         # JWT authentication
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── seed.js         # Database seeder
├── routes/             # API routes
├── services/           # Business services
│   └── stockPriceEngine.js
├── .env               # Environment variables
├── index.js           # Main entry point
└── package.json       # Dependencies
```

## Future Extensibility

The system is designed to be easily extended with real market APIs:

- **Alpha Vantage** - Real-time stock quotes
- **Polygon** - Market data API
- **Finnhub** - Real-time stock data
- **TwelveData** - Financial data API

To integrate, simply update the `stockPriceEngine.js` service to fetch real prices instead of generating simulated ones.


