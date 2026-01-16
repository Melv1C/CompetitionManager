/**
 * Configuration for combined events
 * Maps combined event names to their sub-event count
 */
export const COMBINED_EVENT_CONFIG: Record<string, number> = {
  Décathlon: 10,
  Heptathlon: 7,
  Pentathlon: 5,
  Octathlon: 8,
  Hexathlon: 6,
  Tétrathlon: 4,
  Triathlon: 3,
} as const;

/**
 * Get the number of sub-events for a combined event
 */
export function getCombinedEventSubEventsCount(eventName: string): number {
  return COMBINED_EVENT_CONFIG[eventName] || 0;
}

/**
 * Check if an event is a combined event
 */
export function isCombinedEvent(eventName: string): boolean {
  return eventName in COMBINED_EVENT_CONFIG;
}

/**
 * Get all combined event names
 */
export function getCombinedEventNames(): string[] {
  return Object.keys(COMBINED_EVENT_CONFIG);
}
