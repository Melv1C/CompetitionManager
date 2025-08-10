import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrophyIcon } from 'lucide-react';

export function CompetitionResultsPage() {
  const { t } = useTranslation();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrophyIcon className="h-5 w-5" />
            {t('results')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <TrophyIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-muted-foreground">
              Results not yet available
            </h3>
            <p className="text-sm text-muted-foreground mt-2">
              Competition results will be published here after the event
              concludes.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
