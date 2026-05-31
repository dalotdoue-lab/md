/**
 * Mock Data Module
 * Provides static reference data + minimal users/investments for portfolio API compatibility
 */

// Sample companies data
const companies = [
  {
    id: '1',
    name: 'Safaricom',
    symbol: 'SCOM',
    sector: 'Telecommunications',
    region: 'East Africa',
    country: 'Kenya',
    current_price: 18.50,
    description: 'Leading telecom operator in Kenya',
    logo_url: null,
    market_cap: 15000000000,
    pe_ratio: 12.5,
    dividend_yield: 5.2,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '2',
    name: 'MTN Nigeria',
    symbol: 'MTNN',
    sector: 'Telecommunications',
    region: 'West Africa',
    country: 'Nigeria',
    current_price: 245.00,
    description: 'Largest telecom operator in Nigeria',
    logo_url: null,
    market_cap: 18000000000,
    pe_ratio: 10.5,
    dividend_yield: 5.8,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '3',
    name: 'MTN Group',
    symbol: 'MTN',
    sector: 'Telecommunications',
    region: 'South Africa',
    country: 'South Africa',
    current_price: 145.00,
    description: 'Global telecom company',
    logo_url: null,
    market_cap: 32000000000,
    pe_ratio: 9.2,
    dividend_yield: 6.5,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '4',
    name: 'Standard Bank',
    symbol: 'SBK',
    sector: 'Banking',
    region: 'South Africa',
    country: 'South Africa',
    current_price: 165.00,
    description: "Africa's largest bank by assets",
    logo_url: null,
    market_cap: 45000000000,
    pe_ratio: 8.9,
    dividend_yield: 5.2,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '5',
    name: 'Microsoft',
    symbol: 'MSFT',
    sector: 'Technology',
    region: 'Global Markets',
    country: 'United States',
    current_price: 385.00,
    description: "World's largest software company",
    logo_url: null,
    market_cap: 2850000000000,
    pe_ratio: 35.2,
    dividend_yield: 0.8,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '6',
    name: 'Apple',
    symbol: 'AAPL',
    sector: 'Technology',
    region: 'Global Markets',
    country: 'United States',
    current_price: 175.00,
    description: 'Leading technology company',
    logo_url: null,
    market_cap: 2750000000000,
    pe_ratio: 28.5,
    dividend_yield: 0.5,
    is_active: true,
    created_at: new Date(),
    updated_at: new Date()
  }
];

// Sample sectors data
const sectors = [
  { id: '1', name: 'Telecommunications', description: 'Telecommunications and mobile network providers', icon: 'wifi', is_active: true, created_at: new Date() },
  { id: '2', name: 'Banking', description: 'Commercial and investment banking services', icon: 'building', is_active: true, created_at: new Date() },
  { id: '3', name: 'Utilities', description: 'Electricity, water, and energy distribution', icon: 'bolt', is_active: true, created_at: new Date() },
  { id: '4', name: 'Consumer Goods', description: 'Retail, food, beverage, and consumer products', icon: 'shopping-cart', is_active: true, created_at: new Date() },
  { id: '5', name: 'Manufacturing', description: 'Industrial manufacturing and production', icon: 'cogs', is_active: true, created_at: new Date() },
  { id: '6', name: 'Mining', description: 'Mining and extraction of natural resources', icon: 'diamond', is_active: true, created_at: new Date() },
  { id: '7', name: 'Infrastructure', description: 'Construction and infrastructure development', icon: 'road', is_active: true, created_at: new Date() },
  { id: '8', name: 'Energy', description: 'Oil, gas, and renewable energy', icon: 'fire', is_active: true, created_at: new Date() },
  { id: '9', name: 'Technology', description: 'Software, hardware, and IT services', icon: 'laptop', is_active: true, created_at: new Date() },
  { id: '10', name: 'Smart Systems', description: 'IoT, AI, automation, and smart technology', icon: 'robot', is_active: true, created_at: new Date() }
];

