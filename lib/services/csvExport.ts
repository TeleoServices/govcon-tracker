export function exportToCSV(data: any[], filename: string, headers?: string[]) {
  if (data.length === 0) {
    alert('No data to export')
    return
  }

  // If headers not provided, use keys from first object
  const csvHeaders = headers || Object.keys(data[0])

  // Create CSV rows
  const rows = data.map(item => {
    return csvHeaders.map(header => {
      const value = item[header]
      // Handle null/undefined
      if (value === null || value === undefined) return ''
      // Handle dates
      if (value instanceof Date) return value.toLocaleDateString()
      // Handle objects/arrays - stringify them
      if (typeof value === 'object') return JSON.stringify(value)
      // Escape quotes and wrap in quotes if contains comma
      const stringValue = String(value)
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    })
  })

  // Combine headers and rows
  const csvContent = [
    csvHeaders.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  window.URL.revokeObjectURL(url)
}

export function exportTableToCSV(
  tableData: any[],
  filename: string,
  columnMapping: { [key: string]: string }
) {
  // columnMapping maps display names to data keys
  // e.g., { 'Solicitation Number': 'solicitationNumber', 'Title': 'title' }

  const headers = Object.keys(columnMapping)
  const dataKeys = Object.values(columnMapping)

  const rows = tableData.map(item => {
    return dataKeys.map(key => {
      const value = item[key]
      if (value === null || value === undefined) return ''
      if (value instanceof Date) return value.toLocaleDateString()
      if (typeof value === 'object') return JSON.stringify(value)
      const stringValue = String(value)
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`
      }
      return stringValue
    })
  })

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = window.URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  window.URL.revokeObjectURL(url)
}
