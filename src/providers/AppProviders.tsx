import { Provider } from 'react-redux'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { queryClient } from '@/lib/queryClient'
import { store } from '@/store'
import AppRoutes from '@/routes/AppRoutes'

export default function AppProviders() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <AppRoutes />
        <Toaster richColors position="top-right" />
      </QueryClientProvider>
    </Provider>
  )
}
