import { useCompetitionEid } from '@/hooks';
import type { CompetitionEvent, Result, ResultDetail } from '@repo/core/schemas';
import { Attempt$ } from '@repo/core/schemas';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  cn,
  FakeInput,
  HeightKeyboard,
  Input,
  ScrollArea,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui';
import { Plus } from 'lucide-react';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { z } from 'zod';
import { useOrganizationResults, useUpdateResult } from '../hooks';
import { AddAthleteButton } from './add-athlete-dialog';

type Attempt = z.infer<typeof Attempt$>;

interface HeightResultSheetProps {
  event: CompetitionEvent;
}

// Default starting heights (in cm) - can be customized
const DEFAULT_HEIGHTS = [100, 105, 110, 115, 120, 125, 130, 135, 140, 145, 150];

function formatHeightValue(value: number): string {
  // Format height as meters (e.g., 1.50)
  return (value / 100).toFixed(2);
}

function parseHeightInput(input: string): number | null {
  if (!input) return null;
  const meters = parseFloat(input);
  if (isNaN(meters)) return null;
  return Math.round(meters * 100);
}

function formatAttempts(attempts: Attempt[]): string {
  return attempts.join('');
}

function parseAttempts(input: string): Attempt[] {
  return input.split('').filter((c): c is Attempt => ['X', 'O', '-', 'r'].includes(c));
}

function getAttemptStatus(
  attempts: Attempt[],
): 'cleared' | 'failed' | 'passed' | 'retired' | 'pending' {
  if (attempts.length === 0) return 'pending';
  if (attempts.includes('O')) return 'cleared';
  if (attempts.includes('r')) return 'retired';
  if (attempts.includes('-') && !attempts.includes('X')) return 'passed';
  if (attempts.filter(a => a === 'X').length >= 3) return 'failed';
  return 'pending';
}

function getBestClearedHeight(details: ResultDetail[], heights: number[]): number | null {
  let best: number | null = null;
  for (const detail of details) {
    const height = heights[detail.attemptNumber - 1];
    if (height && detail.attempts.includes('O')) {
      if (best === null || height > best) {
        best = height;
      }
    }
  }
  return best;
}

export function HeightResultSheet({ event }: HeightResultSheetProps) {
  const { t } = useTranslation();
  const competitionEid = useCompetitionEid();
  const { data: allResults } = useOrganizationResults(competitionEid);
  const updateResult = useUpdateResult(competitionEid);

  const [selectedResultId, setSelectedResultId] = useState<number | null>(null);
  const [selectedHeightIndex, setSelectedHeightIndex] = useState<number>(0);
  const [inputValue, setInputValue] = useState('');
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [heights, setHeights] = useState<number[]>(DEFAULT_HEIGHTS.slice(0, 5));
  const [newHeightInput, setNewHeightInput] = useState('');

  // Filter results for this event
  const results = allResults?.filter(r => r.competitionEvent.id === event.id) ?? [];
  const sortedResults = [...results].sort((a, b) => a.currentOrder - b.currentOrder);

  const selectedResult = results.find(r => r.id === selectedResultId);

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

  // Get the detail for a specific height (attemptNumber = heightIndex + 1)
  const getHeightDetail = (result: Result, heightIndex: number): ResultDetail | undefined => {
    return result.details.find(d => d.attemptNumber === heightIndex + 1);
  };

  const handleSelectCell = useCallback((result: Result, heightIndex: number) => {
    setSelectedResultId(result.id);
    setSelectedHeightIndex(heightIndex);
    const detail = getHeightDetail(result, heightIndex);
    setInputValue(formatAttempts(detail?.attempts ?? []));
    setKeyboardOpen(true);
  }, []);

  const handleKeyboardInput = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  const handleEnterPressed = useCallback(() => {
    if (!selectedResult) return;

    const attempts = parseAttempts(inputValue);

    // Build the updated details array
    const existingDetails = selectedResult.details.filter(
      d => d.attemptNumber !== selectedHeightIndex + 1,
    );
    const newDetail = {
      attemptNumber: selectedHeightIndex + 1,
      performanceValue: heights[selectedHeightIndex],
      attempts,
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
          // Move to next athlete for the same height
          const currentIndex = sortedResults.findIndex(r => r.id === selectedResultId);
          const nextResult = sortedResults[currentIndex + 1];
          if (nextResult) {
            handleSelectCell(nextResult, selectedHeightIndex);
          } else {
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
    selectedHeightIndex,
    heights,
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

  const handleAddHeight = useCallback(() => {
    const newHeight = parseHeightInput(newHeightInput);
    if (newHeight && !heights.includes(newHeight)) {
      setHeights(prev => [...prev, newHeight].sort((a, b) => a - b));
      setNewHeightInput('');
    }
  }, [newHeightInput, heights]);

  // Get cell styling based on attempt status
  const getCellStyle = (attempts: Attempt[]) => {
    const status = getAttemptStatus(attempts);
    switch (status) {
      case 'cleared':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'passed':
        return 'bg-blue-100 text-blue-800';
      case 'retired':
        return 'bg-amber-100 text-amber-800';
      default:
        return '';
    }
  };

  return (
    <div className={cn('flex h-full flex-col', keyboardOpen && 'pb-28')}>
      <Card className="flex-1">
        <CardHeader className="flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-lg">{event.name}</CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Input
                type="text"
                placeholder={t('results:addHeight')}
                value={newHeightInput}
                onChange={e => setNewHeightInput(e.target.value)}
                className="h-8 w-20"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleAddHeight();
                  }
                }}
              />
              <Button variant="outline" size="sm" onClick={handleAddHeight}>
                <Plus className="h-4 w-4" />
              </Button>
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
                    {heights.map((height, index) => (
                      <TableHead key={index} className="w-16 text-center">
                        {formatHeightValue(height)}
                      </TableHead>
                    ))}
                    <TableHead className="w-20 text-right">{t('results:best')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedResults.map(result => {
                    const { bib, clubAbbr } = getAthleteInfo(result);
                    const catAbbr = getCategoryAbbr(result);
                    const isSelected = selectedResultId === result.id;
                    const best = getBestClearedHeight(result.details, heights);

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
                        {heights.map((_, heightIndex) => {
                          const detail = getHeightDetail(result, heightIndex);
                          const attempts = detail?.attempts ?? [];
                          const isHeightSelected =
                            isSelected && selectedHeightIndex === heightIndex;
                          const cellStyle = getCellStyle(attempts);

                          return (
                            <TableCell key={heightIndex} className="p-1 text-center">
                              <button
                                type="button"
                                className="w-full"
                                onClick={() => handleSelectCell(result, heightIndex)}
                              >
                                <FakeInput
                                  value={isHeightSelected ? inputValue : formatAttempts(attempts)}
                                  isActive={isHeightSelected}
                                  className={cn('h-8 w-full text-center text-sm', cellStyle)}
                                  placeholder="—"
                                />
                              </button>
                            </TableCell>
                          );
                        })}
                        <TableCell className="text-right font-medium">
                          {best !== null ? formatHeightValue(best) : '—'}
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

      <HeightKeyboard
        open={keyboardOpen}
        inputValue={inputValue}
        onKeyboardInput={handleKeyboardInput}
        onEnterPressed={handleEnterPressed}
        onClose={handleCloseKeyboard}
      />
    </div>
  );
}
