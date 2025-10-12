import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authClient } from '@/lib/auth-client';
import { CheckCircle2, Lock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if there's an error in the URL (invalid token)
    const errorParam = searchParams.get('error');
    if (errorParam === 'INVALID_TOKEN') {
      setError(t('resetPassword:invalidToken'));
    }
  }, [searchParams, t]);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      toast.error(t('resetPassword:noToken'));
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error(t('profile:passwordMismatch'));
      return;
    }

    if (newPassword.length < 8) {
      toast.error(t('profile:passwordTooShort'));
      return;
    }

    setIsResetting(true);
    try {
      await authClient.resetPassword({
        newPassword,
        token,
      });

      setIsSuccess(true);
      toast.success(t('resetPassword:success'));

      // Redirect to sign in after 3 seconds
      setTimeout(() => {
        navigate('/auth/sign-in');
      }, 3000);
    } catch (error) {
      console.error('Reset password error:', error);
      toast.error(t('resetPassword:error'));
      setError(t('resetPassword:error'));
    } finally {
      setIsResetting(false);
    }
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-destructive">
              {t('resetPassword:errorTitle')}
            </CardTitle>
            <CardDescription className="text-center">{error}</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link to="/auth/sign-in">{t('resetPassword:backToSignIn')}</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">{t('resetPassword:successTitle')}</CardTitle>
            <CardDescription>{t('resetPassword:successDescription')}</CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Button asChild>
              <Link to="/auth/sign-in">{t('resetPassword:goToSignIn')}</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Lock className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl text-center">{t('resetPassword:title')}</CardTitle>
          <CardDescription className="text-center">
            {t('resetPassword:description')}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleResetPassword}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">{t('profile:newPassword')}</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder={t('auth:enterPassword')}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t('auth:confirmPassword')}</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                placeholder={t('auth:confirmYourPassword')}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isResetting}>
              {isResetting ? t('resetPassword:resetting') : t('resetPassword:resetButton')}
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link to="/auth/sign-in">{t('resetPassword:backToSignIn')}</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
