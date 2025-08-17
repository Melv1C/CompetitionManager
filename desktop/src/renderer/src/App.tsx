import { ThemeProvider } from '@/features/theme'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { lazy } from 'react'
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom'
import { Toaster } from 'sonner'
import { SocketStatusViewer } from './components/dev/socket-status-viewer'
import { MainLayout } from './components/layout'
import { env } from './lib/env'

// Static import mapping for Vite's build-time analysis
const pageImports = {
  // Main pages
  Home: () => import('./pages/Home'),
  SignIn: () => import('./pages/SignIn').then((m) => ({ default: m.SignInPage })),
  NotFound: () => import('./pages/NotFound')
}

// Helper function to create lazy components from static imports
function createLazyComponent(key: keyof typeof pageImports) {
  return lazy(pageImports[key])
}

const SignInPage = createLazyComponent('SignIn')
const NotFound = createLazyComponent('NotFound')
const Home = createLazyComponent('Home')

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000 // 5 minutes
    }
  }
})

// Main App Layout Component
function MainApp() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  )
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <MainApp />,
    errorElement: <NotFound />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'auth/sign-in',
        element: <SignInPage />
      },
    ]
  }
])

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <RouterProvider router={router} />
        <Toaster />
        {env.VITE_SHOW_SOCKET_STATUS && <SocketStatusViewer />}
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App
