import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClient, QueryClientProvider } from 'react-query'
import App from './App'
import './index.css'
import { SupabaseProvider } from './contexts/SupabaseContext'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <SupabaseProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </SupabaseProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </React.StrictMode>,
)
