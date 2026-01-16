import { formatDateTime } from '@/lib/formatters';
import type { CheckoutSession } from '@repo/core/schemas';
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';
import { CreditCard } from 'lucide-react';
import type { PropsWithChildren } from 'react';
import { useTranslation } from 'node_modules/react-i18next';
import { useCheckoutSessions, useExpireCheckoutSession } from '../hooks/use-checkout-sessions';

export const CheckoutSessionGuard: React.FC<PropsWithChildren> = ({ children }) => {
  const checkoutSessions = useCheckoutSessions();

  if (checkoutSessions.isPending) {
    return <div>Loading...</div>;
  }

  if (checkoutSessions.isError) {
    return <div>Error loading checkout sessions</div>;
  }

  if (checkoutSessions.data.length === 0) {
    return children;
  }

  return (
    <div className="max-w-md mx-auto">
      {checkoutSessions.data.map(session => (
        <PendingCheckoutSession key={session.id} session={session} />
      ))}
    </div>
  );
};

const PendingCheckoutSession: React.FC<{ session: CheckoutSession }> = ({ session }) => {
  const { t } = useTranslation('inscriptions');
  const { mutate: expireSession } = useExpireCheckoutSession(session.id);

  return (
    <Card className="w-full">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-primary/10 p-3">
            <CreditCard className="h-6 w-6 text-primary" />
          </div>
        </div>
        <CardTitle className="text-2xl">{t('checkoutSession.pendingPaymentSession')}</CardTitle>
        <CardDescription className="text-base">
          {t('checkoutSession.pendingPaymentSessionDescription')}
        </CardDescription>
        {session.expiresAt && (
          <p className="text-xs text-muted-foreground mt-2">
            {t('checkoutSession.expiresAt', { date: formatDateTime(new Date(session.expiresAt)) })}
          </p>
        )}
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <Button asChild className="w-full">
          <a href={session.url || '#'} target="_blank" rel="noopener noreferrer">
            {t('checkoutSession.completePaymentSession')}
          </a>
        </Button>
        <Button variant="outline" className="w-full" onClick={() => expireSession()}>
          {t('checkoutSession.cancelPaymentSession')}
        </Button>
      </CardContent>
    </Card>
  );
};
