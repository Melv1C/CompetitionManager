import { useTranslation } from 'react-i18next';
import { Badge } from '@/components/ui/badge';
import { Clock, Info } from 'lucide-react';

export function RecordsEntryStep() {
  const { t } = useTranslation(['inscriptions', 'common']);

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
          <Clock className="w-6 h-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold">{t('enterPersonalRecords')}</h2>
        <p className="text-muted-foreground text-sm">
          {t('optionalPersonalBestTimes')}
        </p>
      </div>

      <div className="max-w-md mx-auto">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2">
              <h3 className="font-medium text-blue-900 text-sm">
                {t('comingSoon', { ns: 'common' })}
              </h3>
              <p className="text-sm text-blue-700">
                {t('recordsStepPlaceholder')}
              </p>
              <Badge variant="secondary" className="text-xs">
                {t('thisFeatureWillBeImplemented', { ns: 'common' })}
              </Badge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
