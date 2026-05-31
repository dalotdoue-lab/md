# Let Investments Website

A professional full-stack website for Let Investments built with Next.js, Express.js, and Supabase.

## Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Node.js, Express.js
- **Database/Auth**: Supabase (PostgreSQL, Auth, Storage)
- **Deployment**: Vercel (frontend), Render (backend)

## Features

- **12 Pages**: Homepage, About Us, Services, Projects, AI & Innovation, Blog, Dashboard, Products, Tracking, Quote, Investors, Contact
- **Client Dashboard**: Project status, tasks, invoices
- **Project Tracking Portal**: Visual progress charts, milestones
- **Online Quotation System**: Service selection, auto-estimate calculation
- **Smart Irrigation Products**: Product catalog with categories
- **Investor Relations**: Company info, inquiry form

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   
```
bash
   cd LetInvestments
   
```

2. **Set up frontend**
   
```
bash
   cd frontend
   npm install
   
```

3. **Set up backend**
   
```
bash
   cd ../backend
   npm install
   
```

4. **Configure environment variables**
   
```
bash
   # Copy the example environment file
   cp ../.env.example .env
   
   # Edit .env with your Supabase credentials
   
```

5. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the schema in `supabase/schema.sql` in the Supabase SQL editor
   - Get your URL and keys from Project Settings

### Development

1. **Start the frontend**
   
```
bash
   cd frontend
   npm run dev
   
```
   Open [http://localhost:3000](http://localhost:3000)

2. **Start the backend**
   
```
bash
   cd backend
   npm run dev
   
```
   API runs on [http://localhost:5000](http://localhost:5000)

## Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Import project in Vercel
3. Set Root Directory:
   - Use `frontend` for a normal Next.js-only Vercel project.
   - Use the repository root `.` only if the Vercel project Framework Preset is set to `Services`.
4. Add environment variables:
   - `NEXT_PUBLIC_API_URL` (your Render backend URL)
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
   - `NEXT_PUBLIC_FIREBASE_APP_ID`
   - `NEXT_PUBLIC_ADMIN_EMAILS`
5. Deploy
6. In Firebase Authentication > Settings > Authorized domains, add the exact Vercel hostname used by the deployment, for example `your-app.vercel.app`.

Only `let@admin.com` is an admin by default; other Google accounts should land in the client dashboard.

### Backend (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set environment variables:
   - `PORT`: 5000
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
4. Deploy

### Database (Supabase)

1. Create a new project at supabase.com
2. Run the SQL from `supabase/schema.sql` in the SQL editor
3. Configure Row Level Security policies as needed

## Project Structure

```
LetInvestments/
├── frontend/                 # Next.js frontend
│   ├── components/          # React components
│   │   ├── common/         # Reusable components
│   │   ├── dashboard/      # Dashboard components
│   │   └── forms/          # Form components
│   ├── pages/              # Next.js pages (12 pages)
│   ├── lib/                # Supabase client
│   ├── styles/             # Global styles
│   └── package.json
├── backend/                 # Express.js backend
│   ├── routes/             # API routes
│   ├── config/             # Configuration
│   └── package.json
├── supabase/               # Database schema
├── .env.example            # Environment template
└── README.md
```

## API Endpoints

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/projects` - List projects
- `GET /api/dashboard/stats` - Dashboard statistics
- `POST /api/quotes` - Submit quote request
- `POST /api/quotes/calculate` - Calculate estimate
- `GET - List products
 /api/products`- `POST /api/investors` - Submit investor inquiry

## Color Palette

- Deep Blue: `#0D3B66`
- Dark Green: `#117A65`
- Light Grey: `#F0F1F6`
- White: `#FFFFFF`
- Accent: `#1E5F8A`

## License

MIT

