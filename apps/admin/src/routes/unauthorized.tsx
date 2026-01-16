import { signOut } from '@/lib/auth-client';
import { Button } from '@melv1c/ui-kit';
import { createFileRoute, useNavigate } from '@tanstack/react-router';

export const Route = createFileRoute('/unauthorized')({
  component: UnauthorizedPage,
});

function UnauthorizedPage() {
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate({ to: '/login' });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-4 text-center">
      <div className="rounded-full bg-red-100 p-4">
        <svg
          className="h-12 w-12 text-red-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-gray-900">Access Denied</h1>
      <p className="max-w-md text-gray-600">
        You don&apos;t have permission to access the admin dashboard. Please contact an
        administrator if you believe this is an error.
      </p>
      <Button variant="outline" onClick={handleSignOut}>
        Sign out and try another account
      </Button>
    </div>
  );
}
