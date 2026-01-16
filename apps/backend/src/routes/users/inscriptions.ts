import { getSession } from '@/utils/auth-utils';
import { prisma } from '@repo/database';
import { Inscription$, inscriptionInclude } from '@repo/utils';
import { Hono } from 'hono';

export const userInscriptionsRoutes = new Hono()

  // GET /users/me/inscriptions - Get all inscriptions for the current user
  .get('/', async c => {
    const session = getSession(c);

    // Get all inscriptions for the current user
    const inscriptions = await prisma.inscription.findMany({
      where: {
        userId: session.userId,
      },
      include: inscriptionInclude,
      orderBy: [{ inscriptionDate: 'desc' }],
    });

    return c.json(Inscription$.array().parse(inscriptions));
  });
