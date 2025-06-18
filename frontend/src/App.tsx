import {
  AdminLayout,
  AdminSkeleton,
  MainLayout,
  OrganizationLayout,
  OrganizationSkeleton,
} from '@/components/layout';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/features/theme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy, Suspense } from 'react';
import {
  createBrowserRouter,
  Outlet,
  RouterProvider,
  useNavigate,
} from 'react-router-dom';
import { useAuth } from './features/auth/hooks/use-auth';
import { useOrganizations } from './features/organization';

// Static import mapping for Vite's build-time analysis
const pageImports = {
  // Main pages
  Home: () => import('./pages/Home'),
  NotFound: () => import('./pages/NotFound'),
  SignIn: () =>
    import('./pages/SignIn').then((m) => ({ default: m.SignInPage })),
  SignUp: () =>
    import('./pages/SignUp').then((m) => ({ default: m.SignUpPage })),

  // Admin pages
  AdminDashboard: () =>
    import('./pages/admin/AdminDashboard').then((m) => ({
      default: m.AdminDashboard,
    })),
  AdminUsers: () =>
    import('./pages/admin/admin-users').then((m) => ({
      default: m.AdminUsers,
    })),
  AdminOrganizations: () =>
    import('./pages/admin/admin-organizations').then((m) => ({
      default: m.AdminOrganizations,
    })),
  AdminDatabase: () =>
    import('./pages/admin/AdminDatabase').then((m) => ({
      default: m.AdminDatabase,
    })),
  AdminLogs: () =>
    import('./pages/admin/admin-logs').then((m) => ({ default: m.AdminLogs })),
  AdminAnalytics: () =>
    import('./pages/admin/AdminAnalytics').then((m) => ({
      default: m.AdminAnalytics,
    })),
  AdminSettings: () =>
    import('./pages/admin/AdminSettings').then((m) => ({
      default: m.AdminSettings,
    })),

  // Organization pages
  OrganizationDashboard: () =>
    import('./pages/organization/organization-dashboard').then((m) => ({
      default: m.OrganizationDashboard,
    })),
  OrganizationCompetitions: () =>
    import('./pages/organization/organization-competitions').then((m) => ({
      default: m.OrganizationCompetitions,
    })),
  OrganizationMembers: () =>
    import('./pages/organization/organization-members').then((m) => ({
      default: m.OrganizationMembers,
    })),
  OrganizationAnalytics: () =>
    import('./pages/organization/organization-analytics').then((m) => ({
      default: m.OrganizationAnalytics,
    })),
  OrganizationSettings: () =>
    import('./pages/organization/organization-settings').then((m) => ({
      default: m.OrganizationSettings,
    })),
} as const;

// Helper function to create lazy components from static imports
function createLazyComponent(key: keyof typeof pageImports) {
  return lazy(pageImports[key]);
}

// Create lazy components
const Home = createLazyComponent('Home');
const NotFound = createLazyComponent('NotFound');
const SignInPage = createLazyComponent('SignIn');
const SignUpPage = createLazyComponent('SignUp');

const AdminDashboard = createLazyComponent('AdminDashboard');
const AdminUsers = createLazyComponent('AdminUsers');
const AdminOrganizations = createLazyComponent('AdminOrganizations');
const AdminDatabase = createLazyComponent('AdminDatabase');
const AdminLogs = createLazyComponent('AdminLogs');
const AdminAnalytics = createLazyComponent('AdminAnalytics');
const AdminSettings = createLazyComponent('AdminSettings');

const OrganizationDashboard = createLazyComponent('OrganizationDashboard');
const OrganizationCompetitions = createLazyComponent(
  'OrganizationCompetitions'
);
const OrganizationMembers = createLazyComponent('OrganizationMembers');
const OrganizationAnalytics = createLazyComponent('OrganizationAnalytics');
const OrganizationSettings = createLazyComponent('OrganizationSettings');
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

// Loading skeleton component for page transitions
function PageLoadingSkeleton() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header skeleton */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Skeleton className="h-6 w-32" />
          <div className="ml-auto flex items-center space-x-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-8 w-20" />
          </div>
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 container mx-auto px-4 py-6">
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </div>

  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <Suspense fallback={<PageLoadingSkeleton />}>
          <RouterProvider router={router} />
        </Suspense>
        <Toaster />
        {/* <SocketStatusViewer /> */}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
