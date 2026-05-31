/**
 * WebSocket Server - Kingstone Investments
 * Real-time: Live transactions, dashboard updates, notifications
 * Broadcast: tx confirmations, balance changes, admin alerts
 */

const WebSocket = require('ws');
const http = require('http');
const prisma = require('../lib/prisma');
const walletRepository = require('../repositories/walletRepository');
const transactionRepository = require('../repositories/transactionRepository');

class WebSocketServer {
  constructor(server) {
    this.wss = null;
    this.clients = new Map(); // userId → ws
    this.broadcastClients = new Set(); // admin dashboard clients
    
    if (server) {
      this.initialize(server);
    }
  }

  initialize(server) {
    this.wss = new WebSocket.Server({ 
      server, 
      path: '/ws',
      perMessageDeflate: {
        zlibDeflateOptions: {
          chunkSize: 1024,
          flush: require('zlib').constants.Z_SYNC_FLUSH
        }
      }
    });

    this.wss.on('connection', (ws, req) => {
      const userId = this.extractUserId(req.url); // ?userId=123
      const ip = req.socket.remoteAddress;

      console.log(`[WS] Client connected: ${userId || 'anonymous'} (${ip})`);

      if (userId) {
        this.clients.set(userId, ws);
        this.sendUserData(ws, userId);
      } else {
        this.broadcastClients.add(ws); // Admin dashboard
      }

      ws.on('close', () => {
        console.log(`[WS] Client disconnected: ${userId || 'anonymous'}`);
        if (userId) {
          this.clients.delete(userId);
        } else {
          this.broadcastClients.delete(ws);
        }
      });

      ws.on('error', (err) => {
        console.error('[WS] Client error:', err);
        ws.close();
      });

      // Ping/pong keepalive
      ws.isAlive = true;
      ws.on('pong', () => { ws.isAlive = true; });
    });

    // Heartbeat
    setInterval(() => {
      this.wss.clients.forEach(ws => {
        if (!ws.isAlive) return ws.terminate();
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);

    console.log('✅ WebSocket server ready on /ws');
  }

  extractUserId(url) {
    const match = url.match(/[?&]userId=([^&]+)/);
    return match ? match[1] : null;
  }

  sendUserData(ws, userId) {
    const sendData = async () => {
      try {
        const wallet = await walletRepository.findByUserId(userId);
        const recentTx = await transactionRepository.findRecentByUserId(userId, 5);

        ws.send(JSON.stringify({
          type: 'user_data',
          wallet: {
            balance: wallet?.balance?.toString() || '0',
            pending: wallet?.pendingBalance?.toString() || '0'
          },
          recentTransactions: recentTx.map(tx => ({
            id: tx.id,
            type: tx.type,
            amount: Number(tx.amount).toFixed(2),
            status: tx.status,
            reference: tx.reference,
            createdAt: tx.createdAt
          }))
        }));
      } catch (error) {
        console.error('[WS] Send user data failed:', error);
      }
    };

    sendData();
  }

  /**
   * Notify specific user (used by paymentService)
   */
  static notifyUser(userId, data) {
    const instance = WebSocketServer.sharedInstance;
    if (!instance?.clients.has(userId)) return;

    const ws = instance.clients.get(userId);
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: data.type || 'notification',
        message: data.message || 'Update received',
        data,
        timestamp: new Date().toISOString()
      }));
      console.log(`[WS] Notified user ${userId}: ${data.type}`);
    }
  }

  /**
   * Broadcast to all admin dashboards
   */
  broadcastAdmin(data) {
    const payload = JSON.stringify({
      type: 'admin_broadcast',
      data,
      timestamp: new Date().toISOString()
    });

    this.broadcastClients.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(payload);
      }
    });
  }

  /**
   * Live transaction update (payment webhook → all admins + user)
   */
  notifyTransaction(tx) {
    // Notify user
    if (tx.userId) {
      WebSocketServer.notifyUser(tx.userId, {
        type: `${tx.type.toLowerCase()}_confirmed`,
        reference: tx.reference,
        amount: Number(tx.amount),
        status: tx.status
      });
    }

    // Broadcast to admins
    this.broadcastAdmin({
      type: 'live_transaction',
      transaction: {
        id: tx.id,
        userId: tx.userId,
        type: tx.type,
        amount: Number(tx.amount),
        reference: tx.reference,
        status: tx.status
      }
    });
  }

  shutdown() {
    console.log('[WS] Shutting down...');
    this.wss?.close(() => {
      console.log('[WS] Closed');
    });
    this.clients.clear();
    this.broadcastClients.clear();
  }
}

// Export singleton for services
WebSocketServer.sharedInstance = null;
const createWebSocketServer = (server) => {
  WebSocketServer.sharedInstance = new WebSocketServer(server);
  return WebSocketServer.sharedInstance;
};

module.exports = { WebSocketServer, createWebSocketServer };

