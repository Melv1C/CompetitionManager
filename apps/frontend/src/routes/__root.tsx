import { Footer, Header } from '@/features/layout';
import { ThemeProvider } from '@/features/theme';
import i18n from '@/libs/i18n';
import { TranslationProvider } from '@melv1c/ui-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { createRootRoute, Outlet } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';

const queryClient = new QueryClient();

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <QueryClientProvider client={queryClient}>
      <TranslationProvider i18n={i18n}>
        <ThemeProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 container mx-auto px-4 py-6">
              <Outlet />
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </TranslationProvider>
      <ReactQueryDevtools initialIsOpen={false} />
      <TanStackRouterDevtools />
    </QueryClientProvider>
  );
}
