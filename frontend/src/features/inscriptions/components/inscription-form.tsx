import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod/v4';
import { useNavigate } from 'react-router-dom';
import { useCompetition } from '@/features/competitions';
import { AthleteSearch } from '@/features/athletes';
import { useCreateInscriptions } from '../hooks/use-inscriptions';
import { useTranslation } from 'react-i18next';
import { useCompetitionEid } from '@/hooks';

const InscriptionFormSchema = z.object({
  athleteId: z
    .number()
    .min(1, 'Please select an athlete'),
  competitionEventIds: z
    .array(z.number())
    .min(1, 'Please select at least one event'),
});

type InscriptionFormData = z.infer<typeof InscriptionFormSchema>;

export function InscriptionForm() {
  const eid = useCompetitionEid();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const competition = useCompetition(eid);
  const createInscriptions = useCreateInscriptions(eid);

  const form = useForm<InscriptionFormData>({
    resolver: zodResolver(InscriptionFormSchema),
    defaultValues: {
      competitionEventIds: [],
    },
  });

  const onSubmit = async (data: InscriptionFormData) => {
    try {
      if (!data.athleteId) {
        return; // This should be caught by form validation
      }

      const inscriptions = data.competitionEventIds.map(
        (competitionEventId) => ({
          athleteId: data.athleteId,
          competitionEventId,
        })
      );

      await createInscriptions.mutateAsync({
        inscriptions,
      });

      // TODO: What happens after successful registration? Payment process?
      // Navigate back to competition after successful registration
      navigate(`/competitions/${eid}`);
    } catch (error) {
      console.error('Failed to create inscriptions:', error);
    }
  };

  return (
    <Card className="max-w-2xl">
      <CardHeader>
        <CardTitle>{t('registrationDetails')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Athlete Search */}
            <FormField
              control={form.control}
              name="athleteId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('athlete')}</FormLabel>
                  <FormControl>
                    <AthleteSearch
                      value={field.value}
                      onValueChange={(athleteId) => field.onChange(athleteId)}
                      placeholder={t('searchAndSelectAthlete')}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Events Selector */}
            <FormField
              control={form.control}
              name="competitionEventIds"
              render={() => (
                <FormItem>
                  <FormLabel>{t('selectEvents')}</FormLabel>
                  <div className="space-y-3">
                    {competition.data.events.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        {t('noEventsAvailable')}
                      </p>
                    ) : (
                      competition.data.events.map((competitionEvent) => (
                        <FormField
                          key={competitionEvent.id}
                          control={form.control}
                          name="competitionEventIds"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(
                                    competitionEvent.id
                                  )}
                                  onCheckedChange={(checked) => {
                                    const updatedIds = checked
                                      ? [
                                          ...(field.value || []),
                                          competitionEvent.id,
                                        ]
                                      : field.value?.filter(
                                          (id) => id !== competitionEvent.id
                                        ) || [];
                                    field.onChange(updatedIds);
                                  }}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="text-sm font-medium">
                                  {competitionEvent.name}
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      ))
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/competitions/${eid}`)}
              >
                {t('cancel')}
              </Button>
              <Button
                type="submit"
                disabled={
                  createInscriptions.isPending ||
                  competition.data.events.length === 0
                }
              >
                {createInscriptions.isPending ? t('submitting') : t('register')}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
