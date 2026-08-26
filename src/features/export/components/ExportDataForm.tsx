import { useState } from 'react'
import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { ExportFormat, ExportRange, ExportRequest } from '@/types/export.types'

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const RANGES: { id: ExportRange; label: string; hint: string }[] = [
  { id: 'all', label: 'All data', hint: 'Everything you have logged' },
  { id: 'year', label: 'Year', hint: 'One calendar year' },
  { id: 'month', label: 'Month', hint: 'One month' },
]

const FORMATS: { id: ExportFormat; label: string }[] = [
  { id: 'json', label: 'JSON' },
  { id: 'excel', label: 'Excel' },
]

interface ExportDataFormProps {
  onExport: (request: ExportRequest) => void
  isLoading?: boolean
}

export function ExportDataForm({ onExport, isLoading }: ExportDataFormProps) {
  const now = new Date()
  const [range, setRange] = useState<ExportRange>('all')
  const [format, setFormat] = useState<ExportFormat>('json')
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const years = Array.from({ length: 8 }, (_, index) => now.getFullYear() - 5 + index)

  const handleExport = () => {
    onExport({
      format,
      range,
      year: range === 'all' ? undefined : year,
      month: range === 'month' ? month : undefined,
    })
  }

  return (
    <div className="space-y-5">
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Range</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {RANGES.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setRange(option.id)}
              className={cn(
                'rounded-lg border px-3 py-3 text-left text-sm transition-colors',
                range === option.id
                  ? 'border-primary bg-primary/5 text-foreground'
                  : 'border-border text-muted-foreground hover:bg-muted/50',
              )}
            >
              <span className="block font-medium text-foreground">{option.label}</span>
              <span className="mt-1 block text-xs">{option.hint}</span>
            </button>
          ))}
        </div>
      </fieldset>

      {range !== 'all' ? (
        <div className="flex flex-wrap gap-3">
          {range === 'month' ? (
            <label className="space-y-1 text-xs font-medium text-muted-foreground">
              Month
              <Select value={String(month)} onValueChange={(value) => setMonth(Number(value))}>
                <SelectTrigger className="h-9 w-40 font-normal text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MONTHS.map((label, index) => (
                    <SelectItem key={label} value={String(index + 1)}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
          ) : null}
          <label className="space-y-1 text-xs font-medium text-muted-foreground">
            Year
            <Select value={String(year)} onValueChange={(value) => setYear(Number(value))}>
              <SelectTrigger className="h-9 w-28 font-normal text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((value) => (
                  <SelectItem key={value} value={String(value)}>
                    {value}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
        </div>
      ) : null}

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">File format</legend>
        <div className="grid grid-cols-2 gap-2">
          {FORMATS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setFormat(option.id)}
              className={cn(
                'rounded-lg border px-3 py-2 text-sm font-medium transition-colors',
                format === option.id
                  ? 'border-primary bg-primary/5 text-foreground'
                  : 'border-border text-muted-foreground hover:bg-muted/50',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      <Button type="button" onClick={handleExport} disabled={isLoading}>
        <Download className="size-4" />
        {isLoading ? 'Preparing…' : format === 'excel' ? 'Download Excel' : 'Download JSON'}
      </Button>
    </div>
  )
}
