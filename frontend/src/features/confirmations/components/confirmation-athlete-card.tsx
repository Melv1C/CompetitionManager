import type { Athlete } from '@repo/core/schemas';
import { Card, CardContent } from '@repo/ui';

interface ConfirmationAthleteCardProps {
  athlete: Athlete;
  presentCount?: number;
  absentCount?: number;
  unknownCount?: number;
  onClick: () => void;
}

export const ConfirmationAthleteCard = ({
  athlete,
  presentCount = 0,
  absentCount = 0,
  unknownCount = 0,
  onClick,
}: ConfirmationAthleteCardProps) => {
  const currentYear = new Date().getFullYear();
  const currentSeasonInfo = athlete.athleteInfo.find(info => info.season === currentYear);

  const bib = currentSeasonInfo?.bib ?? athlete.license ?? '-';
  const clubAbbr = currentSeasonInfo?.club?.abbr ?? '';

  return (
    <Card className="cursor-pointer transition-colors hover:bg-accent" onClick={onClick}>
      <CardContent className="flex items-center justify-between py-0 px-4">
        <div className="flex flex-col">
          <div className="font-medium">
            {bib} - {athlete.firstName} {athlete.lastName}{' '}
            {clubAbbr && <span className="text-sm text-muted-foreground">({clubAbbr})</span>}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Present */}
          {presentCount > 0 && (
            <span className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              <span>{presentCount}</span>
            </span>
          )}

          {/* Absent */}
          {absentCount > 0 && (
            <span className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">
              <span className="h-2 w-2 rounded-full bg-rose-600" />
              <span>{absentCount}</span>
            </span>
          )}

          {/* Unknown */}
          {unknownCount > 0 && (
            <span className="inline-flex items-center gap-2 px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
              <span className="h-2 w-2 rounded-full bg-slate-600" />
              <span>{unknownCount}</span>
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
