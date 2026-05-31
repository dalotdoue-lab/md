# Let Investments - Security & Future-Proofing Guide

---

## Part 1: Security Recommendations

### 1. Row Level Security (RLS)

If using Supabase, enable Row Level Security for data isolation:

```sql
-- Enable RLS on all user-specific tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE watchlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_orders ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Users
-- Users can only read their own data
CREATE POLICY "users_select_own" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON users
  FOR UPDATE USING (auth.uid() = id);

-- Wallets: Only owner can view
CREATE POLICY "wallets_select_own" ON wallets
  FOR SELECT USING (auth.uid() = user_id);

-- Investments: Only owner can view/modify
CREATE POLICY "investments_select_own" ON investments
  FOR ALL USING (auth.uid() = user_id);

-- Transactions: Only owner can view
CREATE POLICY "transactions_select_own" ON transactions
  FOR SELECT USING (auth.uid() = user_id);

-- Watchlist: Only owner can access
CREATE POLICY "watchlist_own" ON watchlist
  FOR ALL USING (auth.uid() = user_id);
```

### 2. Input Validation Middleware

```javascript
// backend/middleware/inputValidation.js

const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, '')
      }));

      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    next();
  };
};

// Define validation schemas
const schemas = {
  // User schemas
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(8)
      .max(128)
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .required(),
    name: Joi.string().min(2).max(100).required(),
    phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),
    company: Joi.string().max(255).optional(),
    country: Joi.string().max(100).optional()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  // Investment schemas
  buy: Joi.object({
    companyId: Joi.string().uuid().required(),
    amount: Joi.number()
      .positive()
      .min(1)
      .max(1000000)
      .required()
  }),

  sell: Joi.object({
    companyId: Joi.string().uuid().required(),
    shares: Joi.number()
      .positive()
      .integer()
      .required()
  }),

  // Wallet schemas
  deposit: Joi.object({
    amount: Joi.number()
      .positive()
      .min(10)
      .max(100000)
      .required(),
    provider: Joi.string()
      .valid('bank', 'mpesa', 'stripe', 'paypal')
      .required(),
    description: Joi.string().max(500).optional()
  }),

  withdraw: Joi.object({
    amount: Joi.number()
      .positive()
      .min(10)
      .max(100000)
      .required(),
    provider: Joi.string()
      .valid('bank', 'mpesa', 'paypal')
      .required(),
    description: Joi.string().max(500).optional()
  }),

  // Product order schema
  createOrder: Joi.object({
    items: Joi.array()
      .items(Joi.object({
        productId: Joi.string().uuid().required(),
        quantity: Joi.number().positive().integer().min(1).max(100).required()
      }))
      .min(1)
      .max(20)
      .required(),
    shippingAddress: Joi.object({
      name: Joi.string().required(),
      address: Joi.string().required(),
      city: Joi.string().required(),
      state: Joi.string().required(),
      postalCode: Joi.string().required(),
      country: Joi.string().required(),
      phone: Joi.string().required()
    }).required()
  })
};

module.exports = { validateRequest, schemas };
```

### 3. API Security Middleware

```javascript
// backend/middleware/security.js

const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

// Security headers
const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
});

// CORS configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// General API rate limiting
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests',
    message: 'Please try again in 15 minutes'
  }
});

// Auth endpoint rate limiting (stricter)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many attempts',
    message: 'Please try again in 1 hour'
  }
});

// Transaction rate limiting
const transactionLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many transactions',
    message: 'Please slow down'
  }
});

// Prevent NoSQL injection
const noSQLInjectionSanitizer = mongoSanitize();

// Prevent XSS attacks
const xssSanitizer = xss();

module.exports = {
  securityHeaders,
  corsOptions,
  apiLimiter,
  authLimiter,
  transactionLimiter,
  noSQLInjectionSanitizer,
  xssSanitizer
};
```

### 4. Audit Logging Implementation

