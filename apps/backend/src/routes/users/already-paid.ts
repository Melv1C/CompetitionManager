import { getSession } from '@/utils/auth-utils';
import { calculateAlreadyPaidAmount } from '@/utils/inscription-utils';
import { zValidator } from '@hono/zod-validator';
import { prisma } from '@repo/database';
import {
  AlreadyPaidQuery$,
  AlreadyPaidResponse$,
  Competition$,
  competitionInclude,
} from '@repo/utils';
import { Hono } from 'hono';

export const userAlreadyPaidRoutes = new Hono()

  // GET /users/me/already-paid - Get already paid amounts for specific athletes in a competition
  .get('/', zValidator('query', AlreadyPaidQuery$), async c => {
    const session = getSession(c);
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
  });
