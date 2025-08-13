import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding users...')

  // Create admin user
  const adminPassword = await bcrypt.hash('Admin@123', 12)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@teleoservices.com' },
    update: {},
    create: {
      email: 'admin@teleoservices.com',
      password: adminPassword,
      name: 'TELEO Admin',
      role: 'ADMIN',
      isActive: true
    }
  })
  console.log('✅ Created admin user:', adminUser.email)
  console.log('   Password: Admin@123')

  // Create sample users
  const userPassword = await bcrypt.hash('User@123', 12)
  
  const sampleUsers = [
    { email: 'john.doe@teleoservices.com', name: 'John Doe' },
    { email: 'jane.smith@teleoservices.com', name: 'Jane Smith' },
    { email: 'bob.wilson@teleoservices.com', name: 'Bob Wilson' }
  ]

  for (const userData of sampleUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        password: userPassword,
        name: userData.name,
        role: 'USER',
        isActive: true,
        createdBy: adminUser.id
      }
    })
    console.log('✅ Created user:', user.email)
  }
  
  console.log('\n📋 Login Credentials:')
  console.log('========================')
  console.log('Admin:')
  console.log('  Email: admin@teleoservices.com')
  console.log('  Password: Admin@123')
  console.log('\nSample Users:')
  console.log('  Email: john.doe@teleoservices.com')
  console.log('  Password: User@123')
  console.log('\n⚠️  Please change these passwords after first login!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })