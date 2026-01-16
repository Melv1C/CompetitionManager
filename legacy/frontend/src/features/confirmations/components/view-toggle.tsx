import { Button } from '@repo/ui';
import { LayoutList, Users } from 'lucide-react';
import { useTranslation } from 'node_modules/react-i18next';
import type { ConfirmationView } from '../hooks/use-confirmation-view';

interface ViewToggleProps {
  currentView: ConfirmationView;
  onViewChange: (view: ConfirmationView) => void;
}

export const ViewToggle = ({ currentView, onViewChange }: ViewToggleProps) => {
  const { t } = useTranslation();

  return (
    <div className="inline-flex rounded-lg border bg-muted p-1">
      <Button
        variant={currentView === 'athletes' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('athletes')}
        className="gap-2"
      >
        <Users className="size-4" />
        {t('confirmations:viewByAthletes')}
      </Button>
      <Button
        variant={currentView === 'events' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewChange('events')}
        className="gap-2"
      >
        <LayoutList className="size-4" />
        {t('confirmations:viewByEvents')}
      </Button>
    </div>
  );
};
