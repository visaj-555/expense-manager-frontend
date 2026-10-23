import * as XLSX from 'xlsx'
import type { DeepInsights } from '@/types/analytics.types'

function sheet(rows: Record<string, unknown>[], emptyMessage: string) {
  if (rows.length === 0) {
    return XLSX.utils.aoa_to_sheet([[emptyMessage]])
  }
  return XLSX.utils.json_to_sheet(rows)
}

export function deepInsightsToExcel(data: DeepInsights) {
  const workbook = XLSX.utils.book_new()
  const { summary, period } = data

  const overview = XLSX.utils.aoa_to_sheet([
    ['Expense Manager — Deep Analysis'],
    ['Period', period.label],
    ['Type', period.type === 'MONTHLY' ? 'Monthly' : 'Yearly'],
    ['From', period.start],
    ['To', period.end],
    ['Generated', new Date().toISOString()],
    [],
    ['Income', summary.income],
    ['Expenses', summary.expense],
    ['Net cashflow', summary.net],
    ['Savings rate %', summary.savingsRate],
    ['Income vs last period %', summary.incomeChangePct],
    ['Expense vs last period %', summary.expenseChangePct],
    ['Net vs last period %', summary.netChangePct],
    ['Transactions', summary.transactionCount],
    ['Expense count', summary.expenseCount],
    ['Income count', summary.incomeCount],
    ['Average daily spend', summary.avgDailySpend],
    ['Average expense', summary.avgExpense],
    ['Largest expense', summary.largestExpense?.title ?? ''],
    ['Largest amount', summary.largestExpense?.amount ?? ''],
    [],
    ['Previous income', data.previous.income],
    ['Previous expenses', data.previous.expense],
    ['Previous net', data.previous.net],
    [],
    ['Internal transfers count', data.transfers.count],
    ['Internal transfers amount', data.transfers.amount],
  ])

  XLSX.utils.book_append_sheet(workbook, overview, 'Summary')
  XLSX.utils.book_append_sheet(
    workbook,
    sheet(
      data.insights.map((item) => ({ Tone: item.tone, Insight: item.text })),
      'No insights for this period',
    ),
    'Insights',
  )
  XLSX.utils.book_append_sheet(
    workbook,
    sheet(
      data.categories.map((item) => ({
        Category: item.name,
        Amount: item.amount,
        SharePercent: item.percentage,
        Transactions: item.count,
        Average: item.avgAmount,
      })),
      'No expense categories',
    ),
    'Expense categories',
  )
  XLSX.utils.book_append_sheet(
    workbook,
    sheet(
      data.incomeSources.map((item) => ({
        Source: item.name,
        Amount: item.amount,
        SharePercent: item.percentage,
        Credits: item.count,
      })),
      'No income sources',
    ),
    'Income sources',
  )
  XLSX.utils.book_append_sheet(
    workbook,
    sheet(
      data.trend.map((item) => ({
        Period: item.label,
        Income: item.income,
        Expense: item.expense,
        Net: item.net,
        SavingsRatePercent: item.savingsRate,
      })),
      'No trend data',
    ),
    period.type === 'YEARLY' ? 'Monthly trend' : 'Trailing 12 months',
  )
  if (period.type === 'MONTHLY') {
    XLSX.utils.book_append_sheet(
      workbook,
      sheet(
        data.daily.map((item) => ({
          Date: item.date,
          Day: item.day,
          Income: item.income,
          Expense: item.expense,
          Net: item.net,
        })),
        'No daily activity',
      ),
      'Daily cashflow',
    )
  }
  XLSX.utils.book_append_sheet(
    workbook,
    sheet(
      data.weekday.map((item) => ({
        Weekday: item.weekday,
        Spend: item.amount,
        Transactions: item.count,
      })),
      'No weekday data',
    ),
    'Weekday spend',
  )
  XLSX.utils.book_append_sheet(
    workbook,
    sheet(
      data.accounts.map((item) => ({
        Account: item.name,
        Type: item.type,
        Outflow: item.outflow,
        Inflow: item.inflow,
      })),
      'No account activity',
    ),
    'Account flows',
  )
  XLSX.utils.book_append_sheet(
    workbook,
    sheet(
      data.topExpenses.map((item) => ({
        Title: item.title,
        Amount: item.amount,
        Category: item.category,
        Account: item.account,
        Date: item.date,
      })),
      'No top expenses',
    ),
    'Top expenses',
  )

  return XLSX.write(workbook, { bookType: 'xlsx', type: 'array' }) as ArrayBuffer
}

export function deepReportFilename(data: DeepInsights) {
  const { period } = data
  if (period.type === 'MONTHLY' && period.month) {
    return `deep-analysis-${period.year}-${String(period.month).padStart(2, '0')}.xlsx`
  }
  return `deep-analysis-${period.year}.xlsx`
}
