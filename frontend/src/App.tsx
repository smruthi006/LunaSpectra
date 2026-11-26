import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { shouldRetrySafeGet } from './api/queries';
import { AppShell } from './components/layout/AppShell';
import { AppRoutes } from './routes/AppRoutes';

const defaultQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: shouldRetrySafeGet,
      refetchOnWindowFocus: false,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={defaultQueryClient}>
      <BrowserRouter>
        <AppShell>
          <AppRoutes />
        </AppShell>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
