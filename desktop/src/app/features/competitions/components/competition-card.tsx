import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useCompetitionStore } from '@/store/competition';
import type { Competition } from '@repo/core/schemas';
import { CalendarIcon, MapPinIcon, TrophyIcon } from 'lucide-react';

interface CompetitionCardProps {
  competition: Competition;
}

export function CompetitionCard({ competition }: CompetitionCardProps) {
  const setCompetition = useCompetitionStore(state => state.setCompetition);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  const isUpcoming = new Date(competition.startDate) > new Date();
  const isMultiDay =
    new Date(competition.startDate).toDateString() !== new Date(competition.endDate).toDateString();

  const handleClick = () => {
    setCompetition(competition);
  };

  return (
    <Card className="h-full transition-all hover:shadow-md cursor-pointer" onClick={handleClick}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="text-lg font-semibold leading-tight">{competition.name}</CardTitle>
          <Badge variant={isUpcoming ? 'default' : 'secondary'} className="shrink-0">
            {isUpcoming ? 'Upcoming' : 'Past'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CalendarIcon className="h-4 w-4" />
          <span>
            {formatDate(competition.startDate)}
            {isMultiDay && ` - ${formatDate(competition.endDate)}`}
          </span>
        </div>

        {competition.location && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPinIcon className="h-4 w-4" />
            <span>{competition.location}</span>
          </div>
        )}

        {competition.events && competition.events.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <TrophyIcon className="h-4 w-4" />
            <span>
              {competition.events.length} {competition.events.length === 1 ? 'event' : 'events'}
            </span>
          </div>
        )}

        {competition.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{competition.description}</p>
        )}

        <div className="flex items-center gap-2 pt-2">
          <Badge variant={competition.isPublished ? 'default' : 'outline'} className="text-xs">
            {competition.isPublished ? 'Published' : 'Draft'}
          </Badge>
          {competition.isSelection && (
            <Badge variant="secondary" className="text-xs">
              Selection
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
