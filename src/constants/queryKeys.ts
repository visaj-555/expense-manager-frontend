export const queryKeys = {
  dashboard: ['dashboard'] as const,
  accounts: {
    all: ['accounts'] as const,
    list: (params?: object) => ['accounts', 'list', params] as const,
    detail: (id: string) => ['accounts', 'detail', id] as const,
  },
  categories: {
    all: ['categories'] as const,
    list: (params?: object) => ['categories', 'list', params] as const,
    detail: (id: string) => ['categories', 'detail', id] as const,
  },
  transactions: {
    all: ['transactions'] as const,
    list: (params?: object) => ['transactions', 'list', params] as const,
    detail: (id: string) => ['transactions', 'detail', id] as const,
  },
  goals: {
    all: ['goals'] as const,
    list: (params?: object) => ['goals', 'list', params] as const,
    detail: (id: string) => ['goals', 'detail', id] as const,
  },
  analytics: {
    all: ['analytics'] as const,
    monthly: (month: number, year: number) => ['analytics', 'monthly', month, year] as const,
    yearly: (year: number) => ['analytics', 'yearly', year] as const,
    categoryTrend: (categoryId: string) => ['analytics', 'category-trend', categoryId] as const,
    cashflow: ['analytics', 'cashflow'] as const,
    topExpenses: ['analytics', 'top-expenses'] as const,
    deep: (params?: object) => ['analytics', 'deep', params] as const,
  },
  transfers: {
    all: ['transfers'] as const,
    list: (params?: object) => ['transfers', 'list', params] as const,
    detail: (id: string) => ['transfers', 'detail', id] as const,
  },
  automations: {
    all: ['automations'] as const,
    list: (params?: object) => ['automations', 'list', params] as const,
    detail: (id: string) => ['automations', 'detail', id] as const,
  },
}
