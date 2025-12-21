import type { CompetitionEvent, Performance } from '@repo/core/schemas';

/**
 * Finds a matching performance for a competition event
 * Matches based on event name (eventName from Beathletics should match event.event.name)
 */
export function findMatchingPerformance(
  event: CompetitionEvent,
  performances: Performance[],
): Performance | null {
  // Try exact match on event name
  const exactMatch = performances.find(
    p => p.eventName.toLowerCase() === event.event.name.toLowerCase(),
  );
  if (exactMatch) return exactMatch;

  // Try matching the competition event name (which might be more specific)
  const eventNameMatch = performances.find(
    p => p.eventName.toLowerCase() === event.name.toLowerCase(),
  );
  if (eventNameMatch) return eventNameMatch;

  // Try partial match (event name contains the base event)
  const partialMatch = performances.find(
    p =>
      p.eventName.toLowerCase().includes(event.event.name.toLowerCase()) ||
      event.event.name.toLowerCase().includes(p.eventName.toLowerCase()),
  );
  if (partialMatch) return partialMatch;

  return null;
}

/**
 * Parses a user-entered performance value based on event type
 * Returns the value in milliseconds for time, meters for distance/height, or raw points
 */
export function parsePerformanceInput(input: string, eventType: string): number | null {
  const trimmed = input.trim();
  if (!trimmed) return null;

  switch (eventType) {
    case 'time': {
      return parseTimeInput(trimmed);
    }

    case 'distance':
    case 'height': {
      // Support formats: "6.45" or "6,45" (meters)
      const normalized = trimmed.replace(',', '.').replace(/m$/i, '').trim();
      // Must be a valid positive number
      if (!/^\d+(\.\d+)?$/.test(normalized)) return null;
      const value = parseFloat(normalized);
      if (isNaN(value) || value <= 0 || value > 100) return null; // Reasonable bounds for athletics
      return value;
    }

    case 'points': {
      // Must be a positive integer
      if (!/^\d+$/.test(trimmed)) return null;
      const value = parseInt(trimmed, 10);
      if (isNaN(value) || value <= 0 || value > 10000) return null; // Reasonable bounds for points
      return value;
    }

    default:
      return null;
  }
}

/**
 * Parses time input in strict formats:
 * - MM:SS.cc or MM:SS (minutes:seconds.centiseconds)
 * - SS.cc or SS (seconds.centiseconds)
 * Max 59 for SS and MM, max 99 for cc
 * Returns time in milliseconds
 */
function parseTimeInput(input: string): number | null {
  const trimmed = input.trim().replace(',', '.');

  // Format: MM:SS.cc or MM:SS (with optional centiseconds)
  const colonFormat = /^(\d{1,2}):(\d{1,2})(?:\.(\d{1,2}))?$/;
  const colonMatch = trimmed.match(colonFormat);
  if (colonMatch) {
    const minutes = parseInt(colonMatch[1], 10);
    const seconds = parseInt(colonMatch[2], 10);
    const centiseconds = colonMatch[3] ? parseInt(colonMatch[3].padEnd(2, '0').slice(0, 2), 10) : 0;

    // Validate ranges
    if (minutes < 0 || minutes > 59) return null;
    if (seconds < 0 || seconds > 59) return null;
    if (centiseconds < 0 || centiseconds > 99) return null;

    return (minutes * 60 + seconds) * 1000 + centiseconds * 10;
  }

  // Format: SS.cc (seconds with centiseconds, no minutes)
  const secondsFormat = /^(\d{1,2})\.(\d{1,2})$/;
  const secondsMatch = trimmed.match(secondsFormat);
  if (secondsMatch) {
    const seconds = parseInt(secondsMatch[1], 10);
    const centiseconds = parseInt(secondsMatch[2].padEnd(2, '0').slice(0, 2), 10);

    // Validate ranges
    if (seconds < 0 || seconds > 59) return null;
    if (centiseconds < 0 || centiseconds > 99) return null;

    return seconds * 1000 + centiseconds * 10;
  }

  // Format: Just seconds (integer)
  const integerFormat = /^(\d{1,2})$/;
  const integerMatch = trimmed.match(integerFormat);
  if (integerMatch) {
    const seconds = parseInt(integerMatch[1], 10);
    if (seconds < 0 || seconds > 59) return null;
    return seconds * 1000;
  }

  return null;
}

/**
 * Normalizes performance input on blur (replaces comma with period)
 */
export function normalizePerformanceInput(input: string, eventType: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';

  if (eventType === 'time' || eventType === 'distance' || eventType === 'height') {
    return trimmed.replace(',', '.');
  }

  return trimmed;
}

export function getInputLabel(eventType: string, t: (key: string) => string): string {
  switch (eventType) {
    case 'time':
      return t('inscriptions:timeInput');
    case 'distance':
    case 'height':
      return t('inscriptions:distanceInput');
    case 'points':
      return t('inscriptions:pointsInput');
    default:
      return t('inscriptions:performanceInput');
  }
}

export function getInputPlaceholder(eventType: string): string {
  switch (eventType) {
    case 'time':
      return '10.23 or 1:05.23';
    case 'distance':
    case 'height':
      return '6.45';
    case 'points':
      return '5000';
    default:
      return '';
  }
}

export function getInputHelp(eventType: string, t: (key: string) => string): string {
  switch (eventType) {
    case 'time':
      return t('inscriptions:timeInputHelp');
    case 'distance':
    case 'height':
      return t('inscriptions:distanceInputHelp');
    case 'points':
      return t('inscriptions:pointsInputHelp');
    default:
      return '';
  }
}