// Sample regions data
const regions = [
  { id: '1', name: 'East Africa', description: 'Kenya, Tanzania, Uganda, Rwanda, Ethiopia', is_active: true, created_at: new Date() },
  { id: '2', name: 'West Africa', description: 'Nigeria, Ghana, Ivory Coast, Senegal, Cameroon', is_active: true, created_at: new Date() },
  { id: '3', name: 'South Africa', description: 'South Africa, Botswana, Namibia, Zimbabwe, Mozambique', is_active: true, created_at: new Date() },
  { id: '4', name: 'North Africa', description: 'Egypt, Morocco, Algeria, Tunisia, Libya', is_active: true, created_at: new Date() },
  { id: '5', name: 'Global Markets', description: 'United States, United Kingdom, Japan, Germany, China', is_active: true, created_at: new Date() }
];

// Sample market insights data
const marketInsights = [
  {
    id: '1',
    slug: 'african-markets-growth-2024',
    title: 'African Markets Show Strong Growth Potential in 2024',
    content: 'The African continent continues to present compelling investment opportunities...',
    author: 'Dr. James Mwangi',
    category: 'Market Analysis',
    subcategory: 'Featured',
    region: 'Africa',
    image_url: null,
    is_featured: true,
    is_published: true,
    published_at: new Date(),
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '2',
    slug: 'energy-transition-opportunities',
    title: 'Global Energy Transition Creates Investment Opportunities',
    content: 'The global shift towards renewable energy is creating significant investment opportunities...',
    author: 'Sarah Chen',
    category: 'Market Analysis',
    subcategory: 'Featured',
    region: 'Global',
    image_url: null,
    is_featured: true,
    is_published: true,
    published_at: new Date(),
    created_at: new Date(),
    updated_at: new Date()
  }
];

// Sample users Map (minimal for portfolio API)
const users = new Map();

// Demo user for testing
users.set('demo-user-1', {
  id: 'demo-user-1',
  name: 'Demo Investor',
  email: 'demo@kingstoneinvest.com',
  virtual_balance: 12500.50,  // Number!
  country: 'Kenya'
});

// Sample investments Map (minimal)
const investments = new Map();

investments.set('inv-1', {
  id: 'inv-1',
  user_id: 'demo-user-1',
  company_id: '1',
  shares: 100,
  buy_price: 18.50,
  created_at: new Date('2024-01-15')
});

investments.set('inv-2', {
  id: 'inv-2', 
  user_id: 'demo-user-1',
  company_id: '2',
  shares: 50,
  buy_price: 245.00,
  created_at: new Date('2024-02-20')
});

// Sample products data
const products = [
  {
    id: '1',
    name: 'Smart Irrigation Controller Pro',
    description: 'Advanced AI-powered irrigation controller',
    price: 2499.00,
    category: 'Irrigation',
    image_url: null,
    specifications: null,
    in_stock: true,
    stock_quantity: 50,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '2',
    name: 'IoT Weather Station',
    description: 'Professional-grade weather monitoring',
    price: 1899.00,
    category: 'Sensors',
    image_url: null,
    specifications: null,
    in_stock: true,
    stock_quantity: 35,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '3',
    name: 'Smart Valve System',
    description: 'Automated valve control system',
    price: 1299.00,
    category: 'Irrigation',
    image_url: null,
    specifications: null,
    in_stock: true,
    stock_quantity: 45,
    created_at: new Date(),
    updated_at: new Date()
  },
  {
    id: '4',
    name: 'AI Analytics Dashboard',
    description: 'Cloud-based analytics platform',
    price: 999.00,
    category: 'Software',
    image_url: null,
    specifications: null,
    in_stock: true,
    stock_quantity: 100,
    created_at: new Date(),
    updated_at: new Date()
  }
];

module.exports = {
  companies,
  sectors,
  regions,
  marketInsights,
  products
};