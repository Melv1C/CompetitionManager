import { prisma } from '@/lib/prisma';
import type { PaymentSessionStatus } from '@repo/core/schemas';

/**
 * Creates a payment session
 */
export async function createPaymentSession(
  userId: string,
  competitionId: number,
  amountTotal: number,
  inscriptionsMetadata: any,
  expirationMinutes: number = 30
) {
  const expiresAt = new Date();
  expiresAt.setMinutes(expiresAt.getMinutes() + expirationMinutes);

  return prisma.paymentSession.create({
    data: {
      userId,
      competitionId,
      status: 'pending',
      amountTotal,
      metadata: inscriptionsMetadata,
      expiresAt,
    },
  });
}

/**
 * Updates payment session status and handles inscription status changes
 */
export async function updatePaymentSessionStatus(
  paymentSessionId: number,
  status: PaymentSessionStatus,
  paymentIntentId?: string
) {
  const updateData: any = {
    status,
    updatedAt: new Date(),
  };

  if (status === 'paid') {
    updateData.paidAt = new Date();
    if (paymentIntentId) {
      updateData.paymentIntentId = paymentIntentId;
    }
  }

  const paymentSession = await prisma.paymentSession.update({
    where: { id: paymentSessionId },
    data: updateData,
    include: {
      inscriptions: true,
      competition: {
        include: {
          events: true,
        },
      },
    },
  });

  return paymentSession;
}

/**
 * Cancels a payment session and deletes related inscriptions
 */
export async function cancelPaymentSession(
  paymentSessionId: number,
  userId: string
) {
  const paymentSession = await prisma.paymentSession.findFirst({
    where: {
      id: paymentSessionId,
      userId,
      status: 'pending',
    },
    include: {
      inscriptions: true,
    },
  });

  if (!paymentSession) {
    throw new Error('Payment session not found or cannot be cancelled');
  }

  // Use transaction to ensure data consistency
  return prisma.$transaction(async (tx) => {
    // Delete all related inscriptions
    await tx.inscription.deleteMany({
      where: {
        paymentSessionId,
      },
    });

    // Update payment session status
    await tx.paymentSession.update({
      where: { id: paymentSessionId },
      data: {
        status: 'cancelled',
      },
    });

    return paymentSession;
  });
}

/**
 * Finds expired payment sessions and marks them as expired
 */
export async function expireOldPaymentSessions() {
  const expiredSessions = await prisma.paymentSession.findMany({
    where: {
      status: 'pending',
      expiresAt: { lt: new Date() },
    },
    include: {
      inscriptions: true,
    },
  });

  if (expiredSessions.length === 0) {
    return [];
  }

  // Use transaction to ensure data consistency
  return prisma.$transaction(async (tx) => {
    const results = [];

    for (const session of expiredSessions) {
      // Delete all related inscriptions
      await tx.inscription.deleteMany({
        where: {
          paymentSessionId: session.id,
        },
      });

      // Update payment session status
      const updatedSession = await tx.paymentSession.update({
        where: { id: session.id },
        data: {
          status: 'expired',
        },
      });

      results.push(updatedSession);
    }

    return results;
  });
}

/**
 * Get payment session by EID for user
 */
export async function getPaymentSessionByEid(eid: string, userId: string) {
  const paymentSession = await prisma.paymentSession.findFirst({
    where: {
      eid,
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      competition: {
        select: {
          id: true,
          eid: true,
          name: true,
        },
      },
      inscriptions: {
        where: {
          isDeleted: false,
        },
        select: {
          id: true,
          eid: true,
          athleteId: true,
          competitionEventId: true,
          status: true,
          amountPaid: true,
        },
      },
    },
  });

  return paymentSession;
}

/**
 * Get all payment sessions for a user
 */
export async function getUserPaymentSessions(userId: string) {
  const paymentSessions = await prisma.paymentSession.findMany({
    where: {
      userId,
    },
    include: {
      competition: {
        select: {
          id: true,
          eid: true,
          name: true,
        },
      },
      inscriptions: {
        where: {
          isDeleted: false,
        },
        select: {
          id: true,
          eid: true,
          athleteId: true,
          competitionEventId: true,
          status: true,
          amountPaid: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return paymentSessions;
}

/**
 * Find payment session by payment intent ID (for webhook processing)
 */
export async function findPaymentSessionByPaymentIntent(
  paymentIntentId: string
) {
  return prisma.paymentSession.findFirst({
    where: {
      paymentIntentId,
      status: 'pending',
    },
    include: {
      inscriptions: true,
      user: true,
      competition: true,
    },
  });
}
