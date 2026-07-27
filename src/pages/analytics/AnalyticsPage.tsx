import { useState } from 'react'
import { BarChart3 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CashflowChart, CategoryBarChart, CategoryPieChart, ChartCard } from '@/components/charts/FinanceCharts'
import { PageHeader, StatCard } from '@/components/shared/PageHeader'
import { ErrorState } from '@/components/shared/States'
import {
  useCashflowTrend,
  useMonthlyAnalytics,
  useTopExpenses,
  useYearlyAnalytics,
} from '@/features/analytics/hooks/useAnalytics'
import { formatCurrency } from '@/lib/utils'
import { getErrorMessage } from '@/utils/errorUtils'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export default function AnalyticsPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())

  const monthly = useMonthlyAnalytics({ month, year })
  const yearly = useYearlyAnalytics({ year })
  const cashflow = useCashflowTrend()
  const topExpenses = useTopExpenses()

  const isLoading = monthly.isLoading || yearly.isLoading || cashflow.isLoading

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 sm:grid-cols-3"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div>
        <Skeleton className="h-80" />
      </div>
    )
  }

  if (monthly.isError) {
    return <ErrorState message={getErrorMessage(monthly.error)} onRetry={() => monthly.refetch()} />
  }

  const monthlyData = monthly.data
  const yearlyData = yearly.data
  const cashflowData = cashflow.data ?? []
  const topData = topExpenses.data ?? []

  const totalIncome = cashflowData.reduce((s, c) => s + c.income, 0)
  const totalExpense = cashflowData.reduce((s, c) => s + c.expense, 0)

  return (
    <div className="space-y-8">
      <PageHeader title="Analytics" description="Deep insights into your spending and income patterns." />

      <div className="flex flex-wrap gap-3">
        <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
          <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {MONTHS.map((m, i) => <SelectItem key={m} value={String(i + 1)}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
          <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {[year - 1, year, year + 1].map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Monthly Expenses" value={formatCurrency(monthlyData?.totalExpense ?? 0)} icon={BarChart3} />
        <StatCard title="6-Month Income" value={formatCurrency(totalIncome)} description="Trailing period" />
        <StatCard title="6-Month Expenses" value={formatCurrency(totalExpense)} description="Trailing period" />
        <StatCard title="Net (6 months)" value={formatCurrency(totalIncome - totalExpense)} />
      </div>

      <Tabs defaultValue="monthly">
        <TabsList>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
          <TabsTrigger value="yearly">Yearly</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="top">Top Expenses</TabsTrigger>
        </TabsList>

        <TabsContent value="monthly" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <ChartCard title="Category Breakdown" description={`${MONTHS[month - 1]} ${year}`}>
              {monthlyData?.categories.length ? (
                <CategoryPieChart data={monthlyData.categories} />
              ) : (
                <p className="py-12 text-center text-sm text-muted-foreground">No data for this month</p>
              )}
            </ChartCard>
            <ChartCard title="Category Amounts">
              {monthlyData?.categories.length ? (
                <CategoryBarChart data={monthlyData.categories.map((c) => ({ category: c.category, amount: c.amount }))} />
              ) : (
                <p className="py-12 text-center text-sm text-muted-foreground">No data</p>
              )}
            </ChartCard>
          </div>
        </TabsContent>

        <TabsContent value="yearly" className="mt-6">
          <ChartCard title="Yearly Category Analysis" description={`${year}`}>
            {yearlyData?.categories.length ? (
              <CategoryBarChart data={yearlyData.categories.map((c) => ({ category: c.category, amount: c.amount }))} />
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">No yearly data</p>
            )}
          </ChartCard>
        </TabsContent>

        <TabsContent value="cashflow" className="mt-6">
          <ChartCard title="Income vs Expense Trend" description="Last 6 months">
            {cashflowData.length ? <CashflowChart data={cashflowData} /> : (
              <p className="py-12 text-center text-sm text-muted-foreground">No cashflow data</p>
            )}
          </ChartCard>
        </TabsContent>

        <TabsContent value="top" className="mt-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Top 10 Expenses</CardTitle></CardHeader>
            <CardContent>
              {topData.length ? (
                <div className="space-y-3">
                  {topData.map((item, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                      <span className="font-medium">{item.title}</span>
                      <span className="font-semibold text-red-600">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="py-8 text-center text-sm text-muted-foreground">No expense data</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
