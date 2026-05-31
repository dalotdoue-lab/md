/**
 * Investment Service - TypeScript
 * 
 * This service handles all investment-related operations including:
 * - Placing BUY/SELL orders
 * - Executing orders and updating portfolios
 * - Recording price history
 * 
 * Integrates with Prisma ORM for database operations
 */

import { PrismaClient, Prisma, User, Company, PriceHistory, Order, PortfolioTransaction } from '@prisma/client';

// Initialize Prisma Client
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// Type definitions for order types
export type OrderType = 'BUY' | 'SELL';
export type OrderStatus = 'PENDING' | 'EXECUTED' | 'CANCELLED' | 'FAILED';

// Type for order with relations
interface OrderWithRelations extends Order {
  user?: User;
  company?: Company;
}

// Type for company with price
interface CompanyWithPrice extends Company {
  currentPrice: number;
}

/**
 * Error handling wrapper
 * Provides consistent error handling across all service functions
 */
export class InvestmentServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'InvestmentServiceError';
  }
}

/**
 * Place a new order (BUY or SELL)
 * 
 * This function creates a new order in the system. For BUY orders,
 * it validates user balance. For SELL orders, it validates user ownership
 * of the shares being sold.
 * 
 * @param userId - The ID of the user placing the order
 * @param companyId - The ID of the company to invest in
 * @param orderType - Either 'BUY' or 'SELL'
 * @param shares - Number of shares to trade
 * @param price - Price per share at time of order
 * @returns Created order object
 */
export async function placeOrder(
  userId: string,
  companyId: string,
  orderType: OrderType,
  shares: number,
  price: number
): Promise<Order> {
  console.log('=== PLACE ORDER SERVICE ===');
  console.log('User ID:', userId);
  console.log('Company ID:', companyId);
  console.log('Order Type:', orderType);
  console.log('Shares:', shares);
  console.log('Price:', price);

  try {
    // Validate input parameters
    if (!userId || !companyId) {
      throw new InvestmentServiceError(
        'User ID and Company ID are required',
        'INVALID_INPUT',
        400
      );
    }

    if (!orderType || !['BUY', 'SELL'].includes(orderType)) {
      throw new InvestmentServiceError(
        'Order type must be BUY or SELL',
        'INVALID_ORDER_TYPE',
        400
      );
    }

    if (!shares || shares <= 0) {
      throw new InvestmentServiceError(
        'Number of shares must be greater than 0',
        'INVALID_SHARES',
        400
      );
    }

    if (!price || price <= 0) {
      throw new InvestmentServiceError(
        'Price must be greater than 0',
        'INVALID_PRICE',
        400
      );
    }

    const totalValue = shares * price;

    // Start a transaction to ensure data consistency
    const order = await prisma.$transaction(async (tx) => {
      // Fetch user with their current portfolio
      const user = await tx.user.findUnique({
        where: { id: userId },
        include: {
          investments: {
            where: { companyId },
          },
        },
      });

      if (!user) {
        throw new InvestmentServiceError(
          'User not found',
          'USER_NOT_FOUND',
          404
        );
      }

      // Validate based on order type
      if (orderType === 'BUY') {
        // For BUY orders, check if user has sufficient balance
        if (user.balance < totalValue) {
          throw new InvestmentServiceError(
            `Insufficient balance. Required: $${totalValue.toFixed(2)}, Available: $${user.balance.toFixed(2)}`,
            'INSUFFICIENT_BALANCE',
            400
          );
        }
      } else if (orderType === 'SELL') {
        // For SELL orders, check if user owns enough shares
        const userInvestment = user.investments[0];
        if (!userInvestment || userInvestment.sharesOwned < shares) {
          throw new InvestmentServiceError(
            `Insufficient shares. Required: ${shares}, Available: ${userInvestment?.sharesOwned || 0}`,
            'INSUFFICIENT_SHARES',
            400
          );
        }
      }

      // Verify company exists
      const company = await tx.company.findUnique({
        where: { id: companyId },
      });

      if (!company) {
        throw new InvestmentServiceError(
          'Company not found',
          'COMPANY_NOT_FOUND',
          404
        );
      }

      // Create the order
      const order = await tx.order.create({
        data: {
          userId,
          companyId,
          orderType,
          shares,
          price,
          totalValue,
          status: 'PENDING',
        },
      });

      console.log('Order created successfully:', order.id);
      return order;
    });

    return order;
  } catch (error) {
    // If it's already our custom error, re-throw it
    if (error instanceof InvestmentServiceError) {
      throw error;
    }

    // Log and wrap other errors
    console.error('!!! PLACE ORDER ERROR !!!');
    console.error('Error:', error);
    throw new InvestmentServiceError(
      `Failed to place order: ${(error as Error).message}`,
      'ORDER_FAILED',
      500
    );
  }
}