```sql
-- Create audit log table if not already in schema
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- Function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
    p_user_id UUID,
    p_action VARCHAR,
    p_entity_type VARCHAR,
    p_entity_id UUID,
    p_old_values JSONB,
    p_new_values JSONB,
    p_ip_address INET,
    p_user_agent TEXT,
    p_description TEXT
) RETURNS VOID AS $$
BEGIN
    INSERT INTO audit_logs (
        user_id, action, entity_type, entity_id,
        old_values, new_values, ip_address, user_agent, description
    ) VALUES (
        p_user_id, p_action, p_entity_type, p_entity_id,
        p_old_values, p_new_values, p_ip_address, p_user_agent, p_description
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 5. SSL/TLS Configuration

For production deployment, ensure:

```nginx
# Nginx configuration example
server {
    listen 443 ssl http2;
    server_name api.letinvestments.com;

    ssl_certificate /etc/letsencrypt/live/api.letinvestments.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.letinvestments.com/privkey.pem;
    
    # SSL settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Additional security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name api.letinvestments.com;
    return 301 https://$server_name$request_uri;
}
```

---

## Part 2: Future-Proofing Suggestions

### 1. Real-Time Updates for Stock Prices

#### WebSocket Implementation

```javascript
// backend/services/websocketService.js

const WebSocket = require('ws');
const stockPriceService = require('./stockPriceService');

class WebSocketService {
  constructor() {
    this.clients = new Map(); // userId -> WebSocket
    this.interval = null;
  }

  /**
   * Initialize WebSocket server
   */
  initialize(server) {
    this.wss = new WebSocket.Server({ server, path: '/ws' });

    this.wss.on('connection', (ws, req) => {
      console.log('WebSocket client connected');

      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          this.handleMessage(ws, data);
        } catch (error) {
          console.error('WebSocket message error:', error);
        }
      });

      ws.on('close', () => {
        console.log('WebSocket client disconnected');
        this.removeClient(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });

    // Start price broadcast interval
    this.startPriceBroadcast();
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(ws, data) {
    switch (data.type) {
      case 'authenticate':
        // Store authenticated user
        ws.userId = data.userId;
        this.clients.set(data.userId, ws);
        ws.send(JSON.stringify({ type: 'authenticated' }));
        break;

      case 'subscribe':
        // Subscribe to specific company updates
        ws.subscriptions = ws.subscriptions || new Set();
        ws.subscriptions.add(data.companyId);
        break;

      case 'unsubscribe':
        ws.subscriptions?.delete(data.companyId);
        break;
    }
  }

  /**
   * Start broadcasting price updates
   */
  startPriceBroadcast() {
    this.interval = setInterval(async () => {
      try {
        const prices = await stockPriceService.getLatestPrices();
        
        this.clients.forEach((ws, userId) => {
          if (ws.readyState === WebSocket.OPEN) {
            // Send all prices or filtered by subscription
            const message = {
              type: 'price_update',
              timestamp: new Date().toISOString(),
              prices: ws.subscriptions 
                ? prices.filter(p => ws.subscriptions.has(p.companyId))
                : prices
            };
            ws.send(JSON.stringify(message));
          }
        });
      } catch (error) {
        console.error('Price broadcast error:', error);
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Broadcast price alert to specific user
   */
  sendPriceAlert(userId, alert) {
    const ws = this.clients.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'price_alert',
        alert
      }));
    }
  }

  /**
   * Remove client
   */
  removeClient(ws) {
    this.clients.forEach((client, userId) => {
      if (client === ws) {
        this.clients.delete(userId);
      }
    });
  }

  /**
   * Cleanup
   */
  cleanup() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.wss?.close();
  }
}

module.exports = new WebSocketService();
```

#### Client-Side WebSocket Hook (React)

```javascript
// frontend/hooks/useStockPrices.js

import { useEffect, useState, useCallback } from 'react';

