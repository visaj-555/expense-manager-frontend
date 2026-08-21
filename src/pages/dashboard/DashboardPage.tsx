import { useState } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  Landmark,
  Lightbulb,
  PiggyBank,
  SlidersHorizontal,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { ChartCard, AccountDistributionChart, CategoryBarChart, SpendingTrendChart } from '@/components/charts/FinanceCharts'
import { PageHeader, StatCard } from '@/components/shared/PageHeader'
import { ErrorState } from '@/components/shared/States'
import { SetBalanceDialog } from '@/features/accounts/components/SetBalanceDialog'
import { CustomizeDashboardDialog } from '@/features/dashboard/components/CustomizeDashboardDialog'
import { useAccounts, useUpdateAccount } from '@/features/accounts/hooks/useAccounts'
import { useDashboardCards } from '@/features/dashboard/hooks/useDashboardCards'
import { useDashboard } from '@/features/dashboard/hooks/useDashboard'
import { formatCurrency, formatDate, formatPercent } from '@/lib/utils'
import type { Account } from '@/types/account.types'
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
  const { data: accountsData } = useAccounts({ page: 1, limit: 100, isArchived: false })
  const updateAccount = useUpdateAccount()
  const { visibility, setCard, reset, enabledCount } = useDashboardCards()
  const [balanceAccount, setBalanceAccount] = useState<Account | null>(null)
  const [customizeOpen, setCustomizeOpen] = useState(false)

  if (isLoading) return <DashboardSkeleton />

  if (isError || !data) {
    return <ErrorState message={getErrorMessage(error)} onRetry={() => refetch()} />
  }

  const { overview, accountDistribution, monthlySummary, recentTransactions, goalsProgress, spendingTrend, insights } = data
  const accounts = accountsData?.data ?? []
  const bankAccounts = accounts.filter((account) => account.type === 'BANK')
  const cashAccounts = accounts.filter((account) => account.type === 'WALLET')
  const bankAccount = bankAccounts.length === 1 ? bankAccounts[0] : null
  const cashAccount = cashAccounts.length === 1 ? cashAccounts[0] : null

  const handleSetBalance = (currentBalance: number) => {
    if (!balanceAccount) return
    updateAccount.mutate(
      { id: balanceAccount.id, payload: { currentBalance } },
      {
        onSuccess: () => {
          toast.success(`Saved ${formatCurrency(currentBalance)} as today's amount`)
          setBalanceAccount(null)
        },
        onError: (err) => toast.error(getErrorMessage(err)),
      },
    )
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Tap a balance to hardcode what you have now. Catch-up expenses will not rewrite it."
        action={
          <Button type="button" variant="outline" onClick={() => setCustomizeOpen(true)}>
            <SlidersHorizontal className="size-4" />
            Customize
          </Button>
        }
      />

      {enabledCount === 0 ? (
        <p className="rounded-xl border border-dashed px-4 py-10 text-center text-sm text-muted-foreground">
          Every card is hidden.{' '}
          <button type="button" className="font-medium text-primary underline-offset-4 hover:underline" onClick={reset}>
            Show all
          </button>
        </p>
      ) : null}

      {visibility.currentBalance ||
      visibility.cash ||
      visibility.fd ||
      visibility.monthlyIncome ||
      visibility.monthlyExpense ||
      visibility.monthlySavings ||
      visibility.netCashFlow ||
      visibility.investments ? (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {visibility.currentBalance ? (
          <StatCard
            title="Current Balance"
            value={formatCurrency(overview.currentBalance)}
            icon={Wallet}
            description={bankAccount ? 'Tap to set what the bank shows' : 'From bank accounts'}
            onClick={bankAccount ? () => setBalanceAccount(bankAccount) : undefined}
          />
        ) : null}
        {visibility.cash ? (
          <StatCard
            title="Current Cash Balance"
            value={formatCurrency(overview.currentWalletBalance)}
            icon={Banknote}
            description={cashAccount ? 'Tap after you count cash' : 'Cash in hand'}
            onClick={cashAccount ? () => setBalanceAccount(cashAccount) : undefined}
          />
        ) : null}
        {visibility.fd ? (
          <StatCard
            title="Fixed Deposits"
            value={formatCurrency(overview.currentFdBalance ?? 0)}
            icon={Landmark}
            description="Live value · grows when you open the app"
          />
        ) : null}
        {visibility.monthlyIncome ? (
          <StatCard
            title="Monthly Income"
            value={formatCurrency(overview.monthlyIncome)}
            icon={ArrowUpRight}
            trend={{ value: 'This month', positive: true }}
          />
        ) : null}
        {visibility.monthlyExpense ? (
          <StatCard
            title="Monthly Expenses"
            value={formatCurrency(overview.monthlyExpense)}
            icon={ArrowDownRight}
            trend={{ value: 'This month', positive: false }}
          />
        ) : null}
        {visibility.monthlySavings ? (
          <StatCard
            title="Monthly Savings"
            value={formatCurrency(overview.monthlySavings)}
            icon={PiggyBank}
            description={`${formatPercent(overview.savingsRate)} savings rate`}
          />
        ) : null}
        {visibility.netCashFlow ? (
          <StatCard title="Net Cash Flow" value={formatCurrency(overview.netCashFlow)} icon={TrendingUp} />
        ) : null}
        {visibility.investments ? (
          <StatCard
            title="Investments"
            value={formatCurrency(overview.monthlyInvestments)}
            icon={Target}
            description="Total SIP"
          />
        ) : null}
      </div>
      ) : null}

      {visibility.spendingTrend || visibility.accountDistribution ? (
      <div className="grid gap-6 lg:grid-cols-2">
        {visibility.spendingTrend ? (
          <ChartCard title="Spending Trend" description="Monthly expenses over time">
            {spendingTrend.length > 0 ? (
              <SpendingTrendChart data={spendingTrend} />
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">No spending data yet</p>
            )}
          </ChartCard>
        ) : null}

        {visibility.accountDistribution ? (
          <ChartCard title="Account Distribution" description="Balance by account">
            {accountDistribution.length > 0 ? (
              <AccountDistributionChart data={accountDistribution} />
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">No accounts yet</p>
            )}
          </ChartCard>
        ) : null}
      </div>
      ) : null}

      {visibility.topCategories || visibility.goals ? (
      <div className="grid gap-6 lg:grid-cols-2">
        {visibility.topCategories ? (
          <ChartCard title="Top Categories" description="Biggest expense categories this month (all-time if none yet)">
            {monthlySummary.topCategories.length > 0 ? (
              <CategoryBarChart data={monthlySummary.topCategories} />
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">No category data yet</p>
            )}
          </ChartCard>
        ) : null}

        {visibility.goals ? (
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
        ) : null}
      </div>
      ) : null}

      {visibility.recentTransactions || visibility.insights ? (
      <div className="grid gap-6 lg:grid-cols-2">
        {visibility.recentTransactions ? (
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
        ) : null}

        {visibility.insights ? (
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
        ) : null}
      </div>
      ) : null}
      <SetBalanceDialog
        open={Boolean(balanceAccount)}
        onOpenChange={(open) => {
          if (!open) setBalanceAccount(null)
        }}
        account={balanceAccount}
        onSubmit={handleSetBalance}
        isLoading={updateAccount.isPending}
      />
      <CustomizeDashboardDialog
        open={customizeOpen}
        onOpenChange={setCustomizeOpen}
        visibility={visibility}
        onToggle={setCard}
        onReset={reset}
      />
    </div>
  )
}
