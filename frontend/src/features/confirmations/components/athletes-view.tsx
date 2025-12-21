import type { Athlete, Inscription, PresenceStatus } from '@repo/core/schemas';
import { Alert, AlertDescription } from '@repo/ui';
import { AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useAthleteInscriptionsMap,
  useFilteredAthletes,
  useSeparatedAthletes,
} from '../hooks/use-athlete-filtering';
import { countPresenceStatuses } from '../types';
import { ConfirmationAthleteCard } from './confirmation-athlete-card';
import { ConfirmationAthleteSearch } from './confirmation-athlete-search';
import { ConfirmationDialog } from './confirmation-dialog';

const INITIAL_SHOW = 5;

interface AthletesViewProps {
  inscriptions: Inscription[] | undefined;
  onSavePresence: (inscriptionIds: number[], presenceStatus: PresenceStatus) => void;
  isSaving: boolean;
}

export const AthletesView = ({ inscriptions, onSavePresence, isSaving }: AthletesViewProps) => {
  const { t } = useTranslation();
  const [searchKey, setSearchKey] = useState('');
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showAllUnknown, setShowAllUnknown] = useState(false);
  const [showAllConfirmed, setShowAllConfirmed] = useState(false);

  const athleteInscriptionsMap = useAthleteInscriptionsMap(inscriptions);
  const filteredAthletes = useFilteredAthletes(athleteInscriptionsMap, searchKey);
  const { unknownAthletes, confirmedAthletes } = useSeparatedAthletes(filteredAthletes);

  const unknownToShow = showAllUnknown ? unknownAthletes : unknownAthletes.slice(0, INITIAL_SHOW);
  const confirmedToShow = showAllConfirmed
    ? confirmedAthletes
    : confirmedAthletes.slice(0, INITIAL_SHOW);

  const handleAthleteClick = (athlete: Athlete) => {
    setSelectedAthlete(athlete);
    setIsDialogOpen(true);
  };

  const selectedInscriptions = selectedAthlete
    ? athleteInscriptionsMap.get(selectedAthlete.id) || []
    : [];

  return (
    <>
      <ConfirmationAthleteSearch value={searchKey} onChange={setSearchKey} />

      <div className="space-y-3">
        {unknownAthletes.length === 0 && confirmedAthletes.length === 0 && (
          <Alert>
            <AlertCircle className="size-4" />
            <AlertDescription>
              {searchKey
                ? t('confirmations:noMatchingAthletes')
                : t('confirmations:noInscriptions')}
            </AlertDescription>
          </Alert>
        )}

        {/* Unknown Status Athletes */}
        {unknownAthletes.length > 0 && (
          <>
            <div className="text-sm font-semibold text-amber-600 dark:text-amber-500">
              {t('confirmations:pendingConfirmation')}
            </div>
            {unknownToShow.map(({ athlete, inscriptions }) => {
              const { presentCount, absentCount, unknownCount } =
                countPresenceStatuses(inscriptions);

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
            {!showAllUnknown && unknownAthletes.length > INITIAL_SHOW && (
              <button
                onClick={() => setShowAllUnknown(true)}
                className="w-full rounded-lg border border-dashed border-gray-300 py-2 text-sm font-medium text-gray-600 hover:border-gray-400 hover:text-gray-700 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-300"
              >
                {t('common:showAll')} ({unknownAthletes.length - INITIAL_SHOW}{' '}
                {t('confirmations:more')})
              </button>
            )}
          </>
        )}

        {/* Divider */}
        {unknownAthletes.length > 0 && confirmedAthletes.length > 0 && (
          <div className="border-t border-gray-200 dark:border-gray-800" />
        )}

        {/* Confirmed Athletes */}
        {confirmedAthletes.length > 0 && (
          <>
            <div className="text-sm font-semibold text-green-600 dark:text-green-500">
              {t('confirmations:confirmed')}
            </div>
            {confirmedToShow.map(({ athlete, inscriptions }) => {
              const { presentCount, absentCount, unknownCount } =
                countPresenceStatuses(inscriptions);

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
            {!showAllConfirmed && confirmedAthletes.length > INITIAL_SHOW && (
              <button
                onClick={() => setShowAllConfirmed(true)}
                className="w-full rounded-lg border border-dashed border-gray-300 py-2 text-sm font-medium text-gray-600 hover:border-gray-400 hover:text-gray-700 dark:border-gray-600 dark:text-gray-400 dark:hover:border-gray-500 dark:hover:text-gray-300"
              >
                {t('common:showAll')} ({confirmedAthletes.length - INITIAL_SHOW}{' '}
                {t('confirmations:more')})
              </button>
            )}
          </>
        )}
      </div>

      <ConfirmationDialog
        athlete={selectedAthlete}
        inscriptions={selectedInscriptions}
        open={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false);
          setSelectedAthlete(null);
        }}
        onSave={onSavePresence}
        isSaving={isSaving}
      />
    </>
  );
};
