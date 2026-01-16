import { useCompetitionEid } from '@/hooks';
import type { CompetitionEvent, Result, ResultDetail } from '@repo/core/schemas';
import { Attempt$, ResultDetailCode } from '@repo/core/schemas';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  cn,
  DistanceKeyboard,
  FakeInput,
  Label,
  ScrollArea,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'node_modules/react-i18next';
import type { z } from 'zod';
import { useOrganizationResults, useUpdateResult } from '../hooks';
import { AddAthleteButton } from './add-athlete-dialog';

type Attempt = z.infer<typeof Attempt$>;

interface DistanceResultSheetProps {
  event: CompetitionEvent;
}

const MAX_ATTEMPTS = 6;
const INITIAL_ATTEMPTS = 3;

function formatDistanceValue(value: number | null | undefined): string {
  if (value === null || value === undefined) return '';
  if (value === ResultDetailCode.X) return 'X';
  if (value === ResultDetailCode.PASS) return '-';
  if (value === ResultDetailCode.R) return 'r';

  // Format distance as meters (e.g., 7.52)
  return (value / 100).toFixed(2);
}

function parseDistanceInput(input: string): number | null {
  if (!input) return null;

  const upperInput = input.toUpperCase();
  if (upperInput === 'X') return ResultDetailCode.X;
  if (upperInput === '-') return ResultDetailCode.PASS;
  if (upperInput === 'R') return ResultDetailCode.R;

  const meters = parseFloat(input);
  if (isNaN(meters)) return null;
  return Math.round(meters * 100);
}

function isValidPerformance(value: number | null | undefined): boolean {
  if (value === null || value === undefined) return false;
  return value > 0;
}

function getBestPerformance(details: ResultDetail[]): number | null {
  const validPerformances = details.map(d => d.performanceValue).filter(v => isValidPerformance(v));
  if (validPerformances.length === 0) return null;
  return Math.max(...validPerformances);
}

