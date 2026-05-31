/**
 * Let Investments - PostgreSQL Database Schema
 * Database: let
 * 
 * This schema creates all necessary tables for the investment platform.
 * Run this script to create the database structure.
 * 
 * Usage:
 * 1. Create database: CREATE DATABASE let;
 * 2. Connect to let database: \c let
 * 3. Run this script: \i POSTGRESQL_SCHEMA.sql
 * 
 * ============================================================================
 */

-- Check if we're connected to the right database
-- \c let

-- ============================================================================
-- 1. ENUMS (Custom Data Types)
-- ============================================================================

-- Drop existing types if they exist (for re-runs)
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS transaction_type CASCADE;
DROP TYPE IF EXISTS transaction_status CASCADE;
DROP TYPE IF EXISTS wallet_status CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS notification_priority CASCADE;
DROP TYPE IF EXISTS audit_action CASCADE;

-- User roles
CREATE TYPE user_role AS ENUM ('admin', 'client', 'manager', 'analyst');

-- Transaction types
CREATE TYPE transaction_type AS ENUM ('DEPOSIT', 'WITHDRAW', 'BUY', 'SELL', 'TRANSFER', 'FEE', 'REFUND');

-- Transaction status
CREATE TYPE transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');

-- Wallet status
CREATE TYPE wallet_status AS ENUM ('active', 'suspended', 'closed', 'frozen');

-- Order status
CREATE TYPE order_status AS ENUM ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded');

-- Notification types
CREATE TYPE notification_type AS ENUM ('transaction', 'investment', 'price_alert', 'news', 'system', 'security');

-- Notification priority
CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Audit actions
CREATE TYPE audit_action AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'BUY', 'SELL');

-- ============================================================================
-- 2. ROLES TABLE
-- ============================================================================

DROP TABLE IF EXISTS roles CASCADE;

CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name user_role NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB DEFAULT '{}'::jsonb,
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for role lookups
CREATE INDEX idx_roles_name ON roles(name);

-- ============================================================================
-- 3. USERS TABLE
-- ============================================================================

DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    phone VARCHAR(50),
    company VARCHAR(255),
    country VARCHAR(100),
    avatar_url VARCHAR(500),
    virtual_balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    password_changed_at TIMESTAMPTZ,
    mfa_enabled BOOLEAN DEFAULT FALSE,
    mfa_secret VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for frequently queried columns
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_is_active ON users(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_users_created_at ON users(created_at);

-- ============================================================================
-- 4. SECTORS TABLE (Reference Data)
-- ============================================================================

DROP TABLE IF EXISTS sectors CASCADE;

CREATE TABLE sectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    icon VARCHAR(100),
    color VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sectors_active ON sectors(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_sectors_sort_order ON sectors(sort_order);

-- ============================================================================
-- 5. REGIONS TABLE (Reference Data)
-- ============================================================================

DROP TABLE IF EXISTS regions CASCADE;

CREATE TABLE regions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    code VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_regions_active ON regions(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- 6. COMPANIES TABLE
-- ============================================================================

DROP TABLE IF EXISTS companies CASCADE;

CREATE TABLE companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    symbol VARCHAR(20) NOT NULL UNIQUE,
    sector_id UUID REFERENCES sectors(id) ON DELETE SET NULL,
    region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
    country VARCHAR(100),
    description TEXT,
    logo_url VARCHAR(500),
    website VARCHAR(500),
    
    -- Stock information
    current_price DECIMAL(15, 4) NOT NULL DEFAULT 0.00,
    previous_price DECIMAL(15, 4),
    open_price DECIMAL(15, 4),
    high_price DECIMAL(15, 4),
    low_price DECIMAL(15, 4),
    volume BIGINT DEFAULT 0,
    
    -- Financial metrics
    market_cap BIGINT,
    pe_ratio DECIMAL(10, 2),
    dividend_yield DECIMAL(8, 4),
    eps DECIMAL(10, 4),
    beta DECIMAL(8, 4),
    fifty_two_week_high DECIMAL(15, 4),
    fifty_two_week_low DECIMAL(15, 4),
    
    -- Additional info
    employees INTEGER,
    founded_year INTEGER,
    ceo VARCHAR(255),
    headquarters VARCHAR(255),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for company queries
CREATE INDEX idx_companies_symbol ON companies(symbol);
CREATE INDEX idx_companies_sector_id ON companies(sector_id);
CREATE INDEX idx_companies_region_id ON companies(region_id);
CREATE INDEX idx_companies_country ON companies(country);
CREATE INDEX idx_companies_is_active ON companies(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_companies_is_featured ON companies(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_companies_current_price ON companies(current_price);
CREATE INDEX idx_companies_search ON companies USING gin(to_tsvector('english', name || ' ' || symbol || ' ' || COALESCE(description, '')));

-- ============================================================================
-- 7. INVESTMENTS TABLE
-- ============================================================================

DROP TABLE IF EXISTS investments CASCADE;

CREATE TABLE investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    -- Investment details
    shares NUMERIC(18, 8) NOT NULL DEFAULT 0,
    buy_price DECIMAL(15, 4) NOT NULL,
    average_cost DECIMAL(15, 4),
    investment_amount DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    
    -- Current values (computed/cached)
    current_price DECIMAL(15, 4),
    current_value DECIMAL(15, 2),
    profit_loss DECIMAL(15, 2),
    profit_loss_percent DECIMAL(10, 4),
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    first_purchased_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_purchased_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id, company_id)
);

CREATE INDEX idx_investments_user_id ON investments(user_id);
CREATE INDEX idx_investments_company_id ON investments(company_id);
CREATE INDEX idx_investments_is_active ON investments(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_investments_user_company ON investments(user_id, company_id);

-- ============================================================================
-- 8. WALLETS TABLE
-- ============================================================================

DROP TABLE IF EXISTS wallets CASCADE;

CREATE TABLE wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    
    balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    pending_balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    locked_balance DECIMAL(15, 2) NOT NULL DEFAULT 0.00,
    
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status wallet_status NOT NULL DEFAULT 'active',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallets_status ON wallets(status);

-- ============================================================================
-- 9. TRANSACTIONS TABLE
-- ============================================================================

DROP TABLE IF EXISTS transactions CASCADE;

CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    type transaction_type NOT NULL,
    amount DECIMAL(15, 2) NOT NULL,
    fee DECIMAL(15, 2) DEFAULT 0.00,
    net_amount DECIMAL(15, 2) NOT NULL,
    
    reference VARCHAR(100) UNIQUE,
    provider VARCHAR(50),
    provider_reference VARCHAR(200),
    
    status transaction_status NOT NULL DEFAULT 'pending',
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    
    -- For BUY/SELL transactions
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    shares NUMERIC(18, 8),
    price_per_share DECIMAL(15, 4),
    
    processed_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_wallet_id ON transactions(wallet_id);
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_reference ON transactions(reference);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_company_id ON transactions(company_id);
CREATE INDEX idx_transactions_user_created ON transactions(user_id, created_at DESC);

-- ============================================================================
-- 10. MARKET INSIGHTS TABLE
-- ============================================================================

DROP TABLE IF EXISTS market_insights CASCADE;

CREATE TABLE market_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(255) NOT NULL UNIQUE,
    title VARCHAR(500) NOT NULL,
    content TEXT NOT NULL,
    summary TEXT,
    author VARCHAR(255),
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    category VARCHAR(100),
    subcategory VARCHAR(100),
    region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
    tags TEXT[],
    
    image_url VARCHAR(500),
    video_url VARCHAR(500),
    
    is_featured BOOLEAN DEFAULT FALSE,
    is_published BOOLEAN DEFAULT FALSE,
    is_premium BOOLEAN DEFAULT FALSE,
    
    views INTEGER DEFAULT 0,
    likes INTEGER DEFAULT 0,
    shares INTEGER DEFAULT 0,
    
    meta_title VARCHAR(200),
    meta_description VARCHAR(500),
    
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_market_insights_slug ON market_insights(slug);
CREATE INDEX idx_market_insights_category ON market_insights(category);
CREATE INDEX idx_market_insights_region_id ON market_insights(region_id);
CREATE INDEX idx_market_insights_is_published ON market_insights(is_published) WHERE is_published = TRUE;
CREATE INDEX idx_market_insights_is_featured ON market_insights(is_featured) WHERE is_featured = TRUE;
CREATE INDEX idx_market_insights_published_at ON market_insights(published_at DESC);
CREATE INDEX idx_market_insights_tags ON market_insights USING gin(tags);

-- ============================================================================
-- 11. PRODUCTS TABLE
-- ============================================================================

DROP TABLE IF EXISTS products CASCADE;

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100) UNIQUE,
    description TEXT,
    
    price DECIMAL(15, 2) NOT NULL,
    compare_at_price DECIMAL(15, 2),
    cost_per_item DECIMAL(15, 2),
    
    category VARCHAR(100),
    subcategory VARCHAR(100),
    
    images TEXT[],
    thumbnail_url VARCHAR(500),
    
    specifications JSONB DEFAULT '{}'::jsonb,
    weight DECIMAL(10, 2),
    dimensions JSONB,
    
    inventory_quantity INTEGER DEFAULT 0,
    inventory_alert_threshold INTEGER DEFAULT 10,
    in_stock BOOLEAN GENERATED ALWAYS AS (inventory_quantity > 0) STORED,
    allow_backorder BOOLEAN DEFAULT FALSE,
    
    is_active BOOLEAN DEFAULT TRUE,
    is_featured BOOLEAN DEFAULT FALSE,
    
    meta_title VARCHAR(200),
    meta_description VARCHAR(500),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_is_active ON products(is_active) WHERE is_active = TRUE;
CREATE INDEX idx_products_is_featured ON products(is_featured) WHERE is_featured = TRUE;

-- ============================================================================
-- 12. PRODUCT ORDERS TABLE
-- ============================================================================

DROP TABLE IF EXISTS product_orders CASCADE;

CREATE TABLE product_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_number VARCHAR(50) NOT NULL UNIQUE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    subtotal DECIMAL(15, 2) NOT NULL,
    tax_amount DECIMAL(15, 2) DEFAULT 0.00,
    shipping_amount DECIMAL(15, 2) DEFAULT 0.00,
    discount_amount DECIMAL(15, 2) DEFAULT 0.00,
    total DECIMAL(15, 2) NOT NULL,
    
    currency VARCHAR(3) DEFAULT 'USD',
    status order_status NOT NULL DEFAULT 'pending',
    
    shipping_name VARCHAR(255),
    shipping_address TEXT,
    shipping_city VARCHAR(100),
    shipping_state VARCHAR(100),
    shipping_postal_code VARCHAR(20),
    shipping_country VARCHAR(100),
    shipping_phone VARCHAR(50),
    
    payment_method VARCHAR(50),
    payment_reference VARCHAR(200),
    paid_at TIMESTAMPTZ,
    
    tracking_number VARCHAR(100),
    shipped_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    
    customer_notes TEXT,
    internal_notes TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_orders_order_number ON product_orders(order_number);
CREATE INDEX idx_product_orders_user_id ON product_orders(user_id);
CREATE INDEX idx_product_orders_status ON product_orders(status);
CREATE INDEX idx_product_orders_created_at ON product_orders(created_at DESC);

-- ============================================================================
-- 13. PRODUCT ORDER ITEMS TABLE
-- ============================================================================

DROP TABLE IF EXISTS product_order_items CASCADE;

CREATE TABLE product_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES product_orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE SET NULL,
    
    name VARCHAR(255) NOT NULL,
    sku VARCHAR(100),
    quantity INTEGER NOT NULL DEFAULT 1,
    price DECIMAL(15, 2) NOT NULL,
    total DECIMAL(15, 2) NOT NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_product_order_items_order_id ON product_order_items(order_id);
CREATE INDEX idx_product_order_items_product_id ON product_order_items(product_id);

-- ============================================================================
-- 14. WATCHLIST TABLE
-- ============================================================================

DROP TABLE IF EXISTS watchlist CASCADE;

CREATE TABLE watchlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    target_price DECIMAL(15, 4),
    price_alert_enabled BOOLEAN DEFAULT FALSE,
    note TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id, company_id)
);

CREATE INDEX idx_watchlist_user_id ON watchlist(user_id);
CREATE INDEX idx_watchlist_company_id ON watchlist(company_id);

-- ============================================================================
-- 15. NOTIFICATIONS TABLE
-- ============================================================================

DROP TABLE IF EXISTS notifications CASCADE;

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    type notification_type NOT NULL,
    priority notification_priority DEFAULT 'medium',
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    entity_type VARCHAR(50),
    entity_id UUID,
    
    action_url VARCHAR(500),
    
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    
    is_email_sent BOOLEAN DEFAULT FALSE,
    is_push_sent BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read) WHERE is_read = FALSE;
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- ============================================================================
-- 16. AUDIT LOGS TABLE
-- ============================================================================

DROP TABLE IF EXISTS audit_logs CASCADE;

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action audit_action NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    
    old_values JSONB,
    new_values JSONB,
    
    ip_address INET,
    user_agent TEXT,
    session_id VARCHAR(100),
    
    description TEXT,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ============================================================================
-- 17. STOCK PRICE HISTORY TABLE
-- ============================================================================

DROP TABLE IF EXISTS stock_price_history CASCADE;

CREATE TABLE stock_price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    date DATE NOT NULL,
    open_price DECIMAL(15, 4),
    high_price DECIMAL(15, 4),
    low_price DECIMAL(15, 4),
    close_price DECIMAL(15, 4),
    adjusted_close DECIMAL(15, 4),
    volume BIGINT DEFAULT 0,
    
    price_change DECIMAL(15, 4),
    price_change_percent DECIMAL(10, 4),
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(company_id, date)
);

CREATE INDEX idx_stock_price_history_company ON stock_price_history(company_id);
CREATE INDEX idx_stock_price_history_date ON stock_price_history(date DESC);
CREATE INDEX idx_stock_price_history_company_date ON stock_price_history(company_id, date DESC);

-- ============================================================================
-- 18. PRICE ALERTS TABLE
-- ============================================================================

DROP TABLE IF EXISTS price_alerts CASCADE;

