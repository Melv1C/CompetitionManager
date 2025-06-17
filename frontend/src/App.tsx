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
import { lazy, Suspense } from 'react';

const loadPage = (path: string, namedExport?: string) =>
  lazy(() =>
    import(`${path}`).then((m) => ({ default: namedExport ? m[namedExport] : m.default }))
  );

const Home = loadPage('./pages/Home');
const NotFound = loadPage('./pages/NotFound');
const SignInPage = loadPage('./pages/SignIn', 'SignInPage');
const SignUpPage = loadPage('./pages/SignUp', 'SignUpPage');

const AdminDashboard = loadPage('./pages/admin/AdminDashboard', 'AdminDashboard');
const AdminUsers = loadPage('./pages/admin/admin-users', 'AdminUsers');
const AdminOrganizations = loadPage('./pages/admin/admin-organizations', 'AdminOrganizations');
const AdminDatabase = loadPage('./pages/admin/AdminDatabase', 'AdminDatabase');
const AdminLogs = loadPage('./pages/admin/admin-logs', 'AdminLogs');
const AdminAnalytics = loadPage('./pages/admin/AdminAnalytics', 'AdminAnalytics');
const AdminSettings = loadPage('./pages/admin/AdminSettings', 'AdminSettings');

const OrganizationDashboard = loadPage('./pages/organization/organization-dashboard', 'OrganizationDashboard');
const OrganizationCompetitions = loadPage('./pages/organization/organization-competitions', 'OrganizationCompetitions');
const OrganizationMembers = loadPage('./pages/organization/organization-members', 'OrganizationMembers');
const OrganizationAnalytics = loadPage('./pages/organization/organization-analytics', 'OrganizationAnalytics');
const OrganizationSettings = loadPage('./pages/organization/organization-settings', 'OrganizationSettings');
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
        <Suspense fallback={<div>Loading...</div>}>
          <RouterProvider router={router} />
        </Suspense>
        <Toaster />
        {/* <SocketStatusViewer /> */}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
