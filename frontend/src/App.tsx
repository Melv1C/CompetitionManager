import {
  AdminLayout,
  CompetitionLayout,
  MainLayout,
  OrganizationLayout,
} from '@/components/layout';
import { Toaster } from '@/components/ui/sonner';
import { SocketStatusViewer } from '@/features/socket';
import { ThemeProvider } from '@/features/theme';
import { env } from '@/lib/env';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { lazy } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { OrganizationCompetitionOutlet } from './features/organization-competitions';

// Static import mapping for Vite's build-time analysis
const pageImports = {
  // Main pages
  Home: () => import('./pages/Home'),
  NotFound: () => import('./pages/NotFound'),
  SignIn: () => import('./pages/SignIn').then(m => ({ default: m.SignInPage })),
  SignUp: () => import('./pages/SignUp').then(m => ({ default: m.SignUpPage })),
  Competitions: () =>
    import('./pages/Competitions').then(m => ({
      default: m.CompetitionsPage,
    })),
  Results: () => import('./pages/Results').then(m => ({ default: m.ResultsPage })),

  // Competition sub-pages
  CompetitionHome: () =>
    import('./pages/competition/home').then(m => ({
      default: m.CompetitionHomePage,
    })),
  CompetitionSchedule: () =>
    import('./pages/competition/schedule').then(m => ({
      default: m.CompetitionSchedulePage,
    })),
  CompetitionParticipants: () =>
    import('./pages/competition/participants').then(m => ({
      default: m.CompetitionParticipantsPage,
    })),
  CompetitionResults: () =>
    import('./pages/competition/results').then(m => ({
      default: m.CompetitionResultsPage,
    })),
  CompetitionRegister: () =>
    import('./pages/competition/register').then(m => ({
      default: m.CompetitionRegisterPage,
    })),

  // Admin pages
  AdminDashboard: () =>
    import('./pages/admin/AdminDashboard').then(m => ({
      default: m.AdminDashboard,
    })),
  AdminUsers: () =>
    import('./pages/admin/admin-users').then(m => ({
      default: m.AdminUsers,
    })),
  AdminOrganizations: () =>
    import('./pages/admin/admin-organizations').then(m => ({
      default: m.AdminOrganizations,
    })),
  AdminDatabase: () =>
    import('./pages/admin/AdminDatabase').then(m => ({
      default: m.AdminDatabase,
    })),
  AdminLogs: () => import('./pages/admin/admin-logs').then(m => ({ default: m.AdminLogs })),
  AdminAnalytics: () =>
    import('./pages/admin/AdminAnalytics').then(m => ({
      default: m.AdminAnalytics,
    })),
  AdminSettings: () =>
    import('./pages/admin/AdminSettings').then(m => ({
      default: m.AdminSettings,
    })),

  // Organization pages
  OrganizationDashboard: () =>
    import('./pages/organization/organization-dashboard').then(m => ({
      default: m.OrganizationDashboard,
    })),
  OrganizationCompetitions: () =>
    import('./pages/organization/organization-competitions').then(m => ({
      default: m.OrganizationCompetitions,
    })),
  OrganizationMembers: () =>
    import('./pages/organization/organization-members').then(m => ({
      default: m.OrganizationMembers,
    })),
  OrganizationAnalytics: () =>
    import('./pages/organization/organization-analytics').then(m => ({
      default: m.OrganizationAnalytics,
    })),
  OrganizationSettings: () =>
    import('./pages/organization/organization-settings').then(m => ({
      default: m.OrganizationSettings,
    })),
  OrganizationCompetitionOverview: () =>
    import('./pages/organization/competition/overview').then(m => ({
      default: m.CompetitionOverview,
    })),
  OrganizationCompetitionInscriptions: () =>
    import('./pages/organization/competition/inscriptions').then(m => ({
      default: m.CompetitionInscriptions,
    })),
  OrganizationCompetitionConfirmations: () =>
    import('./pages/organization/competition/confirmations').then(m => ({
      default: m.CompetitionConfirmations,
    })),
  OrganizationCompetitionEvents: () =>
    import('./pages/organization/competition/events').then(m => ({
      default: m.CompetitionEvents,
    })),
  OrganizationCompetitionResults: () =>
    import('./pages/organization/competition/results').then(m => ({
      default: m.CompetitionResults,
    })),
  OrganizationCompetitionSettings: () =>
    import('./pages/organization/competition/settings').then(m => ({
      default: m.CompetitionSettings,
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
const CompetitionsPage = createLazyComponent('Competitions');
const ResultsPage = createLazyComponent('Results');

// Competition sub-pages
const CompetitionHomePage = createLazyComponent('CompetitionHome');
const CompetitionSchedulePage = createLazyComponent('CompetitionSchedule');
const CompetitionParticipantsPage = createLazyComponent('CompetitionParticipants');
const CompetitionResultsPageSub = createLazyComponent('CompetitionResults');
const CompetitionRegisterPage = createLazyComponent('CompetitionRegister');

const AdminDashboard = createLazyComponent('AdminDashboard');
const AdminUsers = createLazyComponent('AdminUsers');
const AdminOrganizations = createLazyComponent('AdminOrganizations');
const AdminDatabase = createLazyComponent('AdminDatabase');
const AdminLogs = createLazyComponent('AdminLogs');
const AdminAnalytics = createLazyComponent('AdminAnalytics');
const AdminSettings = createLazyComponent('AdminSettings');

const OrganizationDashboard = createLazyComponent('OrganizationDashboard');
const OrganizationCompetitions = createLazyComponent('OrganizationCompetitions');
const OrganizationMembers = createLazyComponent('OrganizationMembers');
const OrganizationAnalytics = createLazyComponent('OrganizationAnalytics');
const OrganizationSettings = createLazyComponent('OrganizationSettings');
const OrganizationCompetitionOverview = createLazyComponent('OrganizationCompetitionOverview');
const OrganizationCompetitionInscriptions = createLazyComponent(
  'OrganizationCompetitionInscriptions',
);
const OrganizationCompetitionConfirmations = createLazyComponent(
  'OrganizationCompetitionConfirmations',
);
const OrganizationCompetitionEvents = createLazyComponent('OrganizationCompetitionEvents');
const OrganizationCompetitionResults = createLazyComponent('OrganizationCompetitionResults');
const OrganizationCompetitionSettings = createLazyComponent('OrganizationCompetitionSettings');
// Create a QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: 'competitions',
        element: <CompetitionsPage />,
      },
      {
        path: 'competitions/:competitionEid',
        element: <CompetitionLayout />,
        children: [
          {
            index: true,
            element: <CompetitionHomePage />,
          },
          {
            path: 'schedule',
            element: <CompetitionSchedulePage />,
          },
          {
            path: 'participants',
            element: <CompetitionParticipantsPage />,
          },
          {
            path: 'results',
            element: <CompetitionResultsPageSub />,
          },
          {
            path: 'register',
            element: <CompetitionRegisterPage />,
          },
        ],
      },
      {
        path: 'results',
        element: <ResultsPage />,
      },
      {
        path: 'auth/sign-in',
        element: <SignInPage />,
      },
      {
        path: 'auth/sign-up',
        element: <SignUpPage />,
      },
    ],
  },
  {
    path: '/organization',
    element: <OrganizationLayout />,
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
        path: 'competitions/:competitionEid',
        element: <OrganizationCompetitionOutlet />,
        children: [
          { index: true, element: <OrganizationCompetitionOverview /> },
          {
            path: 'inscriptions',
            element: <OrganizationCompetitionInscriptions />,
          },
          {
            path: 'confirmations',
            element: <OrganizationCompetitionConfirmations />,
          },
          { path: 'events', element: <OrganizationCompetitionEvents /> },
          { path: 'results', element: <OrganizationCompetitionResults /> },
          { path: 'settings', element: <OrganizationCompetitionSettings /> },
        ],
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
    element: <AdminLayout />,
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
        {env.VITE_SHOW_SOCKET_STATUS && <SocketStatusViewer />}
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
