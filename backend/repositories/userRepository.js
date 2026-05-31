/**
 * User Repository - Prisma Implementation
 * Kingstone Investments
 */

const prisma = require('../lib/prisma');

/**
 * Find user by ID
 */
async function findById(id) {
  if (!id) return null;

  try {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        role: {
          select: { id: true, name: true }
        },
        wallet: {
          select: { id: true, balance: true, currency: true }
        }
      }
    });
  } catch (error) {
    console.error("💥 Error finding user by ID:", error);
    return null;
  }
}

/**
 * Find user by email (LOGIN USES THIS)
 */
async function findByEmail(email) {
  if (!email) return null;

  try {
    const emailLower = email.toLowerCase().trim();

    return await prisma.user.findUnique({
      where: { email: emailLower },
      select: {
        id: true,
        email: true,
        passwordHash: true, // ⚠️ REQUIRED FOR LOGIN
        name: true,
        roleId: true,
        phone: true,
        company: true,
        country: true,
        virtualBalance: true,
        is_email_verified: true,
        is_active: true
      }
    });
  } catch (error) {
    console.error("💥 Error finding user by email:", error);
    return null;
  }
}

module.exports = {
  findById,
  findByEmail
};