import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClient, QueryClientProvider } from 'react-query'
import App from './App'
import './index.css'
import './i18n'
import { SupabaseProvider } from './contexts/SupabaseContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: (failureCount, error: any) => {
        // Don't retry on timeout errors to prevent flash/loading loops
        if (error?.message?.includes('zaman aşımı') || error?.message?.includes('timeout')) {
          return false;
        }
        return failureCount < 1;
      },
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <SupabaseProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </SupabaseProvider>
    </QueryClientProvider>
  </HelmetProvider>,
)
