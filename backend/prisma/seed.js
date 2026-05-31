/**
 * Let Investments - Database Seed Script (Prisma v5 ready)
 */

const bcrypt = require('bcryptjs');
const prisma = require('../lib/prisma');

/** Seed roles */
async function seedRoles() {
  console.log('Seeding roles...');

  const roles = [
    {
      name: 'admin',
      description: 'Administrator with full access',
      permissions: {
        users: ['read', 'write', 'delete'],
        investments: ['read', 'write', 'delete'],
        transactions: ['read', 'write', 'delete'],
        companies: ['read', 'write', 'delete'],
        settings: ['read', 'write'],
      },
      isSystem: true,
    },
    {
      name: 'manager',
      description: 'Manager with elevated permissions',
      permissions: {
        users: ['read'],
        investments: ['read', 'write'],
        transactions: ['read', 'write'],
        companies: ['read', 'write'],
        reports: ['read'],
      },
      isSystem: true,
    },
    {
      name: 'analyst',
      description: 'Analyst with read and analysis permissions',
      permissions: {
        companies: ['read'],
        investments: ['read'],
        transactions: ['read'],
        reports: ['read', 'write'],
        insights: ['read', 'write'],
      },
      isSystem: true,
    },
    {
      name: 'client',
      description: 'Standard client/investor account',
      permissions: {
        portfolio: ['read', 'write'],
        wallet: ['read', 'write'],
        watchlist: ['read', 'write'],
        transactions: ['read'],
      },
      isSystem: true,
    },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: role,
    });
  }

  console.log('Roles seeded successfully');
}

/** Seed sectors */
async function seedSectors() {
  console.log('Seeding sectors...');

  const sectors = [
    { name: 'Telecommunications', description: 'Telecommunications and mobile network providers', icon: 'wifi', color: '#0D3B66', sortOrder: 1 },
    { name: 'Banking', description: 'Commercial and investment banking services', icon: 'building', color: '#117A65', sortOrder: 2 },
    { name: 'Utilities', description: 'Electricity, water, and energy distribution', icon: 'bolt', color: '#F39C12', sortOrder: 3 },
    { name: 'Consumer Goods', description: 'Retail, food, beverage, and consumer products', icon: 'shopping-cart', color: '#E74C3C', sortOrder: 4 },
    { name: 'Manufacturing', description: 'Industrial manufacturing and production', icon: 'cogs', color: '#9B59B6', sortOrder: 5 },
    { name: 'Mining', description: 'Mining and extraction of natural resources', icon: 'diamond', color: '#34495E', sortOrder: 6 },
    { name: 'Infrastructure', description: 'Construction and infrastructure development', icon: 'road', color: '#1ABC9C', sortOrder: 7 },
    { name: 'Energy', description: 'Oil, gas, and renewable energy', icon: 'fire', color: '#E67E22', sortOrder: 8 },
    { name: 'Technology', description: 'Software, hardware, and IT services', icon: 'laptop', color: '#3498DB', sortOrder: 9 },
    { name: 'Healthcare', description: 'Healthcare, pharmaceuticals, and medical services', icon: 'heartbeat', color: '#2ECC71', sortOrder: 10 },
    { name: 'Real Estate', description: 'Real estate investment and property management', icon: 'home', color: '#8E44AD', sortOrder: 11 },
    { name: 'Financial Services', description: 'Insurance, investment, and financial advisory', icon: 'chart-line', color: '#16A085', sortOrder: 12 },
  ];

  for (const sector of sectors) {
    await prisma.sector.upsert({
      where: { name: sector.name },
      update: {},
      create: sector,
    });
  }

  console.log('Sectors seeded successfully');
}

/** Seed regions */
async function seedRegions() {
  console.log('Seeding regions...');

  const regions = [
    { name: 'East Africa', description: 'Kenya, Tanzania, Uganda, Rwanda, Ethiopia, South Sudan', code: 'EA', sortOrder: 1 },
    { name: 'West Africa', description: 'Nigeria, Ghana, Ivory Coast, Senegal, Cameroon', code: 'WA', sortOrder: 2 },
    { name: 'South Africa', description: 'South Africa, Botswana, Namibia, Zimbabwe, Mozambique', code: 'SA', sortOrder: 3 },
    { name: 'North Africa', description: 'Egypt, Morocco, Algeria, Tunisia, Libya', code: 'NA', sortOrder: 4 },
    { name: 'Central Africa', description: 'DRC, Congo, Gabon, Equatorial Guinea', code: 'CA', sortOrder: 5 },
    { name: 'Global Markets', description: 'United States, United Kingdom, Japan, Germany, China', code: 'GLOBAL', sortOrder: 6 },
    { name: 'Middle East', description: 'UAE, Saudi Arabia, Qatar, Israel', code: 'MEA', sortOrder: 7 },
    { name: 'Europe', description: 'UK, Germany, France, Netherlands, Switzerland', code: 'EU', sortOrder: 8 },
    { name: 'Asia Pacific', description: 'China, Japan, India, Australia, Singapore', code: 'APAC', sortOrder: 9 },
  ];

  for (const region of regions) {
    await prisma.region.upsert({
      where: { name: region.name },
      update: {},
      create: region,
    });
  }

  console.log('Regions seeded successfully');
}

