import { ResultEncodingTest } from '@/features/results';

export function CompetitionResults() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Results</h1>
        <p className="text-muted-foreground">Publish and view results.</p>
      </div>

      <ResultEncodingTest />
    </div>
  );
}
