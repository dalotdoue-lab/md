/**
 * Let Investments - SQL Seed Scripts
 * Database: let
 * 
 * This file populates the database with initial reference and sample data.
 * Run after POSTGRESQL_SCHEMA.sql
 * 
 * ============================================================================
 */

-- ============================================================================
-- 1. ROLES
-- ============================================================================

INSERT INTO roles (name, description, permissions, is_system) VALUES
('admin', 'Administrator with full access', 
 '{"users": ["read", "write", "delete"], "investments": ["read", "write", "delete"], "transactions": ["read", "write", "delete"], "companies": ["read", "write", "delete"], "settings": ["read", "write"]}'::jsonb, 
 TRUE),
('manager', 'Manager with elevated permissions', 
 '{"users": ["read"], "investments": ["read", "write"], "transactions": ["read", "write"], "companies": ["read", "write"], "reports": ["read"]}'::jsonb, 
 TRUE),
('analyst', 'Analyst with read and analysis permissions', 
 '{"companies": ["read"], "investments": ["read"], "transactions": ["read"], "reports": ["read", "write"], "insights": ["read", "write"]}'::jsonb, 
 TRUE),
('client', 'Standard client/investor account', 
 '{"portfolio": ["read", "write"], "wallet": ["read", "write"], "watchlist": ["read", "write"], "transactions": ["read"]}'::jsonb, 
 TRUE)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 2. SECTORS
-- ============================================================================

INSERT INTO sectors (name, description, icon, color, sort_order) VALUES
('Telecommunications', 'Telecommunications and mobile network providers', 'wifi', '#0D3B66', 1),
('Banking', 'Commercial and investment banking services', 'building', '#117A65', 2),
('Utilities', 'Electricity, water, and energy distribution', 'bolt', '#F39C12', 3),
('Consumer Goods', 'Retail, food, beverage, and consumer products', 'shopping-cart', '#E74C3C', 4),
('Manufacturing', 'Industrial manufacturing and production', 'cogs', '#9B59B6', 5),
('Mining', 'Mining and extraction of natural resources', 'diamond', '#34495E', 6),
('Infrastructure', 'Construction and infrastructure development', 'road', '#1ABC9C', 7),
('Energy', 'Oil, gas, and renewable energy', 'fire', '#E67E22', 8),
('Technology', 'Software, hardware, and IT services', 'laptop', '#3498DB', 9),
('Healthcare', 'Healthcare, pharmaceuticals, and medical services', 'heartbeat', '#2ECC71', 10),
('Real Estate', 'Real estate investment and property management', 'home', '#8E44AD', 11),
('Financial Services', 'Insurance, investment, and financial advisory', 'chart-line', '#16A085', 12)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 3. REGIONS
-- ============================================================================

INSERT INTO regions (name, description, code, sort_order) VALUES
('East Africa', 'Kenya, Tanzania, Uganda, Rwanda, Ethiopia, South Sudan', 'EA', 1),
('West Africa', 'Nigeria, Ghana, Ivory Coast, Senegal, Cameroon', 'WA', 2),
('South Africa', 'South Africa, Botswana, Namibia, Zimbabwe, Mozambique', 'SA', 3),
('North Africa', 'Egypt, Morocco, Algeria, Tunisia, Libya', 'NA', 4),
('Central Africa', 'DRC, Congo, Gabon, Equatorial Guinea', 'CA', 5),
('Global Markets', 'United States, United Kingdom, Japan, Germany, China', 'GLOBAL', 6),
('Middle East', 'UAE, Saudi Arabia, Qatar, Israel', 'MEA', 7),
('Europe', 'UK, Germany, France, Netherlands, Switzerland', 'EU', 8),
('Asia Pacific', 'China, Japan, India, Australia, Singapore', 'APAC', 9)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- 4. USERS (with hashed passwords)
-- ============================================================================

-- Password for all demo users: "Demo@123"
-- Hash: $2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYXqK7u/W2

