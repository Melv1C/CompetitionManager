import { useInscriptionFormStore } from '@/store/inscription-form-store';
import { InscriptionForm } from './inscription-form';
import { RegistrationBasket } from './registration-basket';

export function InscriptionFlow() {
  const { isInBasketView } = useInscriptionFormStore();

  return isInBasketView ? <RegistrationBasket /> : <InscriptionForm />;
}
