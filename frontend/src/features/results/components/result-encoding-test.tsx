import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCompetitionInscriptions } from '@/features/inscriptions';
import type { CreateResult, Result } from '@repo/core/schemas';
import { useState } from 'react';
import { useCreateResult, useCompetitionResults } from '../hooks/use-results';
import { Loader2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useRequiredOrganizationCompetition } from '@/features/competitions';
import { useCompetitionEid } from '@/hooks';

export function ResultEncodingTest() {
  const competitionEid = useCompetitionEid();
  const competition = useRequiredOrganizationCompetition(competitionEid);
  const events = competition.events;

  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [selectedAthleteId, setSelectedAthleteId] = useState<number | null>(null);
  const [heatNumber, setHeatNumber] = useState('1');
  const [startingOrder, setStartingOrder] = useState('1');

  const { data: inscriptions, isPending: inscriptionsLoading } =
    useCompetitionInscriptions(competitionEid);

  const { data: results, isPending: resultsLoading } = useCompetitionResults(competitionEid);

  const createResultMutation = useCreateResult(competitionEid);

  if (!competition) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Result Encoding Test</CardTitle>
          <CardDescription>No competition selected</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const filteredInscriptions = selectedEventId
    ? inscriptions?.filter(i => i.competitionEvent.id === selectedEventId)
    : [];

  const filteredResults = selectedEventId
    ? results?.filter(r => r.competitionEvent.id === selectedEventId)
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedEventId || !selectedAthleteId) {
      return;
    }

    const data: CreateResult = {
      competitionEventId: selectedEventId,
      athleteId: selectedAthleteId,
      heatNumber: parseInt(heatNumber) || 1,
      startingOrder: parseInt(startingOrder) || 1,
      inscriptionId: null,
    };

    createResultMutation.mutate(data, {
      onSuccess: () => {
        // Reset form
        setSelectedAthleteId(null);
        setStartingOrder(prev => String(parseInt(prev) + 1));
      },
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Result Encoding Test</CardTitle>
          <CardDescription>
            Create initial result entries for athletes. Performance values can be updated later.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Event Selection */}
            <div className="space-y-2">
              <Label htmlFor="event">Competition Event</Label>

              <Select
                value={selectedEventId?.toString() ?? ''}
                onValueChange={value => {
                  setSelectedEventId(parseInt(value));
                  setSelectedAthleteId(null);
                }}
              >
                <SelectTrigger id="event">
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent>
                  {events?.map(event => (
                    <SelectItem key={event.id} value={event.id.toString()}>
                      {event.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Athlete Selection */}
            {selectedEventId && (
              <div className="space-y-2">
                <Label htmlFor="athlete">Athlete</Label>
                {inscriptionsLoading ? (
                  <Skeleton className="h-10 w-full" />
                ) : (
                  <Select
                    value={selectedAthleteId?.toString() ?? ''}
                    onValueChange={value => setSelectedAthleteId(parseInt(value))}
                  >
                    <SelectTrigger id="athlete">
                      <SelectValue placeholder="Select an athlete" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredInscriptions?.map(inscription => (
                        <SelectItem
                          key={inscription.athlete.id}
                          value={inscription.athlete.id.toString()}
                        >
                          {inscription.athlete.firstName} {inscription.athlete.lastName} (
                          {inscription.athlete.license})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            )}

            {/* Heat Number */}
            <div className="space-y-2">
              <Label htmlFor="heatNumber">Heat Number</Label>
              <Input
                id="heatNumber"
                type="number"
                min="1"
                value={heatNumber}
                onChange={e => setHeatNumber(e.target.value)}
              />
            </div>

            {/* Starting Order */}
            <div className="space-y-2">
              <Label htmlFor="startingOrder">Starting Order</Label>
              <Input
                id="startingOrder"
                type="number"
                min="1"
                value={startingOrder}
                onChange={e => setStartingOrder(e.target.value)}
              />
            </div>

            <Button
              type="submit"
              disabled={!selectedEventId || !selectedAthleteId || createResultMutation.isPending}
              className="w-full"
            >
              {createResultMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Entry...
                </>
              ) : (
                'Add Athlete to Event'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results Display */}
      {selectedEventId && (
        <Card>
          <CardHeader>
            <CardTitle>Current Results</CardTitle>
            <CardDescription>
              Results for the selected event (updates in real-time via Socket.IO)
            </CardDescription>
          </CardHeader>
          <CardContent>
            {resultsLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : filteredResults && filteredResults.length > 0 ? (
              <div className="space-y-2">
                {filteredResults
                  .sort((a: Result, b: Result) => a.currentOrder - b.currentOrder)
                  .map((result: Result) => (
                    <div
                      key={result.id}
                      className="flex items-center justify-between rounded-lg border p-3"
                    >
                      <div className="flex-1">
                        <p className="font-medium">
                          {result.athlete.firstName} {result.athlete.lastName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Heat {result.heatNumber} • Order: {result.currentOrder}
                        </p>
                      </div>
                      <div className="text-right">
                        {result.performanceValue !== null ? (
                          <p className="text-lg font-bold">{result.performanceValue}</p>
                        ) : (
                          <p className="text-sm text-muted-foreground">No performance</p>
                        )}
                        {result.windSpeed !== null && (
                          <p className="text-xs text-muted-foreground">
                            Wind: {result.windSpeed} m/s
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">
                No results yet. Add a result above to see it appear here in real-time.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