INSERT INTO users (id, email, password_hash, name, role_id, phone, company, country, virtual_balance, is_active) VALUES
(
    gen_random_uuid(),
    'admin@letinvestments.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYXqK7u/W2',
    'Admin User',
    (SELECT id FROM roles WHERE name = 'admin'),
    '+254 700 123 456',
    'Let Investments',
    'Kenya',
    100000.00,
    TRUE
),
(
    gen_random_uuid(),
    'demo@letinvestments.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYXqK7u/W2',
    'Demo Investor',
    (SELECT id FROM roles WHERE name = 'client'),
    '+254 700 234 567',
    'Demo Investments Ltd',
    'Kenya',
    50000.00,
    TRUE
),
(
    gen_random_uuid(),
    'john.investor@email.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYXqK7u/W2',
    'John Mwangi',
    (SELECT id FROM roles WHERE name = 'client'),
    '+254 711 234 567',
    'Individual',
    'Kenya',
    25000.00,
    TRUE
),
(
    gen_random_uuid(),
    'sarah.tech@email.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYXqK7u/W2',
    'Sarah Chen',
    (SELECT id FROM roles WHERE name = 'client'),
    '+1 555 123 4567',
    'Tech Ventures Inc',
    'United States',
    75000.00,
    TRUE
),
(
    gen_random_uuid(),
    'manager@letinvestments.com',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYXqK7u/W2',
    'James Ochieng',
    (SELECT id FROM roles WHERE name = 'manager'),
    '+254 700 345 678',
    'Let Investments',
    'Kenya',
    100000.00,
    TRUE
)
ON CONFLICT (email) DO NOTHING;

-- ============================================================================
-- 5. WALLETS
-- ============================================================================

INSERT INTO wallets (user_id, balance, pending_balance, currency, status)
SELECT 
    id,
    virtual_balance,
    0.00,
    'USD',
    'active'
FROM users
ON CONFLICT (user_id) DO NOTHING;

-- ============================================================================
-- 6. COMPANIES
-- ============================================================================