CREATE TABLE price_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    
    alert_type VARCHAR(20) NOT NULL,
    target_price DECIMAL(15, 4),
    percent_change DECIMAL(10, 2),
    
    is_active BOOLEAN DEFAULT TRUE,
    is_triggered BOOLEAN DEFAULT FALSE,
    triggered_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(user_id, company_id, alert_type, target_price)
);

CREATE INDEX idx_price_alerts_user_id ON price_alerts(user_id);
CREATE INDEX idx_price_alerts_company_id ON price_alerts(company_id);
CREATE INDEX idx_price_alerts_active ON price_alerts(is_active) WHERE is_active = TRUE;

-- ============================================================================
-- 19. SESSIONS TABLE
-- ============================================================================

DROP TABLE IF EXISTS sessions CASCADE;

CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    token_hash VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    
    is_active BOOLEAN DEFAULT TRUE,
    
    expires_at TIMESTAMPTZ NOT NULL,
    last_used_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token_hash ON sessions(token_hash);
CREATE INDEX idx_sessions_expires_at ON sessions(expires_at);

-- ============================================================================
-- TRIGGER FUNCTIONS
-- ============================================================================

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to all tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_sectors_updated_at BEFORE UPDATE ON sectors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_regions_updated_at BEFORE UPDATE ON regions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_companies_updated_at BEFORE UPDATE ON companies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON investments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_wallets_updated_at BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_market_insights_updated_at BEFORE UPDATE ON market_insights FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_product_orders_updated_at BEFORE UPDATE ON product_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_watchlist_updated_at BEFORE UPDATE ON watchlist FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_price_alerts_updated_at BEFORE UPDATE ON price_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- AUDIT TRIGGER FUNCTION
-- ============================================================================

CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_values, created_at)
        VALUES (NULL, 'CREATE'::audit_action, TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, new_values, created_at)
        VALUES (NULL, 'UPDATE'::audit_action, TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (user_id, action, entity_type, entity_id, old_values, created_at)
        VALUES (NULL, 'DELETE'::audit_action, TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Apply audit triggers to sensitive tables
CREATE TRIGGER audit_investments AFTER INSERT OR UPDATE OR DELETE ON investments FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER audit_transactions AFTER INSERT OR UPDATE OR DELETE ON transactions FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
CREATE TRIGGER audit_wallets AFTER INSERT OR UPDATE OR DELETE ON wallets FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- ============================================================================
-- ANALYTICS VIEWS
-- ============================================================================

-- Portfolio Summary View
CREATE OR REPLACE VIEW user_portfolio_summary AS
SELECT 
    u.id as user_id,
    u.email,
    u.name,
    COUNT(DISTINCT i.id) as total_investments,
    COALESCE(SUM(i.current_value), 0) as total_portfolio_value,
    COALESCE(SUM(i.profit_loss), 0) as total_profit_loss,
    COUNT(DISTINCT w.id) as wallet_count,
    COALESCE(w.balance, 0) as wallet_balance
FROM users u
LEFT JOIN investments i ON u.id = i.user_id AND i.is_active = TRUE
LEFT JOIN wallets w ON u.id = w.user_id
GROUP BY u.id, u.email, u.name, w.balance;

-- Company Market Data View
CREATE OR REPLACE VIEW company_market_data AS
SELECT 
    c.*,
    s.name as sector_name,
    r.name as region_name,
    (SELECT COUNT(*) FROM investments i WHERE i.company_id = c.id AND i.is_active = TRUE) as investor_count,
    (SELECT SUM(shares) FROM investments i WHERE i.company_id = c.id AND i.is_active = TRUE) as total_shares_held
FROM companies c
LEFT JOIN sectors s ON c.sector_id = s.id
LEFT JOIN regions r ON c.region_id = r.id;

-- Recent Transactions View
CREATE OR REPLACE VIEW recent_transactions AS
SELECT 
    t.*,
    u.email,
    u.name as user_name,
    c.symbol as company_symbol,
    c.name as company_name
FROM transactions t
LEFT JOIN users u ON t.user_id = u.id
LEFT JOIN companies c ON t.company_id = c.id
ORDER BY t.created_at DESC
LIMIT 100;

-- Portfolio Analytics View
CREATE OR REPLACE VIEW portfolio_analytics AS
SELECT 
    u.id as user_id,
    u.email,
    u.name,
    COUNT(DISTINCT i.id) as total_positions,
    SUM(i.investment_amount) as total_invested,
    SUM(i.current_value) as total_current_value,
    SUM(i.profit_loss) as total_profit_loss,
    CASE 
        WHEN SUM(i.investment_amount) > 0 
        THEN (SUM(i.profit_loss) / SUM(i.investment_amount)) * 100 
        ELSE 0 
    END as total_return_percent,
    SUM(i.current_value) + w.balance as total_assets,
    w.balance as cash_balance
FROM users u
LEFT JOIN investments i ON u.id = i.user_id AND i.is_active = TRUE
LEFT JOIN wallets w ON u.id = w.user_id
GROUP BY u.id, u.email, u.name, w.balance;

-- Sector Allocation View
CREATE OR REPLACE VIEW sector_allocation AS
SELECT 
    u.id as user_id,
    s.name as sector_name,
    s.id as sector_id,
    SUM(i.current_value) as total_value,
    COUNT(DISTINCT i.id) as positions,
    (SUM(i.current_value) / NULLIF(
        (SELECT SUM(current_value) FROM investments WHERE user_id = u.id AND is_active = TRUE),
        0
    ) * 100) as allocation_percent
FROM users u
JOIN investments i ON u.id = i.user_id AND i.is_active = TRUE
JOIN companies c ON i.company_id = c.id
JOIN sectors s ON c.sector_id = s.id
GROUP BY u.id, s.id, s.name;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE users IS 'Main user table storing investor and admin accounts';
COMMENT ON TABLE companies IS 'Stock/company information with financial metrics';
COMMENT ON TABLE investments IS 'User investment holdings in companies';
COMMENT ON TABLE wallets IS 'User wallet with balance tracking';
COMMENT ON TABLE transactions IS 'Financial transactions (deposits, withdrawals, trades)';
COMMENT ON TABLE market_insights IS 'News and market analysis articles';
COMMENT ON TABLE products IS 'Engineering products for sale';
COMMENT ON TABLE watchlist IS 'Users favorite companies tracking';
COMMENT ON TABLE notifications IS 'User notifications and alerts';
COMMENT ON TABLE audit_logs IS 'Audit trail for sensitive operations';

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

SELECT 'Database schema created successfully!' as status;
SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = 'public';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================


