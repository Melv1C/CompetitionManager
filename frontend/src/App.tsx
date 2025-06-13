import { MainLayout } from '@/components/layout';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/features/theme';
import { Outlet } from 'react-router-dom';

function App() {
  return (
    <ThemeProvider>
      <MainLayout>
        <Outlet />
      </MainLayout>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
