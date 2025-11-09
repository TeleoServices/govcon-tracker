import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting new workflow seed...')

  // Create organization
  const org = await prisma.organization.create({
    data: {
      name: 'TELEO Services',
      dunsNumber: '123456789',
      cageCode: 'TELEO',
      uei: 'UEI123456789TELEO',
      organizationType: 'Small Business',
      address: '123 Main Street, Washington, DC 20001',
      industryNAICS: JSON.stringify(['541511', '541512', '541519']),
      certifications: JSON.stringify(['8(a)', 'HUBZone', 'SDVOSB']),
    },
  })

  console.log('Created organization:', org.name)

  // Create user
  const hashedPassword = await bcrypt.hash('password123', 10)
  const user = await prisma.user.create({
    data: {
      email: 'admin@teleoservices.com',
      password: hashedPassword,
      name: 'Admin User',
      organizationId: org.id,
    },
  })

  console.log('Created user:', user.email)

  // Create 100 SAM.gov opportunities (raw data for review)
  const agencies = [
    'DEPT OF DEFENSE',
    'GENERAL SERVICES ADMINISTRATION',
    'AGRICULTURE, DEPARTMENT OF',
    'VETERANS AFFAIRS, DEPARTMENT OF',
    'SMITHSONIAN INSTITUTION',
    'ENERGY, DEPARTMENT OF',
    'HOMELAND SECURITY, DEPARTMENT OF',
  ]

  console.log('Creating 100 SAM.gov opportunities...')

  const samGovOpps = []
  for (let i = 0; i < 100; i++) {
    const agency = agencies[i % agencies.length]
    const samOpp = await prisma.samGovOpportunity.create({
      data: {
        noticeId: `NOTICE-2025-${String(i + 1).padStart(5, '0')}`,
        solicitationNumber: `SOL-2025-${String(i + 1).padStart(4, '0')}`,
        title: `${agency} - ${['IT Services', 'Consulting', 'Construction', 'Equipment', 'Software Development'][i % 5]} Contract ${i + 1}`,
        description: `Comprehensive ${['IT Services', 'Consulting', 'Construction', 'Equipment', 'Software Development'][i % 5]} contract for ${agency}. This opportunity requires expertise in federal contracting and compliance.`,
        agencyName: agency,
        departmentName: agency,
        noticeType: 'Solicitation',
        baseType: ['RFP', 'RFQ', 'RFI'][i % 3],
        postedDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        responseDeadline: new Date(Date.now() + (Math.random() * 60 + 7) * 24 * 60 * 60 * 1000),
        estimatedValue: Math.floor(Math.random() * 10000000) + 100000,
        naicsCode: ['541511', '541512', '541519', '541611', '541618'][i % 5],
        setAsideType: ['Small Business', '8(a)', 'HUBZone', 'SDVOSB', null][i % 5],
        descriptionLink: `https://sam.gov/opp/notice-${String(i + 1).padStart(5, '0')}`,
        addedToPipeline: i < 20, // First 20 will be added to pipeline
        addedToPipelineAt: i < 20 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) : null,
      },
    })
    if (i < 20) {
      samGovOpps.push(samOpp)
    }
  }

  console.log('Created 100 SAM.gov opportunities (20 added to pipeline)')

  // Create active opportunities in pipeline (selected from SAM.gov)
  const stages = ['Identified', 'Pursuit', 'Capture', 'Proposal Dev', 'Submitted']

  console.log('Creating 15 active pipeline opportunities...')

  const activeOpps = []
  for (let i = 0; i < 15; i++) {
    const samOpp = samGovOpps[i]
    const stage = stages[i % stages.length]

    const opp = await prisma.opportunity.create({
      data: {
        samGovOpportunityId: samOpp.id,
        solicitationNumber: samOpp.solicitationNumber!,
        title: samOpp.title,
        description: samOpp.description,
        organizationId: org.id,
        agencyName: samOpp.agencyName!,
        departmentName: samOpp.departmentName,
        noticeType: samOpp.noticeType,
        baseType: samOpp.baseType,
        stage,
        status: 'Active',
        postedDate: samOpp.postedDate,
        responseDeadline: samOpp.responseDeadline,
        estimatedValue: samOpp.estimatedValue,
        probability: Math.floor(Math.random() * 100),
        naicsCode: samOpp.naicsCode,
        setAsideType: samOpp.setAsideType,
        descriptionLink: samOpp.descriptionLink,
        createdBy: user.id,
      },
    })
    activeOpps.push(opp)
  }

  console.log('Created 15 active pipeline opportunities')

  // Create 3 won opportunities with contracts
  console.log('Creating 3 won opportunities with contracts...')

  for (let i = 15; i < 18; i++) {
    const samOpp = samGovOpps[i]
    const wonDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)

    const opp = await prisma.opportunity.create({
      data: {
        samGovOpportunityId: samOpp.id,
        solicitationNumber: samOpp.solicitationNumber!,
        title: samOpp.title,
        description: samOpp.description,
        organizationId: org.id,
        agencyName: samOpp.agencyName!,
        departmentName: samOpp.departmentName,
        noticeType: samOpp.noticeType,
        baseType: samOpp.baseType,
        stage: 'Submitted',
        status: 'Won',
        wonDate,
        postedDate: samOpp.postedDate,
        responseDeadline: samOpp.responseDeadline,
        estimatedValue: samOpp.estimatedValue,
        probability: 100,
        naicsCode: samOpp.naicsCode,
        setAsideType: samOpp.setAsideType,
        descriptionLink: samOpp.descriptionLink,
        contractNumber: `CONTRACT-${String(i - 14).padStart(3, '0')}`,
        createdBy: user.id,
      },
    })

    // Create contract for won opportunity
    await prisma.contract.create({
      data: {
        contractNumber: `CONTRACT-${String(i - 14).padStart(3, '0')}`,
        title: samOpp.title,
        opportunityId: opp.id,
        organizationId: org.id,
        agencyName: samOpp.agencyName!,
        contractType: ['FFP', 'T&M', 'IDIQ'][i % 3],
        status: 'Active',
        baseValue: samOpp.estimatedValue || 1000000,
        totalValue: samOpp.estimatedValue || 1000000,
        currentValue: samOpp.estimatedValue || 1000000,
        awardDate: wonDate,
        startDate: new Date(wonDate.getTime() + 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(wonDate.getTime() + 365 * 24 * 60 * 60 * 1000),
      },
    })
  }

  console.log('Created 3 won opportunities with contracts')

  // Create 2 lost opportunities with feedback
  console.log('Creating 2 lost opportunities with feedback...')

  const lostReasons = [
    'Price - Our proposal was too high compared to competitors',
    'Technical Approach - Government preferred a different technical solution',
  ]

  const lostFeedbacks = [
    'Government feedback: While your technical approach was strong, your pricing was 15% higher than the winning bid. Consider more competitive pricing for future opportunities.',
    'Government feedback: The selected vendor demonstrated more extensive experience with similar projects and proposed a more innovative solution. We recommend highlighting unique capabilities more prominently in future proposals.',
  ]

  for (let i = 18; i < 20; i++) {
    const samOpp = samGovOpps[i]
    const lostDate = new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000)

    await prisma.opportunity.create({
      data: {
        samGovOpportunityId: samOpp.id,
        solicitationNumber: samOpp.solicitationNumber!,
        title: samOpp.title,
        description: samOpp.description,
        organizationId: org.id,
        agencyName: samOpp.agencyName!,
        departmentName: samOpp.departmentName,
        noticeType: samOpp.noticeType,
        baseType: samOpp.baseType,
        stage: 'Submitted',
        status: 'Lost',
        lostDate,
        lostReason: lostReasons[i - 18],
        lostFeedback: lostFeedbacks[i - 18],
        postedDate: samOpp.postedDate,
        responseDeadline: samOpp.responseDeadline,
        estimatedValue: samOpp.estimatedValue,
        probability: 0,
        naicsCode: samOpp.naicsCode,
        setAsideType: samOpp.setAsideType,
        descriptionLink: samOpp.descriptionLink,
        createdBy: user.id,
      },
    })
  }

  console.log('Created 2 lost opportunities with feedback')

  // Create subcontractors
  await prisma.subcontractor.create({
    data: {
      organizationId: org.id,
      companyName: 'Tech Solutions Inc.',
      dunsNumber: '123456789',
      cageCode: '1ABC2',
      contactName: 'John Smith',
      email: 'john@techsolutions.com',
      phone: '555-0100',
      specialties: JSON.stringify(['IT Services', 'Cloud', 'Cybersecurity']),
      performanceRating: 4.5,
      samRegistered: true,
      status: 'SAM Registered',
    },
  })

  await prisma.subcontractor.create({
    data: {
      organizationId: org.id,
      companyName: 'BuildCorp Services',
      dunsNumber: '987654321',
      cageCode: '2DEF3',
      contactName: 'Jane Doe',
      email: 'jane@buildcorp.com',
      phone: '555-0200',
      specialties: JSON.stringify(['Construction', 'Maintenance', 'Engineering']),
      performanceRating: 4.0,
      samRegistered: true,
      status: 'SAM Registered',
    },
  })

  console.log('Created 2 subcontractors')
  console.log('\n=================================')
  console.log('Seed completed!')
  console.log('=================================')
  console.log('\nWorkflow Summary:')
  console.log('- 100 SAM.gov opportunities (review queue)')
  console.log('- 15 active pipeline opportunities (stages: Identified → Submitted)')
  console.log('- 3 won opportunities with contracts')
  console.log('- 2 lost opportunities with feedback')
  console.log('- 2 subcontractors')
  console.log('\n=================================')
  console.log('Login credentials:')
  console.log('Email: admin@teleoservices.com')
  console.log('Password: password123')
  console.log('=================================\n')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