/**
 * Execute a pending order
 * 
 * This function processes a pending order:
 * - For BUY orders: Deducts from user balance, adds to investments
 * - For SELL orders: Adds to user balance, reduces investments
 * - Creates a PortfolioTransaction record for each execution
 * 
 * @param orderId - The ID of the order to execute
 * @returns Executed order with relations
 */
export async function executeOrder(orderId: string): Promise<OrderWithRelations> {
  console.log('=== EXECUTE ORDER SERVICE ===');
  console.log('Order ID:', orderId);

  try {
    // Validate input
    if (!orderId) {
      throw new InvestmentServiceError(
        'Order ID is required',
        'INVALID_INPUT',
        400
      );
    }

    // Execute in a transaction for data consistency
    const executedOrder = await prisma.$transaction(async (tx) => {
      // Fetch the order with its relations
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          user: true,
          company: true,
        },
      });

      if (!order) {
        throw new InvestmentServiceError(
          'Order not found',
          'ORDER_NOT_FOUND',
          404
        );
      }

      // Check if order is in executable state
      if (order.status !== 'PENDING') {
        throw new InvestmentServiceError(
          `Cannot execute order with status: ${order.status}`,
          'INVALID_ORDER_STATUS',
          400
        );
      }

      const { userId, companyId, orderType, shares, price, totalValue } = order;

      // Process based on order type
      if (orderType === 'BUY') {
        // For BUY orders:
        // 1. Deduct from user balance
        // 2. Add/update investment
        // 3. Create portfolio transaction
        
        await tx.user.update({
          where: { id: userId },
          data: {
            balance: {
              decrement: totalValue,
            },
          },
        });

        // Check if user already has an investment in this company
        const existingInvestment = await tx.investment.findFirst({
          where: { userId, companyId },
        });

        if (existingInvestment) {
          // Update existing investment with new average price
          const totalShares = existingInvestment.sharesOwned + shares;
          const totalCostBasis = 
            existingInvestment.sharesOwned * existingInvestment.averagePrice + totalValue;
          const newAveragePrice = totalCostBasis / totalShares;

          await tx.investment.update({
            where: { id: existingInvestment.id },
            data: {
              sharesOwned: totalShares,
              averagePrice: newAveragePrice,
              currentValue: totalShares * price,
            },
          });
        } else {
          // Create new investment
          await tx.investment.create({
            data: {
              userId,
              companyId,
              sharesOwned: shares,
              averagePrice: price,
              currentValue: totalValue,
            },
          });
        }

        // Create BUY portfolio transaction
        await tx.portfolioTransaction.create({
          data: {
            userId,
            companyId,
            type: 'BUY',
            shares,
            price,
            totalAmount: totalValue,
            status: 'COMPLETED',
          },
        });

      } else if (orderType === 'SELL') {
        // For SELL orders:
        // 1. Add to user balance
        // 2. Reduce/delete investment
        // 3. Create portfolio transaction

        await tx.user.update({
          where: { id: userId },
          data: {
            balance: {
              increment: totalValue,
            },
          },
        });

        // Get current investment
        const investment = await tx.investment.findFirst({
          where: { userId, companyId },
        });

        if (investment) {
          const remainingShares = investment.sharesOwned - shares;

          if (remainingShares <= 0) {
            // Delete investment if all shares sold
            await tx.investment.delete({
              where: { id: investment.id },
            });
          } else {
            // Update investment with remaining shares
            await tx.investment.update({
              where: { id: investment.id },
              data: {
                sharesOwned: remainingShares,
                currentValue: remainingShares * price,
              },
            });
          }
        }

        // Create SELL portfolio transaction
        await tx.portfolioTransaction.create({
          data: {
            userId,
            companyId,
            type: 'SELL',
            shares,
            price,
            totalAmount: totalValue,
            status: 'COMPLETED',
          },
        });
      }

      // Update order status to EXECUTED
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'EXECUTED',
          executedAt: new Date(),
        },
        include: {
          user: true,
          company: true,
        },
      });

      console.log('Order executed successfully:', orderId);
      return updatedOrder;
    });

    return executedOrder;
  } catch (error) {
    if (error instanceof InvestmentServiceError) {
      throw error;
    }

    console.error('!!! EXECUTE ORDER ERROR !!!');
    console.error('Error:', error);
    throw new InvestmentServiceError(
      `Failed to execute order: ${(error as Error).message}`,
      'EXECUTION_FAILED',
      500
    );
  }
}

/**
 * Record a new price for a company
 * 
 * This function:
 * - Updates the company's current price
 * - Creates a new PriceHistory record for historical tracking
 * 
 * @param companyId - The ID of the company
 * @param newPrice - The new price to record
 * @returns Created price history record
 */
