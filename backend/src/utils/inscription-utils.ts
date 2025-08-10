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
  PresenceStatus$,
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
  // 1. Check if events exist and belong to the competition
  const eventIds = inscriptions.map((i) => i.competitionEventId);
  const competitionEventIds = new Set(competition.events.map((e) => e.id));
  if (eventIds.some((id) => !competitionEventIds.has(id))) {
    throw new Error(
      'Some events do not exist or do not belong to this competition'
    );
  }

  // 2. Check inscription dates - verify we are within the registration period
  const now = new Date();
  if (now < competition.inscriptionStartDate) {
    throw new Error(
      `Registration period has not started yet. Registration opens on ${competition.inscriptionStartDate.toLocaleDateString()}`
    );
  }
  if (now > competition.inscriptionEndDate) {
    throw new Error(
      `Registration period has ended. Registration closed on ${competition.inscriptionEndDate.toLocaleDateString()}`
    );
  }

  // 3. Verify that each inscription is related to an athlete
  const athleteIds = inscriptions.map((i) => i.athleteId);
  const uniqueAthleteIds = [...new Set(athleteIds)];

  // Check if all athletes exist
  const existingAthletes = await prisma.athlete.findMany({
    where: {
      id: { in: uniqueAthleteIds },
    },
    select: { id: true },
  });

  const existingAthleteIds = new Set(existingAthletes.map((a) => a.id));
  const missingAthleteIds = uniqueAthleteIds.filter(
    (id) => !existingAthleteIds.has(id)
  );

  if (missingAthleteIds.length > 0) {
    throw new Error(
      `The following athletes do not exist: ${missingAthleteIds.join(', ')}`
    );
  }

  // 4. Check for conflicting inscriptions - verify no other user has registered the same athlete for the same competition
  const conflictingInscriptions = await prisma.inscription.findMany({
    where: {
      competitionId: competition.id,
      athleteId: { in: uniqueAthleteIds },
      userId: { not: userId },
      status: { in: ['PENDING_PAYMENT', 'REGISTERED', 'SELECTED'] }, // Only check active statuses
    },
    select: {
      athleteId: true,
      userId: true,
      athlete: {
        select: {
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (conflictingInscriptions.length > 0) {
    const conflictDetails = conflictingInscriptions.map(
      (inscription) =>
        `${inscription.athlete.firstName} ${inscription.athlete.lastName} (registered by another user)`
    );
    throw new Error(
      `The following athletes are already registered by another user for this competition: ${conflictDetails.join(
        ', '
      )}`
    );
  }

  // 5. Check event capacity - verify there is still room in each event
  // Group inscriptions by event to handle multiple athletes registering for the same event
  const inscriptionsByEvent = new Map<Id, UpsertInscriptions>();
  for (const inscription of inscriptions) {
    const existing =
      inscriptionsByEvent.get(inscription.competitionEventId) || [];
    existing.push(inscription);
    inscriptionsByEvent.set(inscription.competitionEventId, existing);
  }

  for (const [eventId, eventInscriptions] of inscriptionsByEvent) {
    const event = competition.events.find((e) => e.id === eventId);
    if (!event) continue; // This should not happen as we checked above, but for safety

    if (event.maxParticipants !== null && event.maxParticipants !== undefined) {
      // Count current active inscriptions for this event
      const currentInscriptionsCount = await prisma.inscription.count({
        where: {
          competitionEventId: event.id,
          status: { in: ['PENDING_PAYMENT', 'REGISTERED', 'SELECTED'] }, // Only count active statuses
        },
      });

      // Check how many of the current request athletes are already registered for this event by the same user
      const athleteIdsInRequest = eventInscriptions.map((i) => i.athleteId);
      const existingInscriptionsForRequestedAthletes =
        await prisma.inscription.findMany({
          where: {
            competitionEventId: event.id,
            athleteId: { in: athleteIdsInRequest },
            userId,
            status: { in: ['PENDING_PAYMENT', 'REGISTERED', 'SELECTED'] },
          },
          select: { athleteId: true },
        });

      const existingAthleteIds = new Set(
        existingInscriptionsForRequestedAthletes.map((i) => i.athleteId)
      );

      // Count how many are updates vs new inscriptions
      const updatesCount = eventInscriptions.filter((i) =>
        existingAthleteIds.has(i.athleteId)
      ).length;
      const newInscriptionsCount = eventInscriptions.length - updatesCount;

      // Calculate effective current count (subtract existing inscriptions that will be updated)
      const effectiveCurrentCount = currentInscriptionsCount - updatesCount;

      // Check if adding the new inscriptions would exceed the limit
      if (
        effectiveCurrentCount + newInscriptionsCount >
        event.maxParticipants
      ) {
        const availableSlots = event.maxParticipants - effectiveCurrentCount;
        throw new Error(
          `Event "${event.name}" doesn't have enough space. ` +
            `Maximum participants: ${event.maxParticipants}, ` +
            `current participants: ${currentInscriptionsCount}, ` +
            `available slots: ${availableSlots}, ` +
            `requested new inscriptions: ${newInscriptionsCount}`
        );
      }
    }
  }

  // 6. Check for duplicate inscriptions in the same request
  const inscriptionKeys = inscriptions.map(
    (i) => `${i.athleteId}-${i.competitionEventId}`
  );
  const uniqueKeys = new Set(inscriptionKeys);
  if (inscriptionKeys.length !== uniqueKeys.size) {
    throw new Error(
      'Duplicate inscriptions detected in the request. An athlete cannot be registered multiple times for the same event.'
    );
  }
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

      await prisma.inscription.create({
        data: {
          ...newInscription,
          userId,
          competitionId: competition.id,
          status: InscriptionStatus$.enum.REGISTERED,
          amountPaid: paidAmount,
          presenceStatus: PresenceStatus$.enum.UNKNOWN,
          inscriptionDate: new Date(),
          createdBy: userId,
          updatedBy: userId,
          record: newInscription.record
            ? {
                create: RecordPrisma$.parse(newInscription.record),
              }
            : undefined,
        },
      });
    }

    // Mark inscriptions as cancelled
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
          status: InscriptionStatus$.enum.CANCELLED,
          amountPaid: paidAmount,
          updatedBy: userId,
        },
      });
    }
  }
}
