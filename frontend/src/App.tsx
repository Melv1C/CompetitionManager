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

const Home = lazy(() => import('./pages/Home'));
const NotFound = lazy(() => import('./pages/NotFound'));
const SignInPage = lazy(() =>
  import('./pages/SignIn').then((m) => ({ default: m.SignInPage }))
);
const SignUpPage = lazy(() =>
  import('./pages/SignUp').then((m) => ({ default: m.SignUpPage }))
);

const AdminDashboard = lazy(() =>
  import('./pages/admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard }))
);
const AdminUsers = lazy(() =>
  import('./pages/admin/admin-users').then((m) => ({ default: m.AdminUsers }))
);
const AdminOrganizations = lazy(() =>
  import('./pages/admin/admin-organizations').then((m) => ({ default: m.AdminOrganizations }))
);
const AdminDatabase = lazy(() =>
  import('./pages/admin/AdminDatabase').then((m) => ({ default: m.AdminDatabase }))
);
const AdminLogs = lazy(() =>
  import('./pages/admin/admin-logs').then((m) => ({ default: m.AdminLogs }))
);
const AdminAnalytics = lazy(() =>
  import('./pages/admin/AdminAnalytics').then((m) => ({ default: m.AdminAnalytics }))
);
const AdminSettings = lazy(() =>
  import('./pages/admin/AdminSettings').then((m) => ({ default: m.AdminSettings }))
);

const OrganizationDashboard = lazy(() =>
  import('./pages/organization/organization-dashboard').then((m) => ({ default: m.OrganizationDashboard }))
);
const OrganizationCompetitions = lazy(() =>
  import('./pages/organization/organization-competitions').then((m) => ({ default: m.OrganizationCompetitions }))
);
const OrganizationMembers = lazy(() =>
  import('./pages/organization/organization-members').then((m) => ({ default: m.OrganizationMembers }))
);
const OrganizationAnalytics = lazy(() =>
  import('./pages/organization/organization-analytics').then((m) => ({ default: m.OrganizationAnalytics }))
);
const OrganizationSettings = lazy(() =>
  import('./pages/organization/organization-settings').then((m) => ({ default: m.OrganizationSettings }))
);

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
