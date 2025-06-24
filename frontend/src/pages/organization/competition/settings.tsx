import { CompetitionUpdateForm } from '@/features/competitions';

export function CompetitionSettings() {
  return (
    <div className="relative space-y-8">

      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Competition Settings
        </h1>
        <p className="text-muted-foreground">
          Adjust competition configurations.
        </p>
      </div>

      <CompetitionUpdateForm />
    </div>
  );
}
