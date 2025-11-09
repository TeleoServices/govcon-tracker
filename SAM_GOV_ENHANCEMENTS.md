# SAM.gov Enhancement Specification

## Feature 1: Pagination (Sync All Opportunities)

**Problem:** Currently limited to 100 opportunities per sync

**Solution:** Add pagination loop in `lib/services/samGovApi.ts`

### Changes to syncOpportunities method:
1. First call: Get `totalRecords` count
2. Calculate batches: `Math.ceil(totalRecords / 100)`
3. Loop through batches using `offset` parameter
4. Add 200ms delay between requests
5. Log: `"Batch X of Y"`
6. Return: `{ imported, updated, errors, totalFetched }`

## Feature 2: Multi-NAICS Search

**Problem:** Can only search one NAICS code at a time

**Solution:** Accept comma-separated NAICS codes

### UI Changes (app/sam-gov/page.tsx):
- Change NAICS input to textarea (3 rows)
- Placeholder: "541511, 811210, 541330 (comma-separated)"
- Parse: `naicsCodes.split(',').map(n => n.trim())`
- Show progress per NAICS during sync

### API Changes (app/api/sam-gov/sync/route.ts):
- Accept `naicsCodes` as string or array
- Loop through each code
- Call `syncOpportunities` for each
- Deduplicate by `noticeId`
- Return breakdown by code

## Combined Workflow

Input: "541511, 811210"
Process:
1. Split into array: ['541511', '811210']
2. For each code:
   - Fetch ALL pages (pagination)
   - Import opportunities
3. Deduplicate
4. Show: "Imported 234 opps (541511: 145, 811210: 89)"

## UI Requirements

Progress indicator:
```
⟳ Syncing NAICS 1 of 2, Batch 5 of 12...
```

Results display:
```
✓ Imported 234 opportunities
  • 541511: 145 opps
  • 811210: 89 opps
```

## Technical Notes

- Keep existing filters working (state, setAside, dates)
- Use TELEO design (indigo primary)
- Rate limit: 200ms between API calls
- Handle errors gracefully
- Console.log for debugging

## Success Criteria

✓ Syncs 1,000+ opportunities (not limited to 100)
✓ Multiple NAICS codes in one sync
✓ Progress shown during sync
✓ No duplicates (by noticeId)
✓ Works with existing filters
