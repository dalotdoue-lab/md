const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const prisma = require('./lib/prisma');
const { serializePrisma } = require('./utils/serializePrisma');

// Controllers
const authRoutes = require('./routes/auth');
const walletRoutes = require('./routes/wallet');
const transactionsRoutes = require('./routes/transactions');
const watchlistRoutes = require('./routes/watchlist');
const portfolioRoutes = require('./routes/portfolio');
const investmentsRoutes = require('./routes/investments');
const investorsRoutes = require('./routes/investors');
const companiesRoutes = require('./routes/companies');
const sectorsRoutes = require('./routes/sectors');
const regionsRoutes = require('./routes/regions');
const marketInsightsRoutes = require('./routes/market-insights');
const adsRoutes = require('./routes/ads');
const adminRoutes = require('./routes/admin');

// Middleware
const { authenticate } = require('./middleware/auth');
const { auditLogger } = require('./middleware/auditLogger');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(serializePrisma);

// Health check
app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(500).json({ status: 'DB_ERROR', error: error.message });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/transactions', transactionsRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/investments', investmentsRoutes);
app.use('/api/investors', investorsRoutes);
app.use('/api/companies', companiesRoutes);
app.use('/api/sectors', sectorsRoutes);
app.use('/api/regions', regionsRoutes);
app.use('/api/market-insights', marketInsightsRoutes);
app.use('/api/ads', adsRoutes);
app.use('/api/admin', adminRoutes);

// Error handler
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health: http://localhost:${PORT}/health`);
  console.log(`🔐 Auth: POST /api/auth/register & /login`);
  console.log(`💰 Wallet: GET /api/wallet (auth req)`);
});

module.exports = app;
