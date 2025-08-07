import { useCompetition } from '@/features/competitions';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate, formatDateTime } from '@/lib/formatters';
import {
  CalendarIcon,
  MapPinIcon,
  UsersIcon,
  InfoIcon,
  CreditCardIcon,
  ClockIcon,
  AlertCircleIcon,
  CheckCircleIcon,
} from 'lucide-react';

export function CompetitionHomePage() {
  const { eid } = useParams<{ eid: string }>();

  if (!eid) {
    throw new Error('Competition ID (eid) is required');
  }

  const competition = useCompetition(eid);

  const getRegistrationStatus = () => {
    const now = new Date();
    const startDate = new Date(competition.data.inscriptionStartDate);
    const endDate = new Date(competition.data.inscriptionEndDate);

    if (now < startDate) return 'upcoming';
    if (now > endDate) return 'closed';
    return 'open';
  };

  return (
    <div className="space-y-6">
      {/* Competition Header */}
      <div className="space-y-4">
        {competition.data.description && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <InfoIcon className="h-5 w-5" />
                Description
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {competition.data.description}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Info Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Competition Dates
            </CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatDate(competition.data.startDate)}
            </div>
            {competition.data.endDate && (
              <p className="text-xs text-muted-foreground">
                to {formatDate(competition.data.endDate)}
              </p>
            )}
          </CardContent>
        </Card>

        {competition.data.location && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Location</CardTitle>
              <MapPinIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {competition.data.location}
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Organizer</CardTitle>
            <UsersIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {competition.data.organization.name}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Registration Information */}
      {competition.data.isInscriptionVisible && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5" />
              Registration Information
              <div className="ml-auto">
                {getRegistrationStatus() === 'open' && (
                  <Badge variant="default" className="bg-green-500">
                    <CheckCircleIcon className="h-3 w-3 mr-1" />
                    Open
                  </Badge>
                )}
                {getRegistrationStatus() === 'upcoming' && (
                  <Badge variant="secondary">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    Upcoming
                  </Badge>
                )}
                {getRegistrationStatus() === 'closed' && (
                  <Badge variant="destructive">
                    <AlertCircleIcon className="h-3 w-3 mr-1" />
                    Closed
                  </Badge>
                )}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium">Registration Opens</p>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(competition.data.inscriptionStartDate)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Registration Closes</p>
                <p className="text-sm text-muted-foreground">
                  {formatDateTime(competition.data.inscriptionEndDate)}
                </p>
              </div>
            </div>

            {competition.data.isPaidOnline && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCardIcon className="h-4 w-4" />
                Online payment for this competition
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
