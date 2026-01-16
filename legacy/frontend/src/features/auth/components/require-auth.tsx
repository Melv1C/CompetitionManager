import { useAuth } from '@/features/auth';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@repo/ui';
import { LogIn } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { useTranslation } from 'node_modules/react-i18next';
import { Link } from 'react-router-dom';

export function RequireAuth({ children }: PropsWithChildren) {
  const { isAuthenticated, isPending } = useAuth();
  const { t } = useTranslation();

  // Show loading state while checking authentication
  if (isPending) {
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
    );
  }

  // Show invitation to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-3">
                <LogIn className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl">{t('auth:authenticationRequired')}</CardTitle>
            <CardDescription className="text-base">
              {t('auth:loginRequiredForRegistration')}
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button asChild className="w-full">
              <Link to="/auth/sign-in">{t('auth:signIn')}</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/auth/sign-up">{t('auth:signUp')}</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show children if authenticated
  return <>{children}</>;
}
