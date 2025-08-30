import { Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

import { useRequiredCompetition } from '@/features/competitions/hooks/use-competitions';
import { useCompetitionEid } from '@/hooks/use-competition-eid';
import { getAthleteCategory } from '@repo/core/utils';
import { useInscriptionFormStore } from '../../store/inscription-form-store';

export function EventSelectionStep() {
  const { t } = useTranslation(['inscriptions']);
  const eid = useCompetitionEid();
  const competition = useRequiredCompetition(eid);

  const { currentAthlete, currentEventIds, setCurrentEventIds } = useInscriptionFormStore();

  const currentAthleteCategory = currentAthlete
    ? getAthleteCategory(currentAthlete, competition.startDate)
    : null;

  const eligibleEvents = currentAthlete
    ? competition.events.filter(event =>
        event.categories.some(category => category.abbr === currentAthleteCategory?.abbr),
      )
    : [];

  if (!currentAthlete) {
    return (
      <div className="text-center space-y-4 py-12">
        <div className="mx-auto w-12 h-12 bg-muted rounded-full flex items-center justify-center">
          <Calendar className="w-6 h-6 text-muted-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-semibold">{t('selectEvents')}</h2>
          <p className="text-muted-foreground text-sm">{t('pleaseSelectAthleteFirst')}</p>
        </div>
      </div>
    );
  }

  const handleEventToggle = (eventId: number, checked: boolean) => {
    const updatedIds = checked
      ? [...currentEventIds, eventId]
      : currentEventIds.filter(id => id !== eventId);
    setCurrentEventIds(updatedIds);
  };

  return (
    <div className="space-y-6">
      {/* Events List */}
      <div className="max-w-2xl mx-auto">
        {eligibleEvents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">{t('noEventsAvailable')}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Events */}
            <div className="grid gap-2">
              {eligibleEvents.map(competitionEvent => (
                <div
                  key={competitionEvent.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    checked={currentEventIds.includes(competitionEvent.id)}
                    onCheckedChange={checked =>
                      handleEventToggle(competitionEvent.id, checked as boolean)
                    }
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{competitionEvent.name}</p>
                      <Badge variant="outline">€{competitionEvent.price.toFixed(2)}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
