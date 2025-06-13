import { Outlet } from 'react-router-dom';
import { MainLayout } from './components/layout';
import { ThemeProvider } from './components/theme/theme-provider';

function App() {
  return (
    <ThemeProvider>
      <MainLayout>
        <Outlet />
      </MainLayout>
    </ThemeProvider>
  );
}

export default App;
