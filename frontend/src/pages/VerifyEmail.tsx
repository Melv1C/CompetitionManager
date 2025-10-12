import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useSearchParams } from 'react-router-dom';

export function VerifyEmailPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const error = searchParams.get('error');

  useEffect(() => {
    if (error) {
      setStatus('error');
    } else {
      // The backend handles verification and redirects here
      // If there's no error param, it was successful
      setStatus('success');
    }
  }, [error]);

  if (status === 'verifying') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">{t('verifyEmail:verifying')}</CardTitle>
            <CardDescription>{t('verifyEmail:pleaseWait')}</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md border-destructive">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <CardTitle className="text-2xl">{t('verifyEmail:errorTitle')}</CardTitle>
            <CardDescription className="text-balance">
              {error === 'invalid_token'
                ? t('verifyEmail:invalidToken')
                : t('verifyEmail:errorDescription')}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link to="/profile">{t('verifyEmail:goToProfile')}</Link>
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link to="/">{t('verifyEmail:goHome')}</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">{t('verifyEmail:successTitle')}</CardTitle>
          <CardDescription className="text-balance">
            {t('verifyEmail:successDescription')}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-2">
          <Button asChild className="w-full">
            <Link to="/">{t('verifyEmail:goHome')}</Link>
          </Button>
          <Button asChild variant="ghost" className="w-full">
            <Link to="/profile">{t('verifyEmail:goToProfile')}</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
