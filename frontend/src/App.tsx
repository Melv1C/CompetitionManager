import { AdminLayout, MainLayout } from '@/components/layout';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/features/theme';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import {
  AdminAnalytics,
  AdminCompetitions,
  AdminDashboard,
  AdminParticipants,
  AdminSettings,
  Home,
  NotFound,
  SignInPage,
  SignUpPage,
} from './pages';

// Main App Layout Component
function MainApp() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  );
}

// Admin App Layout Component
function AdminApp() {
  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainApp />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'competitions',
        element: <div>Competitions</div>,
      },
      {
        path: 'participants',
        element: <div>Participants</div>,
      },
      {
        path: 'results',
        element: <div>Results</div>,
      },
      {
        path: 'login',
        element: <SignInPage />,
      },
      {
        path: 'signup',
        element: <SignUpPage />,
      },
    ],
  },
  {
    path: '/admin',
    element: <AdminApp />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: 'competitions',
        element: <AdminCompetitions />,
      },
      {
        path: 'participants',
        element: <AdminParticipants />,
      },
      {
        path: 'analytics',
        element: <AdminAnalytics />,
      },
      {
        path: 'settings',
        element: <AdminSettings />,
      },
    ],
  },
]);

function App() {
  return (
    <ThemeProvider>
      <RouterProvider router={router} />
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
