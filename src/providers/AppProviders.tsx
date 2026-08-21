import { Provider } from 'react-redux'
import { QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from 'sonner'
import { queryClient } from '@/lib/queryClient'
import { store } from '@/store'
import AppRoutes from '@/routes/AppRoutes'
import { ThemeProvider, useTheme } from '@/features/theme/ThemeProvider'

function ThemedToaster() {
  const { resolved } = useTheme()
  return <Toaster richColors position="top-right" theme={resolved} />
}

export default function AppProviders() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AppRoutes />
          <ThemedToaster />
        </ThemeProvider>
      </QueryClientProvider>
    </Provider>
  )
}
