import { prisma } from '@/lib/prisma';
import {
  UpsertInscriptions,
  Competition,
  BetterAuthId,
  inscriptionInclude,
  Id,
  Inscription$,
  RecordPrisma$,
  InscriptionStatus$,
} from '@repo/core/schemas';

export interface CreateInscriptionsResult {
  freeInscriptions: any[];
  paidInscriptions: any[];
  paymentSession?: any;
  totalAmount: number;
}

/**
 * Validates if inscriptions can be created
 */
export async function validateInscriptions(
  competition: Competition,
  inscriptions: UpsertInscriptions,
  userId: BetterAuthId
): Promise<void> {
  // Check if events exist and belong to the competition
  const eventIds = inscriptions.map((i) => i.competitionEventId);
  const competitionEventIds = new Set(competition.events.map((e) => e.id));
  if (eventIds.some((id) => !competitionEventIds.has(id))) {
    throw new Error(
      'Some events do not exist or do not belong to this competition'
    );
  }

  // TODO: Add more validation logic as needed
}

/**
 * Calculates the total cost for all events in the inscriptions
 */
export function calculateTotalEventCost(
  competition: Competition,
  inscriptions: UpsertInscriptions
) {
  const inscriptionEventIds = new Set(
    inscriptions.map((inscription) => inscription.competitionEventId)
  );

  const relevantEvents = competition.events.filter((event) =>
    inscriptionEventIds.has(event.id)
  );

  return relevantEvents.reduce(
    (totalCost, event) => totalCost + event.price,
    0
  );
}

/**
 * Calculates the total amount already paid by athletes for this competition
 */
export async function calculateAlreadyPaidAmount(
  competition: Competition,
  inscriptions: UpsertInscriptions,
  userId: BetterAuthId
) {
  const athleteIds = inscriptions.map((inscription) => inscription.athleteId);

  const paidAmountResult = await prisma.inscription.aggregate({
    _sum: {
      amountPaid: true,
    },
    where: {
      competitionId: competition.id,
      athleteId: { in: athleteIds },
      userId,
    },
  });

  return paidAmountResult._sum.amountPaid || 0;
}

/**
 * Upserts inscriptions in the database
 */
export async function upsertInscriptionsInDB(
  competition: Competition,
  inscriptions: UpsertInscriptions,
  userId: BetterAuthId,
  totalPaid: number
) {
  // Group inscriptions by athlete to process them together
  const athleteGroupedInscriptions = new Map<Id, UpsertInscriptions>();

  for (const inscription of inscriptions) {
    const existing =
      athleteGroupedInscriptions.get(inscription.athleteId) || [];
    existing.push(inscription);
    athleteGroupedInscriptions.set(inscription.athleteId, existing);
  }

  let remainingPaid = totalPaid;

  for (const [athleteId, athleteInscriptions] of athleteGroupedInscriptions) {
    // Get all existing inscriptions for this athlete in this competition
    const existingInscriptions = Inscription$.array().parse(
      await prisma.inscription.findMany({
        where: {
          competitionId: competition.id,
          athleteId,
          userId,
        },
        include: inscriptionInclude,
      })
    );

    // Determine which inscriptions to delete, update, or create
    const competitionEventIds = athleteInscriptions.map(
      (i) => i.competitionEventId
    );

    const toDeleteInscriptions = existingInscriptions.filter(
      (existing) => !competitionEventIds.includes(existing.competitionEventId)
    );

    const toUpdateInscriptions = existingInscriptions.filter((existing) =>
      competitionEventIds.includes(existing.competitionEventId)
    );

    const toCreateInscriptions = athleteInscriptions.filter(
      (newInsc) =>
        !existingInscriptions.some(
          (existing) =>
            existing.competitionEventId === newInsc.competitionEventId
        )
    );

    // Update existing inscriptions
    for (const existingInscription of toUpdateInscriptions) {
      const matchingNewInscription = athleteInscriptions.find(
        (newInsc) =>
          newInsc.competitionEventId === existingInscription.competitionEventId
      );

      if (!matchingNewInscription) continue;

      const event = competition.events.find(
        (e) => e.id === matchingNewInscription.competitionEventId
      );
      if (!event) throw new Error('Event not found');

      const paidAmount = Math.min(remainingPaid, event.price);
      remainingPaid -= paidAmount;

      const updateData = {
        amountPaid: paidAmount,
        isDeleted: false,
        updatedBy: userId,
      };

      await prisma.inscription.update({
        where: { id: existingInscription.id },
        data: {
          ...updateData,
          record: existingInscription.record
            ? {
                update: RecordPrisma$.parse(matchingNewInscription.record),
              }
            : {
                create: RecordPrisma$.parse(matchingNewInscription.record),
              },
        },
      });
    }

    // Create new inscriptions
    for (const newInscription of toCreateInscriptions) {
      const event = competition.events.find(
        (e) => e.id === newInscription.competitionEventId
      );
      if (!event) throw new Error('Event not found');

      const paidAmount = Math.min(remainingPaid, event.price);
      remainingPaid -= paidAmount;

      const createData = {
        ...newInscription,
        userId,
        competitionId: competition.id,
        status: InscriptionStatus$.enum.CONFIRMED, // Assuming confirmed for new inscriptions
        amountPaid: paidAmount,
        isDeleted: false,
        inscriptionDate: new Date(),
        createdBy: userId,
        updatedBy: userId,
      };

      await prisma.inscription.create({
        data: {
          ...createData,
          record: newInscription.record
            ? {
                create: RecordPrisma$.parse(newInscription.record),
              }
            : undefined,
        },
      });
    }

    // Mark inscriptions as deleted (soft delete)
    for (const inscriptionToDelete of toDeleteInscriptions) {
      const event = competition.events.find(
        (e) => e.id === inscriptionToDelete.competitionEventId
      );
      if (!event) throw new Error('Event not found');

      const paidAmount = Math.min(remainingPaid, event.price);
      remainingPaid -= paidAmount;

      await prisma.inscription.update({
        where: { id: inscriptionToDelete.id },
        data: {
          isDeleted: true,
          amountPaid: paidAmount,
          updatedBy: userId,
        },
      });
    }
  }
}
