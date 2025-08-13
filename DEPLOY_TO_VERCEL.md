# 🚀 Deploy GovCon Tracker to Vercel

## Quick Deploy Steps

### Option 1: Via GitHub + Vercel Dashboard (Easiest)

1. **Push to GitHub**:
```bash
git init
git add .
git commit -m "Deploy to Vercel"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/govcon-tracker.git
git push -u origin main
```

2. **Deploy from Vercel**:
- Go to [vercel.com](https://vercel.com) and sign up/login
- Click "Add New..." → "Project"
- Import your GitHub repository
- Add these environment variables:

```env
DATABASE_URL=file:./prisma/dev.db
NEXT_PUBLIC_SUPABASE_URL=https://fuflbtkhtzvkqdobruow.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ1ZmxidGtodHp2a3Fkb2JydW93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwMzYwNjYsImV4cCI6MjA3MDYxMjA2Nn0.-nYOJ-wGj95Z2AWuGwxhu49ZTigXcmFrp6PZ11qyrew
SAM_API_KEY=M1v3EyXRPp6b5mdrcPck6a8tCPy6qgebd9j4H2bDA
JWT_SECRET=change-this-to-a-secure-random-string
```

3. **Click Deploy**

### Option 2: Via Vercel CLI

```bash
# Deploy directly
npx vercel

# Follow prompts:
# - Set up and deploy? → Y
# - Which scope? → Your account
# - Link to existing project? → N
# - Project name? → govcon-tracker
# - Directory? → ./
# - Override settings? → N

# Set environment variables
npx vercel env add DATABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
npx vercel env add SAM_API_KEY
npx vercel env add JWT_SECRET

# Deploy to production
npx vercel --prod
```

## Your App URLs

After deployment:
- **Production**: `https://govcon-tracker.vercel.app`
- **Preview**: `https://govcon-tracker-[unique-id].vercel.app`

## What's Included

✅ **Features Ready**:
- Dashboard with KPIs and analytics
- SAM.gov opportunity tracking
- Subcontractor verification
- Contact log management
- Contract tracking
- Pipeline visualization

✅ **Integrations Working**:
- SAM.gov API for real-time opportunities
- Supabase for data storage
- SQLite for local data
- Authentication system

## Important Notes

⚠️ **Database Limitation**: 
- SQLite file resets on each deployment
- User data won't persist between deployments
- For production, migrate to PostgreSQL

💡 **Recommended for Production**:
1. Use Vercel Postgres or external database
2. Update DATABASE_URL to PostgreSQL
3. Set stronger JWT_SECRET
4. Enable Vercel Analytics

## Troubleshooting

If deployment fails:
1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Ensure GitHub repo is public or Vercel has access
4. Check for any TypeScript errors (already fixed)

## Support

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Deploy**: [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)

---

Ready to deploy! Your app will be live in ~2 minutes after clicking deploy. 🎉