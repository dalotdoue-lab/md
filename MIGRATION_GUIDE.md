# Kingstone Investments - Migration & Setup Guide

This guide describes how to configure and seed your newly migrated codebase in your new Chrome profile setup (using Google, GitHub, Firebase, and MongoDB).

---

## Step 1: Create Your GitHub Repository
Your local Git repository is already initialized and committed at `C:\Users\Administrator\Documents\md_migrated`. 

To push it to your new GitHub account (**dalotdoue-lab**):
1. Since Chrome is already logged into your account, simply open [GitHub New Repository](https://github.com/new).
2. Enter **`md`** as the repository name and click the green **Create repository** button.
3. In your terminal, run the following push commands:
   ```bash
   cd C:\Users\Administrator\Documents\md_migrated
   git push -u origin main
   ```
   *Note: Git Credential Manager will automatically use your active Chrome Profile 7 login to authenticate!*

---

## Step 2: Configure MongoDB Atlas (Database)
Your codebase uses a MongoDB database for client portfolios, quote submissions, and messaging catalog.
1. Log in to [MongoDB Atlas](https://cloud.mongodb.com).
2. Create a new free tier Cluster (e.g. `Cluster0`).
3. Under **Database Access**, create a user (e.g., `admin`) and set a password.
4. Under **Network Access**, add IP `0.0.0.0/0` (allow access from anywhere) so your backend can connect.
5. Click **Connect** -> **Drivers** -> Copy the connection string. It will look like:
   `mongodb+srv://admin:<password>@cluster0.xxxx.mongodb.net/letinvestments?retryWrites=true&w=majority`
6. Open `backend/.env` and update the `MONGODB_URI` with this connection string:
   ```env
   MONGODB_URI="mongodb+srv://admin:YOUR_PASSWORD@cluster0.xxxx.mongodb.net/letinvestments"
   ```

---

## Step 3: Configure Firebase Auth
Your application uses Firebase for client authentication.
1. Go to the [Firebase Console](https://console.firebase.google.com).
2. Click **Add project** and create a project (e.g., `kingstone-investments`).
3. Enable **Authentication** in the Build menu, then click **Get Started** and enable **Email/Password** sign-in provider.
4. Click **Project settings** (gear icon) -> **General** -> scroll down to **Your apps** -> click **Web icon `</>`** to register a web app.
5. Copy the configuration object and update your `frontend/.env.local` with these values:
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   ```

---

## Step 4: Configure Firebase Admin (Backend SDK)
To let the backend verify authentication tokens and manage user profiles:
1. Inside your Firebase Console, go to **Project settings** -> **Service accounts**.
2. Click the **Generate new private key** button at the bottom of the page. This downloads a `.json` file containing your admin credentials.
3. Open this `.json` file and map its values to your `backend/.env`:
   ```env
   FIREBASE_PROJECT_ID="your_project_id"
   FIREBASE_CLIENT_EMAIL="firebase-adminsdk-xxxxx@your_project_id.iam.gserviceaccount.com"
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```

---

## Step 5: Seeding and Testing the Application
Once the `.env` values are configured, run these scripts to seed both databases (PostgreSQL and MongoDB Atlas) with mock data:

### 1. Seed PostgreSQL Database (Prisma)
Make sure PostgreSQL is running, then execute:
```bash
cd backend
npx prisma db push
npm run seed
```

### 2. Seed MongoDB Atlas Database (Mongoose)
Verify your Atlas database user permissions and connection URI are set, then execute:
```bash
cd backend
npm run seed:mongo
```
*This seeds catalogs, products, materials, settings, and automatically syncs user profile roles directly from your Firebase Auth!*

---

## Step 6: GitHub Pages Frontend Deployment
We have updated `frontend/next.config.js` to enable static HTML exports and added an automated GitHub Actions deployment workflow at `.github/workflows/deploy.yml`.

When you push the codebase to your repository:
1. Go to your GitHub repository -> **Settings** -> **Pages**.
2. Under **Build and deployment** -> **Source**, select **GitHub Actions**.
3. Every time you push to the `main` branch, GitHub will automatically build and deploy your static Next.js frontend to **GitHub Pages** for free!
