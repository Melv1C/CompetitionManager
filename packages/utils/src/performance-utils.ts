import type { EventType } from './schemas';

/**
 * Compare two performance values based on event type
 * For time: lower is better (returns negative if a is better)
 * For distance/height/points: higher is better (returns negative if a is better)
 * @param a - First performance value
 * @param b - Second performance value
 * @param type - The event type
 * @returns Negative if a is better, positive if b is better, 0 if equal
 */
export function sortPerf(a: number, b: number, type: EventType): number {
  // Handle special codes (negative values indicate special states)
  const aIsSpecial = a < 0;
  const bIsSpecial = b < 0;

  // Both are special codes - maintain order
  if (aIsSpecial && bIsSpecial) return 0;
  // Only a is special - b is better
  if (aIsSpecial) return 1;
  // Only b is special - a is better
  if (bIsSpecial) return -1;

  // For time events, lower is better
  if (type === 'time') {
    return a - b;
  }

  // For distance, height, points - higher is better
  return b - a;
}

/**
 * Format a performance value based on the event type
 * @param value - The performance value to format
 * @param type - The type of performance ('time', 'distance', 'height', 'points')
 * @returns Formatted string representation of the performance
 */
export function formatPerformance(value: number | undefined | null, type: EventType): string {
  if (value === undefined || value === null) return '-';

  switch (type) {
    case 'time': {
      const minutes = Math.floor(value / 60000);
      const seconds = Math.floor((value % 60000) / 1000);
      const centiseconds = Math.ceil((value % 1000) / 10);
      return minutes > 0
        ? `${minutes}:${seconds.toString().padStart(2, '0')}.${centiseconds
            .toString()
            .padStart(2, '0')}`
        : `${seconds}.${centiseconds.toString().padStart(2, '0')}`;
    }

    case 'distance':
    case 'height': {
      return `${value.toFixed(2)}m`;
    }

    case 'points': {
      return `${value} pts`;
    }

    default:
      return value.toFixed(2);
  }
}
