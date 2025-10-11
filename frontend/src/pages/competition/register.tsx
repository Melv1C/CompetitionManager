import { RequireAuth } from '@/features/auth';
import { CheckoutSessionGuard } from '@/features/checkout-sessions';
import { InscriptionWizard } from '@/features/inscriptions';

export function CompetitionRegisterPage() {
  return (
    <div className="w-full mx-auto">
      {/* Registration Flow (Form + Basket) */}
      <RequireAuth>
        <CheckoutSessionGuard>
          <InscriptionWizard />
        </CheckoutSessionGuard>
      </RequireAuth>
    </div>
  );
}
