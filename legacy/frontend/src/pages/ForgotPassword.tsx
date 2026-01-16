import { authClient } from '@/lib/auth-client';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from '@repo/ui';
import { CheckCircle2, Mail } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'node_modules/react-i18next';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [isRequesting, setIsRequesting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error(t('forgotPassword:emailRequired'));
      return;
    }

    setIsRequesting(true);
    try {
      const res = await authClient.requestPasswordReset({
        email,
        redirectTo: `${window.location.origin}/reset-password`,
      });

      console.log('Request password reset response:', res);

      setIsSuccess(true);
      toast.success(t('forgotPassword:success'));
    } catch (error) {
      console.error('Request password reset error:', error);
      // Don't reveal if the email exists or not for security
      setIsSuccess(true);
    } finally {
      setIsRequesting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl">{t('forgotPassword:successTitle')}</CardTitle>
            <CardDescription className="text-balance">
              {t('forgotPassword:successDescription')}
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-2">
            <Button asChild className="w-full">
              <Link to="/auth/sign-in">{t('resetPassword:backToSignIn')}</Link>
            </Button>
            <Button variant="ghost" onClick={() => setIsSuccess(false)} className="w-full">
              {t('forgotPassword:sendAnother')}
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
            <Mail className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl text-center">{t('forgotPassword:title')}</CardTitle>
          <CardDescription className="text-center text-balance">
            {t('forgotPassword:description')}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleRequestReset}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth:email')}</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder={t('auth:enterEmail')}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isRequesting}>
              {isRequesting ? t('forgotPassword:requesting') : t('forgotPassword:sendResetLink')}
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
