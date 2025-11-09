import { samGovApi } from './lib/services/samGovApi'

async function testSamGov() {
  try {
    console.log('Testing SAM.gov API...')
    console.log('API Key:', process.env.SAM_GOV_API_KEY?.substring(0, 10) + '...')

    const result = await samGovApi.searchOpportunities({
      limit: 5
    })

    console.log('\nSuccess!')
    console.log('Total Records:', result.totalRecords)
    console.log('Opportunities Retrieved:', result.opportunities.length)

    if (result.opportunities.length > 0) {
      console.log('\nFirst Opportunity:')
      console.log('- Notice ID:', result.opportunities[0].noticeId)
      console.log('- Title:', result.opportunities[0].title)
      console.log('- Posted Date:', result.opportunities[0].postedDate)
    }
  } catch (error: any) {
    console.error('\nError:', error.message)
    console.error('Stack:', error.stack)
  }
}

testSamGov()
