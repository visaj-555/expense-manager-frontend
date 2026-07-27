export const queryKeys = {
  dashboard: ['dashboard'] as const,
  accounts: {
    all: ['accounts'] as const,
    list: (params?: Record<string, unknown>) => ['accounts', 'list', params] as const,
    detail: (id: string) => ['accounts', 'detail', id] as const,
  },
  categories: {
    all: ['categories'] as const,
    list: (params?: Record<string, unknown>) => ['categories', 'list', params] as const,
    detail: (id: string) => ['categories', 'detail', id] as const,
  },
  transactions: {
    all: ['transactions'] as const,
    list: (params?: Record<string, unknown>) => ['transactions', 'list', params] as const,
    detail: (id: string) => ['transactions', 'detail', id] as const,
  },
  goals: {
    all: ['goals'] as const,
    list: (params?: Record<string, unknown>) => ['goals', 'list', params] as const,
    detail: (id: string) => ['goals', 'detail', id] as const,
  },
  analytics: {
    monthly: (month: number, year: number) => ['analytics', 'monthly', month, year] as const,
    yearly: (year: number) => ['analytics', 'yearly', year] as const,
    categoryTrend: (categoryId: string) => ['analytics', 'category-trend', categoryId] as const,
    cashflow: ['analytics', 'cashflow'] as const,
    topExpenses: ['analytics', 'top-expenses'] as const,
  },
}
