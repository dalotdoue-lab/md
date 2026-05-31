/**
 * Authentication Controller - FINAL CLEAN VERSION
 * Kingstone Investments
 * Fully Fixed: Role handling, Prisma safety, frontend compatibility
 */

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../prisma/client");

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey-do-not-use-in-prod";

// =====================================================
// REGISTER
// =====================================================
exports.register = async (req, res) => {
  try {
    const { email, password, name, country, phone, company } = req.body;

    const emailLower = email.toLowerCase().trim();

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: emailLower }
    });

    if (existingUser) {
      return res.status(409).json({
        error: "UserExists",
        message: "User with this email already exists"
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Get or create client role
    let clientRole = await prisma.role.findFirst({
      where: { name: "client" }
    });

    if (!clientRole) {
      clientRole = await prisma.role.create({
        data: {
          name: "client",
          description: "Standard investment client",
          permissions: {
            dashboard: true,
            portfolio: true,
            transactions: true,
            investments: true
          },
          isSystem: true
        }
      });
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: emailLower,
        name: name.trim(),
        passwordHash,
        roleId: clientRole.id,
        country: country || null,
        phone: phone || null,
        company: company || null
      }
    });

    // Create wallet (safe check)
    let wallet = await prisma.wallet.findUnique({
      where: { userId: user.id }
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          userId: user.id,
          balance: "10000.00",
          pendingBalance: "0.00",
          currency: "USD",
          status: "active"
        }
      });
    }

    // JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: clientRole.name
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // RESPONSE (IMPORTANT FIX HERE)
    const responseUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: clientRole.name,
      country: user.country,
      phone: user.phone,
      company: user.company
    };

    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.status(201).json({
      success: true,
      user: responseUser,
      token,
      message: "Registration successful"
    });

  } catch (error) {
    console.error("REGISTER ERROR:", error);

    return res.status(500).json({
      error: "InternalServerError",
      message: "Registration failed"
    });
  }
};

// =====================================================
// LOGIN (FIXED & CLEAN)
// =====================================================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const emailLower = email.toLowerCase();

    const user = await prisma.user.findUnique({
      where: { email: emailLower }
    });

    if (!user || !user.passwordHash) {
      return res.status(401).json({
        error: "Login failed",
        message: "Invalid credentials"
      });
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);

    if (!isValid) {
      return res.status(401).json({
        error: "Login failed",
        message: "Invalid credentials"
      });
    }

    // Get role (IMPORTANT FIX)
    const role = await prisma.role.findUnique({
      where: { id: user.roleId }
    });

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: role?.name || "client"
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const responseUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: role?.name || "client"
    };

    res.cookie("authToken", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return res.json({
      success: true,
      user: responseUser,
      token,
      message: "Login successful"
    });

  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return res.status(500).json({
      error: "Login failed",
      message: "Authentication error"
    });
  }
};