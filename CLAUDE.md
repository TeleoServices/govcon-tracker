# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build production application
- `npm run lint` - Run ESLint code linting
- `npm run db:push` - Push Prisma schema changes to SQLite database
- `npm run db:generate` - Generate Prisma client after schema changes
- `npm run db:studio` - Open Prisma Studio for database management
- `npx tsx prisma/seed.ts` - Run database seeding script

## Architecture Overview

This is a Next.js government contracting management application with a SQLite database. The architecture follows a standard Next.js 14 app directory pattern with the following key components:

### Database & Data Layer
- **Database**: SQLite with Prisma ORM (located at `./prisma/dev.db`)
- **Schema**: Defined in `prisma/schema.prisma` with models for Vendor, Contract, Opportunity, ContactLog, and Modification
- **Critical SQLite Limitation**: Arrays are stored as JSON strings since SQLite doesn't support native arrays
- **Data Hooks**: Custom React hooks in `src/hooks/use-data.ts` provide standardized data fetching with loading/error states

### Entity Relationships
- **Vendors** (called "Subcontractors" in UI) contain company information, certifications, and capabilities
- **Opportunities** follow a 7-stage pipeline: IDENTIFIED → PURSUIT → CAPTURE → PROPOSAL_DEVELOPMENT → SUBMITTED → AWARDED/LOST
- **ContactLog** tracks communications between the prime contractor and subcontractors for specific opportunities
- **Contracts** track awarded contracts with modifications

### Critical Data Transformation Pattern
Due to SQLite limitations, array fields (capabilities, naicsCode, certifications, attachments) require transformation:

**API Routes** (in `/api` folders): Must convert arrays to JSON strings before database operations:
```typescript
const transformedData = {
  ...data,
  capabilities: Array.isArray(data.capabilities) ? JSON.stringify(data.capabilities) : data.capabilities,
}
```

**Frontend Components**: Must parse JSON strings back to arrays when displaying data:
```typescript
const parseJSONArray = (jsonString: string | string[]): string[] => {
  if (Array.isArray(jsonString)) return jsonString
  if (!jsonString) return []
  try {
    const parsed = JSON.parse(jsonString)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}
```

### UI Components Structure
- **Pages**: Located in `src/app/` following Next.js 14 app directory structure
- **Reusable Components**: Organized by feature in `src/components/[feature]/`
- **UI Primitives**: Custom components in `src/components/ui/` (no external Radix UI dependencies for core functionality)
- **Form Handling**: Uses Zod validation (`src/lib/validation.ts`) with form state management

### Stage Management System
Opportunities use a sophisticated stage progression system:
- **Stage Advancement**: Forward/backward navigation with validation
- **Progress Calculation**: Percentage completion based on current stage
- **Visual Indicators**: Color-coded chips and progress bars with tooltips
- **Stage Descriptions**: Detailed explanations available via `getStageDescription()` utility

### API Patterns
- **Route Structure**: Follow Next.js 14 route handlers (`route.ts` files)
- **Individual Resource Routes**: Use `[id]/route.ts` pattern for specific resource operations
- **Error Handling**: Include both console logging and structured error responses
- **Data Filtering**: API routes support read-only operations; filtering happens on frontend

### Terminology Consistency
Use "Subcontractors" (not "Vendors") throughout the UI to reflect government contracting context where these companies serve as subcontractors on prime contracts.

### Common Debugging Areas
1. **Array Parsing Errors**: Check for proper JSON string conversion in forms and API routes
2. **Stage Progression Issues**: Ensure read-only fields are filtered out in update operations
3. **Database Connection**: Verify `DATABASE_URL` points to `"file:./prisma/dev.db"`
4. **Mock Data Fallbacks**: Application shows mock data when database is empty; real data takes precedence when available