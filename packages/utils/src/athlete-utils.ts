import { getSeason } from './get-season';
import type { AbbrBaseCategory, Athlete, BaseCategory, Category, Gender } from './schemas';

/**
 * Get the bib number for an athlete for a specific season
 * @param athlete - The athlete object containing athleteInfo
 * @param referenceDate - Reference date to determine season (defaults to current date)
 * @returns The bib number or null if not found
 */
export function getSeasonBib(athlete: Athlete, referenceDate: Date = new Date()) {
  const season = getSeason(referenceDate);
  const athleteInfo = athlete.athleteInfo.find(info => info.season === season);

  return athleteInfo?.bib ?? null;
}

/**
 * Get the club name for an athlete for a specific season
 * @param athlete - The athlete object containing athleteInfo
 * @param referenceDate - Reference date to determine season (defaults to current date)
 * @returns The club name or null if not found
 */
export function getSeasonClub(athlete: Athlete, referenceDate: Date = new Date()) {
  const season = referenceDate.getFullYear();
  const athleteInfo = athlete.athleteInfo.find(info => info.season === season);

  return athleteInfo?.club ?? null;
}

/**
 * Calculate age based on birthdate and reference date
 * @param birthdate - The athlete's birthdate
 * @param referenceDate - Reference date (defaults to current date)
 * @returns The calculated age
 */
function getAge(birthdate: Date, referenceDate: Date = new Date()): number {
  const isBirthdayPassed =
    referenceDate.getMonth() > birthdate.getMonth() ||
    (referenceDate.getMonth() === birthdate.getMonth() &&
      referenceDate.getDate() >= birthdate.getDate());

  return referenceDate.getFullYear() - birthdate.getFullYear() - (isBirthdayPassed ? 0 : 1);
}

/**
 * Get full category information for an athlete based on birthdate and gender
 * @param athlete - The athlete object
 * @param referenceDate - Reference date (defaults to current date)
 * @returns Object containing category information
 */
export function getAthleteCategory(athlete: Athlete, referenceDate: Date = new Date()): Category {
  const age = getAge(athlete.birthdate, referenceDate);

  // Handle Master categories (35 and older)
  if (age >= 35) {
    const masterAge = Math.floor(age / 5) * 5;
    return {
      name: `Master ${masterAge} ${athlete.gender === 'M' ? 'M' : 'F'}`,
      abbr: `${athlete.gender === 'M' ? 'M' : 'W'}${masterAge}`,
      baseCategory: 'Master',
      abbrBaseCategory: 'MAS',
      gender: athlete.gender,
      masterAgeGroup: masterAge,
    };
  }

  // Calculate athletics season year (season changes in September)
  const athleticsAge = getSeason(referenceDate) - athlete.birthdate.getFullYear();

  const getCategoryInfo = (baseCategory: BaseCategory, abbrBaseCategory: AbbrBaseCategory) => {
    const genderSuffix = athlete.gender === 'M' ? 'M' : 'F';
    // Handle special feminine forms for certain categories
    const categoryName = getCategoryDisplayName(baseCategory, athlete.gender);

    return {
      name: `${categoryName} ${genderSuffix}`,
      abbr: `${abbrBaseCategory} ${genderSuffix}`,
      baseCategory,
      abbrBaseCategory,
      gender: athlete.gender,
    };
  };

  const categories = [
    {
      min: 0,
      max: 7,
      baseCategory: 'Kangourou' as BaseCategory,
      abbrBaseCategory: 'KAN' as AbbrBaseCategory,
    },
    {
      min: 8,
      max: 9,
      baseCategory: 'Benjamin' as BaseCategory,
      abbrBaseCategory: 'BEN' as AbbrBaseCategory,
    },
    {
      min: 10,
      max: 11,
      baseCategory: 'Pupille' as BaseCategory,
      abbrBaseCategory: 'PUP' as AbbrBaseCategory,
    },
    {
      min: 12,
      max: 13,
      baseCategory: 'Minime' as BaseCategory,
      abbrBaseCategory: 'MIN' as AbbrBaseCategory,
    },
    {
      min: 14,
      max: 15,
      baseCategory: 'Cadet' as BaseCategory,
      abbrBaseCategory: 'CAD' as AbbrBaseCategory,
    },
    {
      min: 16,
      max: 17,
      baseCategory: 'Scolaire' as BaseCategory,
      abbrBaseCategory: 'SCO' as AbbrBaseCategory,
    },
    {
      min: 18,
      max: 19,
      baseCategory: 'Junior' as BaseCategory,
      abbrBaseCategory: 'JUN' as AbbrBaseCategory,
    },
    {
      min: 20,
      max: 22,
      baseCategory: 'Espoir' as BaseCategory,
      abbrBaseCategory: 'ESP' as AbbrBaseCategory,
    },
    {
      min: 23,
      max: 36, // Up to 36 to be sure
      baseCategory: 'Senior' as BaseCategory,
      abbrBaseCategory: 'SEN' as AbbrBaseCategory,
    },
  ];

  const foundCategory = categories.find(c => athleticsAge >= c.min && athleticsAge <= c.max);
  return getCategoryInfo(foundCategory!.baseCategory, foundCategory!.abbrBaseCategory);
}

/**
 * Get the proper display name for a category, handling feminine forms
 * @param baseCategory - The base category
 * @param gender - The athlete's gender
 * @returns The proper display name
 */
function getCategoryDisplayName(baseCategory: BaseCategory, gender: Gender): string {
  if (gender === 'F') {
    switch (baseCategory) {
      case 'Benjamin':
        return 'Benjamine';
      case 'Cadet':
        return 'Cadette';
      case 'Junior':
        return 'Juniore';
      case 'Senior':
        return 'Seniore';
      default:
        return baseCategory;
    }
  }
  return baseCategory;
}