export async function recordPrice(
  companyId: string,
  newPrice: number
): Promise<PriceHistory> {
  console.log('=== RECORD PRICE SERVICE ===');
  console.log('Company ID:', companyId);
  console.log('New Price:', newPrice);

  try {
    // Validate input
    if (!companyId) {
      throw new InvestmentServiceError(
        'Company ID is required',
        'INVALID_INPUT',
        400
      );
    }

    if (!newPrice || newPrice <= 0) {
      throw new InvestmentServiceError(
        'Price must be greater than 0',
        'INVALID_PRICE',
        400
      );
    }

    // Execute in transaction to ensure consistency
    const priceHistory = await prisma.$transaction(async (tx) => {
      // Verify company exists
      const company = await tx.company.findUnique({
        where: { id: companyId },
      });

      if (!company) {
        throw new InvestmentServiceError(
          'Company not found',
          'COMPANY_NOT_FOUND',
          404
        );
      }

      // Update company's current price
      await tx.company.update({
        where: { id: companyId },
        data: { currentPrice: newPrice },
      });

      // Create price history record
      const history = await tx.priceHistory.create({
        data: {
          companyId,
          price: newPrice,
          volume: Math.floor(Math.random() * 1000000) + 100000, // Random volume for simulation
        },
      });

      console.log('Price recorded successfully:', history.id);
      return history;
    });

    return priceHistory;
  } catch (error) {
    if (error instanceof InvestmentServiceError) {
      throw error;
    }

    console.error('!!! RECORD PRICE ERROR !!!');
    console.error('Error:', error);
    throw new InvestmentServiceError(
      `Failed to record price: ${(error as Error).message}`,
      'PRICE_RECORD_FAILED',
      500
    );
  }
}

/**
 * Get user's portfolio with current values
 * 
 * Calculates current portfolio value based on latest stock prices
 * 
 * @param userId - The ID of the user
 * @returns User's portfolio with investments and current values
 */
export async function getUserPortfolio(userId: string) {
  console.log('=== GET USER PORTFOLIO SERVICE ===');
  console.log('User ID:', userId);

  try {
    if (!userId) {
      throw new InvestmentServiceError(
        'User ID is required',
        'INVALID_INPUT',
        400
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        investments: {
          include: {
            company: true,
          },
        },
      },
    });

    if (!user) {
      throw new InvestmentServiceError(
        'User not found',
        'USER_NOT_FOUND',
        404
      );
    }

    // Calculate portfolio metrics
    let totalInvested = 0;
    let currentValue = 0;

    const holdings = user.investments.map((investment) => {
      const investedAmount = investment.sharesOwned * investment.averagePrice;
      const currentAmount = investment.sharesOwned * investment.company.currentPrice;
      const gainLoss = currentAmount - investedAmount;
      const gainLossPercent = ((gainLoss / investedAmount) * 100);

      totalInvested += investedAmount;
      currentValue += currentAmount;

      return {
        company: {
          id: investment.company.id,
          name: investment.company.name,
          ticker: investment.company.ticker,
        },
        shares: investment.sharesOwned,
        averagePrice: investment.averagePrice,
        currentPrice: investment.company.currentPrice,
        investedAmount,
        currentAmount,
        gainLoss,
        gainLossPercent,
      };
    });

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
      balance: user.balance,
      totalInvested,
      currentValue,
      totalGainLoss: currentValue - totalInvested,
      totalGainLossPercent: totalInvested > 0 
        ? ((currentValue - totalInvested) / totalInvested) * 100 
        : 0,
      holdings,
    };
  } catch (error) {
    if (error instanceof InvestmentServiceError) {
      throw error;
    }

    console.error('!!! GET PORTFOLIO ERROR !!!');
    console.error('Error:', error);
    throw new InvestmentServiceError(
      `Failed to get portfolio: ${(error as Error).message}`,
      'PORTFOLIO_FAILED',
      500
    );
  }
}

/**
 * Get price history for a company
 * 
 * @param companyId - The ID of the company
 * @param days - Number of days of history to retrieve (default: 30)
 * @returns Array of price history records
 */
export async function getPriceHistory(
  companyId: string,
  days: number = 30
): Promise<PriceHistory[]> {
  console.log('=== GET PRICE HISTORY SERVICE ===');
  console.log('Company ID:', companyId);
  console.log('Days:', days);

  try {
    if (!companyId) {
      throw new InvestmentServiceError(
        'Company ID is required',
        'INVALID_INPUT',
        400
      );
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const history = await prisma.priceHistory.findMany({
      where: {
        companyId,
        date: {
          gte: startDate,
        },
      },
      orderBy: {
        date: 'asc',
      },
    });

    return history;
  } catch (error) {
    if (error instanceof InvestmentServiceError) {
      throw error;
    }

    console.error('!!! GET PRICE HISTORY ERROR !!!');
    console.error('Error:', error);
    throw new InvestmentServiceError(
      `Failed to get price history: ${(error as Error).message}`,
      'HISTORY_FAILED',
      500
    );
  }
}

// Export Prisma client for direct queries if needed
export { prisma };

// Export types for external use
export type { OrderWithRelations, CompanyWithPrice };