INSERT INTO companies (name, symbol, sector_id, region_id, country, description, current_price, market_cap, pe_ratio, dividend_yield, is_active, is_featured) VALUES
-- East Africa
(
    'Safaricom', 'SCOM', 
    (SELECT id FROM sectors WHERE name = 'Telecommunications'),
    (SELECT id FROM regions WHERE name = 'East Africa'),
    'Kenya',
    'Leading telecom operator in Kenya and pioneer of M-Pesa mobile money service',
    18.50, 15000000000, 12.5, 5.2, TRUE, TRUE
),
(
    'Kenya Power', 'KPLC',
    (SELECT id FROM sectors WHERE name = 'Utilities'),
    (SELECT id FROM regions WHERE name = 'East Africa'),
    'Kenya',
    'Electricity distribution company serving Kenya',
    2.15, 2500000000, 8.2, 3.8, TRUE, FALSE
),
(
    'Equity Group', 'EQTY',
    (SELECT id FROM sectors WHERE name = 'Banking'),
    (SELECT id FROM regions WHERE name = 'East Africa'),
    'Kenya',
    'Largest banking group in East Africa by assets',
    45.00, 12000000000, 10.2, 4.5, TRUE, TRUE
),
-- West Africa
(
    'MTN Nigeria', 'MTNN',
    (SELECT id FROM sectors WHERE name = 'Telecommunications'),
    (SELECT id FROM regions WHERE name = 'West Africa'),
    'Nigeria',
    'Largest telecom operator in Nigeria',
    245.00, 18000000000, 10.5, 5.8, TRUE, TRUE
),
(
    'Guaranty Trust Bank', 'GUARANTY',
    (SELECT id FROM sectors WHERE name = 'Banking'),
    (SELECT id FROM regions WHERE name = 'West Africa'),
    'Nigeria',
    'Leading Nigerian bank with pan-African presence',
    32.50, 14000000000, 9.8, 4.2, TRUE, FALSE
),
(
    'Ghana Commercial Bank', 'GCB',
    (SELECT id FROM sectors WHERE name = 'Banking'),
    (SELECT id FROM regions WHERE name = 'West Africa'),
    'Ghana',
    'State-owned commercial bank in Ghana',
    6.80, 1200000000, 7.5, 6.1, TRUE, FALSE
),
-- South Africa
(
    'MTN Group', 'MTN',
    (SELECT id FROM sectors WHERE name = 'Telecommunications'),
    (SELECT id FROM regions WHERE name = 'South Africa'),
    'South Africa',
    'Global telecom company operating in Africa and Middle East',
    145.00, 32000000000, 9.2, 6.5, TRUE, TRUE
),
(
    'Standard Bank', 'SBK',
    (SELECT id FROM sectors WHERE name = 'Banking'),
    (SELECT id FROM regions WHERE name = 'South Africa'),
    'South Africa',
    'Africa''s largest bank by assets',
    165.00, 45000000000, 8.9, 5.2, TRUE, TRUE
),
(
    'Sasol', 'SSL',
    (SELECT id FROM sectors WHERE name = 'Energy'),
    (SELECT id FROM regions WHERE name = 'South Africa'),
    'South Africa',
    'Integrated chemicals and energy company',
    12.50, 8500000000, 6.8, 4.1, TRUE, FALSE
),
(
    'Anglo American', 'ANGLO',
    (SELECT id FROM sectors WHERE name = 'Mining'),
    (SELECT id FROM regions WHERE name = 'South Africa'),
    'South Africa',
    'Global mining and metals company',
    42.00, 55000000000, 12.3, 2.8, TRUE, FALSE
),
-- Global Markets
(
    'Microsoft', 'MSFT',
    (SELECT id FROM sectors WHERE name = 'Technology'),
    (SELECT id FROM regions WHERE name = 'Global Markets'),
    'United States',
    'World''s largest software company',
    385.00, 2850000000000, 35.2, 0.8, TRUE, TRUE
),
(
    'Apple', 'AAPL',
    (SELECT id FROM sectors WHERE name = 'Technology'),
    (SELECT id FROM regions WHERE name = 'Global Markets'),
    'United States',
    'Leading technology company',
    175.00, 2750000000000, 28.5, 0.5, TRUE, TRUE
),
(
    'Google', 'GOOGL',
    (SELECT id FROM sectors WHERE name = 'Technology'),
    (SELECT id FROM regions WHERE name = 'Global Markets'),
    'United States',
    'Leading internet and tech company',
    142.00, 1780000000000, 25.8, 0.0, TRUE, FALSE
),
(
    'Amazon', 'AMZN',
    (SELECT id FROM sectors WHERE name = 'Consumer Goods'),
    (SELECT id FROM regions WHERE name = 'Global Markets'),
    'United States',
    'E-commerce and cloud computing giant',
    178.00, 1850000000000, 62.5, 0.0, TRUE, FALSE
),
(
    'Tesla', 'TSLA',
    (SELECT id FROM sectors WHERE name = 'Technology'),
    (SELECT id FROM regions WHERE name = 'Global Markets'),
    'United States',
    'Electric vehicles and clean energy company',
    248.00, 790000000000, 72.5, 0.0, TRUE, FALSE
)
ON CONFLICT (symbol) DO NOTHING;

-- ============================================================================
-- 7. INVESTMENTS (Sample Portfolio)
-- ============================================================================

DO $$
DECLARE
    demo_user_id UUID;
    john_user_id UUID;
    sarah_user_id UUID;
