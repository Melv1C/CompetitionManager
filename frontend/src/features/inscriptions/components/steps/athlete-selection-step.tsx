import { AthleteSearch } from '@/features/athletes';
import { useInscriptionFormStore } from '@/store/inscription-form-store';

export function AthleteSelectionStep() {
  const { currentAthlete, setCurrentAthlete } = useInscriptionFormStore();

  return <AthleteSearch value={currentAthlete} onChange={setCurrentAthlete} />;
}
