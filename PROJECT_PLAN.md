# Let Investments - Project Plan

## Project Overview
- **Project Name**: Let Investments Website
- **Type**: Full-stack Web Application
- **Core Functionality**: Professional investment company website with client dashboard, project tracking, quotation system, and investor portal
- **Target Users**: Potential clients, existing clients, investors, partners

## Technology Stack
- **Frontend**: Next.js 14 (Pages Router), React 18, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database/Auth**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Vercel (frontend), Render (backend)

## Design Specifications

### Color Palette
- Deep Blue: `#0D3B66`
- Dark Green: `#117A65`
- Light Grey: `#F0F1F6`
- White: `#FFFFFF`
- Accent: `#1E5F8A` (lighter blue for hover states)

### Typography
- Headings: Montserrat Bold
- Body: Open Sans
- Font sizes following Tailwind defaults

## Page Structure

### 1. Homepage (`/`)
- Hero section with company introduction
- Services overview
- Featured projects
- AI & Innovation highlight
- CTA sections
- Trust indicators

### 2. About Us (`/about`)
- Company history
- Mission & Vision
- Team section
- Values

### 3. Services (`/services`)
- Service cards grid
- Detailed service descriptions
- CTA to quotation system

### 4. Projects / Portfolio (`/projects`)
- Project gallery
- Filter by category
- Project detail modals/pages

### 5. AI & Innovation (`/ai-innovation`)
- AI technology showcase
- Innovation highlights
- Smart solutions

### 6. Blog / Insights (`/blog`)
- Blog post listings
- Featured articles
- Category filters

### 7. Client Dashboard (`/dashboard`)
- Project status overview
- Active tasks
- Invoices section
- Document access

### 8. Smart Irrigation Products (`/products`)
- Product catalog
- Product details
- Ordering system integration

### 9. Project Tracking Portal (`/tracking`)
- Visual progress charts
- Milestones timeline
- Status updates

### 10. Online Quotation System (`/quote`)
- Service selection
- Project information form
- Auto-estimate calculation
- Form submission

### 11. Investor Page (`/investors`)
- Company information
- Growth potential
- Financial highlights
- Inquiry form

### 12. Contact (`/contact`)
- Contact form
- Company information
- Map integration
- Office details

## Components to Create

### Reusable Components
1. **Navbar** - Responsive navigation with mobile menu
2. **Footer** - Company info, links, social media
3. **HeroSection** - Reusable hero with title, subtitle, CTA
4. **ServiceCard** - Service display card
5. **ProjectCard** - Project showcase card
6. **AIHighlight** - AI/tech feature highlight
7. **CTAButton** - Call-to-action button component
8. **Layout** - Main layout wrapper
9. **SEOHead** - Meta tags and OG tags

### Dashboard Components
1. **DashboardStats** - Overview statistics
2. **ProjectStatus** - Project status cards
3. **InvoiceList** - Invoice table/list
4. **ProgressChart** - Visual progress indicator

### Form Components
1. **QuoteForm** - Multi-step quote form
2. **ContactForm** - Contact form
3. **InvestorForm** - Investor inquiry form

## Backend API Endpoints

