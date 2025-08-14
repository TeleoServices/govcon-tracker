import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Add pgbouncer=true to connection string for pooler connections
const databaseUrl = process.env.DATABASE_URL?.includes('pooler.supabase.com') 
  ? `${process.env.DATABASE_URL}?pgbouncer=true&connection_limit=1`
  : process.env.DATABASE_URL

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: databaseUrl
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma