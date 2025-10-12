import { Button } from '@/components/ui/button';
import { RequireAuth, useAuth } from '@/features/auth';
import { CheckoutSessionGuard } from '@/features/checkout-sessions';
import { InscriptionWizard } from '@/features/inscriptions';
import { Mail } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export function CompetitionRegisterPage() {
  return (
    <div className="w-full mx-auto">
      {/* Registration Flow (Form + Basket) */}
      <RequireAuth>
        <RequireVerifiedEmail>
          <CheckoutSessionGuard>
            <InscriptionWizard />
          </CheckoutSessionGuard>
        </RequireVerifiedEmail>
      </RequireAuth>
    </div>
  );
}

function RequireVerifiedEmail({ children }: PropsWithChildren) {
  const { user } = useAuth();
  const { t } = useTranslation('inscriptions');

  if (!user) {
    throw new Error('User should be defined here');
  }

  if (!user.emailVerified) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Mail className="size-8 text-primary" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight">
              {t('emailVerificationRequired')}
            </h2>
            <p className="text-muted-foreground">{t('emailVerificationMessage')}</p>
          </div>

          <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
            {t('emailVerificationSent')}
          </div>

          <Button asChild size="lg" className="w-full">
            <Link to="/profile">{t('goToProfile')}</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
