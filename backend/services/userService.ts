/**
 * User Service - TypeScript
 * 
 * Handles user registration and authentication for the investment platform.
 * Includes password hashing with bcrypt and automatic wallet creation.
 */

import { PrismaClient, User, Wallet } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Initialize Prisma Client
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

// =====================================================
// Types
// =====================================================

/**
 * Input type for user registration
 */
export interface RegisterUserInput {
  email: string;
  name: string;
  password: string;
  country?: string;
  phone?: string;
  company?: string;
}

/**
 * Type for user without password (returned to client)
 */
export interface SafeUser {
  id: string;
  email: string;
  name: string;
  country: string | null;
  phone: string | null;
  company: string | null;
  role: string;
  balance: number;
  createdAt: Date;
}

/**
 * Custom error class for user service errors
 */
export class UserServiceError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'UserServiceError';
  }
}

// =====================================================
// Constants
// =====================================================

// Default starting balance for new users (virtual money for demo)
const DEFAULT_STARTING_BALANCE = 10000;

// Bcrypt salt rounds for password hashing
const BCRYPT_SALT_ROUNDS = 10;

// =====================================================
// Main Function: Register User
// =====================================================

/**
 * Register a new user in the system
 * 
 * This function:
 * 1. Validates input (email format, password length, required fields)
 * 2. Checks if user already exists with the same email
 * 3. Hashes the password using bcrypt
 * 4. Creates user and wallet in a single transaction
 * 5. Returns the user without the password hash
 * 
 * @param input - Object containing email, name, password, country, phone, company
 * @returns Created user (without password hash) and JWT token
 * @throws UserServiceError on validation failure or database errors
 */
export async function registerUser(input: RegisterUserInput): Promise<{ user: SafeUser; token: string }> {
  console.log('=== REGISTER USER SERVICE ===');
  console.log('Email:', input.email);
  console.log('Name:', input.name);

  try {
    // =====================================================
    // Step 1: Input Validation
    // =====================================================
    console.log('Validating input...');

    // Check required fields
    if (!input.email || !input.name || !input.password) {
      throw new UserServiceError(
        'Email, name, and password are required',
        'MISSING_REQUIRED_FIELDS',
        400
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(input.email)) {
      throw new UserServiceError(
        'Invalid email format',
        'INVALID_EMAIL',
        400
      );
    }

    // Validate password length (minimum 6 characters)
    if (input.password.length < 6) {
      throw new UserServiceError(
        'Password must be at least 6 characters',
        'PASSWORD_TOO_SHORT',
        400
      );
    }

    // Normalize email to lowercase
    const normalizedEmail = input.email.toLowerCase().trim();
    const trimmedName = input.name.trim();

    console.log('Input validation passed');

    // =====================================================
    // Step 2: Check if user already exists
    // =====================================================
    console.log('Checking for existing user...');

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      console.log('User already exists with email:', normalizedEmail);
      throw new UserServiceError(
        'A user with this email already exists',
        'EMAIL_ALREADY_EXISTS',
        409
      );
    }

    console.log('No existing user found');

    // =====================================================
    // Step 3: Hash the password
    // =====================================================
    console.log('Hashing password...');

    const passwordHash = await bcrypt.hash(input.password, BCRYPT_SALT_ROUNDS);

    console.log('Password hashed successfully');

    // =====================================================
    // Step 4: Create user and wallet in transaction
    // =====================================================
    console.log('Creating user and wallet in transaction...');

    // Use Prisma transaction to ensure both user and wallet are created atomically
    const createdUser = await prisma.$transaction(async (tx) => {
      // Create the user first
      const user = await tx.user.create({
        data: {
          email: normalizedEmail,
          name: trimmedName,
          passwordHash: passwordHash,
          country: input.country || null,
          phone: input.phone || null,
          company: input.company || null,
          role: 'client', // Default role
          balance: DEFAULT_STARTING_BALANCE, // Virtual starting balance
        },
      });

      console.log('User created with ID:', user.id);

      // Create the wallet with starting balance
      await tx.wallet.create({
        data: {
          userId: user.id,
          balance: 0, // Wallet starts at 0, user balance is virtual
          currency: 'USD',
          status: 'active',
        },
      });

      console.log('Wallet created for user:', user.id);

      return user;
    });

    // =====================================================
    // Step 5: Generate JWT token
    // =====================================================
    console.log('Generating JWT token...');

    const token = generateJwtToken(createdUser.id, createdUser.email, createdUser.role);

    console.log('JWT token generated');

    // =====================================================
    // Step 6: Return safe user object (without password)
    // =====================================================
    const safeUser: SafeUser = {
      id: createdUser.id,
      email: createdUser.email,
      name: createdUser.name,
      country: createdUser.country,
      phone: createdUser.phone,
      company: createdUser.company,
      role: createdUser.role,
      balance: createdUser.balance,
      createdAt: createdUser.createdAt,
    };

    console.log('User registered successfully:', createdUser.id);

    return {
      user: safeUser,
      token,
    };

  } catch (error) {
    // If it's already our custom error, re-throw it
    if (error instanceof UserServiceError) {
      console.error('User service error:', error.code, error.message);
      throw error;
    }

    // Log and wrap unexpected errors
    console.error('!!! REGISTER USER ERROR !!!');
    console.error('Error:', error);
    console.error('Stack:', (error as Error).stack);

    throw new UserServiceError(
      `Registration failed: ${(error as Error).message}`,
      'REGISTRATION_FAILED',
      500
    );
  }
}

