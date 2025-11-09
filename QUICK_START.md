# TELEO GovCon Tracker - Quick Start Guide

## 🚀 Application is Running!

### Access the Application
**URL**: http://localhost:3001

### Default Credentials
- **Email**: admin@teleoservices.com
- **Password**: password123

---

## 📊 What You'll See

### Dashboard (/dashboard)
The main dashboard displays:
- **5 KPI Cards** with colored icons showing key metrics
- **Pipeline Funnel** with 6 stages and 50 opportunities distributed across them
- **Quick Insights** panel with critical metrics
- **3 Charts**: Stage Distribution, Top Agencies, Priority Mix
- **Summary Statistics**: Total opportunities, pipeline value, conversion rate

### Opportunities (/opportunities)
- Table view of all 50 seeded opportunities
- Shows solicitation number, title, agency, stage, value, and deadline
- Color-coded stage badges
- Data from 5 different government agencies

### Subcontractors (/subcontractors)
- Card grid displaying 2 subcontractors
- Tech Solutions Inc. (IT Services, 4.5/5 rating)
- BuildCorp Services (Construction, 4.0/5 rating)
- Shows contact info, CAGE codes, SAM registration status

### Other Pages
- **SAM.gov** - Placeholder for API sync
- **Contracts** - Placeholder for contract management
- **Contact Log** - Placeholder for communication tracking

---

## 🗄️ Database

### Location
`/mnt/c/Users/Jason/OneDrive/Desktop/teleo-govcon-tracker/prisma/dev.db`

### Size
388KB (with 50 opportunities and sample data)

### Models
18 database models including:
- User, Organization, Opportunity
- Subcontractor, Contract, Quote
- Activity, Document, and more

### Sample Data
- 1 Organization (TELEO Services)
- 1 Admin User
- 50 Opportunities across 6 stages
- 2 Subcontractors

---

## 🛠️ Development Commands

### Start Server
```bash
cd "/mnt/c/Users/Jason/OneDrive/Desktop/teleo-govcon-tracker"
npm run dev
```
Access at: http://localhost:3001

### Database Commands
```bash
# View data in Prisma Studio (GUI)
npm run db:studio

# Reset database
npx prisma db push --force-reset

# Reseed data
npm run db:seed

# Generate Prisma Client
npm run db:generate
```

### Build for Production
```bash
npm run build
npm run start
```

---

## 📁 Key Files

### Configuration
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind/styling configuration
- `.env` - Environment variables (DATABASE_URL)

### Database
- `prisma/schema.prisma` - Database schema (18 models)
- `prisma/seed.ts` - Seed script for sample data
- `prisma/dev.db` - SQLite database file

### Application
- `app/layout.tsx` - Root layout with AppLayout wrapper
- `app/dashboard/page.tsx` - Main dashboard
- `components/dashboard/*` - Dashboard components
- `components/layout/AppLayout.tsx` - Navigation and layout
- `lib/prisma.ts` - Prisma client
- `lib/utils.ts` - Utility functions

---

## 🎨 Design Specifications

### Colors (TELEO Brand)
- **Primary**: #4F46E5 (Indigo)
- **Success**: #10B981 (Green)
- **Warning**: #F59E0B (Amber)
- **Danger**: #EF4444 (Red)
- **Purple**: #A855F7
- **Pink**: #EC4899

### Stage Colors (Pipeline Funnel)
1. Identified - Blue (#6366F1)
2. Pursuit - Indigo (#5B5FE8)
3. Capture - Purple (#A855F7)
4. Proposal Dev - Pink (#EC4899)
5. Submitted - Red (#EF4444)
6. Awarded - Green (#10B981)

---

## 🔑 Key Features

### ✅ Implemented
- Professional TELEO design with indigo primary color
- Top navigation with 6 menu items
- Complete dashboard with KPIs, funnel, and charts
- Opportunity tracking (50 seeded)
- Subcontractor management (2 seeded)
- API routes for data fetching
- SQLite database with 18 models
- TypeScript throughout
- Responsive design

### 🚧 Ready for Implementation
- User authentication (NextAuth.js structure ready)
- SAM.gov API integration (schema ready)
- CRUD operations for opportunities
- Contract management
- Document upload
- Activity/audit logging
- Advanced filtering and search

---

## 📈 Sample Data Distribution

### Opportunities by Stage
- Identified: ~8 opportunities
- Pursuit: ~8 opportunities
- Capture: ~9 opportunities
- Proposal Dev: ~8 opportunities
- Submitted: ~8 opportunities
- Awarded: ~9 opportunities

### Agencies
- DEPT OF DEFENSE
- GENERAL SERVICES ADMINISTRATION
- AGRICULTURE, DEPARTMENT OF
- VETERANS AFFAIRS, DEPARTMENT OF
- SMITHSONIAN INSTITUTION

### Opportunity Types
- RFP (Request for Proposal)
- RFQ (Request for Quote)
- RFI (Request for Information)

---

## 🎯 Navigation Menu

1. **Dashboard** - Main overview with KPIs and charts
2. **SAM.gov** - Government contract sync
3. **Opportunities** - Contract opportunity tracking
4. **Subcontractors** - Partner network management
5. **Contact Log** - Communication tracking
6. **Contracts** - Active contract management

---

## 💡 Tips

1. **Dashboard loads real data** - All KPIs and charts calculate from actual database
2. **Opportunities table is sortable** - Click headers to sort
3. **Funnel is interactive** - Hover for visual feedback
4. **All pages use TELEO colors** - Consistent brand experience
5. **Database is persistent** - Data survives server restarts

---

## 🐛 Troubleshooting

### Server won't start
```bash
# Kill any process on port 3001
lsof -ti:3001 | xargs kill -9

# Restart
npm run dev
```

### Database errors
```bash
# Regenerate Prisma Client
npm run db:generate

# Reset database
npx prisma db push --force-reset
npm run db:seed
```

### Module not found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## 📞 Support

For issues or questions, check:
1. `BUILD_SUMMARY.md` - Complete build documentation
2. Console logs in browser DevTools
3. Terminal output for server errors
4. Prisma Studio for database inspection

---

**Enjoy your TELEO GovCon Tracker!** 🎉
