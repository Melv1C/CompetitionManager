import { prisma } from '@/lib/prisma';
import { InscriptionStatus$ } from '@repo/core/schemas';

export async function cancelInscriptions(stripeSessionId: string) {
  // TODO: maybe we can even delete the inscriptions instead of marking them as cancelled?
  return await prisma.inscription.updateMany({
    where: {
      stripeSessionId,
      status: InscriptionStatus$.enum.PENDING_PAYMENT,
    },
    data: { status: InscriptionStatus$.enum.CANCELLED, stripeSessionId: null },
  });
}
