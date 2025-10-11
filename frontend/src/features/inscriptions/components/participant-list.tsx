import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useRequiredCompetition } from '@/features/competitions';
import { useCompetitionEid } from '@/hooks';
import type { InscriptionPublic } from '@repo/core/schemas';
import { formatPerformance, getSeasonBib } from '@repo/core/utils';
import { UsersIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useCompetitionInscriptions } from '../hooks/use-inscriptions';

function getStatusBadgeVariant(status: InscriptionPublic['status']) {
  switch (status) {
    case 'REGISTERED':
      return 'default';
    case 'SELECTED':
      return 'secondary';
    case 'PENDING_PAYMENT':
      return 'outline';
    case 'REJECTED':
      return 'destructive';
    case 'CANCELLED':
      return 'destructive';
    default:
      return 'outline';
  }
}

function getPresenceStatusBadgeVariant(status: InscriptionPublic['presenceStatus']) {
  switch (status) {
    case 'PRESENT':
      return 'default';
    case 'ABSENT':
      return 'destructive';
    case 'UNKNOWN':
      return 'outline';
    default:
      return 'outline';
  }
}

export function ParticipantListSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UsersIcon className="h-5 w-5" />
          <Skeleton className="h-6 w-32" />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <Skeleton className="h-4 w-12" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-32" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-24" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-20" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-16" />
              </TableHead>
              <TableHead>
                <Skeleton className="h-4 w-20" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={index}>
                <TableCell>
                  <Skeleton className="h-4 w-12" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-6 w-20" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export function ParticipantList() {
  const { t } = useTranslation();
  const eid = useCompetitionEid();
  const competition = useRequiredCompetition(eid);
  const inscriptions = useCompetitionInscriptions(eid);

  if (inscriptions.isPending) {
    return <ParticipantListSkeleton />;
  }

  if (inscriptions.isError) {
    return <div className="text-center py-4">Failed to load inscriptions</div>;
  }

  if (inscriptions.data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            {t('inscriptions:participants')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <UsersIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">
              {t('inscriptions:noParticipantsYet')}
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              {t('inscriptions:noParticipantsDescription')}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UsersIcon className="h-5 w-5" />
          {t('inscriptions:participants')} ({inscriptions.data.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t('bib.title')}</TableHead>
              <TableHead>{t('athlete.title')}</TableHead>
              <TableHead>{t('event.title')}</TableHead>
              <TableHead>{t('record.title')}</TableHead>
              <TableHead>{t('status.title')}</TableHead>
              <TableHead>{t('inscriptions:presenceStatus')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {inscriptions.data.map(inscription => {
              const bib = getSeasonBib(inscription.athlete, competition.startDate);
              return (
                <TableRow key={`${inscription.athlete.id}-${inscription.competitionEvent.id}`}>
                  <TableCell className="font-medium">{bib ?? '-'}</TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {inscription.athlete.firstName} {inscription.athlete.lastName}
                    </div>
                  </TableCell>
                  <TableCell>{inscription.competitionEvent.event.name}</TableCell>
                  <TableCell>
                    {formatPerformance(
                      inscription.record?.performanceValue,
                      inscription.competitionEvent.event.type,
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeVariant(inscription.status)}>
                      {t(`enums:inscriptionStatus.${inscription.status.toLowerCase()}`)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getPresenceStatusBadgeVariant(inscription.presenceStatus)}>
                      {t(`enums:presenceStatus.${inscription.presenceStatus.toLowerCase()}`)}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
