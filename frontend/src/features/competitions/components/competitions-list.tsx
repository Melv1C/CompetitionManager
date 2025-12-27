import type { Competition } from '@repo/core/schemas';
import { Badge, Card, cn, Separator } from '@repo/ui';
import { Radio } from 'lucide-react';
import { Fragment } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

interface CompetitionsListProps {
  competitions: Competition[];
}

function isCompetitionInProgress(competition: Competition): boolean {
  const now = new Date();

  return now >= competition.startDate && now <= competition.endDate;
}

function DateBadge({ date }: { date: Date }) {
  const day = date.getDate();

  return (
    <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center overflow-hidden rounded-lg bg-orange-500 text-white shadow-sm">
      <span className="text-xl font-bold leading-tight">{day}</span>
    </div>
  );
}

function YearDivider({ year }: { year: number }) {
  return (
    <div className="flex items-center gap-3 pt-6 pb-2">
      <span className="text-xl font-bold text-foreground">{year}</span>
      <Separator className="flex-1" />
    </div>
  );
}

function MonthDivider({ month, locale }: { month: string; locale: string }) {
  const date = new Date(month);
  const monthName = date.toLocaleDateString(locale, { month: 'long' });

  return (
    <div className="flex items-center gap-3 pt-4 pb-2">
      <span className="text-base font-semibold capitalize text-muted-foreground">{monthName}</span>
      <Separator className="flex-1" />
    </div>
  );
}

function getDaysBetween(startDate: Date, endDate: Date): Date[] {
  const days: Date[] = [];
  const current = new Date(startDate);
  current.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  while (current <= end) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
}

interface CompetitionDayCardProps {
  competition: Competition;
  date: Date;
  dayIndex: number;
  totalDays: number;
}

function CompetitionDayCard({ competition, date, dayIndex, totalDays }: CompetitionDayCardProps) {
  const { t } = useTranslation();
  const inProgress = isCompetitionInProgress(competition);

  return (
    <Link to={`/competitions/${competition.eid}`} className="block">
      <Card
        className={cn(
          'gap-0 py-0 transition-colors hover:bg-muted/50',
          inProgress && 'border-green-500 bg-green-500/5',
        )}
      >
        <div className="flex items-center gap-4 p-4">
          <DateBadge date={date} />
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="truncate font-semibold leading-tight">
              {competition.name}
              {totalDays > 1 && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">
                  ({t('inscriptions:day')} {dayIndex + 1}/{totalDays})
                </span>
              )}
            </h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <Badge variant="outline">{competition.organization.name}</Badge>
            </div>
          </div>
          {inProgress && (
            <Badge variant="default" className="shrink-0 gap-1.5 bg-green-600 hover:bg-green-600">
              <Radio className="h-3 w-3 animate-pulse" />
              {t('inscriptions:status.in_progress')}
            </Badge>
          )}
        </div>
      </Card>
    </Link>
  );
}

interface CompetitionDayItem {
  competition: Competition;
  date: Date;
  dayIndex: number;
  totalDays: number;
}

export function CompetitionsList({ competitions }: CompetitionsListProps) {
  const { t, i18n } = useTranslation();

  if (competitions.length === 0) {
    return (
      <div className="py-4 text-center text-muted-foreground">
        {t('messages:empty.competitions')}
      </div>
    );
  }

  // Build a list of (competition, date, dayIndex, totalDays) for each day
  const competitionDays: CompetitionDayItem[] = [];

  for (const competition of competitions) {
    const days = getDaysBetween(new Date(competition.startDate), new Date(competition.endDate));
    for (let i = 0; i < days.length; i++) {
      competitionDays.push({
        competition,
        date: days[i],
        dayIndex: i,
        totalDays: days.length,
      });
    }
  }

  // Sort by date
  competitionDays.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Group by year and month
  let currentYear: number | null = null;
  let currentMonth: string | null = null;

  return (
    <div className="flex flex-col gap-2">
      {competitionDays.map(({ competition, date, dayIndex, totalDays }) => {
        const year = date.getFullYear();
        const month = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const showYearDivider = year !== currentYear;
        const showMonthDivider = month !== currentMonth;

        if (showYearDivider) currentYear = year;
        if (showMonthDivider) currentMonth = month;

        return (
          <Fragment key={`${competition.id}-${dayIndex}`}>
            {showYearDivider && <YearDivider year={year} />}
            {showMonthDivider && !showYearDivider && (
              <MonthDivider month={month} locale={i18n.language} />
            )}
            {showYearDivider && <MonthDivider month={month} locale={i18n.language} />}
            <CompetitionDayCard
              competition={competition}
              date={date}
              dayIndex={dayIndex}
              totalDays={totalDays}
            />
          </Fragment>
        );
      })}
    </div>
  );
}
