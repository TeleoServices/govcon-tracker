# Vercel Deployment Instructions

## Prerequisites
- Git repository (GitHub, GitLab, or Bitbucket)
- Vercel account (free at vercel.com)

## Method 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for Vercel deployment"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Select the repository

3. **Configure Environment Variables**:
   In the Vercel dashboard, add these environment variables:
   ```
   DATABASE_URL=file:./prisma/dev.db
   NEXT_PUBLIC_SUPABASE_URL=https://fuflbtkhtzvkqdobruow.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZmxidGtodHp2a3Fkb2JydW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMzYwNjYsImV4cCI6MjA3MDYxMjA2Nn0.-nYOJ-wGj95Z2AWuGwxhu49ZTigXcmFrp6PZ11qyrew
   SAM_API_KEY=M1v3EyXRPp6b5mdrcPck6a8tCPy6qgebd9j4H2bDA
   JWT_SECRET=your-secure-jwt-secret-key-here
   ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete

## Method 2: Deploy via Vercel CLI

1. **Login to Vercel**:
   ```bash
   npx vercel login
   ```

2. **Deploy**:
   ```bash
   npx vercel --prod
   ```

3. **Follow prompts**:
   - Set up and deploy? `Y`
   - Which scope? Select your account
   - Link to existing project? `N`
   - What's your project's name? `govcon-tracker`
   - In which directory is your code located? `./`
   - Auto-detected project settings? `Y`

4. **Set Environment Variables**:
   ```bash
   npx vercel env add DATABASE_URL production
   # Enter: file:./prisma/dev.db

   npx vercel env add NEXT_PUBLIC_SUPABASE_URL production
   # Enter: https://fuflbtkhtzvkqdobruow.supabase.co

   npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
   # Enter: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZmxidGtodHp2a3Fkb2JydW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMzYwNjYsImV4cCI6MjA3MDYxMjA2Nn0.-nYOJ-wGj95Z2AWuGwxhu49ZTigXcmFrp6PZ11qyrew

   npx vercel env add SAM_API_KEY production
   # Enter: M1v3EyXRPp6b5mdrcPck6a8tCPy6qgebd9j4H2bDA

   npx vercel env add JWT_SECRET production
   # Enter: your-secure-jwt-secret-key-here
   ```

5. **Redeploy with environment variables**:
   ```bash
   npx vercel --prod
   ```

## Your Deployment URL

After deployment, your app will be available at:
- **Production**: `https://govcon-tracker.vercel.app`
- **Preview**: `https://govcon-tracker-[hash].vercel.app`

## Important Notes

1. **Database Limitation**: SQLite file database works but has limitations on Vercel:
   - Database resets on each deployment
   - Not suitable for production data persistence
   - Consider migrating to PostgreSQL for production

2. **Recommended Production Setup**:
   - Use Vercel Postgres or external PostgreSQL
   - Update DATABASE_URL to PostgreSQL connection string
   - Run migrations: `npx prisma migrate deploy`

3. **Custom Domain**:
   - Add custom domain in Vercel dashboard
   - Settings → Domains → Add

## Troubleshooting

If deployment fails:

1. **Check build logs** in Vercel dashboard
2. **Ensure all environment variables** are set
3. **Verify Prisma generation** runs during build
4. **Check API routes** for proper exports

## Local Testing of Production Build

```bash
npm run build
npm start
```

Visit http://localhost:3000 to test production build locally.