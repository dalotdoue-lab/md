/**
 * Notification Repository
 * Let Investments - Database operations for notifications
 * 
 * ============================================================================
 * Fixed: Using shared Prisma client from lib/prisma.js
 */

const prisma = require("../lib/prisma");

const notificationRepository = {
  /**
   * Find all notifications for a user
   */
  async findByUserId(userId, filters = {}) {
    const { isRead, type, limit = 50, offset = 0 } = filters;

    const where = { userId };
    
    if (isRead !== undefined) {
      where.isRead = isRead;
    }
    
    if (type) {
      where.type = type;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { userId, isRead: false } }),
    ]);

    return { notifications, total, unreadCount };
  },

  /**
   * Find notification by ID
   */
  async findById(id) {
    return await prisma.notification.findUnique({
      where: { id },
    });
  },

  /**
   * Create notification
   */
  async create(data) {
    const { userId, type, priority, title, message, entityType, entityId, actionUrl } = data;

    return await prisma.notification.create({
      data: {
        userId,
        type,
        priority: priority || 'medium',
        title,
        message,
        entityType,
        entityId,
        actionUrl,
      },
    });
  },

  /**
   * Mark notification as read
   */
  async markAsRead(id, userId) {
    return await prisma.notification.updateMany({
      where: { id, userId },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(userId) {
    return await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  },

  /**
   * Delete notification
   */
  async delete(id, userId) {
    return await prisma.notification.deleteMany({
      where: { id, userId },
    });
  },

  /**
   * Delete all read notifications
   */
  async deleteRead(userId) {
    return await prisma.notification.deleteMany({
      where: { userId, isRead: true },
    });
  },

  /**
   * Get unread count
   */
  async getUnreadCount(userId) {
    return await prisma.notification.count({
      where: { userId, isRead: false },
    });
  },

  /**
   * Create bulk notifications
   */
  async createBulk(notifications) {
    return await prisma.notification.createMany({
      data: notifications,
    });
  },
};

module.exports = notificationRepository;



