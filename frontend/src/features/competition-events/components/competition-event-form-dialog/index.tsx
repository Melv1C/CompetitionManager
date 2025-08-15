import { Suspense } from 'react';
import {
  CompetitionEventFormDialog as CompetitionEventFormDialogComponent,
  type CompetitionEventFormDialogProps,
} from './competition-event-form-dialog';
import { CompetitionEventFormDialogSkeleton } from './competition-event-form-dialog-skeleton';

export function CompetitionEventFormDialog(props: CompetitionEventFormDialogProps) {
  return (
    <Suspense fallback={<CompetitionEventFormDialogSkeleton {...props} />}>
      <CompetitionEventFormDialogComponent {...props} />
    </Suspense>
  );
}
