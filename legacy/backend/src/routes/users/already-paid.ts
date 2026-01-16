import { prisma } from '@/lib/prisma';
import { getRequiredSession } from '@/utils/auth-utils';
import { calculateAlreadyPaidAmount } from '@/utils/inscription-utils';
import { logError } from '@/utils/log-utils';
import { zValidator } from '@hono/zod-validator';
import {
  AlreadyPaidQuery$,
  AlreadyPaidResponse$,
  Competition$,
  competitionInclude,
} from '@repo/core/schemas';
import { Hono } from 'hono';

const userAlreadyPaidRoutes = new Hono();

// GET /users/me/already-paid - Get already paid amounts for specific athletes in a competition
userAlreadyPaidRoutes.get('/', zValidator('query', AlreadyPaidQuery$), async c => {
  try {
    const session = await getRequiredSession(c);
    const { competitionId, athleteIds } = c.req.valid('query');

    // Get competition info (needed for the utility function)
    const competition = Competition$.parse(
      await prisma.competition.findUnique({
        where: { id: competitionId },
        include: competitionInclude,
      }),
    );

    if (!competition) {
      return c.json({ error: 'Competition not found' }, 404);
    }

    const alreadyPaid = await calculateAlreadyPaidAmount(competition, athleteIds, session.userId);

    return c.json(AlreadyPaidResponse$.parse(alreadyPaid));
  } catch (error) {
    logError('Failed to fetch already paid amounts', error, c);
    return c.json({ error: 'Failed to fetch already paid amounts' }, 500);
  }
});

export { userAlreadyPaidRoutes };
