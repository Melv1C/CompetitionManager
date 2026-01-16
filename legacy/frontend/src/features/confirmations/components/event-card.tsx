import { formatTime } from '@/lib/formatters';
import type { Inscription } from '@repo/core/schemas';
import {
  Badge,
  Card,
  CardContent,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'node_modules/react-i18next';
import type { EventWithInscriptions } from '../hooks/use-event-filtering';
import type { PresenceStatusCounts } from '../types';

interface EventCardProps {
  eventData: EventWithInscriptions;
}

export const EventCard = ({ eventData }: EventCardProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const { event, inscriptions, counts } = eventData;

  const currentYear = new Date().getFullYear();

  const getAthleteDisplay = (inscription: Inscription) => {
    const athlete = inscription.athlete;
    const seasonInfo = athlete.athleteInfo.find(info => info.season === currentYear);
    const bib = seasonInfo?.bib ?? athlete.license ?? '-';
    const clubAbbr = seasonInfo?.club?.abbr;

    return {
      bib,
      name: `${athlete.firstName} ${athlete.lastName}`,
      club: clubAbbr,
    };
  };

  // Sort inscriptions by athlete bib/name
  const sortedInscriptions = [...inscriptions].sort((a, b) => {
    const aDisplay = getAthleteDisplay(a);
    const bDisplay = getAthleteDisplay(b);

    // Try to sort by bib number first
    const aBib = parseInt(String(aDisplay.bib));
    const bBib = parseInt(String(bDisplay.bib));

    if (!isNaN(aBib) && !isNaN(bBib)) {
      return aBib - bBib;
    }

    return aDisplay.name.localeCompare(bDisplay.name);
  });

  return (
    <Card className="cursor-pointer px-0 py-2 hover:bg-accent/50 transition-colors">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardContent className="cursor-pointer transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isOpen ? (
                  <ChevronDown className="size-4 text-muted-foreground" />
                ) : (
                  <ChevronRight className="size-4 text-muted-foreground" />
                )}
                <div className="text-sm font-mono text-muted-foreground">
                  {formatTime(event.eventStartTime)}
                </div>
                <div className="font-medium">{event.name}</div>
              </div>

              <StatusBadges counts={counts} />
            </div>
          </CardContent>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">{t('bib.title')}</TableHead>
                  <TableHead>{t('athlete.title')}</TableHead>
                  <TableHead>{t('club.title')}</TableHead>
                  <TableHead className="w-24 text-right">{t('confirmations:status')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedInscriptions.map(inscription => {
                  const display = getAthleteDisplay(inscription);

                  return (
                    <TableRow key={inscription.id}>
                      <TableCell className="font-mono text-muted-foreground">
                        {display.bib}
                      </TableCell>
                      <TableCell className="font-medium">{display.name}</TableCell>
                      <TableCell className="text-muted-foreground">{display.club || '-'}</TableCell>
                      <TableCell className="text-right">
                        <PresenceStatusBadge status={inscription.presenceStatus} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

interface StatusBadgesProps {
  counts: PresenceStatusCounts;
}

const StatusBadges = ({ counts }: StatusBadgesProps) => {
  const { presentCount, absentCount, unknownCount } = counts;

  return (
    <div className="flex items-center gap-2">
      {presentCount > 0 && (
        <Badge variant="outline" className="bg-emerald-100 text-emerald-800 border-emerald-200">
          <span className="mr-1.5 h-2 w-2 rounded-full bg-emerald-600" />
          {presentCount}
        </Badge>
      )}
      {absentCount > 0 && (
        <Badge variant="outline" className="bg-rose-100 text-rose-800 border-rose-200">
          <span className="mr-1.5 h-2 w-2 rounded-full bg-rose-600" />
          {absentCount}
        </Badge>
      )}
      {unknownCount > 0 && (
        <Badge variant="outline" className="bg-slate-100 text-slate-800 border-slate-200">
          <span className="mr-1.5 h-2 w-2 rounded-full bg-slate-600" />
          {unknownCount}
        </Badge>
      )}
    </div>
  );
};

interface PresenceStatusBadgeProps {
  status: 'PRESENT' | 'ABSENT' | 'UNKNOWN';
}

const PresenceStatusBadge = ({ status }: PresenceStatusBadgeProps) => {
  const { t } = useTranslation();

  const config = {
    PRESENT: {
      label: t('confirmations:statusPresent'),
      className: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      dotClassName: 'bg-emerald-600',
    },
    ABSENT: {
      label: t('confirmations:statusAbsent'),
      className: 'bg-rose-100 text-rose-800 border-rose-200',
      dotClassName: 'bg-rose-600',
    },
    UNKNOWN: {
      label: t('confirmations:statusUnknown'),
      className: 'bg-slate-100 text-slate-800 border-slate-200',
      dotClassName: 'bg-slate-600',
    },
  };

  const { label, className, dotClassName } = config[status];

  return (
    <Badge variant="outline" className={className}>
      <span className={`mr-1.5 h-2 w-2 rounded-full ${dotClassName}`} />
      {label}
    </Badge>
  );
};
