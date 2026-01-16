import { EventType, ResultDetailCode, sortPerf, UpdateResultDetail } from '@repo/utils';

/**
 * Process result details: filter, update values, sort, and mark best
 * @param details - Array of result details to process
 * @param eventType - The event type for sorting logic
 * @returns Processed details with isBest and isOfficialRecord set
 */
export function processResultDetails(
  details: UpdateResultDetail[],
  eventType: EventType,
): Array<UpdateResultDetail & { isBest: boolean; isOfficialRecord: boolean }> {
  // Filter details based on event type
  const validDetails = details.filter(detail => {
    if (eventType === 'distance') {
      // Remove if value is 0
      return detail.performanceValue !== 0;
    }
    if (eventType === 'height') {
      // Remove if attempts is empty
      return detail.attempts && detail.attempts.length > 0;
    }
    return true;
  });

  // Update values based on event type
  const updatedDetails = validDetails.map(detail => {
    const updated = { ...detail };

    if (eventType === 'distance') {
      // For distance events, ensure attempts is empty
      updated.attempts = [];
    } else if (eventType === 'height') {
      // For height events, set value based on attempts
      const hasSuccessfulAttempt = detail.attempts.includes('O');
      updated.performanceValue = hasSuccessfulAttempt ? detail.attemptNumber : 0;
    }

    return updated;
  });

  // Sort by performance
  const sortedDetails = [...updatedDetails].sort((a, b) =>
    sortPerf(a.performanceValue, b.performanceValue, eventType),
  );

  // Mark isBest for the first (best) detail
  return sortedDetails.map((detail, idx) => ({
    ...detail,
    isBest: idx === 0,
    isOfficialRecord: idx === 0, // Assuming first is official best for now
  }));
}

/**
 * Extract result value and wind from the best detail
 * Handles special result codes appropriately
 * @param bestDetail - The best detail from processed results
 * @returns Object with value and wind for the result
 */
export function getResultValueFromDetail(bestDetail: UpdateResultDetail | undefined): {
  value: number | null;
  wind: number | null;
} {
  if (!bestDetail) {
    return { value: null, wind: null };
  }

  if (bestDetail.performanceValue > 0) {
    return {
      value: bestDetail.performanceValue,
      wind: bestDetail.windSpeed ?? null,
    };
  }

  // Handle special codes
  switch (bestDetail.performanceValue) {
    case ResultDetailCode.X:
      return { value: -4, wind: null }; // NM (No Mark)
    case ResultDetailCode.PASS:
      return { value: null, wind: null };
    case ResultDetailCode.R:
      return { value: -1, wind: null }; // DNF
    default:
      return { value: null, wind: null };
  }
}
