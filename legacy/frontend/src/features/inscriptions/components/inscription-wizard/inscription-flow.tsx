import { useInscriptionFormStore } from '../../store/inscription-form-store';
import { InscriptionForm } from './inscription-form';
import { RegistrationBasket } from './registration-basket';

export function InscriptionWizard() {
  const { isInBasketView } = useInscriptionFormStore();

  return isInBasketView ? <RegistrationBasket /> : <InscriptionForm />;
}