// =====================================================
// Helper Functions
// =====================================================

/**
 * Generate a JWT token for the user
 * 
 * @param userId - The user's ID
 * @param email - The user's email
 * @param role - The user's role
 * @returns JWT token string
 */
function generateJwtToken(userId: string, email: string, role: string): string {
  // In a real application, you would use jsonwebtoken library:
  // import jwt from 'jsonwebtoken';
  // const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  // return jwt.sign({ userId, email, role }, JWT_SECRET, { expiresIn: '7d' });
  
  // For now, return a placeholder
  console.log('Generating token for user:', userId, 'role:', role);
  return `jwt-token-placeholder-${Date.now()}`;
}

/**
 * Validate user credentials (login helper)
 * 
 * @param email - User's email
 * @param password - User's plain text password
 * @returns User if credentials are valid
 * @throws UserServiceError on invalid credentials
 */
export async function validateCredentials(
  email: string, 
  password: string
): Promise<SafeUser> {
  console.log('=== VALIDATE CREDENTIALS ===');
  console.log('Email:', email);

  try {
    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      console.log('User not found');
      throw new UserServiceError(
        'Invalid email or password',
        'INVALID_CREDENTIALS',
        401
      );
    }

    // Compare password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);

    if (!isValidPassword) {
      console.log('Invalid password');
      throw new UserServiceError(
        'Invalid email or password',
        'INVALID_CREDENTIALS',
        401
      );
    }

    console.log('Credentials validated successfully');

    // Return safe user object
    const safeUser: SafeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      country: user.country,
      phone: user.phone,
      company: user.company,
      role: user.role,
      balance: user.balance,
      createdAt: user.createdAt,
    };

    return safeUser;

  } catch (error) {
    if (error instanceof UserServiceError) {
      throw error;
    }

    console.error('!!! VALIDATE CREDENTIALS ERROR !!!');
    console.error('Error:', error);

    throw new UserServiceError(
      `Authentication failed: ${(error as Error).message}`,
      'AUTH_FAILED',
      500
    );
  }
}

/**
 * Get user by ID (without password)
 * 
 * @param userId - The user's ID
 * @returns User object without password
 */
export async function getUserById(userId: string): Promise<SafeUser | null> {
  console.log('=== GET USER BY ID ===');
  console.log('User ID:', userId);

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        country: true,
        phone: true,
        company: true,
        role: true,
        balance: true,
        createdAt: true,
      },
    });

    if (!user) {
      console.log('User not found');
      return null;
    }

    console.log('User found:', user.id);
    return user as SafeUser;

  } catch (error) {
    console.error('!!! GET USER BY ID ERROR !!!');
    console.error('Error:', error);

    throw new UserServiceError(
      `Failed to get user: ${(error as Error).message}`,
      'GET_USER_FAILED',
      500
    );
  }
}

// Export Prisma client for external use if needed
export { prisma };

