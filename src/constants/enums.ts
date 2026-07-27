import type { AccountType, CategoryType, PaymentMethod, TransactionType } from './enums'

export const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  CASH: 'Cash',
  BANK: 'Bank',
  CREDIT_CARD: 'Credit Card',
  SAVINGS: 'Savings',
  INVESTMENT: 'Investment',
  WALLET: 'Wallet',
}

export const CATEGORY_TYPE_LABELS: Record<CategoryType, string> = {
  EXPENSE: 'Expense',
  INCOME: 'Income',
}

export const TRANSACTION_TYPE_LABELS: Record<TransactionType, string> = {
  INCOME: 'Income',
  EXPENSE: 'Expense',
  TRANSFER: 'Transfer',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: 'Cash',
  UPI: 'UPI',
  CREDIT_CARD: 'Credit Card',
  DEBIT_CARD: 'Debit Card',
  NET_BANKING: 'Net Banking',
  WALLET: 'Wallet',
}

export const CHART_COLORS = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  '#14b8a6',
  '#6366f1',
  '#f59e0b',
  '#ec4899',
  '#8b5cf6',
]

export const DEFAULT_PAGE_SIZE = 10
