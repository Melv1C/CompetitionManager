import { prisma } from '@/lib/prisma';
import { requirePermissions } from '@/middleware/access-control';
import { getRequiredSession, getRequiredUser } from '@/utils/auth-utils';
import { getCompetitions } from '@/utils/competition-utils';
import { logError } from '@/utils/log-utils';
import { zValidator } from '@hono/zod-validator';
import {
  Competition$,
  CompetitionCreate$,
  CompetitionPrisma$,
  CompetitionUpdate$,
  Cuid$,
  competitionInclude,
} from '@repo/core/schemas';
import { checkLockedFields, getFieldEditability } from '@repo/core/utils';
import { logger } from 'better-auth';
import { Hono } from 'hono';
import { z } from 'zod';

const organizationCompetitionsRoutes = new Hono();

// GET /organization/competitions - Get competitions for the active organization
organizationCompetitionsRoutes.get(
  '/',
  requirePermissions({
    competitions: ['read'],
  }),
  async c => {
    try {
      const session = await getRequiredSession(c);

      const competitions = await getCompetitions({
        where: {
          organizationId: session.activeOrganizationId!,
        },
        orderBy: { startDate: 'desc' },
      });

      return c.json(competitions);
    } catch (error) {
      logError('Failed to fetch organization competitions', error, c);
      return c.json({ error: 'Failed to fetch organization competitions' }, 500);
    }
  },
);

// POST /organization/competitions - Create new competition
organizationCompetitionsRoutes.post(
  '/',
  requirePermissions({
    competitions: ['create'],
  }),
  zValidator('json', CompetitionCreate$),
  async c => {
    try {
      const { name, startDate } = c.req.valid('json');
      const session = await getRequiredSession(c);

      if (!session.activeOrganizationId) {
        logger.error('No active organization found for user', {
          session,
        });
        return c.json({ error: 'No active organization found' }, 400);
      }

      const competitionStartDate = new Date(startDate);
      const competitionEndDate = new Date(competitionStartDate);
      // Set end date to end of the same day (23:59:59.999)
      competitionEndDate.setHours(23, 59, 59, 999);

      const today = new Date();
      const oneDayBeforeStart = new Date(competitionStartDate);
      oneDayBeforeStart.setDate(oneDayBeforeStart.getDate() - 1);

      const data = CompetitionPrisma$.parse({
        name,
        startDate: competitionStartDate,
        endDate: competitionEndDate,
        inscriptionStartDate: today,
        inscriptionEndDate: oneDayBeforeStart,
        organizationId: session.activeOrganizationId,
        createdBy: session.userId,
        updatedBy: session.userId,
      });

      const competition = await prisma.competition.create({
        data,
        include: competitionInclude,
      });

      return c.json(Competition$.parse(competition), 201);
    } catch (error) {
      logError('Failed to create competition', error, c);
      return c.json({ error: 'Failed to create competition' }, 500);
    }
  },
);

// GET /organization/competitions/:eid - Get single competition details
organizationCompetitionsRoutes.get(
  '/:eid',
  requirePermissions({
    competitions: ['read'],
  }),
  zValidator('param', z.object({ eid: Cuid$ })),
  async c => {
    try {
      const { eid } = c.req.valid('param');
      const session = await getRequiredSession(c);

      if (!session.activeOrganizationId) {
        logger.error('No active organization found for user', { session });
        return c.json({ error: 'No active organization found' }, 400);
      }

      const competition = await prisma.competition.findFirst({
        where: { eid, organizationId: session.activeOrganizationId },
        include: competitionInclude,
      });

      if (!competition) {
        return c.json({ error: 'Competition not found' }, 404);
      }

      return c.json(Competition$.parse(competition));
    } catch (error) {
      logError('Failed to fetch competition', error, c);
      return c.json({ error: 'Failed to fetch competition' }, 500);
    }
  },
);

// PUT /organization/competitions/:eid - Update existing competition
organizationCompetitionsRoutes.put(
  '/:eid',
  requirePermissions({
    competitions: ['update'],
  }),
  zValidator('param', z.object({ eid: Cuid$ })),
  zValidator('json', CompetitionUpdate$.partial()),
  async c => {
    try {
      const { eid } = c.req.valid('param');
      const { freeClubIds, allowedClubIds, ...updateData } = c.req.valid('json');

      const session = await getRequiredSession(c);
      if (!session.activeOrganizationId) {
        logger.error('No active organization found for user', {
          session,
        });
        return c.json({ error: 'No active organization found' }, 400);
      }

      const competition = await prisma.competition.findFirst({
        where: { eid, organizationId: session.activeOrganizationId },
        include: competitionInclude,
      });
      if (!competition) {
        return c.json({ error: 'Competition not found' }, 404);
      }

      // Check if user is admin to bypass field locking
      const user = await getRequiredUser(c);
      const isAdmin = user.role === 'admin';

      // Parse competition to match the expected type
      const parsedCompetition = Competition$.parse(competition);

      // Get all field names being updated (including club IDs)
      const updateFields = Object.keys(updateData);
      if (freeClubIds !== undefined) {
        updateFields.push('freeClubIds');
      }
      if (allowedClubIds !== undefined) {
        updateFields.push('allowedClubIds');
      }

      // Check if any of the fields being updated are locked
      const { hasErrors, lockedFields } = checkLockedFields(
        updateFields,
        parsedCompetition,
        new Date(),
        { isAdmin },
      );

      if (hasErrors) {
        // Get detailed reasons for each locked field
        const fieldErrors = lockedFields.map(fieldName => {
          const info = getFieldEditability(fieldName, parsedCompetition, new Date(), { isAdmin });
          return {
            field: fieldName,
            reason: info.reason,
            rule: info.rule,
          };
        });

        logger.warn('Attempt to update locked fields', {
          competitionEid: eid,
          userId: session.userId,
          lockedFields,
          fieldErrors,
        });

        return c.json(
          {
            error: 'Cannot update locked fields',
            lockedFields: fieldErrors,
          },
          400,
        );
      }

      const updatedCompetition = await prisma.competition.update({
        where: { eid },
        data: {
          ...updateData,
          updatedBy: session.userId,
          freeClubs: { set: freeClubIds?.map(id => ({ id })) },
          allowedClubs: { set: allowedClubIds?.map(id => ({ id })) },
        },
        include: competitionInclude,
      });

      return c.json(Competition$.parse(updatedCompetition));
    } catch (error) {
      logError('Failed to update competition', error, c);
      return c.json({ error: 'Failed to update competition' }, 500);
    }
  },
);

export { organizationCompetitionsRoutes };
