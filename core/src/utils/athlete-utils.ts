import type { Athlete } from '@/schemas';

/**
 * Get the bib number for an athlete for a specific season
 * @param athlete - The athlete object containing athleteInfo
 * @param refDate - Reference date to determine season (defaults to current date)
 * @returns The bib number or null if not found
 */
export function getSeasonBib(
  athlete: Athlete,
  refDate: Date = new Date()
): number | null {
  const season = refDate.getFullYear();
  console.log(`Getting bib for season: ${season}`);
  console.log(`Athlete info:`, athlete);
  const athleteInfo = athlete.athleteInfo.find(
    (info) => info.season === season
  );

  return athleteInfo?.bib ?? null;
}
