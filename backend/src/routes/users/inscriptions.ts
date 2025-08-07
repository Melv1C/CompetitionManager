import { prisma } from '@/lib/prisma';
import { getRequiredSession } from '@/utils/auth-utils';
import { logError } from '@/utils/log-utils';
import { Inscription$, inscriptionInclude } from '@repo/core/schemas';
import { Hono } from 'hono';

const userInscriptionsRoutes = new Hono();

// GET /users/me/inscriptions - Get all inscriptions for the current user
userInscriptionsRoutes.get('/me/inscriptions', async (c) => {
  try {
    const session = await getRequiredSession(c);

    // Get all inscriptions for the current user
    const inscriptions = await prisma.inscription.findMany({
      where: {
        userId: session.userId,
      },
      include: inscriptionInclude,
      orderBy: [
        { inscriptionDate: 'desc' },
      ],
    });

    return c.json(Inscription$.array().parse(inscriptions));
  } catch (error) {
    logError('Failed to fetch user inscriptions', error, c);
    return c.json({ error: 'Failed to fetch user inscriptions' }, 500);
  }
});

export { userInscriptionsRoutes };
