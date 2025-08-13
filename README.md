# GovCon Tracker

A comprehensive government contract tracking application built with Next.js, TypeScript, and Prisma.

## Features

- **Contract Management**: Track active contracts, values, and key dates
- **Opportunity Tracking**: Monitor RFPs, RFQs, and other government solicitations
- **Vendor Database**: Manage vendor information, certifications, and capabilities
- **Dashboard**: Overview of contracts, opportunities, and vendor metrics
- **Search & Filter**: Quickly find contracts, opportunities, and vendors

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI components
- **Database**: PostgreSQL with Prisma ORM
- **API**: Next.js API Routes

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database

### Installation

1. Clone the repository:
```bash
cd ~/govcon-tracker
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit `.env` with your database connection string:
```
DATABASE_URL="postgresql://user:password@localhost:5432/govcon_tracker?schema=public"
```

4. Initialize the database:
```bash
npm run db:push
npm run db:generate
```

5. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Database Schema

The application uses the following main entities:

- **Vendors**: Company information, certifications, capabilities
- **Contracts**: Active contracts with agencies, values, and timelines
- **Opportunities**: Open solicitations and RFPs
- **Modifications**: Contract modifications and changes

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:push` - Push schema changes to database
- `npm run db:generate` - Generate Prisma client
- `npm run db:studio` - Open Prisma Studio

## Project Structure

```
govcon-tracker/
├── src/
│   ├── app/              # Next.js app directory
│   │   ├── api/          # API routes
│   │   ├── contracts/    # Contracts page
│   │   ├── opportunities/# Opportunities page
│   │   └── vendors/      # Vendors page
│   ├── components/       # Reusable UI components
│   ├── lib/             # Utility functions and database
│   └── types/           # TypeScript type definitions
├── prisma/              # Database schema
└── public/              # Static assets
```

## License

MIT