### `/api/auth`
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/user` - Get current user

### `/api/projects`
- `GET /api/projects` - List all projects
- `GET /api/projects/:id` - Get project details
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project

### `/api/dashboard`
- `GET /api/dashboard/stats` - Dashboard statistics
- `GET /api/dashboard/projects` - Client projects
- `GET /api/dashboard/invoices` - Client invoices
- `GET /api/dashboard/tasks` - Client tasks

### `/api/quotes`
- `POST /api/quotes` - Submit quote request
- `GET /api/quotes` - List quotes (admin)
- `GET /api/quotes/:id` - Get quote details
- `PUT /api/quotes/:id/status` - Update quote status

### `/api/products`
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product details
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)

### `/api/investors`
- `POST /api/investors` - Submit investor inquiry
- `GET /api/investors` - List inquiries (admin)

## Database Schema (Supabase)

### Tables

1. **users**
   - id (uuid, PK)
   - email (varchar)
   - name (varchar)
   - role (varchar)
   - created_at (timestamp)

2. **projects**
   - id (uuid, PK)
   - title (varchar)
   - description (text)
   - category (varchar)
   - status (varchar)
   - client_id (uuid, FK)
   - progress (int)
   - images (jsonb)
   - created_at (timestamp)

3. **quotes**
   - id (uuid, PK)
   - user_id (uuid, FK)
   - services (jsonb)
   - project_info (jsonb)
   - estimated_cost (decimal)
   - status (varchar)
   - created_at (timestamp)

4. **products**
   - id (uuid, PK)
   - name (varchar)
   - description (text)
   - price (decimal)
   - category (varchar)
   - image_url (varchar)
   - specifications (jsonb)
   - created_at (timestamp)

5. **blog_posts**
   - id (uuid, PK)
   - title (varchar)
   - content (text)
   - author (varchar)
   - category (varchar)
   - image_url (varchar)
   - published_at (timestamp)
   - created_at (timestamp)

6. **investors**
   - id (uuid, PK)
   - name (varchar)
   - email (varchar)
   - company (varchar)
   - investment_interest (varchar)
   - message (text)
   - created_at (timestamp)

## Implementation Steps

### Phase 1: Project Setup
1. Initialize Next.js project with Tailwind CSS
2. Set up Express.js backend
3. Configure Supabase client
4. Set up project structure

### Phase 2: Frontend Core
1. Create Tailwind configuration with custom colors
2. Build reusable components (Navbar, Footer, etc.)
3. Create layout and page templates
4. Implement all 12 pages with placeholder content

### Phase 3: Backend API
1. Set up Express.js routes
2. Implement Supabase integration
3. Create all API endpoints
4. Add error handling and validation

### Phase 4: Advanced Features
1. Client Dashboard functionality
2. Project Tracking Portal
3. Online Quotation System
4. Investor inquiry system

### Phase 5: SEO & Performance
1. Add meta tags and OG tags
2. Optimize images
3. Add loading states
4. Test responsive design

### Phase 6: Deployment Preparation
1. Environment configuration
2. Build optimization
3. Documentation
4. Deployment scripts

## File Structure

```
/LetInvestments/
├── frontend/                 # Next.js frontend
│   ├── components/          # React components
│   │   ├── common/          # Reusable components
│   │   ├── dashboard/       # Dashboard components
│   │   └── forms/           # Form components
│   ├── pages/               # Next.js pages
│   │   ├── api/             # API routes
│   │   ├── about.js
│   │   ├── services.js
│   │   ├── projects.js
│   │   ├── ai-innovation.js
│   │   ├── blog.js
│   │   ├── dashboard.js
│   │   ├── products.js
│   │   ├── tracking.js
│   │   ├── quote.js
│   │   ├── investors.js
│   │   ├── contact.js
│   │   └── index.js
│   ├── styles/              # CSS files
│   ├── lib/                 # Utilities
│   │   └── supabase.js      # Supabase client
│   ├── public/              # Static assets
│   ├── tailwind.config.js   # Tailwind config
│   ├── next.config.js       # Next.js config
│   └── package.json
│
├── backend/                  # Express.js backend
│   ├── routes/              # API routes
│   │   ├── auth.js
│   │   ├── projects.js
│   │   ├── dashboard.js
│   │   ├── quotes.js
│   │   ├── products.js
│   │   └── investors.js
│   ├── middleware/          # Express middleware
│   ├── config/              # Configuration
│   ├── index.js             # Entry point
│   └── package.json
│
├── supabase/                 # Supabase configuration
│   ├── schema.sql           # Database schema
│   └── migrations/
│
├── .env.example             # Environment variables template
├── README.md                # Project documentation
└── package.json             # Root package.json
```

## Acceptance Criteria

### Visual Checkpoints
- [ ] Color scheme matches specification (Deep Blue, Dark Green, Light Grey, White)
- [ ] Typography uses Montserrat for headings, Open Sans for body
- [ ] All pages are responsive (mobile, tablet, desktop)
- [ ] Navigation is consistent across all pages
- [ ] CTA buttons are prominent and consistent

### Functionality Checkpoints
- [ ] All 12 pages are created and accessible
- [ ] Navigation works between all pages
- [ ] Forms submit correctly (console log for demo)
- [ ] Dashboard displays mock data
- [ ] Project tracking shows progress visualization
- [ ] Product catalog displays products
- [ ] Quote system calculates estimates

### Technical Checkpoints
- [ ] Next.js project builds without errors
- [ ] Express.js server starts correctly
- [ ] Tailwind CSS compiles properly
- [ ] Supabase client is configured
- [ ] API endpoints are defined
- [ ] SEO meta tags are present

### Performance Checkpoints
- [ ] Pages load without critical errors
- [ ] Images are optimized
- [ ] Responsive design works on all breakpoints
- [ ] No console errors on page load


