import type { Athlete, Inscription } from '@repo/core/schemas';
import { useMemo } from 'react';
import type { AthleteWithInscriptions } from '../types';

const getCurrentYear = () => new Date().getFullYear();

export const useAthleteInscriptionsMap = (inscriptions: Inscription[] | undefined) => {
  return useMemo(() => {
    if (!inscriptions) return new Map<number, Inscription[]>();

    const map = new Map<number, Inscription[]>();
    inscriptions.forEach(inscription => {
      const athleteId = inscription.athlete.id;
      const existingInscriptions = map.get(athleteId);
      if (existingInscriptions) {
        existingInscriptions.push(inscription);
      } else {
        map.set(athleteId, [inscription]);
      }
    });

    return map;
  }, [inscriptions]);
};

export const useFilteredAthletes = (
  athleteInscriptionsMap: Map<number, Inscription[]>,
  searchKey: string,
): AthleteWithInscriptions[] => {
  return useMemo(() => {
    const allAthletes = Array.from(athleteInscriptionsMap.entries()).map(([_, inscriptions]) => ({
      athlete: inscriptions[0].athlete,
      inscriptions,
    }));

    if (!searchKey.trim()) {
      return allAthletes;
    }

    const keys = searchKey
      .toLowerCase()
      .split(' ')
      .filter(k => k.trim().length > 0);
    const currentYear = getCurrentYear();

    return allAthletes
      .filter(({ athlete }) => matchesSearchKeys(athlete, keys, currentYear))
      .sort((a, b) => sortByBestMatch(a.athlete, b.athlete, keys, currentYear));
  }, [athleteInscriptionsMap, searchKey]);
};

const matchesSearchKeys = (athlete: Athlete, keys: string[], currentYear: number): boolean => {
  return keys.every(key => {
    const firstName = athlete.firstName.toLowerCase();
    const lastName = athlete.lastName.toLowerCase();
    const license = athlete.license.toLowerCase();

    if (firstName.includes(key) || lastName.includes(key) || license.includes(key)) {
      return true;
    }

    const bibNumber = parseInt(key);
    if (!isNaN(bibNumber)) {
      const currentSeasonInfo = athlete.athleteInfo.find(info => info.season === currentYear);
      if (currentSeasonInfo && currentSeasonInfo.bib === bibNumber) {
        return true;
      }
    }

    return false;
  });
};

const sortByBestMatch = (a: Athlete, b: Athlete, keys: string[], currentYear: number): number => {
  const aFirstName = a.firstName.toLowerCase();
  const aLastName = a.lastName.toLowerCase();
  const bFirstName = b.firstName.toLowerCase();
  const bLastName = b.lastName.toLowerCase();
  const firstKey = keys[0];

  // Check bib match
  const aBibInfo = a.athleteInfo.find(info => info.season === currentYear);
  const bBibInfo = b.athleteInfo.find(info => info.season === currentYear);
  const aBibMatch = aBibInfo && aBibInfo.bib === parseInt(firstKey);
  const bBibMatch = bBibInfo && bBibInfo.bib === parseInt(firstKey);

  if (aBibMatch && !bBibMatch) return -1;
  if (!aBibMatch && bBibMatch) return 1;

  // Check first name match
  const aFirstMatch = aFirstName.startsWith(firstKey);
  const bFirstMatch = bFirstName.startsWith(firstKey);

  if (aFirstMatch && !bFirstMatch) return -1;
  if (!aFirstMatch && bFirstMatch) return 1;

  // Check last name match
  const aLastMatch = aLastName.startsWith(firstKey);
  const bLastMatch = bLastName.startsWith(firstKey);

  if (aLastMatch && !bLastMatch) return -1;
  if (!aLastMatch && bLastMatch) return 1;

  // Default alphabetical sort
  return aFirstName.localeCompare(bFirstName);
};

export const useSeparatedAthletes = (filteredAthletes: AthleteWithInscriptions[]) => {
  return useMemo(() => {
    const unknown: AthleteWithInscriptions[] = [];
    const confirmed: AthleteWithInscriptions[] = [];

    filteredAthletes.forEach(({ athlete, inscriptions }) => {
      const hasUnknown = inscriptions.some(i => i.presenceStatus === 'UNKNOWN');
      if (hasUnknown) {
        unknown.push({ athlete, inscriptions });
      } else {
        confirmed.push({ athlete, inscriptions });
      }
    });

    return { unknownAthletes: unknown, confirmedAthletes: confirmed };
  }, [filteredAthletes]);
};
