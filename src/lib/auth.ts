import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'teleo-services-secret-key-change-in-production'
)

export interface UserPayload {
  id: string
  email: string
  name: string
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export async function createSession(user: UserPayload): Promise<string> {
  const token = await new SignJWT({ 
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)

  // Store session in database
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + 24)
  
  await prisma.session.create({
    data: {
      userId: user.id,
      token,
      expiresAt
    }
  })

  return token
}

export async function verifySession(token: string): Promise<UserPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    
    // Check if session exists in database
    const session = await prisma.session.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!session || session.expiresAt < new Date()) {
      return null
    }

    return payload as unknown as UserPayload
  } catch {
    return null
  }
}

export async function getCurrentUser(token: string | undefined): Promise<UserPayload | null> {
  if (!token) {
    return null
  }

  return verifySession(token)
}

export async function logout(token: string | undefined): Promise<void> {
  if (token) {
    // Delete session from database
    await prisma.session.deleteMany({
      where: { token }
    })
  }
}

export async function requireAuth(token: string | undefined): Promise<UserPayload> {
  const user = await getCurrentUser(token)
  
  if (!user) {
    throw new Error('Unauthorized')
  }
  
  return user
}

export async function requireAdmin(token: string | undefined): Promise<UserPayload> {
  const user = await requireAuth(token)
  
  if (user.role !== 'ADMIN') {
    throw new Error('Forbidden: Admin access required')
  }
  
  return user
}