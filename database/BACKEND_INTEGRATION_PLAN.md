# Let Investments - Backend Integration Plan

This document outlines the plan to replace in-memory mock data with PostgreSQL database queries in the Express.js backend.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Connection Setup](#database-connection-setup)
3. [Repository Pattern Implementation](#repository-pattern-implementation)
4. [API Endpoints to Implement](#api-endpoints-to-implement)
5. [Authentication Integration](#authentication-integration)
6. [Stock Price Updates](#stock-price-updates)
7. [Security Recommendations](#security-recommendations)
8. [Testing Strategy](#testing-strategy)
9. [Migration Checklist](#migration-checklist)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (Next.js)                     │
│                     http://localhost:3000                    │
└─────────────────────────┬───────────────────────────────────┘
                          │ HTTP/REST
┌─────────────────────────▼───────────────────────────────────┐
│                     Backend (Express.js)                   │
│                      http://localhost:5000                  │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Controllers │  │  Services   │  │   Repositories      │  │
│  │             │  │             │  │   (Database Layer)  │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
├─────────────────────────────────────────────────────────────┤
│                    Database (PostgreSQL)                   │
│                    via Supabase or self-hosted              │
└─────────────────────────────────────────────────────────────┘
```

---

## Database Connection Setup

### Option 1: Supabase Connection

```javascript
// backend/config/database.js

const { Pool } = require('pg');
require('dotenv').config();

// Supabase connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection
pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = {
  query: (text, params) => pool.query(text, params),
  getClient: () => pool.connect(),
  pool
};
```

### Option 2: Using Prisma ORM

```javascript
// backend/config/prisma.js

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

module.exports = prisma;
```

---

## Repository Pattern Implementation

Create a repository layer for clean separation of concerns:

```
backend/
├── repositories/
│   ├── userRepository.js
│   ├── companyRepository.js
│   ├── investmentRepository.js
│   ├── walletRepository.js
│   ├── transactionRepository.js
│   ├── marketInsightRepository.js
│   ├── productRepository.js
│   └── watchlistRepository.js
├── services/
│   └── ...
└── controllers/
    └── ...
```

### Example: User Repository

```javascript
// backend/repositories/userRepository.js

const db = require('../config/database');

const userRepository = {
  /**
   * Find user by email
   */
  async findByEmail(email) {
    const result = await db.query(
      'SELECT * FROM users WHERE email = $1 AND is_active = TRUE',
      [email]
    );
    return result.rows[0];
  },

  /**
   * Find user by ID
   */
  async findById(id) {
    const result = await db.query(
      'SELECT id, email, name, role_id, phone, company, country, virtual_balance, is_active, created_at, updated_at FROM users WHERE id = $1',
      [id]
    );
    return result.rows[0];
  },

  /**
   * Create new user
   */
  async create(userData) {
    const { email, password_hash, name, phone, company, country } = userData;
    const result = await db.query(
      `INSERT INTO users (email, password_hash, name, phone, company, country, virtual_balance)
       VALUES ($1, $2, $3, $4, $5, $6, 0.00)
       RETURNING id, email, name, created_at`,
      [email, password_hash, name, phone, company, country]
    );
    return result.rows[0];
  },

  /**
   * Update user's virtual balance
   */
  async updateBalance(userId, amount) {
    const result = await db.query(
      'UPDATE users SET virtual_balance = virtual_balance + $1, updated_at = NOW() WHERE id = $2 RETURNING virtual_balance',
      [amount, userId]
    );
    return result.rows[0];
  },

  /**
   * Get user's role
   */
  async getUserRole(userId) {
    const result = await db.query(
      `SELECT r.name as role_name, r.permissions 
       FROM users u 
       JOIN roles r ON u.role_id = r.id 
       WHERE u.id = $1`,
      [userId]
    );
    return result.rows[0];
  }
};

module.exports = userRepository;
```

### Example: Company Repository

```javascript
// backend/repositories/companyRepository.js

const db = require('../config/database');

const companyRepository = {
  /**
   * Get all active companies with optional filters
   */
  async findAll(filters = {}) {
    let query = `
      SELECT c.*, s.name as sector_name, r.name as region_name
      FROM companies c
      LEFT JOIN sectors s ON c.sector_id = s.id
      LEFT JOIN regions r ON c.region_id = r.id
      WHERE c.is_active = TRUE
    `;
    
    const params = [];
    let paramIndex = 1;

    if (filters.sector) {
      query += ` AND s.name = $${paramIndex++}`;
      params.push(filters.sector);
    }

    if (filters.region) {
      query += ` AND r.name = $${paramIndex++}`;
      params.push(filters.region);
    }

    if (filters.country) {
      query += ` AND c.country = $${paramIndex++}`;
      params.push(filters.country);
    }

    if (filters.search) {
      query += ` AND (c.name ILIKE $${paramIndex} OR c.symbol ILIKE $${paramIndex})`;
      params.push(`%${filters.search}%`);
      paramIndex++;
    }

    // Default sort by name
    query += ' ORDER BY c.name ASC';

    // Pagination
    if (filters.limit) {
      query += ` LIMIT $${paramIndex++}`;
      params.push(filters.limit);
    }

    if (filters.offset) {
      query += ` OFFSET $${paramIndex++}`;
      params.push(filters.offset);
    }

    const result = await db.query(query, params);
    
    // Get total count for pagination
    const countQuery = query.split('ORDER BY')[0].replace('SELECT c.*, s.name as sector_name, r.name as region_name', 'SELECT COUNT(*)');
    const countResult = await db.query(countQuery, params.slice(0, -2)); // Remove limit/offset

    return {
      companies: result.rows,
      total: parseInt(countResult.rows[0].count)
    };
  },

  /**
   * Find company by ID
   */
  async findById(id) {
    const result = await db.query(
      `SELECT c.*, s.name as sector_name, r.name as region_name
       FROM companies c
       LEFT JOIN sectors s ON c.sector_id = s.id
       LEFT JOIN regions r ON c.region_id = r.id
       WHERE c.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  /**
   * Find company by symbol
   */
  async findBySymbol(symbol) {
    const result = await db.query(
      'SELECT * FROM companies WHERE symbol = $1 AND is_active = TRUE',
      [symbol.toUpperCase()]
    );
    return result.rows[0];
  },

  /**
   * Get stock price history
   */
  async getPriceHistory(companyId, days = 30) {
    const result = await db.query(
      `SELECT * FROM stock_price_history 
       WHERE company_id = $1 
       AND date >= CURRENT_DATE - INTERVAL '${days} days'
       ORDER BY date DESC`,
      [companyId]
    );
    return result.rows;
  },

  /**
   * Update stock price
   */
  async updatePrice(id, newPrice) {
    const result = await db.query(
      `UPDATE companies 
       SET current_price = $1, previous_price = current_price, updated_at = NOW() 
       WHERE id = $2 
       RETURNING *`,
      [newPrice, id]
    );
    return result.rows[0];
  },

  /**
   * Get featured companies
   */
  async findFeatured() {
    const result = await db.query(
      `SELECT c.*, s.name as sector_name, r.name as region_name
       FROM companies c
       LEFT JOIN sectors s ON c.sector_id = s.id
       LEFT JOIN regions r ON c.region_id = r.id
       WHERE c.is_featured = TRUE AND c.is_active = TRUE
       ORDER BY c.name ASC
       LIMIT 10`
    );
    return result.rows;
  }
};

module.exports = companyRepository;
```

---

## API Endpoints to Implement

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | User login |
| POST | `/api/auth/logout` | User logout |
| POST | `/api/auth/refresh` | Refresh token |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |

### Companies Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/companies` | List all companies |
| GET | `/api/companies/:id` | Get company details |
| GET | `/api/companies/symbol/:ticker` | Get by ticker |
| GET | `/api/companies/:id/history` | Stock price history |
| GET | `/api/companies/featured` | Featured companies |

### Sectors & Regions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/sectors` | List all sectors |
| GET | `/api/regions` | List all regions |

### Investments Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/investments` | User's investments |
| POST | `/api/investments/buy` | Buy shares |
| POST | `/api/investments/sell` | Sell shares |
| GET | `/api/investments/:id` | Investment details |

### Wallet Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/wallet` | Get wallet balance |
| POST | `/api/wallet/deposit` | Request deposit |
| POST | `/api/wallet/withdraw` | Request withdrawal |
| GET | `/api/wallet/transactions` | Transaction history |

### Market Insights Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/insights` | List insights |
| GET | `/api/insights/:slug` | Get article |
| GET | `/api/insights/featured` | Featured articles |

### Products Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products |
| GET | `/api/products/:id` | Product details |
| POST | `/api/products/orders` | Create order |

### Watchlist Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/watchlist` | User's watchlist |
| POST | `/api/watchlist` | Add to watchlist |
| DELETE | `/api/watchlist/:companyId` | Remove from watchlist |

### Admin Endpoints (Require Admin Role)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/update-prices` | Update stock prices |
| POST | `/api/admin/sync-market-data` | Sync market data |
| GET | `/api/admin/users` | List all users |
| POST | `/api/admin/users/:id/balance` | Adjust user balance |

---

## Authentication Integration

### Using Supabase Auth

```javascript
// backend/middleware/auth.js

const supabase = require('../config/supabase');

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email
    };

    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Role-based authorization
const requireRole = (...roles) => {
  return async (req, res, next) => {
    try {
      const userRepo = require('../repositories/userRepository');
      const user = await userRepo.getUserRole(req.user.id);

      if (!user || !roles.includes(user.role_name)) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      res.status(500).json({ error: 'Authorization failed' });
    }
  };
};

module.exports = { authMiddleware, requireRole };
```

### Using JWT Tokens (Self-hosted Auth)

```javascript
// backend/middleware/auth.js

const jwt = require('jsonwebtoken');
const userRepository = require('../repositories/userRepository');

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    // Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get full user from database
    const user = await userRepository.findById(decoded.userId);
    
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    res.status(401).json({ error: 'Invalid token' });
  }
};

module.exports = authMiddleware;
```

---

## Stock Price Updates

### Cron Job for Price Updates

```javascript
// backend/services/stockPriceService.js

const companyRepository = require('../repositories/companyRepository');
const priceAlertRepository = require('../repositories/priceAlertRepository');
const notificationService = require('./notificationService');
const axios = require('axios');

class StockPriceService {
  constructor() {
    this.apiKey = process.env.STOCK_API_KEY;
    this.apiUrl = process.env.STOCK_API_URL;
  }

  /**
   * Fetch latest stock prices from external API
   */
  async fetchLatestPrices(symbols) {
    try {
      // Example using Alpha Vantage or similar
      const response = await axios.get(`${this.apiUrl}/quote`, {
        params: {
          symbol: symbols.join(','),
          apikey: this.apiKey
        }
      });
      
      return response.data;
    } catch (error) {
      console.error('Error fetching stock prices:', error);
      return null;
    }
  }

  /**
   * Update all company prices
   */
  async updateAllPrices() {
    try {
      const { companies } = await companyRepository.findAll({ limit: 1000 });
      const symbols = companies.map(c => c.symbol);
      
      const prices = await this.fetchLatestPrices(symbols);
      
      if (!prices) return;

      for (const company of companies) {
        const newPrice = prices[company.symbol]?.price || company.current_price;
        
        // Update company price
        await companyRepository.updatePrice(company.id, newPrice);
        
        // Check price alerts
        await this.checkPriceAlerts(company.id, newPrice);
      }

      console.log(`Updated prices for ${companies.length} companies`);
    } catch (error) {
      console.error('Error updating prices:', error);
    }
  }

  /**
   * Check and trigger price alerts
   */
  async checkPriceAlerts(companyId, currentPrice) {
    const alerts = await priceAlertRepository.getActiveAlerts(companyId);
    
    for (const alert of alerts) {
      let shouldTrigger = false;
      
      if (alert.alert_type === 'above' && currentPrice >= alert.target_price) {
        shouldTrigger = true;
      } else if (alert.alert_type === 'below' && currentPrice <= alert.target_price) {
        shouldTrigger = true;
      }
      
      if (shouldTrigger) {
        await notificationService.create({
          userId: alert.user_id,
          type: 'price_alert',
          title: `Price Alert: ${alert.company_symbol}`,
          message: `${alert.company_name} is now $${currentPrice.toFixed(2)} (${alert.alert_type} $${alert.target_price})`,
          entityType: 'company',
          entityId: companyId
        });
        
        await priceAlertRepository.markTriggered(alert.id);
      }
    }
  }
}

module.exports = new StockPriceService();
```

### Cron Setup

```javascript
// backend/scheduler.js

const cron = require('node-cron');
const stockPriceService = require('./services/stockPriceService');

// Update prices every 15 minutes during market hours (9:30 AM - 4:00 PM EST)
cron.schedule('*/15 9-16 * * 1-5', async () => {
  console.log('Running scheduled price update...');
  await stockPriceService.updateAllPrices();
});

// Alternatively, run daily at market close
cron.schedule('0 16 * * 1-5', async () => {
  console.log('Running end-of-day price update...');
  await stockPriceService.updateAllPrices();
});
```

---

## Security Recommendations

### 1. Row Level Security (Supabase)

```sql
-- Enable RLS on sensitive tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view own wallet" ON wallets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own investments" ON investments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (auth.uid() = user_id);
```

### 2. Input Validation

```javascript
// backend/middleware/validate.js

const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }));
      
      return res.status(400).json({ error: 'Validation failed', details: errors });
    }
    
    next();
  };
};

// Validation schemas
const schemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required(),
    name: Joi.string().min(2).max(100).required(),
    phone: Joi.string().optional(),
    company: Joi.string().optional(),
    country: Joi.string().optional()
  }),

  buyInvestment: Joi.object({
    companyId: Joi.string().uuid().required(),
    amount: Joi.number().positive().min(1).required()
  }),

  deposit: Joi.object({
    amount: Joi.number().positive().min(10).required(),
    provider: Joi.string().valid('bank', 'mpesa', 'stripe').required(),
    description: Joi.string().optional()
  })
};

module.exports = { validate, schemas };
```

### 3. API Rate Limiting

```javascript
// backend/middleware/rateLimiter.js

const rateLimit = require('express-rate-limit');

// General API limit
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { error: 'Too many requests, please try again later' }
});

// Stricter limit for auth endpoints
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 attempts per hour
  message: { error: 'Too many login attempts, please try again later' }
});

// Stricter limit for transactions
const transactionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 transactions per minute
  message: { error: 'Too many transactions, please slow down' }
});

module.exports = { apiLimiter, authLimiter, transactionLimiter };
```

### 4. Audit Logging

```javascript
// backend/middleware/auditLogger.js

const auditLogger = (action, entityType) => {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json;
    
    res.json = function(data) {
      // Log after successful operations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const db = require('../config/database');
        
        db.query(
          `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, ip_address, user_agent)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            req.user?.id,
            action,
            entityType,
            data.id || req.params.id,
            null, // old_values - fetch separately for updates
            JSON.stringify(data),
            req.ip,
            req.get('user-agent')
          ]
        ).catch(console.error);
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
};

module.exports = auditLogger;
```

---

## Testing Strategy

### Unit Tests

```javascript
// backend/tests/unit/userRepository.test.js

const userRepository = require('../../repositories/userRepository');
const db = require('../../config/database');

describe('UserRepository', () => {
  beforeEach(async () => {
    // Clean test database
    await db.query('DELETE FROM users WHERE email LIKE $1', ['test%']);
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      // Arrange
      await db.query(
        `INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3)`,
        ['test@example.com', 'hash', 'Test User']
      );

      // Act
      const user = await userRepository.findByEmail('test@example.com');

      // Assert
      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
    });

    it('should return undefined for non-existent email', async () => {
      const user = await userRepository.findByEmail('nonexistent@example.com');
      expect(user).toBeUndefined();
    });
  });
});
```

### Integration Tests

```javascript
// backend/tests/integration/auth.test.js

const request = require('supertest');
const app = require('../../index');

describe('Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'newuser@example.com',
          password: 'Password123',
          name: 'New User'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
    });
  });
});
```

---

## Migration Checklist

### Phase 1: Database Setup
- [ ] Create PostgreSQL database (Supabase or self-hosted)
- [ ] Run schema.sql to create all tables
- [ ] Run seed scripts to populate initial data
- [ ] Configure database connection in backend

### Phase 2: Repository Layer
- [ ] Create database config module
- [ ] Implement UserRepository
- [ ] Implement CompanyRepository
- [ ] Implement InvestmentRepository
- [ ] Implement WalletRepository
- [ ] Implement TransactionRepository
- [ ] Implement other repositories

### Phase 3: Controller Updates
- [ ] Update AuthController to use UserRepository
- [ ] Update CompaniesController to use CompanyRepository
- [ ] Update InvestmentsController to use InvestmentRepository
- [ ] Update WalletController to use WalletRepository
- [ ] Update other controllers

### Phase 4: Authentication
- [ ] Set up JWT or Supabase Auth
- [ ] Implement auth middleware
- [ ] Update routes with auth middleware
- [ ] Implement role-based access control

### Phase 5: Testing
- [ ] Write unit tests for repositories
- [ ] Write integration tests for API endpoints
- [ ] Test authentication flow
- [ ] Test transaction flow

### Phase 6: Deployment
- [ ] Set up production database
- [ ] Configure environment variables
- [ ] Run migrations on production
- [ ] Deploy backend to production
- [ ] Monitor and fix issues

---

## Environment Variables

Create a `.env` file:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/Let
DATABASE_URL_SUPABASE=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT].supabase.co:5432/postgres

# Supabase
SUPABASE_URL=https://[YOUR-PROJECT].supabase.co
SUPABASE_ANON_KEY=[YOUR-ANON-KEY]
SUPABASE_SERVICE_KEY=[YOUR-SERVICE-KEY]

# JWT (if using self-hosted auth)
JWT_SECRET=[YOUR-JWT-SECRET]
JWT_EXPIRES_IN=7d

# Stock API
STOCK_API_KEY=[YOUR-STOCK-API-KEY]
STOCK_API_URL=https://api.example.com

# App
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:3000
```

---

## Conclusion

This integration plan provides a comprehensive roadmap for migrating from in-memory mock data to a production-ready PostgreSQL database. The modular repository pattern ensures maintainability, while the security recommendations protect sensitive financial data.

Key benefits of this approach:
- **Scalability**: Database-backed data can handle millions of records
- **Security**: RLS, validation, and audit logging
- **Maintainability**: Clean separation of concerns with repositories
- **Real-time**: Live stock prices via cron jobs
- **Auditability**: Complete transaction history

---

*Document Version: 1.0.0*
*Last Updated: 2024*



