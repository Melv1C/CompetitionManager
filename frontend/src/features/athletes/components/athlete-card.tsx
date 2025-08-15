import { Card, CardContent } from '@/components/ui/card';
import { RacingBib } from '@/components/racing-bib';
import { cn } from '@/lib/utils';
import type { Athlete } from '@repo/core/schemas';
import { getAthleteCategory, getSeasonBib, getSeasonClub } from '@repo/core/utils';

interface AthleteCardProps {
  athlete: Athlete;
  referenceDate?: Date;
  isClickable?: boolean;
  onClick?: () => void;
}

/**
 * Athlete card component for displaying athlete information in search results.
 * Prioritizes bib number, name, club, and category as requested.
 */
export function AthleteCard({
  athlete,
  referenceDate,
  isClickable = true,
  onClick,
}: AthleteCardProps) {
  const bib = getSeasonBib(athlete, referenceDate);
  const club = getSeasonClub(athlete, referenceDate);
  const category = getAthleteCategory(athlete, referenceDate);
  const fullName = `${athlete.firstName} ${athlete.lastName}`;

  return (
    <Card
      className={cn(
        'transition-colors border-0 shadow-none py-1',
        isClickable && 'cursor-pointer hover:bg-accent',
      )}
      onClick={isClickable ? onClick : undefined}
    >
      <CardContent className="p-3">
        <div className="flex items-center gap-3">
          <RacingBib number={bib} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-sm truncate">{fullName}</h4>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
              <span>{club?.abbr || 'No Club'}</span>
              <span>{category.abbr}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
