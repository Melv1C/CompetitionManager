import { formatDateTime } from '@/lib/formatters';
import type { Inscription } from '@repo/core/schemas';
import { formatPerformance, getSeasonBib, getSeasonClub } from '@repo/core/utils';
import {
  Badge,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui';
import { Edit, MoreHorizontal, Trash2, UsersIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface OrganizationInscriptionsTableProps {
  inscriptions: Inscription[];
  competitionStartDate: Date;
}

function getStatusBadgeVariant(status: Inscription['status']) {
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

export function OrganizationInscriptionsTable({
  inscriptions,
  competitionStartDate,
}: OrganizationInscriptionsTableProps) {
  const { t } = useTranslation();

  const handleEdit = (inscription: Inscription) => {
    console.log('Edit inscription:', inscription);
  };

  const handleDelete = (inscription: Inscription) => {
    console.log('Delete inscription:', inscription);
  };

  if (inscriptions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <UsersIcon className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground">
          {t('inscriptions:noInscriptionsYet')}
        </h3>
        <p className="text-sm text-muted-foreground mt-2">
          {t('inscriptions:noInscriptionsDescription')}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('inscriptions:inscriptionDate')}</TableHead>
            <TableHead>{t('athlete.title')}</TableHead>
            <TableHead>{t('club.title')}</TableHead>
            <TableHead>{t('bib.title')}</TableHead>
            <TableHead>{t('event.title')}</TableHead>
            <TableHead>{t('record.title')}</TableHead>
            <TableHead>{t('status.title')}</TableHead>
            <TableHead>{t('common:userId')}</TableHead>
            <TableHead>{t('common:updatedAt')}</TableHead>
            <TableHead className="w-[70px]">{t('common:actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {inscriptions.map(inscription => {
            const bib = getSeasonBib(inscription.athlete, competitionStartDate);
            return (
              <TableRow key={inscription.id}>
                <TableCell>{formatDateTime(inscription.inscriptionDate)}</TableCell>
                <TableCell className="font-medium">
                  {inscription.athlete.firstName} {inscription.athlete.lastName}
                </TableCell>
                <TableCell>
                  {getSeasonClub(inscription.athlete, competitionStartDate)?.abbr ?? '-'}
                </TableCell>
                <TableCell>{bib ?? '-'}</TableCell>
                <TableCell>{inscription.competitionEvent.name}</TableCell>
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
                <TableCell className="text-muted-foreground text-xs">
                  {inscription.userId}
                </TableCell>
                <TableCell>{formatDateTime(inscription.updatedAt)}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(inscription)}>
                        <Edit className="mr-2 h-4 w-4" />
                        {t('common:edit')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(inscription)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        {t('common:delete')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
