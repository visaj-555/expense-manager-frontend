import { localISODate } from '@/lib/utils'

export interface ParsedBulkRow {
  transactionDate: string
  title: string
  amount: string
  categoryName?: string
  notes?: string
}

const MONTHS: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
}

function pad(value: number) {
  return String(value).padStart(2, '0')
}

export function toLocalDateString(year: number, monthIndex: number, day: number): string | null {
  if (!year || monthIndex < 0 || monthIndex > 11 || day < 1 || day > 31) return null
  const date = new Date(year, monthIndex, day)
  if (date.getFullYear() !== year || date.getMonth() !== monthIndex || date.getDate() !== day) {
    return null
  }
  return `${year}-${pad(monthIndex + 1)}-${pad(day)}`
}

export function parseFlexibleDate(raw: string, fallback: string): string {
  const value = raw.trim()
  if (!value) return fallback

  const iso = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (iso) {
    return toLocalDateString(Number(iso[1]), Number(iso[2]) - 1, Number(iso[3])) ?? fallback
  }

  const dmy = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/)
  if (dmy) {
    const year = Number(dmy[3]) < 100 ? 2000 + Number(dmy[3]) : Number(dmy[3])
    return toLocalDateString(year, Number(dmy[2]) - 1, Number(dmy[1])) ?? fallback
  }

  const named = value.match(/^([A-Za-z]+)\s+(\d{1,2}),?\s+(\d{4})$/)
  if (named) {
    const month = MONTHS[named[1].toLowerCase()]
    if (month != null) {
      return toLocalDateString(Number(named[3]), month, Number(named[2])) ?? fallback
    }
  }

  const named2 = value.match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/)
  if (named2) {
    const month = MONTHS[named2[2].toLowerCase()]
    if (month != null) {
      return toLocalDateString(Number(named2[3]), month, Number(named2[1])) ?? fallback
    }
  }

  return fallback
}

export function parseAmountCell(raw: string): string {
  const cleaned = raw.replace(/[₹,]/g, '').replace(/\s/g, '').trim()
  const num = Number(cleaned)
  if (!Number.isFinite(num) || num <= 0) return ''
  return String(num)
}

function splitRow(line: string): string[] {
  if (line.includes('\t')) return line.split('\t').map((cell) => cell.trim())
  if (line.includes(',')) {
    return line.split(',').map((cell) => cell.replace(/^["']|["']$/g, '').trim())
  }
  return [line.trim()]
}

function looksLikeDate(cell: string) {
  if (!cell) return false
  return parseFlexibleDate(cell, '') !== ''
}

function looksLikeAmount(cell: string) {
  return Boolean(parseAmountCell(cell))
}

function parseCells(cells: string[], fallbackDate: string): ParsedBulkRow | null {
  if (cells.length === 1) {
    return { transactionDate: fallbackDate, title: cells[0], amount: '' }
  }

  if (looksLikeDate(cells[0])) {
    return {
      transactionDate: parseFlexibleDate(cells[0], fallbackDate),
      title: cells[1] ?? '',
      amount: parseAmountCell(cells[2] ?? ''),
      categoryName: cells[3] || undefined,
      notes: cells[4] || undefined,
    }
  }

  if (looksLikeAmount(cells[1])) {
    return {
      transactionDate: fallbackDate,
      title: cells[0],
      amount: parseAmountCell(cells[1]),
      categoryName: cells[2] || undefined,
      notes: cells[3] || undefined,
    }
  }

  return {
    transactionDate: fallbackDate,
    title: cells[0],
    amount: parseAmountCell(cells.find((cell, index) => index > 0 && looksLikeAmount(cell)) ?? ''),
    categoryName: cells[2] || undefined,
  }
}

/**
 * Paste from Excel / Notion / Sheets.
 * Preferred columns: Date, Title, Amount, Category, Notes
 * Title + Amount also works if the date column is missing.
 */
export function parseBulkPaste(text: string, fallbackDate = localISODate()): ParsedBulkRow[] {
  const lines = text
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)

  const rows: ParsedBulkRow[] = []

  for (const line of lines) {
    const cells = splitRow(line).filter((cell, index, all) => cell || index < all.length - 1)
    if (cells.length === 0) continue

    const header = cells.join(' ').toLowerCase()
    if (header.includes('amount') && (header.includes('title') || header.includes('name'))) {
      continue
    }

    const row = parseCells(cells, fallbackDate)
    if (!row || (!row.title && !row.amount)) continue
    rows.push(row)
  }

  return rows
}