BEGIN
    SELECT id INTO demo_user_id FROM users WHERE email = 'demo@letinvestments.com';
    SELECT id INTO john_user_id FROM users WHERE email = 'john.investor@email.com';
    SELECT id INTO sarah_user_id FROM users WHERE email = 'sarah.tech@email.com';
    
    -- Demo user's investments
    INSERT INTO investments (user_id, company_id, shares, buy_price, average_cost, investment_amount, current_price, current_value, profit_loss, is_active, first_purchased_at)
    SELECT 
        demo_user_id,
        c.id,
        100,
        c.current_price * 0.95,
        c.current_price * 0.95,
        c.current_price * 0.95 * 100,
        c.current_price,
        c.current_price * 100,
        c.current_price * 100 - (c.current_price * 0.95 * 100),
        TRUE,
        NOW() - INTERVAL '30 days'
    FROM companies c
    WHERE c.symbol IN ('SCOM', 'MTNN', 'MSFT')
    ON CONFLICT (user_id, company_id) DO NOTHING;
    
    -- John Mwangi's investments
    INSERT INTO investments (user_id, company_id, shares, buy_price, average_cost, investment_amount, current_price, current_value, profit_loss, is_active, first_purchased_at)
    SELECT 
        john_user_id,
        c.id,
        50,
        c.current_price * 0.90,
        c.current_price * 0.90,
        c.current_price * 0.90 * 50,
        c.current_price,
        c.current_price * 50,
        c.current_price * 50 - (c.current_price * 0.90 * 50),
        TRUE,
        NOW() - INTERVAL '15 days'
    FROM companies c
    WHERE c.symbol IN ('EQTY', 'SBK')
    ON CONFLICT (user_id, company_id) DO NOTHING;
    
    -- Sarah Chen's investments
    INSERT INTO investments (user_id, company_id, shares, buy_price, average_cost, investment_amount, current_price, current_value, profit_loss, is_active, first_purchased_at)
    SELECT 
        sarah_user_id,
        c.id,
        200,
        c.current_price * 0.92,
        c.current_price * 0.92,
        c.current_price * 0.92 * 200,
        c.current_price,
        c.current_price * 200,
        c.current_price * 200 - (c.current_price * 0.92 * 200),
        TRUE,
        NOW() - INTERVAL '7 days'
    FROM companies c
    WHERE c.symbol IN ('AAPL', 'GOOGL', 'TSLA')
    ON CONFLICT (user_id, company_id) DO NOTHING;
END $$;

-- ============================================================================
-- 8. PRODUCTS
-- ============================================================================

INSERT INTO products (name, sku, description, price, category, inventory_quantity, is_active, is_featured, specifications) VALUES
(
    'Smart Irrigation Controller Pro', 'IRR-PRO-001',
    'Advanced AI-powered irrigation controller with weather integration',
    2499.00, 'Irrigation', 50, TRUE, TRUE,
    '{"power": "12V DC", "wifi": "2.4GHz", "zones": 16}'::jsonb
),
(
    'IoT Weather Station', 'IOT-WS-001',
    'Professional-grade weather monitoring with real-time data',
    1899.00, 'Sensors', 35, TRUE, TRUE,
    '{"sensors": ["temperature", "humidity", "wind", "rain"]}'::jsonb
),
(
    'Smart Valve System', 'IRR-VLV-001',
    'Automated valve control system with leak detection',
    1299.00, 'Irrigation', 45, TRUE, FALSE,
    '{"valves": 8, "flow_monitoring": true}'::jsonb
),
(
    'AI Analytics Dashboard', 'SW-AI-001',
    'Cloud-based analytics platform for agricultural data',
    999.00, 'Software', 100, TRUE, TRUE,
    '{"cloud": "AWS/Azure", "ai_ml": true}'::jsonb
),
(
    'Soil Moisture Sensor Array', 'IOT-SM-001',
    'Multi-point soil moisture monitoring system',
    749.00, 'Sensors', 60, TRUE, FALSE,
    '{"sensors": 10, "depths": "multiple"}'::jsonb
),
(
    'Drone Surveillance System', 'HW-DR-001',
    'Agricultural drone for crop monitoring',
    4500.00, 'Hardware', 15, TRUE, FALSE,
    '{"range": "10km", "battery": "45min"}'::jsonb
),
(
    'Smart Fertilizer Dispenser', 'IRR-FD-001',
    'Automated fertilizer injection system',
    899.00, 'Irrigation', 30, TRUE, FALSE,
    '{"tanks": 4, "dosing": "variable"}'::jsonb
),
(
    'Solar Pump Controller', 'HW-SP-001',
    'Intelligent solar pump controller with MPPT',
    1599.00, 'Hardware', 25, TRUE, FALSE,
    '{"power": "2HP", "mppt": true}'::jsonb
)
ON CONFLICT (sku) DO NOTHING;

