import { prisma, type Prisma } from '@/lib/prisma';
import {
  Competition$,
  competitionInclude,
} from '@competition-manager/core/schemas';

export interface GetCompetitionsOptions {
  where?: Prisma.CompetitionWhereInput;
  orderBy?:
    | Prisma.CompetitionOrderByWithRelationInput
    | Prisma.CompetitionOrderByWithRelationInput[];
  skip?: number;
  take?: number;
}

/**
 * Reusable utility function to fetch competitions with consistent include options
 * Used across different route handlers for competitions
 */
export async function getCompetitions(options: GetCompetitionsOptions = {}) {
  const { where, orderBy = { startDate: 'asc' }, skip, take } = options;

  const competitions = await prisma.competition.findMany({
    where,
    orderBy,
    skip,
    take,
    include: competitionInclude,
  });

  return Competition$.array().parse(competitions);
}

/**
 * Get competitions count with optional filtering
 */
export async function getCompetitionsCount(
  where?: Prisma.CompetitionWhereInput
) {
  return prisma.competition.count({ where });
}
