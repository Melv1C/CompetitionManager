import { useParams } from 'react-router-dom';
import type { Cuid } from '@repo/core/schemas';

/**
 * Custom hook to extract and validate the competition ID (eid) from URL parameters
 * @returns The validated competition ID
 * @throws Error if the competition ID is not present in the URL
 */
export function useCompetitionEid(): Cuid {
  const { eid } = useParams<{ eid: Cuid }>();

  if (!eid) {
    throw new Error('Competition ID (eid) is required');
  }

  return eid;
}
