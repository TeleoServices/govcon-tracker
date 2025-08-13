# DreamHost Deployment Instructions for GovCon Tracker

## Important: Application Architecture

This GovCon Tracker application **CANNOT be deployed as a static site** on DreamHost's basic hosting. It requires:

1. **Server-side functionality** for:
   - API routes (`/api/*`)
   - Database connections (SQLite + Supabase)
   - Authentication system
   - SAM.gov API integration
   - Real-time data synchronization

2. **Dynamic features** that need a Node.js server:
   - User authentication with JWT tokens
   - Database CRUD operations
   - External API calls to SAM.gov
   - Server-side data processing

## Recommended Deployment Options

### Option 1: DreamHost VPS (Recommended)
Deploy on DreamHost VPS with Node.js support:

1. **Set up Node.js on VPS**:
   ```bash
   # Install Node.js 20+
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

2. **Upload application files**:
   ```bash
   # Copy entire project to VPS
   scp -r govcon-tracker/ username@vps.dreamhost.com:/home/username/
   ```

3. **Install dependencies**:
   ```bash
   cd govcon-tracker
   npm install
   npx prisma generate
   ```

4. **Set up environment variables**:
   Create `.env` file with:
   ```
   DATABASE_URL="file:./prisma/dev.db"
   NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-key"
   SAM_API_KEY="M1v3EyXRPp6b5mdrcPck6a8tCPy6qgebd9j4H2bD"
   JWT_SECRET="your-secret-key"
   ```

5. **Build and run**:
   ```bash
   npm run build
   npm start # Runs on port 3000
   ```

6. **Set up reverse proxy** in Apache/Nginx to route domain to port 3000

### Option 2: Use a Cloud Platform
Deploy to a platform that supports Next.js applications:

- **Vercel** (Recommended - Made by Next.js creators)
  ```bash
  npm i -g vercel
  vercel
  ```

- **Netlify** (with Next.js adapter)
- **Railway.app**
- **Render.com**

### Option 3: DreamCompute Cloud Server
Use DreamHost's cloud computing service for full control.

## Why Static Export Won't Work

The application uses:
- **API Routes**: All `/api/*` endpoints require server processing
- **Database Operations**: Prisma ORM needs runtime database access
- **Authentication**: JWT validation happens server-side
- **External API Calls**: SAM.gov integration needs server environment
- **Dynamic Data**: Real-time opportunity tracking and synchronization

## Current Build Output

When you run `npm run build`, it creates:
- `.next/` folder with server and client bundles
- Optimized for Node.js server deployment
- NOT suitable for static hosting

## Database Requirements

The application needs:
1. **SQLite database** (local file: `prisma/dev.db`)
2. **Supabase PostgreSQL** (for SAM.gov data)

Both require server-side access and cannot work in static hosting.

## Conclusion

For DreamHost deployment, you need:
- **VPS or DreamCompute** for Node.js support
- **Cannot use** shared hosting or static site hosting
- Consider cloud platforms like Vercel for easier deployment

## Quick Vercel Deployment (Alternative)

1. Push code to GitHub
2. Visit [vercel.com](https://vercel.com)
3. Import GitHub repository
4. Add environment variables
5. Deploy automatically

This provides free hosting with automatic SSL, global CDN, and seamless Next.js support.