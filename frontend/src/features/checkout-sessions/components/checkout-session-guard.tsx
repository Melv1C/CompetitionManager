import { Button } from '@/components/ui/button';
import { formatDateTime } from '@/lib/formatters';
import type { CheckoutSession } from '@repo/core/schemas';
import type { PropsWithChildren } from 'react';
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
    <div>
      <ul>
        {checkoutSessions.data.map(session => (
          <PendingCheckoutSession key={session.id} session={session} />
        ))}
      </ul>
    </div>
  );
};

const PendingCheckoutSession: React.FC<{ session: CheckoutSession }> = ({ session }) => {
  const { mutate: expireSession } = useExpireCheckoutSession(session.id);
  return (
    <li className="flex items-center justify-between gap-4 p-4 border rounded-lg bg-muted mb-2">
      <div className="flex flex-col">
        <span className="text-primary font-medium">You have a pending checkout session.</span>
        <span className="text-xs text-muted-foreground mt-1">
          Expires at: {session.expiresAt ? formatDateTime(new Date(session.expiresAt)) : 'Unknown'}
        </span>
      </div>
      <div className="flex gap-2">
        <Button variant="default" size="sm" asChild>
          <a href={session.url || '#'} target="_blank" rel="noopener noreferrer">
            Complete
          </a>
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            expireSession();
          }}
        >
          Expire
        </Button>
      </div>
    </li>
  );
};
