/**
 * WebSocket Service
 * Let Investments - Real-time updates for portfolio and prices
 * 
 * ============================================================================
 */

const WebSocket = require('ws');

let wss = null;
const clients = new Map(); // userId -> WebSocket

/**
 * Initialize WebSocket server
 * @param {http.Server} server - Node.js HTTP server
 */
function initialize(server) {
  wss = new WebSocket.Server({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    console.log('WebSocket client connected');

    ws.isAuthenticated = false;
    ws.userId = null;
    ws.subscriptions = new Set();

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message);
        handleMessage(ws, data);
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({ type: 'error', message: 'Invalid message format' }));
      }
    });

    ws.on('close', () => {
      console.log('WebSocket client disconnected');
      if (ws.userId) {
        clients.delete(ws.userId);
      }
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    // Send welcome message
    ws.send(JSON.stringify({ type: 'connected' }));
  });

  console.log('WebSocket server initialized');
}

/**
 * Handle incoming WebSocket messages
 */
function handleMessage(ws, data) {
  switch (data.type) {
    case 'authenticate':
      // Store user ID from token
      ws.userId = data.userId;
      ws.isAuthenticated = true;
      clients.set(data.userId, ws);
      ws.send(JSON.stringify({ type: 'authenticated', userId: data.userId }));
      break;

    case 'subscribe':
      // Subscribe to company price updates
      if (data.companyId) {
        ws.subscriptions.add(data.companyId);
        ws.send(JSON.stringify({ type: 'subscribed', companyId: data.companyId }));
      }
      break;

    case 'unsubscribe':
      // Unsubscribe from company updates
      if (data.companyId) {
        ws.subscriptions.delete(data.companyId);
        ws.send(JSON.stringify({ type: 'unsubscribed', companyId: data.companyId }));
      }
      break;

    case 'ping':
      ws.send(JSON.stringify({ type: 'pong' }));
      break;

    default:
      ws.send(JSON.stringify({ type: 'error', message: `Unknown message type: ${data.type}` }));
  }
}

/**
 * Send message to specific user
 * @param {string} userId - User ID
 * @param {object} data - Message data
 */
function sendToUser(userId, data) {
  const ws = clients.get(userId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
    return true;
  }
  return false;
}

/**
 * Broadcast price update to subscribed clients
 * @param {string} companyId - Company ID
 * @param {object} priceData - Price data
 */
function broadcastPriceUpdate(companyId, priceData) {
  clients.forEach((ws) => {
    if (ws.isAuthenticated && ws.subscriptions.has(companyId)) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'price_update',
          companyId,
          ...priceData,
        }));
      }
    }
  });
}

/**
 * Broadcast to all connected clients
 * @param {object} data - Message data
 */
function broadcast(data) {
  const message = JSON.stringify(data);
  clients.forEach((ws) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(message);
    }
  });
}

/**
 * Notify user of transaction
 * @param {string} userId - User ID
 * @param {object} transaction - Transaction data
 */
function notifyTransaction(userId, transaction) {
  sendToUser(userId, {
    type: 'transaction',
    transaction,
  });
}

/**
 * Notify user of portfolio change
 * @param {string} userId - User ID
 * @param {object} portfolio - Portfolio data
 */
function notifyPortfolioChange(userId, portfolio) {
  sendToUser(userId, {
    type: 'portfolio_update',
    portfolio,
  });
}

/**
 * Notify user of price alert
 * @param {string} userId - User ID
 * @param {object} alert - Alert data
 */
function notifyPriceAlert(userId, alert) {
  sendToUser(userId, {
    type: 'price_alert',
    alert,
  });
}

/**
 * Get connected clients count
 */
function getClientCount() {
  return clients.size;
}

/**
 * Close all connections
 */
function shutdown() {
  if (wss) {
    clients.forEach((ws) => {
      ws.close();
    });
    wss.close();
    console.log('WebSocket server shutdown');
  }
}

module.exports = {
  initialize,
  sendToUser,
  broadcastPriceUpdate,
  broadcast,
  notifyTransaction,
  notifyPortfolioChange,
  notifyPriceAlert,
  getClientCount,
  shutdown,
};



