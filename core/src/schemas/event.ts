import { z } from 'zod/v4';
import { Id$ } from './base';

export const EventGroup$ = z.enum([
  'sprint',
  'middle',
  'long',
  'hurdles',
  'relay',
  'jump',
  'throw',
  'combined',
]);
export type EventGroup = z.infer<typeof EventGroup$>;

export const EventType$ = z.enum(['time', 'distance', 'height', 'points']);
export type EventType = z.infer<typeof EventType$>;

// Event base schema
export const Event$ = z.object({
  id: Id$,
  name: z.string(),
  abbr: z.string(),
  group: EventGroup$,
  type: EventType$,
});
export type Event = z.infer<typeof Event$>;

// Event create schema (omit id)
export const EventCreate$ = Event$.omit({ id: true });
export type EventCreate = z.infer<typeof EventCreate$>;

// Event update schema (all fields optional except id)
export const EventUpdate$ = EventCreate$.partial();
export type EventUpdate = z.infer<typeof EventUpdate$>;
