export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export function exportFilename(
  range: 'all' | 'year' | 'month',
  format: 'json' | 'excel',
  year?: number,
  month?: number,
) {
  const stamp = new Date().toISOString().slice(0, 10)
  const extension = format === 'excel' ? 'xlsx' : 'json'
  if (range === 'month' && year && month) {
    return `expense-manager-${year}-${String(month).padStart(2, '0')}.${extension}`
  }
  if (range === 'year' && year) {
    return `expense-manager-${year}.${extension}`
  }
  return `expense-manager-all-${stamp}.${extension}`
}
