import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Lightbulb,
  PiggyBank,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartCard, AccountDistributionChart, CategoryBarChart, SpendingTrendChart } from '@/components/charts/FinanceCharts'
import { PageHeader, StatCard } from '@/components/shared/PageHeader'
import { ErrorState } from '@/components/shared/States'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { formatCurrency, formatDate, formatPercent } from '@/lib/utils'
import { getErrorMessage } from '@/utils/errorUtils'

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-xl" />
        <Skeleton className="h-80 rounded-xl" />
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { data, isLoading, isError, error, refetch } = useDashboard()

  if (isLoading) return <DashboardSkeleton />

  if (isError || !data) {
    return <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
  }

  const { overview, accountDistribution, monthlySummary, recentTransactions, goalsProgress, spendingTrend, insights } = data

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Your financial overview at a glance."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Current Balance"
          value={formatCurrency(overview.currentBalance)}
          icon={Wallet}
          description="From bank accounts"
        />
        <StatCard
          title="Current Cash Balance"
          value={formatCurrency(overview.currentWalletBalance)}
          icon={Banknote}
          description="Cash in hand"
        />
        <StatCard
          title="Monthly Income"
          value={formatCurrency(overview.monthlyIncome)}
          icon={ArrowUpRight}
          trend={{ value: 'This month', positive: true }}
        />
        <StatCard
          title="Monthly Expenses"
          value={formatCurrency(overview.monthlyExpense)}
          icon={ArrowDownRight}
          trend={{ value: 'This month', positive: false }}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Monthly Savings"
          value={formatCurrency(overview.monthlySavings)}
          icon={PiggyBank}
          description={`${formatPercent(overview.savingsRate)} savings rate`}
        />
        <StatCard title="Net Cash Flow" value={formatCurrency(overview.netCashFlow)} icon={TrendingUp} />
        <StatCard
          title="Investments"
          value={formatCurrency(overview.monthlyInvestments)}
          icon={Target}
          description="Total SIP"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Spending Trend" description="Monthly expenses over time">
          {spendingTrend.length > 0 ? (
            <SpendingTrendChart data={spendingTrend} />
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">No spending data yet</p>
          )}
        </ChartCard>

        <ChartCard title="Account Distribution" description="Balance by account">
          {accountDistribution.length > 0 ? (
            <AccountDistributionChart data={accountDistribution} />
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">No accounts yet</p>
          )}
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartCard title="Top Categories" description="Biggest expense categories this month (all-time if none yet)">
          {monthlySummary.topCategories.length > 0 ? (
            <CategoryBarChart data={monthlySummary.topCategories} />
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">No category data yet</p>
          )}
        </ChartCard>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Goal Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            {goalsProgress.length > 0 ? (
              goalsProgress.map((goal) => (
                <div key={goal.goalName} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{goal.goalName}</span>
                    <span className="text-muted-foreground">
                      {formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}
                    </span>
                  </div>
                  <Progress value={Math.min(goal.progress, 100)} />
                  <p className="text-xs text-muted-foreground">{formatPercent(goal.progress)} complete</p>
                </div>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No goals set yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {recentTransactions.map((tx, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{tx.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {tx.category} · {formatDate(tx.transactionDate)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={tx.type === 'INCOME' ? 'font-semibold text-emerald-600' : 'font-semibold'}>
                        {tx.type === 'INCOME' ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {tx.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">No recent transactions</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="size-4 text-amber-500" />
              Quick Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            {insights.length > 0 ? (
              <ul className="space-y-3">
                {insights.map((insight, i) => (
                  <li key={i} className="rounded-lg bg-muted/50 px-4 py-3 text-sm leading-relaxed">
                    {insight}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-8 text-center text-sm text-muted-foreground">Insights will appear as you add data</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
