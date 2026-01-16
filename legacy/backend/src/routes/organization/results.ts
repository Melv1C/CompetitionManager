import { prisma } from '@/lib/prisma';
import { requirePermissions } from '@/middleware/access-control';
import { getRequiredSession } from '@/utils/auth-utils';
import { getResultValueFromDetail, processResultDetails } from '@/utils/result-utils';
import { zValidator } from '@hono/zod-validator';
import {
  CreateResult$,
  Cuid$,
  EventType,
  PrismaResult,
  Result$,
  resultInclude,
  UpdateResult$,
} from '@repo/core/schemas';
import { getRoomName } from '@repo/core/types';
import { logger } from 'better-auth';
import { Hono } from 'hono';
import z from 'zod';

export const organizationResultsRoutes = new Hono();

// GET /organization/competitions/:competitionEid/results - Get all results
organizationResultsRoutes.get(
  '/:competitionEid/results',
  requirePermissions({
    results: ['read'],
  }),
  zValidator('param', z.object({ competitionEid: Cuid$ })),
  async c => {
    const { competitionEid } = c.req.valid('param');
    const session = await getRequiredSession(c);

    if (!session.activeOrganizationId) {
      logger.error('No active organization found for user', { session });
      return c.json({ error: 'No active organization found' }, 400);
    }

    const competition = await prisma.competition.findFirst({
      where: { eid: competitionEid, organizationId: session.activeOrganizationId },
    });

    if (!competition) {
      return c.json({ error: 'Competition not found' }, 404);
    }

    const results = await prisma.result.findMany({
      where: { competitionId: competition.id },
      include: resultInclude,
      orderBy: { currentOrder: 'asc' },
    });

    return c.json({ results: Result$.array().parse(results) });
  },
);

// POST /organization/competitions/:competitionEid/results - Create results
organizationResultsRoutes.post(
  '/:competitionEid/results',
  requirePermissions({
    results: ['manage'],
  }),
  zValidator('param', z.object({ competitionEid: Cuid$ })),
  zValidator('json', CreateResult$.array()),
  async c => {
    const { competitionEid } = c.req.valid('param');
    const results = c.req.valid('json');
    const session = await getRequiredSession(c);

    if (!session.activeOrganizationId) {
      logger.error('No active organization found for user', { session });
      return c.json({ error: 'No active organization found' }, 400);
    }

    const competition = await prisma.competition.findFirst({
      where: { eid: competitionEid, organizationId: session.activeOrganizationId },
    });

    if (!competition) {
      return c.json({ error: 'Competition not found' }, 404);
    }

    for (const result of results) {
      const resultData: PrismaResult = {
        ...result,
        currentOrder: result.startingOrder,
        createdBy: session.userId,
        updatedBy: session.userId,
      };

      const createdResult = await prisma.result.create({
        data: {
          ...resultData,
          competitionId: competition.id,
          athleteId: result.athleteId,
          competitionEventId: result.competitionEventId,
          inscriptionId: result.inscriptionId,
        },
        include: resultInclude,
      });
      logger.info('Created result', { resultId: createdResult.id, userId: session.userId });
      c.get('io')
        .to(getRoomName.competition(competitionEid))
        .emit('upsertResult', Result$.parse(createdResult));
    }

    // Handle the creation of results
    return c.json({ message: 'Results created successfully', results });
  },
);

// PUT /organization/competitions/:competitionEid/results/:resultEid - Update result
organizationResultsRoutes.put(
  '/:competitionEid/results/:resultEid',
  requirePermissions({
    results: ['manage'],
  }),
  zValidator('param', z.object({ competitionEid: Cuid$, resultEid: Cuid$ })),
  zValidator('json', UpdateResult$),
  async c => {
    const { competitionEid, resultEid } = c.req.valid('param');
    const resultData = c.req.valid('json');
    const session = await getRequiredSession(c);

    if (!session.activeOrganizationId) {
      logger.error('No active organization found for user', { session });
      return c.json({ error: 'No active organization found' }, 400);
    }

    const competition = await prisma.competition.findFirst({
      where: { eid: competitionEid, organizationId: session.activeOrganizationId },
    });

    if (!competition) {
      return c.json({ error: 'Competition not found' }, 404);
    }

    const result = await prisma.result.findFirst({
      where: { eid: resultEid, competitionId: competition.id },
      include: { competitionEvent: { include: { event: true } } },
    });

    if (!result) {
      return c.json({ error: 'Result not found' }, 404);
    }

    // Process the details to compute isBest and get the best value
    const eventType = result.competitionEvent.event.type as EventType;
    const processedDetails = processResultDetails(resultData.details, eventType);
    const bestDetail = processedDetails.find(d => d.isBest);
    const { value, wind } = getResultValueFromDetail(bestDetail);

    const updatedResult = await prisma.result.update({
      where: { id: result.id },
      data: {
        ...resultData,
        performanceValue: value,
        windSpeed: wind,
        updatedBy: session.userId,
        details: {
          deleteMany: {}, // Remove existing details
          create: processedDetails,
        },
      },
      include: resultInclude,
    });

    logger.info('Updated result', { resultId: updatedResult.id, userId: session.userId });
    c.get('io')
      .to(getRoomName.competition(competitionEid))
      .emit('upsertResult', Result$.parse(updatedResult));

    return c.json({ message: 'Result updated successfully', result: updatedResult });
  },
);

// DELETE /organization/competitions/:competitionEid/results/:resultEid - Delete result
organizationResultsRoutes.delete(
  '/:competitionEid/results/:resultEid',
  requirePermissions({
    results: ['manage'],
  }),
  zValidator('param', z.object({ competitionEid: Cuid$, resultEid: Cuid$ })),
  async c => {
    const { competitionEid, resultEid } = c.req.valid('param');
    const session = await getRequiredSession(c);

    if (!session.activeOrganizationId) {
      logger.error('No active organization found for user', { session });
      return c.json({ error: 'No active organization found' }, 400);
    }

    const competition = await prisma.competition.findFirst({
      where: { eid: competitionEid, organizationId: session.activeOrganizationId },
    });

    if (!competition) {
      return c.json({ error: 'Competition not found' }, 404);
    }

    const result = await prisma.result.findFirst({
      where: { eid: resultEid, competitionId: competition.id },
    });

    if (!result) {
      return c.json({ error: 'Result not found' }, 404);
    }

    await prisma.result.delete({
      where: { id: result.id },
    });

    logger.info('Deleted result', { resultId: result.id, userId: session.userId });
    c.get('io').to(getRoomName.competition(competitionEid)).emit('resultDeleted', result.id);

    return c.json({ message: 'Result deleted successfully' });
  },
);
