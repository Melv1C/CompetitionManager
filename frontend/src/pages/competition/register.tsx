import { CheckoutSessionGuard } from '@/features/checkout-sessions';
import { InscriptionFlow } from '@/features/inscriptions';

export function CompetitionRegisterPage() {
  return (
    <div className="w-full mx-auto">
      {/* Registration Flow (Form + Basket) */}
      <CheckoutSessionGuard>
        <InscriptionFlow />
      </CheckoutSessionGuard>
    </div>
  );
}
