/**
 * Audit Logger
 * Let Investments - Audit logging middleware
 * 
 * ============================================================================
 */

const prisma = require('../lib/prisma');

/**
 * Create audit log entry
 * @param {object} data - Audit log data
 */
async function createAuditLog(data) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId || null,
        action: data.action,
        entityType: data.entityType,
        entityId: data.entityId,
        oldValues: data.oldValues || null,
        newValues: data.newValues || null,
        ipAddress: data.ipAddress || null,
        userAgent: data.userAgent || null,
        sessionId: data.sessionId || null,
        description: data.description || null,
      },
    });
  } catch (error) {
    console.error('Audit log error:', error);
    // Don't throw - audit logging should not break main flow
  }
}

/**
 * Audit middleware factory
 * @param {string} entityType - Entity type to audit
 * @param {string} action - Action type
 */
function auditMiddleware(entityType, action) {
  return async (req, res, next) => {
    // Store original json method
    const originalJson = res.json.bind(res);

    res.json = async function (data) {
      // Only log successful operations
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const userId = req.user?.id || null;
        const ipAddress = req.ip || req.connection?.remoteAddress || null;
        const userAgent = req.get('user-agent') || null;

        await createAuditLog({
          userId,
          action,
          entityType,
          entityId: data?.id || req.params?.id || null,
          newValues: data,
          ipAddress,
          userAgent,
          description: `${action} ${entityType}`,
        });
      }

      return originalJson(data);
    };

    next();
  };
}

/**
 * Quick audit for specific operations
 */
const audit = {
  // Authentication events
  login: (userId, ipAddress) => 
    createAuditLog({ userId, action: 'UPDATE', entityType: 'user', entityId: userId, ipAddress, description: 'User login' }),
  
  logout: (userId, ipAddress) => 
    createAuditLog({ userId, action: 'UPDATE', entityType: 'user', entityId: userId, ipAddress, description: 'User logout' }),
  
  register: (userId, data, ipAddress) => 
    createAuditLog({ userId, action: 'CREATE', entityType: 'user', entityId: userId, newValues: { email: data.email }, ipAddress, description: 'User registration' }),

  // Investment events
  buy: (userId, data, ipAddress) => 
    createAuditLog({ userId, action: 'BUY', entityType: 'investment', entityId: data.investmentId, newValues: data, ipAddress, description: 'Buy investment' }),
  
  sell: (userId, data, ipAddress) => 
    createAuditLog({ userId, action: 'SELL', entityType: 'investment', entityId: data.investmentId, newValues: data, ipAddress, description: 'Sell investment' }),

  // Financial events
  deposit: (userId, data, ipAddress) => 
    createAuditLog({ userId, action: 'CREATE', entityType: 'transaction', entityId: data.transactionId, newValues: data, ipAddress, description: 'Deposit' }),
  
  withdraw: (userId, data, ipAddress) => 
    createAuditLog({ userId, action: 'CREATE', entityType: 'transaction', entityId: data.transactionId, newValues: data, ipAddress, description: 'Withdrawal' }),

  // Generic
  create: (userId, entityType, entityId, data, ipAddress) => 
    createAuditLog({ userId, action: 'CREATE', entityType, entityId, newValues: data, ipAddress, description: `Create ${entityType}` }),
  
  update: (userId, entityType, entityId, oldData, newData, ipAddress) => 
    createAuditLog({ userId, action: 'UPDATE', entityType, entityId, oldValues: oldData, newValues: newData, ipAddress, description: `Update ${entityType}` }),
  
  delete: (userId, entityType, entityId, oldData, ipAddress) => 
    createAuditLog({ userId, action: 'DELETE', entityType, entityId, oldValues: oldData, ipAddress, description: `Delete ${entityType}` }),
};

/**
 * Get audit logs for an entity
 */
async function getEntityAuditLogs(entityType, entityId, limit = 50) {
  return await prisma.auditLog.findMany({
    where: { entityType, entityId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Get user activity logs
 */
async function getUserActivityLogs(userId, limit = 50) {
  return await prisma.auditLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

module.exports = {
  createAuditLog,
  auditMiddleware,
  audit,
  getEntityAuditLogs,
  getUserActivityLogs,
};