export const useStockPrices = (symbols = []) => {
  const [prices, setPrices] = useState({});
  const [connectionStatus, setConnectionStatus] = useState('disconnected');
  const [ws, setWs] = useState(null);

  useEffect(() => {
    // Connect to WebSocket
    const websocket = new WebSocket(`ws://${window.location.host}/ws`);

    websocket.onopen = () => {
      setConnectionStatus('connected');
      // Authenticate
      const token = localStorage.getItem('authToken');
      websocket.send(JSON.stringify({
        type: 'authenticate',
        userId: token // or extract user ID from token
      }));
      
      // Subscribe to symbols
      symbols.forEach(symbol => {
        websocket.send(JSON.stringify({
          type: 'subscribe',
          companyId: symbol
        }));
      });
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'price_update') {
        const newPrices = {};
        data.prices.forEach(p => {
          newPrices[p.symbol] = p;
        });
        setPrices(prev => ({ ...prev, ...newPrices }));
      } else if (data.type === 'price_alert') {
        // Show notification
        showNotification(data.alert);
      }
    };

    websocket.onclose = () => {
      setConnectionStatus('disconnected');
    };

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('error');
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [symbols.join(',')]);

  const subscribe = useCallback((symbol) => {
    ws?.send(JSON.stringify({ type: 'subscribe', companyId: symbol }));
  }, [ws]);

  const unsubscribe = useCallback((symbol) => {
    ws?.send(JSON.stringify({ type: 'unsubscribe', companyId: symbol }));
  }, [ws]);

  return { prices, connectionStatus, subscribe, unsubscribe };
};
```

### 2. Analytics Dashboard

#### SQL Views for Analytics

```sql
-- Portfolio Analytics View
CREATE OR REPLACE VIEW portfolio_analytics AS
SELECT 
    u.id as user_id,
    u.email,
    u.name,
    COUNT(DISTINCT i.id) as total_positions,
    SUM(i.investment_amount) as total_invested,
    SUM(i.current_value) as total_current_value,
    SUM(i.profit_loss) as total_profit_loss,
    CASE 
        WHEN SUM(i.investment_amount) > 0 
        THEN (SUM(i.profit_loss) / SUM(i.investment_amount)) * 100 
        ELSE 0 
    END as total_return_percent,
    SUM(i.current_value) + w.balance as total_assets,
    w.balance as cash_balance
FROM users u
LEFT JOIN investments i ON u.id = i.user_id AND i.is_active = TRUE
LEFT JOIN wallets w ON u.id = w.user_id
GROUP BY u.id, u.email, u.name, w.balance;

-- Sector Allocation View
CREATE VIEW sector_allocation AS
SELECT 
    u.id as user_id,
    s.name as sector_name,
    s.id as sector_id,
    SUM(i.current_value) as total_value,
    COUNT(DISTINCT i.id) as positions,
    (SUM(i.current_value) / NULLIF(
        (SELECT SUM(current_value) FROM investments WHERE user_id = u.id AND is_active = TRUE),
        0
    ) * 100) as allocation_percent
FROM users u
JOIN investments i ON u.id = i.user_id AND i.is_active = TRUE
JOIN companies c ON i.company_id = c.id
JOIN sectors s ON c.sector_id = s.id
GROUP BY u.id, s.id, s.name;

-- Regional Allocation View
CREATE VIEW regional_allocation AS
SELECT 
    u.id as user_id,
    r.name as region_name,
    r.id as region_id,
    SUM(i.current_value) as total_value,
    (SUM(i.current_value) / NULLIF(
        (SELECT SUM(current_value) FROM investments WHERE user_id = u.id AND is_active = TRUE),
        0
    ) * 100) as allocation_percent
FROM users u
JOIN investments i ON u.id = i.user_id AND i.is_active = TRUE
JOIN companies c ON i.company_id = c.id
JOIN regions r ON c.region_id = r.id
GROUP BY u.id, r.id, r.name;

-- Top Holdings View
CREATE VIEW top_holdings AS
SELECT 
    u.id as user_id,
    c.name as company_name,
    c.symbol,
    i.shares,
    i.current_value,
    i.profit_loss,
    i.profit_loss_percent,
    RANK() OVER (PARTITION BY u.id ORDER BY i.current_value DESC) as rank
FROM users u
JOIN investments i ON u.id = i.user_id AND i.is_active = TRUE
JOIN companies c ON i.company_id = c.id;
```

#### Analytics API Endpoints

```javascript
// backend/routes/analytics.js

const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authMiddleware = require('../middleware/auth');