-- ============================================================================
-- 9. MARKET INSIGHTS
-- ============================================================================

INSERT INTO market_insights (slug, title, content, summary, author, category, region_id, is_featured, is_published, published_at) VALUES
(
    'african-markets-growth-2024',
    'African Markets Show Strong Growth Potential in 2024',
    'The African continent continues to present compelling investment opportunities as economic growth accelerates across key markets...',
    'Analysis of African market growth opportunities in 2024',
    'Dr. James Mwangi',
    (SELECT id FROM regions WHERE name = 'East Africa'),
    TRUE, TRUE, NOW() - INTERVAL '2 days'
),
(
    'energy-transition-opportunities',
    'Global Energy Transition Creates Investment Opportunities',
    'The global shift towards renewable energy is creating significant investment opportunities...',
    'Investment opportunities in renewable energy and clean tech',
    'Sarah Chen',
    (SELECT id FROM regions WHERE name = 'Global Markets'),
    TRUE, TRUE, NOW() - INTERVAL '5 days'
),
(
    'telecom-sector-africa',
    'Telecommunications Sector: Africa''s Digital Highway',
    'Africa''s telecommunications sector continues to expand rapidly...',
    'Analysis of Africa''s telecommunications sector growth',
    'Michael Okonkwo',
    (SELECT id FROM regions WHERE name = 'West Africa'),
    FALSE, TRUE, NOW() - INTERVAL '10 days'
),
(
    'banking-digital-transformation',
    'Digital Transformation in African Banking',
    'African banks are undergoing rapid digital transformation...',
    'Digital banking revolution in Africa',
    'Emily Watson',
    (SELECT id FROM regions WHERE name = 'South Africa'),
    FALSE, TRUE, NOW() - INTERVAL '15 days'
),
(
    'tech-giants-emerging-markets',
    'Tech Giants Eye Emerging Markets for Growth',
    'Major technology companies are increasingly focusing on emerging markets...',
    'How global tech companies are targeting emerging markets',
    'David Kim',
    (SELECT id FROM regions WHERE name = 'Global Markets'),
    FALSE, TRUE, NOW() - INTERVAL '20 days'
)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- 10. WATCHLIST
-- ============================================================================

DO $$
DECLARE
    demo_user_id UUID;
    john_user_id UUID;
    sarah_user_id UUID;
BEGIN
    SELECT id INTO demo_user_id FROM users WHERE email = 'demo@letinvestments.com';
    SELECT id INTO john_user_id FROM users WHERE email = 'john.investor@email.com';
    SELECT id INTO sarah_user_id FROM users WHERE email = 'sarah.tech@email.com';
    
    INSERT INTO watchlist (user_id, company_id, note)
    SELECT demo_user_id, c.id, 'Top African telecom pick'
    FROM companies c WHERE c.symbol IN ('MTN', 'GUARANTY')
    ON CONFLICT (user_id, company_id) DO NOTHING;
    
    INSERT INTO watchlist (user_id, company_id, note)
    SELECT john_user_id, c.id, 'Watching for entry point'
    FROM companies c WHERE c.symbol IN ('KPLC', 'GCB', 'SSL')
    ON CONFLICT (user_id, company_id) DO NOTHING;
    
    INSERT INTO watchlist (user_id, company_id, note)
    SELECT sarah_user_id, c.id, 'Tech portfolio diversification'
    FROM companies c WHERE c.symbol IN ('AMZN', 'MSFT')
    ON CONFLICT (user_id, company_id) DO NOTHING;
END $$;

-- ============================================================================
-- 11. SAMPLE TRANSACTIONS
-- ============================================================================

DO $$
DECLARE
    demo_user_id UUID;
    john_user_id UUID;
    sarah_user_id UUID;
    demo_wallet_id UUID;
    john_wallet_id UUID;
    sarah_wallet_id UUID;
    ref_num TEXT;
