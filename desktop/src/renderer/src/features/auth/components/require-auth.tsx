import { Skeleton } from '@/components/ui/skeleton'
import { type PropsWithChildren } from 'react'
import { useAuth } from '../hooks/use-auth'
import { SignInForm } from './sign-in-form'

export function RequireAuth({ children }: PropsWithChildren) {
  const { isAuthenticated, isLoading } = useAuth()

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center m-16">
        <div className="w-full max-w-md mx-auto space-y-4 p-6">
          <Skeleton className="h-8 w-3/4 mx-auto" />
          <Skeleton className="h-4 w-1/2 mx-auto" />
          <div className="space-y-3 mt-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
      </div>
    )
  }

  // Show sign-in form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center bg-background m-16">
        <SignInForm />
      </div>
    )
  }

  // Show children if authenticated
  return <>{children}</>
}