/** Seed admin user from environment variables */
async function seedAdminUser() {
  console.log('Seeding admin user...');

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.log('⚠️  ADMIN_EMAIL or ADMIN_PASSWORD not set. Skipping admin user seed.');
    return;
  }

  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });

  if (!adminRole) {
    console.log('⚠️  Admin role not found. Skipping admin user seed.');
    return;
  }

  const adminUser = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Admin User',
      passwordHash,
      roleId: adminRole.id,
      phone: '+254700123456',
      company: 'Let Investments',
      country: 'Kenya',
      virtualBalance: 100000,
    },
  });

  await prisma.wallet.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: { userId: adminUser.id, balance: 100000, currency: 'USD', status: 'active' },
  });

  console.log('Admin user seeded successfully');
}

/** Seed demo users + wallets */
async function seedUsers() {
  console.log('Seeding demo users...');

  // Demo user password — must be set via environment variable.
  // No credentials are hardcoded in source files per security policy.
  const seedPassword = process.env.SEED_USER_PASSWORD;
  if (!seedPassword) {
    console.log('⚠️  SEED_USER_PASSWORD not set. Skipping demo user seed.');
    return;
  }

  const passwordHash = await bcrypt.hash(seedPassword, 12);
  const clientRole = await prisma.role.findUnique({ where: { name: 'client' } });
  const managerRole = await prisma.role.findUnique({ where: { name: 'manager' } });

  const users = [
    { email: 'demo@letinvestments.com', name: 'Demo Investor', passwordHash, roleId: clientRole?.id, phone: '+254700234567', company: 'Demo Investments Ltd', country: 'Kenya', virtualBalance: 50000 },
    { email: 'john.investor@email.com', name: 'John Mwangi', passwordHash, roleId: clientRole?.id, phone: '+254711234567', company: 'Individual', country: 'Kenya', virtualBalance: 25000 },
    { email: 'sarah.tech@email.com', name: 'Sarah Chen', passwordHash, roleId: clientRole?.id, phone: '+15551234567', company: 'Tech Ventures Inc', country: 'United States', virtualBalance: 75000 },
    { email: 'manager@letinvestments.com', name: 'James Ochieng', passwordHash, roleId: managerRole?.id, phone: '+254700345678', company: 'Let Investments', country: 'Kenya', virtualBalance: 100000 },
  ];

  for (const userData of users) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: userData,
    });

    await prisma.wallet.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, balance: userData.virtualBalance, currency: 'USD', status: 'active' },
    });
  }

  console.log('Users seeded successfully');
}

/** Seed companies */
async function seedCompanies() {
  console.log('Seeding companies...');

  const telecom = await prisma.sector.findUnique({ where: { name: 'Telecommunications' } });
  const banking = await prisma.sector.findUnique({ where: { name: 'Banking' } });
  const utilities = await prisma.sector.findUnique({ where: { name: 'Utilities' } });
  const energy = await prisma.sector.findUnique({ where: { name: 'Energy' } });
  const mining = await prisma.sector.findUnique({ where: { name: 'Mining' } });
  const technology = await prisma.sector.findUnique({ where: { name: 'Technology' } });
  const consumerGoods = await prisma.sector.findUnique({ where: { name: 'Consumer Goods' } });

  const eastAfrica = await prisma.region.findUnique({ where: { name: 'East Africa' } });
  const westAfrica = await prisma.region.findUnique({ where: { name: 'West Africa' } });
  const southAfrica = await prisma.region.findUnique({ where: { name: 'South Africa' } });
  const globalMarkets = await prisma.region.findUnique({ where: { name: 'Global Markets' } });

  const companies = [
    { name: 'Safaricom', symbol: 'SCOM', sectorId: telecom?.id, regionId: eastAfrica?.id, country: 'Kenya', description: 'Leading telecom operator in Kenya', currentPrice: 18.5, marketCap: 15000000000n, peRatio: 12.5, dividendYield: 5.2, isActive: true, isFeatured: true },
    { name: 'Equity Group', symbol: 'EQTY', sectorId: banking?.id, regionId: eastAfrica?.id, country: 'Kenya', description: 'Largest banking group in East Africa', currentPrice: 45.0, marketCap: 12000000000n, peRatio: 10.2, dividendYield: 4.5, isActive: true, isFeatured: true },
    { name: 'MTN Nigeria', symbol: 'MTNN', sectorId: telecom?.id, regionId: westAfrica?.id, country: 'Nigeria', description: 'Largest telecom operator in Nigeria', currentPrice: 245.0, marketCap: 18000000000n, peRatio: 10.5, dividendYield: 5.8, isActive: true, isFeatured: true },
    { name: 'Microsoft', symbol: 'MSFT', sectorId: technology?.id, regionId: globalMarkets?.id, country: 'United States', description: "World's largest software company", currentPrice: 385.0, marketCap: 2850000000000n, peRatio: 35.2, dividendYield: 0.8, isActive: true, isFeatured: true },
  ];

  for (const company of companies) {
    await prisma.company.upsert({
      where: { symbol: company.symbol },
      update: {},
      create: company,
    });
  }

  console.log('Companies seeded successfully');
}

