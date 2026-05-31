/**
 * Kingstone Investments Backend
 * Express.js server with PostgreSQL database
 * 
 * ============================================================================
 * Fixed: Using shared Prisma client from lib/prisma.js
 * Added: RBAC admin/client-portal routes
 */

const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import shared Prisma client
const prisma = require('./lib/prisma');

// Import MongoDB connection
const connectMongoDB = require('./config/mongodb');

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const clientPortalRoutes = require('./routes/client-portal');
const companiesRoutes = require('./routes/companies');
const sectorsRoutes = require('./routes/sectors');
const regionsRoutes = require('./routes/regions');
const investmentsRoutes = require('./routes/investments');
const portfolioRoutes = require('./routes/portfolio');
const transactionsRoutes = require('./routes/transactions');
const watchlistRoutes = require('./routes/watchlist');
const marketInsightsRoutes = require('./routes/market-insights');
const adsRoutes = require('./routes/ads');
const walletRoutes = require('./routes/wallet');

// Import services
const { initScheduler } = require('./services/scheduler');
const websocketService = require('./services/websocketService');

const app = express();
const PORT = process.env.PORT || 5000;

// =====================================================
// Middleware
// =====================================================

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests from this IP',
    retryAfter: '15 minutes'
  },
  skipSuccessfulRequests: true
});

app.use('/api/', limiter);

// Security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"]
    }
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

// Additional security headers
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  next();
});

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// =====================================================
// Database Connection & Initialization
// =====================================================

async function initializeDatabase() {
  console.log('========================================');
  console.log('Initializing Database Connection...');
  console.log('========================================');
  
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    console.log('✅ Database initialization complete');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    return false;
  }
}

// =====================================================
// API Routes
// =====================================================

// Health check
app.get('/api/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'ok', 
      message: 'Let Investments API is running with PostgreSQL + RBAC',
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    res.status(503).json({ 
      status: 'error', 
      message: 'Database connection issue',
      timestamp: new Date().toISOString(),
      database: 'disconnected'
    });
  }
});

// Public endpoint for system settings/maintenance status
app.get('/api/system/settings', async (req, res) => {
  try {
    const SystemSettings = require('./models/SystemSettings');
    let settings = await SystemSettings.findOne();
    if (!settings) {
      settings = await SystemSettings.create({});
    }
    const mpesaPaybill = settings.mpesaPaybill || settings.mpesaNumber || '400200';
    const mpesaAccountNumber = settings.mpesaAccountNumber || 'KINGSTONE';
    const mpesaAccountName = settings.mpesaAccountName || settings.mpesaName || 'Kingstone Investments';
    res.json({
      success: true,
      systemDown: settings.systemDown,
      systemMessage: settings.systemMessage,
      mpesaPaybill,
      mpesaAccountNumber,
      mpesaAccountName,
      mpesaNumber: mpesaPaybill,
      mpesaName: mpesaAccountName
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin/blog', require('./routes/blog'));
app.use('/api/admin', adminRoutes);
app.use('/api/client-portal', clientPortalRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/sectors', sectorsRoutes);
app.use('/api/regions', regionsRoutes);
app.use('/api/payments', require('./routes/payment'));
app.use('/api/invest', investmentsRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/insights', marketInsightsRoutes);
app.use('/api/ads', adsRoutes);
app.use('/api/wallet', walletRoutes);

// MongoDB-backed routes
app.use('/api/me', require('./routes/me'));
app.use('/api/catalog', require('./routes/catalog'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/invest-portal', require('./routes/investPortal'));

// =====================================================
// Error Handling
// =====================================================

app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    path: req.path
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'An unexpected error occurred'
  });
});

// =====================================================
// Graceful Shutdown
// =====================================================

async function gracefulShutdown(signal) {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  try {
    const { stopScheduler } = require('./services/scheduler');
    stopScheduler();
    websocketService.shutdown();
    await prisma.$disconnect();
    
    console.log('✅ Graceful shutdown complete');
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// =====================================================
// Start Server
// =====================================================

async function startServer() {
  const dbInitialized = await initializeDatabase();

  if (!dbInitialized && process.env.NODE_ENV === 'production') {
    console.error('Cannot start server without database connection');
    process.exit(1);
  }

  await connectMongoDB();

  const server = app.listen(PORT, () => {
    console.log(`\n🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    
    if (dbInitialized) {
      initScheduler();
      console.log('✅ Scheduler initialized');
    }

    try {
      websocketService.initialize(server);
      console.log('✅ WebSocket server initialized');
    } catch (error) {
      console.warn('⚠️ WebSocket initialization failed:', error.message);
    }
  });

  return server;
}

startServer();

module.exports = app;