// GET /api/analytics/portfolio - Portfolio summary
router.get('/portfolio', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM portfolio_analytics WHERE user_id = $1',
      [req.user.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/sectors - Sector allocation
router.get('/sectors', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM sector_allocation WHERE user_id = $1 ORDER BY total_value DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/regions - Regional allocation
router.get('/regions', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM regional_allocation WHERE user_id = $1 ORDER BY total_value DESC',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/performance - Historical performance
router.get('/performance', authMiddleware, async (req, res) => {
  try {
    const { period = '30' } = req.query;
    
    const result = await db.query(`
      SELECT 
        DATE(t.created_at) as date,
        SUM(CASE WHEN t.type = 'DEPOSIT' THEN t.amount ELSE 0 END) as deposits,
        SUM(CASE WHEN t.type = 'WITHDRAW' THEN t.amount ELSE 0 END) as withdrawals,
        SUM(CASE WHEN t.type = 'BUY' THEN t.amount ELSE 0 END) as investments,
        SUM(CASE WHEN t.type = 'SELL' THEN t.amount ELSE 0 END) as divestments
      FROM transactions t
      WHERE t.user_id = $1 
        AND t.status = 'completed'
        AND t.created_at >= CURRENT_DATE - INTERVAL '${period} days'
      GROUP BY DATE(t.created_at)
      ORDER BY date ASC
    `, [req.user.id]);
    
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/analytics/holdings - Top holdings
router.get('/holdings', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM top_holdings WHERE user_id = $1 AND rank <= 10 ORDER BY rank',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
```

### 3. Notification System

```sql
-- Notifications table (add to schema if needed)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    priority VARCHAR(20) DEFAULT 'medium',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    action_url VARCHAR(500),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    is_email_sent BOOLEAN DEFAULT FALSE,
    is_push_sent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

```javascript
// backend/services/notificationService.js

class NotificationService {
  /**
   * Create notification
   */
  async create(notification) {
    const { db } = require('../config/database');
    
    const result = await db.query(
      `INSERT INTO notifications (user_id, type, priority, title, message, entity_type, entity_id, action_url)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [
        notification.userId,
        notification.type,
        notification.priority || 'medium',
        notification.title,
        notification.message,
        notification.entityType,
        notification.entityId,
        notification.actionUrl
      ]
    );

    // Send real-time notification via WebSocket
    websocketService.sendNotification(notification.userId, result.rows[0]);

    // Send email if enabled
    if (notification.sendEmail !== false) {
      await this.sendEmailNotification(result.rows[0]);
    }

    return result.rows[0];
  }

  /**
   * Send transaction notification
   */
  async sendTransactionNotification(userId, transaction) {
    const messages = {
      DEPOSIT: { title: 'Deposit Successful', message: `Your deposit of $${transaction.amount} has been processed.` },
      WITHDRAW: { title: 'Withdrawal Processed', message: `Your withdrawal of $${transaction.amount} has been processed.` },
      BUY: { title: 'Purchase Complete', message: `You purchased ${transaction.shares} shares for $${transaction.amount}.` },
      SELL: { title: 'Sale Complete', message: `You sold ${transaction.shares} shares for $${transaction.amount}.` }
    };

    const { title, message } = messages[transaction.type] || { title: 'Transaction Update', message: 'Your transaction has been processed.' };

    await this.create({
      userId,
      type: 'transaction',
      title,
      message,
      entityType: 'transaction',
      entityId: transaction.id,
      actionUrl: '/dashboard/transactions'
    });
  }

  /**
   * Send email notification
   */
  async sendEmailNotification(notification) {
    // Integrate with email service (SendGrid, AWS SES, etc.)
    const user = await userRepository.findById(notification.user_id);
    
    const emailService = require('./emailService');
    await emailService.send({
      to: user.email,
      subject: notification.title,
      html: `<p>${notification.message}</p>`
    });
  }
}

module.exports = new NotificationService();
```

### 4. Backup & Restore Procedures

```bash
#!/bin/bash
# backup-database.sh

# Configuration
DB_NAME="Let_investments"
DB_USER="postgres"
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Perform backup
pg_dump -U $DB_USER -Fc $DB_NAME > $BACKUP_DIR/backup_$DATE.dump

# Compress backup
gzip $BACKUP_DIR/backup_$DATE.dump

# Keep only last 7 daily backups
find $BACKUP_DIR -name "backup_*.dump.gz" -mtime +7 -delete

echo "Backup completed: backup_$DATE.dump.gz"
```

```bash
#!/bin/bash
# restore-database.sh

# Configuration
DB_NAME="Let_investments"
DB_USER="postgres"
BACKUP_FILE=$1

if [ -z "$BACKUP_FILE" ]; then
    echo "Usage: $0 <backup_file>"
    exit 1
fi

# Check if file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Drop existing database (careful in production!)
echo "Dropping existing database..."
dropdb -U $DB_USER $DB_NAME

# Create new database
echo "Creating new database..."
createdb -U $DB_USER $DB_NAME

# Restore backup
echo "Restoring backup..."
gunzip -c $BACKUP_FILE | pg_restore -U $DB_USER -d $DB_NAME

echo "Restore completed successfully!"
```

#### Automated Backup with Cron

```bash
# Add to crontab
# Run daily at 2 AM
0 2 * * * /path/to/backup-database.sh >> /var/log/backup.log 2>&1

# Run weekly on Sunday at 3 AM
0 3 * * 0 /path/to/backup-database.sh --weekly >> /var/log/backup.log 2>&1
```

### 5. Additional Future-Proofing Features

#### Multi-Factor Authentication (MFA)

```javascript
// backend/services/mfaService.js

const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

class MFAService {
  /**
   * Generate MFA secret for user
   */
  async generateSecret(user) {
    const secret = speakeasy.generateSecret({
      name: `Let Investments (${user.email})`,
      issuer: 'Let Investments'
    });

    // Store secret temporarily (not verified yet)
    await this.storeTempSecret(user.id, secret.otpauth_url);

    // Generate QR code
    const qrCode = await QRCode.toDataURL(secret.otpauth_url);

    return {
      secret: secret.base32,
      qrCode
    };
  }

  /**
   * Verify MFA token
   */
  async verifyToken(userId, token) {
    const tempSecret = await this.getTempSecret(userId);
    
    if (!tempSecret) {
      throw new Error('MFA not set up');
    }

    const verified = spepeakeasy.totp.verify({
      secret: tempSecret,
      encoding: 'base32',
      token: token,
      window: 1 // Allow 1 step tolerance
    });

    if (verified) {
      // Enable MFA for user
      await this.enableMFA(userId);
      await this.clearTempSecret(userId);
    }

    return verified;
  }

  /**
   * Validate MFA login
   */
  async validateLogin(userId, token) {
    const user = await userRepository.findById(userId);
    
    if (!user.mfa_enabled) {
      return true; // MFA not enabled, allow login
    }

    return this.verifyToken(userId, token);
  }
}

module.exports = new MFAService();
```

#### API Versioning

```javascript
// backend/routes/v1/companies.js - Current version
// backend/routes/v2/companies.js - Future version

// Middleware for API versioning
const apiVersion = (version) => {
  return (req, res, next) => {
    req.apiVersion = version;
    next();
  };
};

// Usage
router.use('/api/v1', apiVersion('v1'), v1Routes);
router.use('/api/v2', apiVersion('v2'), v2Routes);
```

---

## Summary Checklist

### Security
- [ ] Enable Row Level Security (RLS)
- [ ] Implement input validation on all endpoints
- [ ] Add rate limiting (general and per-endpoint)
- [ ] Enable SSL/TLS in production
- [ ] Set up audit logging
- [ ] Implement MFA (optional but recommended)
- [ ] Configure CORS properly
- [ ] Add security headers (Helmet.js)

### Future-Proofing
- [ ] Set up WebSocket for real-time prices
- [ ] Create analytics views and endpoints
- [ ] Implement notification system
- [ ] Set up automated backups
- [ ] Implement API versioning
- [ ] Add database indexes for performance
- [ ] Configure proper caching strategy
- [ ] Plan for horizontal scaling

### Monitoring
- [ ] Set up application monitoring (Sentry, New Relic)
- [ ] Configure database monitoring
- [ ] Set up logging infrastructure
- [ ] Create alerting system
- [ ] Monitor API performance

---

*Document Version: 1.0.0*
*Last Updated: 2024*