/** Seed demo investments */
async function seedInvestments() {
  console.log('Seeding demo investments...');
  const demoUser = await prisma.user.findUnique({ where: { email: 'demo@letinvestments.com' } });
  if (!demoUser) return;

  const scom = await prisma.company.findUnique({ where: { symbol: 'SCOM' } });
  const mtnn = await prisma.company.findUnique({ where: { symbol: 'MTNN' } });
  const msft = await prisma.company.findUnique({ where: { symbol: 'MSFT' } });

  const investments = [
    { userId: demoUser.id, companyId: scom?.id, shares: 100, buyPrice: scom?.currentPrice * 0.95 },
    { userId: demoUser.id, companyId: mtnn?.id, shares: 50, buyPrice: mtnn?.currentPrice * 0.95 },
    { userId: demoUser.id, companyId: msft?.id, shares: 25, buyPrice: msft?.currentPrice * 0.92 },
  ];

  for (const inv of investments) {
    if (!inv.companyId) continue;
    const totalCost = inv.shares * inv.buyPrice;
    await prisma.investment.upsert({
      where: { userId_companyId: { userId: inv.userId, companyId: inv.companyId } },
      update: {},
      create: {
        userId: inv.userId,
        companyId: inv.companyId,
        shares: inv.shares,
        buyPrice: inv.buyPrice,
        averageCost: inv.buyPrice,
        investmentAmount: totalCost,
        currentPrice: inv.buyPrice,
        currentValue: totalCost,
        profitLoss: 0,
        profitLossPercent: 0,
        isActive: true,
      },
    });
  }

  console.log('Demo investments seeded successfully');
}

/** Seed market insights */
async function seedMarketInsights() {
  console.log('Seeding market insights...');
  // Find the first admin user dynamically — no hardcoded email addresses
  const adminRole = await prisma.role.findUnique({ where: { name: 'admin' } });
  const admin = adminRole ? await prisma.user.findFirst({ where: { roleId: adminRole.id } }) : null;
  const eastAfrica = await prisma.region.findUnique({ where: { name: 'East Africa' } });
  const globalMarkets = await prisma.region.findUnique({ where: { name: 'Global Markets' } });

  const insights = [
    {
      slug: 'african-markets-growth-2024',
      title: 'African Markets Show Strong Growth Potential in 2024',
      content: 'The African continent continues to present compelling investment opportunities...',
      summary: 'Analysis of African market growth opportunities in 2024',
      authorId: admin?.id,
      category: 'Market Analysis',
      regionId: eastAfrica?.id,
      tags: ['Africa', 'Growth', 'Emerging Markets'],
      isFeatured: true,
      isPublished: true,
    },
    {
      slug: 'energy-transition-opportunities',
      title: 'Global Energy Transition Creates Investment Opportunities',
      content: 'The global shift towards renewable energy is creating significant investment opportunities...',
      summary: 'Investment opportunities in renewable energy and clean tech',
      authorId: admin?.id,
      category: 'Market Analysis',
      regionId: globalMarkets?.id,
      tags: ['Energy', 'Renewable', 'ESG'],
      isFeatured: true,
      isPublished: true,
    },
  ];

  for (const insight of insights) {
    await prisma.marketInsight.upsert({
      where: { slug: insight.slug },
      update: {},
      create: { ...insight, publishedAt: insight.isPublished ? new Date() : null },
    });
  }

  console.log('Market insights seeded successfully');
}

/** Seed notifications */
async function seedNotifications() {
  console.log('Seeding notifications...');
  const demoUser = await prisma.user.findUnique({ where: { email: 'demo@letinvestments.com' } });
  if (!demoUser) return;

  const notifications = [
    { userId: demoUser.id, type: 'system', priority: 'high', title: 'Welcome to Let Investments', message: 'Your account has been created successfully.' },
    { userId: demoUser.id, type: 'investment', priority: 'medium', title: 'Portfolio Update', message: 'Your portfolio value has increased by 2.5% this week.' },
  ];

  for (const notif of notifications) {
    await prisma.notification.create({ data: notif });
  }

  console.log('Notifications seeded successfully');
}

/** Main seed function */
async function main() {
  console.log('========================================');
  console.log('Let Investments - Database Seeding');
  console.log('========================================\n');

  try {
    await seedRoles();
    await seedSectors();
    await seedRegions();
    await seedAdminUser();
    await seedUsers();
    await seedCompanies();
    await seedInvestments();
    await seedMarketInsights();
    await seedNotifications();

    console.log('\n========================================');
    console.log('✅ Database seeded successfully!');
    console.log('========================================');
  } catch (error) {
    console.error('\n❌ Seeding failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();