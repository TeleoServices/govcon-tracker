import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Create some vendors first
  const vendor1 = await prisma.vendor.create({
    data: {
      name: 'John Smith',
      company: 'Tech Solutions Inc.',
      trade: 'IT Services',
      samRegistered: true,
      capabilities: JSON.stringify(['Cloud Infrastructure', 'Cybersecurity']),
      naicsCode: JSON.stringify(['541511', '541512']),
      contactEmail: 'john@techsolutions.com',
      contactPhone: '(555) 123-4567',
      certifications: JSON.stringify(['8(a)', 'WOSB']),
    },
  })

  const vendor2 = await prisma.vendor.create({
    data: {
      name: 'Sarah Johnson',
      company: 'BuildCorp Services',
      trade: 'Construction',
      samRegistered: true,
      capabilities: JSON.stringify(['General Construction', 'Project Management']),
      naicsCode: JSON.stringify(['236220', '237310']),
      contactEmail: 'sarah@buildcorp.com',
      contactPhone: '(555) 987-6543',
      certifications: JSON.stringify(['SDB', 'HUBZone']),
    },
  })

  // Create opportunities
  const opp1 = await prisma.opportunity.create({
    data: {
      solNo: 'FA8773-24-R-0015',
      title: 'Cloud Infrastructure Modernization',
      description: 'Comprehensive cloud migration and infrastructure modernization project for Air Force systems.',
      agency: 'Air Force',
      naics: '541511',
      stage: 'CAPTURE',
      dueDate: new Date('2025-01-15'),
      priority: 'HIGH',
      postedDate: new Date('2024-12-01'),
      estimatedValue: 1500000,
      type: 'RFP',
      setAside: 'Small Business',
      placeOfPerformance: 'Wright-Patterson AFB, OH',
      status: 'OPEN',
      samUrl: 'https://sam.gov/opp/123456',
      attachments: JSON.stringify([]),
      notes: 'High priority opportunity with good win probability',
    },
  })

  const opp2 = await prisma.opportunity.create({
    data: {
      solNo: 'HSHQDC-24-R-00012',
      title: 'Cybersecurity Assessment Services',
      description: 'Comprehensive cybersecurity assessment and vulnerability analysis for DHS critical systems.',
      agency: 'DHS - CISA',
      naics: '541512',
      stage: 'PURSUIT',
      dueDate: new Date('2025-01-20'),
      priority: 'MEDIUM',
      postedDate: new Date('2024-12-05'),
      estimatedValue: null,
      type: 'RFQ',
      setAside: 'Small Business',
      placeOfPerformance: 'Washington, DC',
      status: 'OPEN',
      samUrl: 'https://sam.gov/opp/123457',
      attachments: JSON.stringify([]),
      notes: 'Potential for follow-on work',
    },
  })

  const opp3 = await prisma.opportunity.create({
    data: {
      solNo: 'W91QF1-24-R-0008',
      title: 'Professional Training Services',
      description: 'Development and delivery of professional training programs for Army personnel.',
      agency: 'Army - TRADOC',
      naics: '611430',
      stage: 'PROPOSAL_DEVELOPMENT',
      dueDate: new Date('2025-01-25'),
      priority: 'LOW',
      postedDate: new Date('2024-12-10'),
      estimatedValue: 750000,
      type: 'SOURCES_SOUGHT',
      setAside: null,
      placeOfPerformance: 'Fort Leavenworth, KS',
      status: 'OPEN',
      samUrl: 'https://sam.gov/opp/123458',
      attachments: JSON.stringify([]),
      notes: 'Training focus on leadership development',
    },
  })

  // Create contact logs
  await prisma.contactLog.create({
    data: {
      subId: vendor1.id,
      oppId: opp1.id,
      date: new Date('2025-01-08'),
      method: 'EMAIL',
      status: 'QUOTE_REQUESTED',
      notes: 'Initial outreach for cloud infrastructure capabilities',
    },
  })

  await prisma.contactLog.create({
    data: {
      subId: vendor2.id,
      oppId: opp3.id,
      date: new Date('2025-01-07'),
      method: 'PHONE',
      status: 'QUOTE_RECEIVED',
      notes: 'Discussed training program requirements and pricing',
    },
  })

  console.log('Database seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })