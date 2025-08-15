import { useTranslation } from 'react-i18next';

import { AthleteSearch } from '@/features/athletes';
import { useInscriptionFormStore } from '@/store/inscription-form-store';

export function AthleteSelectionStep() {
  const { t } = useTranslation();
  const { currentAthlete, setCurrentAthlete } = useInscriptionFormStore();

  return (
    <AthleteSearch
      value={currentAthlete}
      onChange={setCurrentAthlete}
    />
  );
}
