import type { EventType } from '@/schemas';

/**
 * Format a performance value based on the event type
 * @param value - The performance value to format
 * @param type - The type of performance ('time', 'distance', 'height', 'points')
 * @returns Formatted string representation of the performance
 */
export function formatPerformance(
  value: number | undefined | null,
  type: EventType
): string {
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
