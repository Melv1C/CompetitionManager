import { Button } from '@/components/ui/button';
import { CheckCircle, Calendar, Users, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useCompetitionEid } from '@/hooks/use-competition-eid';

export function InscriptionSuccess() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const eid = useCompetitionEid();

  const handleNavigateToParticipants = () => {
    navigate(`/competitions/${eid}/participants`);
  };

  const handleNavigateToSchedule = () => {
    navigate(`/competitions/${eid}/schedule`);
  };

  const handleNewInscription = () => {
    navigate(`/competitions/${eid}/register`);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <CheckCircle className="w-16 h-16 text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-green-600 dark:text-green-400">
          {t('inscriptions:success.title')}
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300">{t('inscriptions:success.subtitle')}</p>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Button onClick={handleNavigateToParticipants} variant="outline" className="h-12">
            <Users className="w-4 h-4 mr-2" />
            {t('inscriptions:success.viewParticipants')}
          </Button>

          <Button onClick={handleNavigateToSchedule} variant="outline" className="h-12">
            <Calendar className="w-4 h-4 mr-2" />
            {t('inscriptions:success.viewSchedule')}
          </Button>
        </div>

        <Button onClick={handleNewInscription} className="w-full h-12">
          <Plus className="w-4 h-4 mr-2" />
          {t('inscriptions:success.newInscription')}
        </Button>
      </div>
    </div>
  );
}
