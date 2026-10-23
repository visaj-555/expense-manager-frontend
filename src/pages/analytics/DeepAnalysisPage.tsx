import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft,
  Download,
  Landmark,
  PiggyBank,
  TrendingDown,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ChartCard,
  ComposedTrendChart,
  DailyAreaChart,
  DonutAllocationChart,
  SavingsRateGauge,
  WeekdayBarChart,
} from '@/components/charts/FinanceCharts'
import { PageHeader, StatCard } from '@/components/shared/PageHeader'
import { ErrorState } from '@/components/shared/States'
import { CategoryShareList } from '@/features/analytics/components/CategoryShareList'
import { DeltaLabel } from '@/features/analytics/components/DeltaLabel'
import { InsightPills } from '@/features/analytics/components/InsightPills'
import { SpendCalendar } from '@/features/analytics/components/SpendCalendar'
import { deepInsightsToExcel, deepReportFilename } from '@/features/analytics/to-deep-excel'
import { downloadBlob } from '@/features/export/download-file'
import { useDeepInsights } from '@/features/analytics/hooks/useAnalytics'
import { useCategories } from '@/features/categories/hooks/useCategories'
import { formatCurrency, formatDate, formatPercent } from '@/lib/utils'
import type { AnalyticsPeriod } from '@/types/analytics.types'
import { getErrorMessage } from '@/utils/errorUtils'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const ALL_CATEGORIES = '__all__'

