import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CHART_COLORS } from '@/constants/enums'
import { formatCurrency } from '@/lib/utils'

interface ChartCardProps {
  title: string
  description?: string
  children: React.ReactNode
  className?: string
}

export function ChartCard({ title, description, children, className }: ChartCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

interface SpendingTrendChartProps {
  data: { month: string; expense: number }[]
}

export function SpendingTrendChart({ data }: SpendingTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'currentColor' }} />
        <YAxis tick={{ fontSize: 12, fill: 'currentColor' }} tickFormatter={(v) => `₹${v / 1000}k`} />
        <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
        <Line type="monotone" dataKey="expense" stroke="#0d9488" strokeWidth={2} dot={{ r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  )
}

interface AccountDistributionChartProps {
  data: { account: string; balance: number }[]
}

export function AccountDistributionChart({ data }: AccountDistributionChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie data={data} dataKey="balance" nameKey="account" cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={2}>
          {data.map((_, index) => (
            <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}

interface CategoryBarChartProps {
  data: { category: string; amount: number }[]
}

export function CategoryBarChart({ data }: CategoryBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} layout="vertical" margin={{ left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis type="number" tick={{ fontSize: 12, fill: 'currentColor' }} tickFormatter={(v) => `₹${v / 1000}k`} />
        <YAxis type="category" dataKey="category" width={100} tick={{ fontSize: 12, fill: 'currentColor' }} />
        <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
        <Bar dataKey="amount" fill="#0d9488" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

interface CashflowChartProps {
  data: { month: string; income: number; expense: number }[]
}

export function CashflowChart({ data }: CashflowChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'currentColor' }} />
        <YAxis tick={{ fontSize: 12, fill: 'currentColor' }} tickFormatter={(v) => `₹${v / 1000}k`} />
        <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
        <Legend />
        <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

interface CategoryPieChartProps {
  data: { category: string; amount: number; percentage: number }[]
}

export function CategoryPieChart({ data }: CategoryPieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          dataKey="amount"
          nameKey="category"
          cx="50%"
          cy="50%"
          outerRadius={110}
          label={({ name, percent }) => `${name} (${((percent ?? 0) * 100).toFixed(0)}%)`}
        >
          {data.map((_, index) => (
            <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
      </PieChart>
    </ResponsiveContainer>
  )
}

interface ComposedTrendChartProps {
  data: { label: string; income: number; expense: number; net: number }[]
}

export function ComposedTrendChart({ data }: ComposedTrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={340}>
      <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="label" tick={{ fontSize: 12, fill: 'currentColor' }} />
        <YAxis tick={{ fontSize: 12, fill: 'currentColor' }} tickFormatter={(v) => `₹${v / 1000}k`} />
        <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
        <Legend />
        <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={18} />
        <Bar dataKey="expense" name="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} barSize={18} />
        <Line type="monotone" dataKey="net" name="Net" stroke="#0d9488" strokeWidth={2.5} dot={{ r: 3 }} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

interface DonutAllocationChartProps {
  data: { name: string; amount: number; percentage: number }[]
  centerLabel: string
  centerValue: string
}

export function DonutAllocationChart({ data, centerLabel, centerValue }: DonutAllocationChartProps) {
  return (
    <div className="relative h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="amount"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={72}
            outerRadius={108}
            paddingAngle={2}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
        </PieChart>
      </ResponsiveContainer>
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <p className="text-xs text-muted-foreground">{centerLabel}</p>
        <p className="text-lg font-semibold tracking-tight">{centerValue}</p>
      </div>
    </div>
  )
}

interface DailyAreaChartProps {
  data: { day: number; expense: number; income: number }[]
}

export function DailyAreaChart({ data }: DailyAreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <ComposedChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="day" tick={{ fontSize: 11, fill: 'currentColor' }} />
        <YAxis tick={{ fontSize: 12, fill: 'currentColor' }} tickFormatter={(v) => `₹${v / 1000}k`} />
        <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
        <Legend />
        <Area type="monotone" dataKey="expense" name="Spend" stroke="#ef4444" fill="#ef444433" />
        <Line type="monotone" dataKey="income" name="Income" stroke="#10b981" strokeWidth={2} dot={false} />
      </ComposedChart>
    </ResponsiveContainer>
  )
}

interface WeekdayBarChartProps {
  data: { weekday: string; amount: number }[]
}

export function WeekdayBarChart({ data }: WeekdayBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis dataKey="weekday" tick={{ fontSize: 12, fill: 'currentColor' }} />
        <YAxis tick={{ fontSize: 12, fill: 'currentColor' }} tickFormatter={(v) => `₹${v / 1000}k`} />
        <Tooltip formatter={(value) => formatCurrency(Number(value ?? 0))} />
        <Bar dataKey="amount" name="Spend" fill="#0d9488" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}

interface SavingsRateGaugeProps {
  value: number
}

export function SavingsRateGauge({ value }: SavingsRateGaugeProps) {
  const clamped = Math.max(-40, Math.min(60, value))
  const ratio = (clamped + 40) / 100
  const color = value >= 20 ? '#10b981' : value >= 0 ? '#0d9488' : '#ef4444'

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-4">
      <div className="relative h-3 w-full max-w-xs overflow-hidden rounded-full bg-muted">
        <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${ratio * 100}%`, background: color }} />
        <div className="absolute top-1/2 h-5 w-px -translate-y-1/2 bg-foreground/40" style={{ left: '60%' }} />
      </div>
      <div className="text-center">
        <p className="text-3xl font-semibold tracking-tight" style={{ color }}>
          {value.toFixed(1)}%
        </p>
        <p className="text-xs text-muted-foreground">20%+ is a healthy savings rate</p>
      </div>
    </div>
  )
}