export function DistanceResultSheet({ event }: DistanceResultSheetProps) {
  const { t } = useTranslation();
  const competitionEid = useCompetitionEid();
  const { data: allResults } = useOrganizationResults(competitionEid);
  const updateResult = useUpdateResult(competitionEid);

  const [selectedResultId, setSelectedResultId] = useState<number | null>(null);
  const [selectedAttempt, setSelectedAttempt] = useState<number>(1);
  const [inputValue, setInputValue] = useState('');
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [showWind, setShowWind] = useState(false);

  // Filter results for this event
  const results = allResults?.filter(r => r.competitionEvent.id === event.id) ?? [];
  const sortedResults = [...results].sort((a, b) => a.currentOrder - b.currentOrder);

  const selectedResult = results.find(r => r.id === selectedResultId);

  // Determine which attempts to show
  const visibleAttempts = useMemo(() => {
    // Check if any athlete has attempts beyond the initial 3
    const hasExtendedAttempts = results.some(r =>
      r.details.some(
        d => d.attemptNumber > INITIAL_ATTEMPTS && isValidPerformance(d.performanceValue),
      ),
    );
    return hasExtendedAttempts ? MAX_ATTEMPTS : INITIAL_ATTEMPTS;
  }, [results]);

  // Get bib and club from athlete info
  const getAthleteInfo = (result: Result) => {
    const info = result.athlete.athleteInfo?.[0];
    return {
      bib: info?.bib ?? '—',
      clubAbbr: info?.club?.abbr ?? '—',
    };
  };

  // Get category abbreviation from event categories
  const getCategoryAbbr = (_result: Result) => {
    const categories = event.categories;
    if (categories.length === 0) return '—';
    return categories[0].abbrBaseCategory ?? '—';
  };

  // Get the detail for a specific attempt
  const getAttemptDetail = (result: Result, attemptNumber: number): ResultDetail | undefined => {
    return result.details.find(d => d.attemptNumber === attemptNumber);
  };

  const handleSelectCell = useCallback((result: Result, attemptNumber: number) => {
    setSelectedResultId(result.id);
    setSelectedAttempt(attemptNumber);
    const detail = getAttemptDetail(result, attemptNumber);
    setInputValue(formatDistanceValue(detail?.performanceValue));
    setKeyboardOpen(true);
  }, []);

  const handleKeyboardInput = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  const handleEnterPressed = useCallback(() => {
    if (!selectedResult) return;

    const performanceValue = parseDistanceInput(inputValue);

    // Build the updated details array
    const existingDetails = selectedResult.details.filter(d => d.attemptNumber !== selectedAttempt);
    const newDetail = {
      attemptNumber: selectedAttempt,
      performanceValue: performanceValue ?? 0,
      attempts: [] as Attempt[],
      windSpeed: undefined,
    };

    const updatedDetails = [...existingDetails, newDetail].sort(
      (a, b) => a.attemptNumber - b.attemptNumber,
    );

    updateResult.mutate(
      {
        resultEid: selectedResult.eid,
        data: {
          heatNumber: selectedResult.heatNumber,
          startingOrder: selectedResult.startingOrder,
          currentOrder: selectedResult.currentOrder,
          details: updatedDetails,
        },
      },
      {
        onSuccess: () => {
          // Move to next athlete for the same attempt
          const currentIndex = sortedResults.findIndex(r => r.id === selectedResultId);
          const nextResult = sortedResults[currentIndex + 1];
          if (nextResult) {
            handleSelectCell(nextResult, selectedAttempt);
          } else {
            // End of athletes - close keyboard
            setKeyboardOpen(false);
            setSelectedResultId(null);
            setInputValue('');
          }
        },
      },
    );
  }, [
    selectedResult,
    inputValue,
    selectedAttempt,
    updateResult,
    sortedResults,
    selectedResultId,
    handleSelectCell,
  ]);

  const handleCloseKeyboard = useCallback(() => {
    handleEnterPressed();
    setKeyboardOpen(false);
    setSelectedResultId(null);
    setInputValue('');
  }, [handleEnterPressed]);

  return (
    <div className={cn('flex h-full flex-col', keyboardOpen && 'pb-52')}>
      <Card className="flex-1">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-lg">{event.name}</CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch id="show-wind" checked={showWind} onCheckedChange={setShowWind} />
              <Label htmlFor="show-wind" className="text-sm">
                {t('results:wind')}
              </Label>
            </div>
            <AddAthleteButton event={event} />
          </div>
        </CardHeader>
        <CardContent>
          {results.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">{t('results:noAthletes')}</p>
          ) : (
            <ScrollArea className="h-[calc(100vh-280px)]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead className="w-16 text-center">{t('results:bib')}</TableHead>
                    <TableHead>{t('results:athlete')}</TableHead>
                    <TableHead className="w-20">{t('results:club')}</TableHead>
                    <TableHead className="w-16">{t('results:category')}</TableHead>
                    {Array.from({ length: visibleAttempts }, (_, i) => (
                      <TableHead key={i + 1} className="w-20 text-center">
                        {i + 1}
                      </TableHead>
                    ))}
                    <TableHead className="w-24 text-right">{t('results:best')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedResults.map(result => {
                    const { bib, clubAbbr } = getAthleteInfo(result);
                    const catAbbr = getCategoryAbbr(result);
                    const isSelected = selectedResultId === result.id;
                    const best = getBestPerformance(result.details);

                    return (
                      <TableRow key={result.id} className={cn(isSelected && 'bg-primary/5')}>
                        <TableCell className="text-center font-medium">
                          {result.startingOrder}
                        </TableCell>
                        <TableCell className="text-center">{bib}</TableCell>
                        <TableCell>
                          <div>
                            <span className="font-medium">
                              {result.athlete.lastName.toUpperCase()} {result.athlete.firstName}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{clubAbbr}</TableCell>
                        <TableCell className="text-muted-foreground">{catAbbr}</TableCell>
                        {Array.from({ length: visibleAttempts }, (_, i) => {
                          const attemptNumber = i + 1;
                          const detail = getAttemptDetail(result, attemptNumber);
                          const isAttemptSelected = isSelected && selectedAttempt === attemptNumber;

                          return (
                            <TableCell key={attemptNumber} className="text-center">
                              <button
                                type="button"
                                className="w-full"
                                onClick={() => handleSelectCell(result, attemptNumber)}
                              >
                                <FakeInput
                                  value={
                                    isAttemptSelected
                                      ? inputValue
                                      : formatDistanceValue(detail?.performanceValue)
                                  }
                                  isActive={isAttemptSelected}
                                  className="h-8 w-full text-center"
                                  placeholder="—"
                                />
                              </button>
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-right font-medium">
                          {best !== null ? formatDistanceValue(best) : '—'}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <DistanceKeyboard
        open={keyboardOpen}
        inputValue={inputValue}
        onKeyboardInput={handleKeyboardInput}
        onEnterPressed={handleEnterPressed}
        onClose={handleCloseKeyboard}
      />
    </div>
  );
}