export default function DeepAnalysisPage() {
  const now = new Date()
  const [period, setPeriod] = useState<AnalyticsPeriod>('MONTHLY')
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [categoryId, setCategoryId] = useState(ALL_CATEGORIES)

  const { data: categoriesData } = useCategories({ page: 1, limit: 100, isArchived: false, type: 'EXPENSE' })
  const expenseCategories = categoriesData?.data ?? []

  const params = useMemo(
    () => ({
      period,
      year,
      month: period === 'MONTHLY' ? month : undefined,
      categoryId: categoryId === ALL_CATEGORIES ? undefined : categoryId,
    }),
    [period, year, month, categoryId],
  )

  const { data, isLoading, isError, error, refetch } = useDeepInsights(params)

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-72" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    )
  }

  if (isError || !data) {
    return <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
  }

  const { summary } = data
  const selectedCategory = expenseCategories.find((category) => category.id === categoryId)

  const handleDownloadReport = () => {
    const filename = deepReportFilename(data)
    const blob = new Blob([deepInsightsToExcel(data)], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    })
    downloadBlob(filename, blob)
    toast.success(`Downloaded ${data.period.label} report`)
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Deep Analysis"
        description="Bank-grade view of income, spend mix, cashflow, and category concentration."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" onClick={handleDownloadReport}>
              <Download className="size-4" />
              Download {period === 'MONTHLY' ? 'monthly' : 'yearly'} report
            </Button>
            <Button asChild variant="outline">
              <Link to="/analytics">
                <ArrowLeft className="size-4" /> Simple analytics
              </Link>
            </Button>
          </div>
        }
      />

      <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
        <Tabs value={period} onValueChange={(value) => setPeriod(value as AnalyticsPeriod)}>
          <TabsList>
            <TabsTrigger value="MONTHLY">Monthly</TabsTrigger>
            <TabsTrigger value="YEARLY">Yearly</TabsTrigger>
          </TabsList>
        </Tabs>
        {period === 'MONTHLY' ? (
          <Select value={String(month)} onValueChange={(value) => setMonth(Number(value))}>
            <SelectTrigger className="w-32">
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
        ) : null}
        <Select value={String(year)} onValueChange={(value) => setYear(Number(value))}>
          <SelectTrigger className="w-28">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[year - 2, year - 1, year, year + 1].filter((value, index, list) => list.indexOf(value) === index).map((value) => (
              <SelectItem key={value} value={String(value)}>
                {value}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryId} onValueChange={setCategoryId}>
          <SelectTrigger className="w-full sm:w-56">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL_CATEGORIES}>All expense categories</SelectItem>
            {expenseCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.icon ? `${category.icon} ` : ''}
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <InsightPills insights={data.insights} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Income"
          value={formatCurrency(summary.income)}
          icon={TrendingUp}
          description={<DeltaLabel value={summary.incomeChangePct} />}
        />
        <StatCard
          title={selectedCategory ? `${selectedCategory.name} spend` : 'Expenses'}
          value={formatCurrency(summary.expense)}
          icon={TrendingDown}
          description={<DeltaLabel value={summary.expenseChangePct} invert />}
        />
        <StatCard
          title="Net cashflow"
          value={formatCurrency(summary.net)}
          icon={Wallet}
          description={<DeltaLabel value={summary.netChangePct} />}
        />
        <StatCard
          title="Savings rate"
          value={formatPercent(summary.savingsRate)}
          icon={PiggyBank}
          description={`${summary.expenseCount} expenses · avg ${formatCurrency(summary.avgDailySpend)}/day`}
        />
      </div>

      <ChartCard
        title="Income, spend, and net"
        description={
          period === 'MONTHLY'
            ? `Trailing 12 months through ${data.period.label}`
            : `Each month in ${data.period.year}`
        }
      >
        {data.trend.some((point) => point.income || point.expense) ? (
          <ComposedTrendChart data={data.trend} />
        ) : (
          <p className="py-16 text-center text-sm text-muted-foreground">No cashflow in this window</p>
        )}
      </ChartCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard
          title="Where money went"
          description={selectedCategory ? selectedCategory.name : data.period.label}
        >
          {data.categories.length ? (
            <DonutAllocationChart
              data={data.categories.map((category) => ({
                name: category.name,
                amount: category.amount,
                percentage: category.percentage,
              }))}
              centerLabel="Spent"
              centerValue={formatCurrency(summary.expense)}
            />
          ) : (
            <p className="py-16 text-center text-sm text-muted-foreground">No expense mix to chart</p>
          )}
        </ChartCard>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Category concentration</CardTitle>
            <CardDescription>Tap a row to isolate that category across every chart.</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryShareList
              categories={data.categories}
              selectedId={categoryId === ALL_CATEGORIES ? undefined : categoryId}
              onSelect={(id) => setCategoryId(id ?? ALL_CATEGORIES)}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Savings rate" description="Share of income kept after expenses">
          <SavingsRateGauge value={summary.savingsRate} />
        </ChartCard>
        <ChartCard title="Spend by weekday" description="When the money actually leaves">
          {data.weekday.some((day) => day.amount > 0) ? (
            <WeekdayBarChart data={data.weekday} />
          ) : (
            <p className="py-16 text-center text-sm text-muted-foreground">No weekday pattern yet</p>
          )}
        </ChartCard>
      </div>

      {period === 'MONTHLY' ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <ChartCard title="Daily cashflow" description={data.period.label}>
            {data.daily.some((day) => day.expense || day.income) ? (
              <DailyAreaChart data={data.daily} />
            ) : (
              <p className="py-16 text-center text-sm text-muted-foreground">No daily activity</p>
            )}
          </ChartCard>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Spend calendar</CardTitle>
              <CardDescription>Heatmap of each day in {data.period.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <SpendCalendar daily={data.daily} />
            </CardContent>
          </Card>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Account flows</CardTitle>
            <CardDescription>Outflow vs inflow by account in this period</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.accounts.length ? (
              data.accounts.map((account) => (
                <div key={account.accountId} className="rounded-lg border p-3">
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <Landmark className="size-4 text-muted-foreground" />
                      {account.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{account.type.replace('_', ' ')}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <p>
                      <span className="text-muted-foreground">Out </span>
                      <span className="font-semibold text-red-600">{formatCurrency(account.outflow)}</span>
                    </p>
                    <p className="text-right">
                      <span className="text-muted-foreground">In </span>
                      <span className="font-semibold text-emerald-600">{formatCurrency(account.inflow)}</span>
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No account activity</p>
            )}
            {data.transfers.count > 0 ? (
              <p className="text-xs text-muted-foreground">
                Plus {formatCurrency(data.transfers.amount)} moved across {data.transfers.count} internal transfer
                {data.transfers.count === 1 ? '' : 's'} — not counted as spend.
              </p>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Largest expenses</CardTitle>
            <CardDescription>Top tickets in {data.period.label}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topExpenses.length ? (
              data.topExpenses.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.category} · {item.account} · {formatDate(item.date)}
                    </p>
                  </div>
                  <p className="shrink-0 font-semibold text-red-600">{formatCurrency(item.amount)}</p>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No expenses in this period</p>
            )}
          </CardContent>
        </Card>
      </div>

      {data.incomeSources.length ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Income sources</CardTitle>
            <CardDescription>How earnings arrived in {data.period.label}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {data.incomeSources.map((source) => (
                <div key={source.categoryId ?? source.name} className="rounded-lg border p-3">
                  <p className="text-sm font-medium">
                    {source.icon ? `${source.icon} ` : ''}
                    {source.name}
                  </p>
                  <p className="mt-1 text-lg font-semibold">{formatCurrency(source.amount)}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatPercent(source.percentage)} · {source.count} credit{source.count === 1 ? '' : 's'}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}
