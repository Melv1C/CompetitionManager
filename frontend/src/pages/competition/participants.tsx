import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UsersIcon } from 'lucide-react';

export function CompetitionParticipantsPage() {
  const { eid } = useParams<{ eid: string }>();
  const { t } = useTranslation();

  if (!eid) {
    throw new Error('Competition ID (eid) is required');
  }

  // const competition = useCompetition(eid);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UsersIcon className="h-5 w-5" />
            {t('participants')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <UsersIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">
              Participant list coming soon
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              The list of registered participants will be available here closer
              to the event.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
