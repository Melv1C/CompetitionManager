import type { Athlete, Inscription } from '@repo/core/schemas';

export interface AthleteWithInscriptions {
  athlete: Athlete;
  inscriptions: Inscription[];
}

export interface PresenceStatusCounts {
  presentCount: number;
  absentCount: number;
  unknownCount: number;
}

export const countPresenceStatuses = (inscriptions: Inscription[]): PresenceStatusCounts => ({
  presentCount: inscriptions.filter(i => i.presenceStatus === 'PRESENT').length,
  absentCount: inscriptions.filter(i => i.presenceStatus === 'ABSENT').length,
  unknownCount: inscriptions.filter(i => i.presenceStatus === 'UNKNOWN').length,
});
