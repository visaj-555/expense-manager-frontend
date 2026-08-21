import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
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
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
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
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
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
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
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
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
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
        <Pie data={data} dataKey="amount" nameKey="category" cx="50%" cy="50%" outerRadius={110} label={({ category, percentage }) => `${category} (${percentage.toFixed(0)}%)`}>
          {data.map((_, index) => (
            <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => formatCurrency(value)} />
      </PieChart>
    </ResponsiveContainer>
  )
}