BEGIN
    SELECT id, id INTO demo_user_id, demo_wallet_id FROM users WHERE email = 'demo@letinvestments.com';
    SELECT id, id INTO john_user_id, john_wallet_id FROM users WHERE email = 'john.investor@email.com';
    SELECT id, id INTO sarah_user_id, sarah_wallet_id FROM users WHERE email = 'sarah.tech@email.com';
    
    -- Demo user's deposit
    ref_num := 'DEP-' || to_char(NOW(), 'YYYYMMDD') || '-0001';
    INSERT INTO transactions (wallet_id, user_id, type, amount, fee, net_amount, reference, status, description, completed_at)
    VALUES (demo_wallet_id, demo_user_id, 'DEPOSIT', 10000.00, 0.00, 10000.00, ref_num, 'completed', 'Initial deposit for trading', NOW() - INTERVAL '45 days')
    ON CONFLICT (reference) DO NOTHING;
    
    -- John's deposit
    ref_num := 'DEP-' || to_char(NOW(), 'YYYYMMDD') || '-0002';
    INSERT INTO transactions (wallet_id, user_id, type, amount, fee, net_amount, reference, status, description, completed_at)
    VALUES (john_wallet_id, john_user_id, 'DEPOSIT', 25000.00, 0.00, 25000.00, ref_num, 'completed', 'Initial investment capital', NOW() - INTERVAL '30 days')
    ON CONFLICT (reference) DO NOTHING;
    
    -- Sarah's deposit
    ref_num := 'DEP-' || to_char(NOW(), 'YYYYMMDD') || '-0003';
    INSERT INTO transactions (wallet_id, user_id, type, amount, fee, net_amount, reference, status, description, completed_at)
    VALUES (sarah_wallet_id, sarah_user_id, 'DEPOSIT', 75000.00, 0.00, 75000.00, ref_num, 'completed', 'Tech portfolio investment', NOW() - INTERVAL '14 days')
    ON CONFLICT (reference) DO NOTHING;
END $$;

-- ============================================================================
-- 12. SAMPLE NOTIFICATIONS
-- ============================================================================

DO $$
DECLARE
    demo_user_id UUID;
BEGIN
    SELECT id INTO demo_user_id FROM users WHERE email = 'demo@letinvestments.com';
    
    INSERT INTO notifications (user_id, type, priority, title, message, is_read, created_at)
    VALUES 
        (demo_user_id, 'system', 'high', 'Welcome to Let Investments', 'Your account has been created successfully. Start exploring investment opportunities!', FALSE, NOW() - INTERVAL '30 days'),
        (demo_user_id, 'investment', 'medium', 'Portfolio Update', 'Your portfolio value has increased by 2.5% this week.', FALSE, NOW() - INTERVAL '7 days'),
        (demo_user_id, 'transaction', 'high', 'Deposit Confirmed', 'Your deposit of $10,000 has been processed successfully.', TRUE, NOW() - INTERVAL '45 days')
    ON CONFLICT DO NOTHING;
END $$;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 'Seed data inserted successfully!' as status;

-- Verify counts
SELECT 'Users: ' || COUNT(*) as count FROM users;
SELECT 'Companies: ' || COUNT(*) as count FROM companies;
SELECT 'Sectors: ' || COUNT(*) as count FROM sectors;
SELECT 'Regions: ' || COUNT(*) as count FROM regions;
SELECT 'Investments: ' || COUNT(*) as count FROM investments;
SELECT 'Products: ' || COUNT(*) as count FROM products;
SELECT 'Market Insights: ' || COUNT(*) as count FROM market_insights;
SELECT 'Watchlist: ' || COUNT(*) as count FROM watchlist;
SELECT 'Transactions: ' || COUNT(*) as count FROM transactions;
SELECT 'Notifications: ' || COUNT(*) as count FROM notifications;

-- ============================================================================
-- END OF SEED SCRIPTS
-- ============================================================================


