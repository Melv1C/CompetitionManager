import { useRequiredCompetition } from '@/features/competitions';
import { useCompetitionEid } from '@/hooks';
import { InscriptionStatus$, type Athlete } from '@repo/core/schemas';
import { useTranslation } from 'react-i18next';
import { useCompetitionInscriptions, useUserInscriptions } from './use-inscriptions';
import { useInscriptionFormStore } from '../store/inscription-form-store';
import { getSeasonBib, getSeasonClub } from '@repo/core/utils';

type AthleteBlockStatus =
  | {
      isBlocked: false;
      reason?: undefined;
    }
  | {
      isBlocked: true;
      reason: string;
    };

/**
 * Hook to check if an athlete is blocked from registration and get the translated reason
 */
export function useAthleteBlockStatus(athlete?: Athlete): AthleteBlockStatus {
  const { t } = useTranslation();
  const eid = useCompetitionEid();
  const competition = useRequiredCompetition(eid);
  const inscriptions = useCompetitionInscriptions(eid);
  const userInscriptions = useUserInscriptions();

  const { registrations } = useInscriptionFormStore(state => state);

  if (!athlete) {
    return { isBlocked: false };
  }

  // Check if athlete is registered by any user
  const isAthleteRegisteredByOtherUser =
    inscriptions.data?.some(insc => insc.athlete.id === athlete.id) ?? false;

  // Check if athlete is registered by the current user
  const isAthleteRegisteredByCurrentUser =
    userInscriptions.data?.some(
      insc =>
        insc.athlete.id === athlete.id &&
        insc.competitionId === competition.id &&
        insc.status !== InscriptionStatus$.enum.CANCELLED,
    ) ?? false;

  // Athlete is blocked if registered by another user but not by current user
  const isBlocked = isAthleteRegisteredByOtherUser && !isAthleteRegisteredByCurrentUser;

  if (isBlocked) {
    return {
      isBlocked: true,
      reason: t('inscriptions:athleteAlreadyRegistered'),
    };
  }

  // Check if athlete is already in the current registration list
  const isAthleteInCurrentRegistrations = registrations.some(reg => reg.athlete.id === athlete.id);

  if (isAthleteInCurrentRegistrations) {
    return {
      isBlocked: true,
      reason: t('inscriptions:athleteInCurrentRegistrations'),
    };
  }

  //Check if the athlete has a bib for the season
  const hasBibForSeason = !!getSeasonBib(athlete, competition.startDate);

  if (!hasBibForSeason) {
    return {
      isBlocked: true,
      reason: t('inscriptions:athleteNoBibForSeason'),
    };
  }

  // Check if competition is open for athlete's club
  const isCompetitionOpenForAthleteClub =
    competition.allowedClubs.length > 0
      ? competition.allowedClubs
          .map(c => c.id)
          .includes(getSeasonClub(athlete, competition.startDate)?.id ?? -1)
      : true; // If no clubs are specified, competition is open to all clubs

  if (!isCompetitionOpenForAthleteClub) {
    return {
      isBlocked: true,
      reason: t('inscriptions:competitionNotOpenForAthleteClubs', {
        clubs: competition.allowedClubs.map(c => c.name).join(', '),
      }),
    };
  }

  return { isBlocked: false };
}
