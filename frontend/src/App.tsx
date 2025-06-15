import {
  AdminLayout,
  AdminSkeleton,
  MainLayout,
  OrganizationLayout,
  OrganizationSkeleton,
} from '@/components/layout';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/features/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useNavigate,
} from 'react-router-dom';
import { useAuth } from './features/auth/hooks/use-auth';
import { useOrganizations } from './features/organization';
import {
  AdminAnalytics,
  AdminDashboard,
  AdminDatabase,
  AdminLogs,
  AdminSettings,
  Home,
  NotFound,
  SignInPage,
  SignUpPage,
} from './pages';
import { AdminOrganizations } from './pages/admin/admin-organizations';
import { AdminUsers } from './pages/admin/admin-users';
import {
  OrganizationAnalytics,
  OrganizationCompetitions,
  OrganizationDashboard,
  OrganizationMembers,
  OrganizationSettings,
} from './pages/organization';

// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

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
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return <AdminSkeleton />;
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  if (user.role !== 'admin') {
    navigate('/');
    return null;
  }

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}

// Organization App Layout Component
function OrganizationApp() {
  const { organizations, isLoadingOrganizations } = useOrganizations();
  const navigate = useNavigate();

  if (isLoadingOrganizations) {
    return <OrganizationSkeleton />;
  }

  if (organizations.length === 0) {
    navigate('/');
    return null;
  }

  return (
    <OrganizationLayout>
      <Outlet />
    </OrganizationLayout>
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
    path: '/organization',
    element: <OrganizationApp />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <OrganizationDashboard />,
      },
      {
        path: 'competitions',
        element: <OrganizationCompetitions />,
      },
      {
        path: 'members',
        element: <OrganizationMembers />,
      },
      {
        path: 'analytics',
        element: <OrganizationAnalytics />,
      },
      {
        path: 'settings',
        element: <OrganizationSettings />,
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
        path: 'users',
        element: <AdminUsers />,
      },
      {
        path: 'organizations',
        element: <AdminOrganizations />,
      },
      {
        path: 'database',
        element: <AdminDatabase />,
      },
      {
        path: 'logs',
        element: <AdminLogs />,
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
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} />
        <Toaster />
        {/* <SocketStatusViewer /> */}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
