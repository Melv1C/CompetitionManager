import { useOrganizationCompetition } from '@/features/competitions';
import {
  ConfirmationAthleteCard,
  ConfirmationAthleteSearch,
  ConfirmationDialog,
  useUpdatePresenceStatus,
} from '@/features/confirmations';
import { useOrganizationInscriptions } from '@/features/inscriptions';
import { useCompetitionEid } from '@/hooks';
import type { Athlete, Inscription, PresenceStatus } from '@repo/core/schemas';
import { Alert, AlertDescription } from '@repo/ui';
import { AlertCircle } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';

export const CompetitionConfirmations = () => {
  const { t } = useTranslation();
  const competitionEid = useCompetitionEid();
  const competition = useOrganizationCompetition(competitionEid);
  const inscriptions = useOrganizationInscriptions(competitionEid);

  const [searchKey, setSearchKey] = useState('');
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const updatePresenceStatus = useUpdatePresenceStatus(competitionEid);

  // Filter and group inscriptions by athlete
  const athleteInscriptionsMap = useMemo(() => {
    if (!inscriptions) return new Map<number, Inscription[]>();

    const map = new Map<number, Inscription[]>();
    inscriptions.data?.forEach(inscription => {
      const athleteId = inscription.athlete.id;
      const existingInscriptions = map.get(athleteId);
      if (existingInscriptions) {
        existingInscriptions.push(inscription);
      } else {
        map.set(athleteId, [inscription]);
      }
    });

    return map;
  }, [inscriptions]);

  // Filter athletes based on search key
  const filteredAthletes = useMemo(() => {
    if (!searchKey.trim()) {
      return Array.from(athleteInscriptionsMap.entries()).map(([_, inscriptions]) => ({
        athlete: inscriptions[0].athlete,
        inscriptions,
      }));
    }

    const keys = searchKey
      .toLowerCase()
      .split(' ')
      .filter(k => k.trim().length > 0);
    const currentYear = new Date().getFullYear();

    return Array.from(athleteInscriptionsMap.entries())
      .map(([_, inscriptions]) => ({
        athlete: inscriptions[0].athlete,
        inscriptions,
      }))
      .filter(({ athlete }) => {
        // Check if all search keys match
        return keys.every(key => {
          const firstName = athlete.firstName.toLowerCase();
          const lastName = athlete.lastName.toLowerCase();
          const license = athlete.license.toLowerCase();

          // Check name and license
          if (firstName.includes(key) || lastName.includes(key) || license.includes(key)) {
            return true;
          }

          // Check bib number
          const bibNumber = parseInt(key);
          if (!isNaN(bibNumber)) {
            const currentSeasonInfo = athlete.athleteInfo.find(info => info.season === currentYear);
            if (currentSeasonInfo && currentSeasonInfo.bib === bibNumber) {
              return true;
            }
          }

          return false;
        });
      })
      .sort((a, b) => {
        // Sort by best match (prioritize bib, then first name, then last name)
        const aFirstName = a.athlete.firstName.toLowerCase();
        const aLastName = a.athlete.lastName.toLowerCase();
        const bFirstName = b.athlete.firstName.toLowerCase();
        const bLastName = b.athlete.lastName.toLowerCase();
        const firstKey = keys[0];

        // Check bib match
        const aBibInfo = a.athlete.athleteInfo.find(info => info.season === currentYear);
        const bBibInfo = b.athlete.athleteInfo.find(info => info.season === currentYear);
        const aBibMatch = aBibInfo && aBibInfo.bib === parseInt(firstKey);
        const bBibMatch = bBibInfo && bBibInfo.bib === parseInt(firstKey);

        if (aBibMatch && !bBibMatch) return -1;
        if (!aBibMatch && bBibMatch) return 1;

        // Check first name match
        const aFirstMatch = aFirstName.startsWith(firstKey);
        const bFirstMatch = bFirstName.startsWith(firstKey);

        if (aFirstMatch && !bFirstMatch) return -1;
        if (!aFirstMatch && bFirstMatch) return 1;

        // Check last name match
        const aLastMatch = aLastName.startsWith(firstKey);
        const bLastMatch = bLastName.startsWith(firstKey);

        if (aLastMatch && !bLastMatch) return -1;
        if (!aLastMatch && bLastMatch) return 1;

        // Default alphabetical sort
        return aFirstName.localeCompare(bFirstName);
      });
  }, [athleteInscriptionsMap, searchKey]);

  const handleAthleteClick = (athlete: Athlete) => {
    setSelectedAthlete(athlete);
    setIsDialogOpen(true);
  };

  const handleSavePresence = (inscriptionIds: number[], presenceStatus: PresenceStatus) => {
    updatePresenceStatus.mutate(
      { inscriptionIds, presenceStatus },
      {
        onSuccess: () => {
          toast.success(t('confirmations:successUpdate'));
        },
        onError: () => {
          toast.error(t('confirmations:errorUpdate'));
        },
      },
    );
  };

  if (!competition.data?.hasConfirmation) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">{t('confirmations:title')}</h1>
        <Alert>
          <AlertCircle className="size-4" />
          <AlertDescription>{t('confirmations:confirmationNotEnabled')}</AlertDescription>
        </Alert>
      </div>
    );
  }

  const selectedInscriptions = selectedAthlete
    ? athleteInscriptionsMap.get(selectedAthlete.id) || []
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('confirmations:title')}</h1>
        <p className="text-muted-foreground">{t('confirmations:description')}</p>
      </div>

      <ConfirmationAthleteSearch value={searchKey} onChange={setSearchKey} />

      <div className="space-y-3">
        {filteredAthletes.length === 0 && (
          <Alert>
            <AlertCircle className="size-4" />
            <AlertDescription>
              {searchKey
                ? t('confirmations:noMatchingAthletes')
                : t('confirmations:noInscriptions')}
            </AlertDescription>
          </Alert>
        )}

        {filteredAthletes.map(({ athlete, inscriptions }) => {
          const presentCount = inscriptions.filter(i => i.presenceStatus === 'PRESENT').length;
          const absentCount = inscriptions.filter(i => i.presenceStatus === 'ABSENT').length;
          const unknownCount = inscriptions.filter(i => i.presenceStatus === 'UNKNOWN').length;

          return (
            <ConfirmationAthleteCard
              key={athlete.id}
              athlete={athlete}
              presentCount={presentCount}
              absentCount={absentCount}
              unknownCount={unknownCount}
              onClick={() => handleAthleteClick(athlete)}
            />
          );
        })}
      </div>

      <ConfirmationDialog
        athlete={selectedAthlete}
        inscriptions={selectedInscriptions}
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedAthlete(null);
        }}
        onSave={handleSavePresence}
        isSaving={updatePresenceStatus.isPending}
      />
    </div>
  );
};
