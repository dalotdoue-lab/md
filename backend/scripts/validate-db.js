/**
 * Database Validation Script
 * Let Investments - Validate database integrity
 * 
 * Usage: node scripts/validate-db.js
 * 
 * ============================================================================
 */

const prisma = require('../lib/prisma');

/**
 * Run all validation checks
 */
async function validateDatabase() {
  console.log('Starting database validation...\n');
  let allPassed = true;

  try {
    // 1. Check table counts
    await validateTableCounts();

    // 2. Check foreign key integrity
    await validateForeignKeys();

    // 3. Check uniqueness constraints
    await validateUniqueness();

    // 4. Check data integrity
    await validateDataIntegrity();

    // 5. Check required data exists
    await validateRequiredData();

    console.log('\n========================================');
    if (allPassed) {
      console.log('✅ All validations passed!');
    } else {
      console.log('❌ Some validations failed!');
      process.exit(1);
    }
    console.log('========================================\n');
  } catch (error) {
    console.error('Validation error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Validate table counts
 */
async function validateTableCounts() {
  console.log('1. Checking table counts...');

  const checks = [
    { name: 'Users', count: await prisma.user.count(), min: 1 },
    { name: 'Roles', count: await prisma.role.count(), min: 1 },
    { name: 'Sectors', count: await prisma.sector.count(), min: 1 },
    { name: 'Regions', count: await prisma.region.count(), min: 1 },
    { name: 'Companies', count: await prisma.company.count(), min: 1 },
    { name: 'Wallets', count: await prisma.wallet.count(), min: 1 },
  ];

  checks.forEach(check => {
    const passed = check.count >= check.min;
    console.log(`   ${passed ? '✓' : '✗'} ${check.name}: ${check.count} (min: ${check.min})`);
    if (!passed) allPassed = false;
  });
}

/**
 * Validate foreign key relationships
 */
async function validateForeignKeys() {
  console.log('\n2. Checking foreign key integrity...');

  // Check users with invalid role_id
  const invalidRoles = await prisma.$queryRaw`
    SELECT COUNT(*) as count FROM users 
    WHERE "role_id" IS NOT NULL 
    AND "role_id" NOT IN (SELECT id FROM roles)
  `;
  const invalidRoleCount = Number(invalidRoles[0]?.count || 0);
  console.log(`   ${invalidRoleCount === 0 ? '✓' : '✗'} Users with invalid role: ${invalidRoleCount}`);
  if (invalidRoleCount > 0) allPassed = false;

  // Check companies with invalid sector_id
  const invalidSectors = await prisma.$queryRaw`
    SELECT COUNT(*) as count FROM companies 
    WHERE "sector_id" IS NOT NULL 
    AND "sector_id" NOT IN (SELECT id FROM sectors)
  `;
  const invalidSectorCount = Number(invalidSectors[0]?.count || 0);
  console.log(`   ${invalidSectorCount === 0 ? '✓' : '✗'} Companies with invalid sector: ${invalidSectorCount}`);
  if (invalidSectorCount > 0) allPassed = false;

  // Check investments with invalid user_id
  const invalidInvestments = await prisma.$queryRaw`
    SELECT COUNT(*) as count FROM investments 
    WHERE "user_id" NOT IN (SELECT id FROM users)
  `;
  const invalidInvestmentCount = Number(invalidInvestments[0]?.count || 0);
  console.log(`   ${invalidInvestmentCount === 0 ? '✓' : '✗'} Investments with invalid user: ${invalidInvestmentCount}`);
  if (invalidInvestmentCount > 0) allPassed = false;
}

/**
 * Validate uniqueness constraints
 */
async function validateUniqueness() {
  console.log('\n3. Checking uniqueness constraints...');

  // Check duplicate emails
  const duplicateEmails = await prisma.user.groupBy({
    by: ['email'],
    having: { email: { _count: { gt: 1 } } },
  });
  console.log(`   ${duplicateEmails.length === 0 ? '✓' : '✗'} Duplicate user emails: ${duplicateEmails.length}`);
  if (duplicateEmails.length > 0) allPassed = false;

  // Check duplicate company symbols
  const duplicateSymbols = await prisma.company.groupBy({
    by: ['symbol'],
    having: { symbol: { _count: { gt: 1 } } },
  });
  console.log(`   ${duplicateSymbols.length === 0 ? '✓' : '✗'} Duplicate company symbols: ${duplicateSymbols.length}`);
  if (duplicateSymbols.length > 0) allPassed = false;
}

/**
 * Validate data integrity (business rules)
 */
async function validateDataIntegrity() {
  console.log('\n4. Checking data integrity...');

  // Check for negative wallet balances
  const negativeBalances = await prisma.wallet.count({
    where: { balance: { lt: 0 } },
  });
  console.log(`   ${negativeBalances === 0 ? '✓' : '✗'} Negative wallet balances: ${negativeBalances}`);
  if (negativeBalances > 0) allPassed = false;

  // Check for negative investment values
  const negativeInvestments = await prisma.investment.count({
    where: { shares: { lt: 0 } },
  });
  console.log(`   ${negativeInvestments === 0 ? '✓' : '✗'} Negative share counts: ${negativeInvestments}`);
  if (negativeInvestments > 0) allPassed = false;

  // Check inactive users with active investments
  const inactiveWithInvestments = await prisma.investment.count({
    where: {
      isActive: true,
      user: { isActive: false },
    },
  });
  console.log(`   ${inactiveWithInvestments === 0 ? '✓' : '✗'} Inactive users with active investments: ${inactiveWithInvestments}`);
  if (inactiveWithInvestments > 0) allPassed = false;
}

/**
 * Validate required reference data exists
 */
async function validateRequiredData() {
  console.log('\n5. Checking required data...');

  // Check required roles exist
  const requiredRoles = ['admin', 'client', 'manager', 'analyst'];
  const existingRoles = await prisma.role.findMany({ select: { name: true } });
  const existingRoleNames = existingRoles.map(r => r.name);
  
  const missingRoles = requiredRoles.filter(r => !existingRoleNames.includes(r));
  console.log(`   ${missingRoles.length === 0 ? '✓' : '✗'} Required roles: ${missingRoles.length === 0 ? 'All present' : 'Missing: ' + missingRoles.join(', ')}`);
  if (missingRoles.length > 0) allPassed = false;

  // Check required sectors exist
  const requiredSectors = ['Telecommunications', 'Banking', 'Technology', 'Energy'];
  const existingSectors = await prisma.sector.findMany({ select: { name: true } });
  const existingSectorNames = existingSectors.map(s => s.name);
  
  const missingSectors = requiredSectors.filter(s => !existingSectorNames.includes(s));
  console.log(`   ${missingSectors.length === 0 ? '✓' : '✗'} Required sectors: ${missingSectors.length === 0 ? 'All present' : 'Missing: ' + missingSectors.join(', ')}`);
  if (missingSectors.length > 0) allPassed = false;

  // Check demo user exists
  const demoUser = await prisma.user.findUnique({
    where: { email: 'demo@Letinvestments.com' },
  });
  console.log(`   ${demoUser ? '✓' : '✗'} Demo user exists`);
  if (!demoUser) allPassed = false;
}

// Run validation
validateDatabase();



