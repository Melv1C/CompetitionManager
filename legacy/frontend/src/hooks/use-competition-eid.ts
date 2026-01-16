import type { Cuid } from '@repo/core/schemas';
import { useParams } from 'react-router-dom';

/**
 * Custom hook to extract and validate the competition ID (eid) from URL parameters
 * @returns The validated competition ID
 * @throws Error if the competition ID is not present in the URL
 */
export function useCompetitionEid(): Cuid {
  const { competitionEid } = useParams<{ competitionEid: Cuid }>();

  if (!competitionEid) {
    throw new Error('Competition ID (eid) is required');
  }

  return competitionEid;
}
