import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export type ConfirmationView = 'athletes' | 'events';

const VIEW_PARAM = 'view';
const DEFAULT_VIEW: ConfirmationView = 'athletes';

export const useConfirmationView = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const currentView = (searchParams.get(VIEW_PARAM) as ConfirmationView) || DEFAULT_VIEW;

  const setView = useCallback(
    (view: ConfirmationView) => {
      setSearchParams(
        prev => {
          if (view === DEFAULT_VIEW) {
            prev.delete(VIEW_PARAM);
          } else {
            prev.set(VIEW_PARAM, view);
          }
          return prev;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const isAthletesView = currentView === 'athletes';
  const isEventsView = currentView === 'events';

  return {
    currentView,
    setView,
    isAthletesView,
    isEventsView,
  };
};
