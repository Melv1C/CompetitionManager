import { ThemeProvider } from '@/features/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy } from 'react';
import { MainLayout } from './components/layout';
import { RequireAuth } from './features/auth/components/require-auth';
import { RequireCompetition } from './features/competitions/components/require-competition';
import { SocketStatusViewer } from './features/socket';
import { env } from './lib/env';
import { Toaster } from '@repo/ui';

// Static import mapping for Vite's build-time analysis
const pageImports = {
  // Main pages
  Home: () => import('./pages/Home'),
};

// Helper function to create lazy components from static imports
function createLazyComponent(key: keyof typeof pageImports) {
  return lazy(pageImports[key]);
}

const Home = createLazyComponent('Home');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <MainLayout>
          <RequireAuth>
            <RequireCompetition>
              <Home />
            </RequireCompetition>
          </RequireAuth>
        </MainLayout>
        <Toaster />
        {env.VITE_SHOW_SOCKET_STATUS && <SocketStatusViewer />}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
