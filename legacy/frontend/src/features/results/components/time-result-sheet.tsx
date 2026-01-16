import { useCompetitionEid } from '@/hooks';
import type { CompetitionEvent, Result } from '@repo/core/schemas';
import { ResultCode } from '@repo/core/schemas';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  cn,
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
  TimeKeyboard,
} from '@repo/ui';
import { useCallback, useState } from 'react';
import { useTranslation } from 'node_modules/react-i18next';
import { useOrganizationResults, useUpdateResult } from '../hooks';
import { AddAthleteButton } from './add-athlete-dialog';

interface TimeResultSheetProps {
  event: CompetitionEvent;
}

function formatTimeValue(value: number | null): string {
  if (value === null) return '';
  if (value === ResultCode.DNS) return 'DNS';
  if (value === ResultCode.DNF) return 'DNF';
  if (value === ResultCode.DQ) return 'DQ';

  // Format time as mm:ss.hh or ss.hh
  const totalSeconds = value / 100;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0) {
    return `${minutes}:${seconds.toFixed(2).padStart(5, '0')}`;
  }
  return seconds.toFixed(2);
}

function parseTimeInput(input: string): number | null {
  if (!input) return null;

  const upperInput = input.toUpperCase();
  if (upperInput === 'DNS') return ResultCode.DNS;
  if (upperInput === 'DNF') return ResultCode.DNF;
  if (upperInput === 'DQ') return ResultCode.DQ;

  // Parse time input (supports mm:ss.hh or ss.hh format)
  if (input.includes(':')) {
    const [minutes, rest] = input.split(':');
    const seconds = parseFloat(rest);
    if (isNaN(seconds)) return null;
    return Math.round((parseInt(minutes, 10) * 60 + seconds) * 100);
  }

  const seconds = parseFloat(input);
  if (isNaN(seconds)) return null;
  return Math.round(seconds * 100);
}

export function TimeResultSheet({ event }: TimeResultSheetProps) {
  const { t } = useTranslation();
  const competitionEid = useCompetitionEid();
  const { data: allResults } = useOrganizationResults(competitionEid);
  const updateResult = useUpdateResult(competitionEid);

  const [selectedResultId, setSelectedResultId] = useState<number | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [inputField, setInputField] = useState<'time' | 'wind' | 'points'>('time');
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [showWind, setShowWind] = useState(false);

  // Filter results for this event
  const results = allResults?.filter(r => r.competitionEvent.id === event.id) ?? [];
  const sortedResults = [...results].sort((a, b) => a.currentOrder - b.currentOrder);

  const selectedResult = results.find(r => r.id === selectedResultId);

  // Get bib and club from athlete info (first entry if exists)
  const getAthleteInfo = (result: Result) => {
    const info = result.athlete.athleteInfo?.[0];
    return {
      bib: info?.bib ?? '—',
      clubAbbr: info?.club?.abbr ?? '—',
    };
  };

  // Get category abbreviation from event categories (simplified - could be more complex)
  const getCategoryAbbr = (_result: Result) => {
    const categories = event.categories;
    if (categories.length === 0) return '—';
    // For now, just return the first category abbreviation
    return categories[0].abbrBaseCategory ?? '—';
  };

  const handleSelectCell = useCallback((result: Result, field: 'time' | 'wind' | 'points') => {
    setSelectedResultId(result.id);
    setInputField(field);
    if (field === 'time') {
      setInputValue(formatTimeValue(result.performanceValue ?? null));
    } else if (field === 'wind') {
      setInputValue(result.windSpeed?.toString() ?? '');
    } else {
      setInputValue(result.points?.toString() ?? '');
    }
    setKeyboardOpen(true);
  }, []);

  const handleKeyboardInput = useCallback((value: string) => {
    setInputValue(value);
  }, []);

  const handleEnterPressed = useCallback(() => {
    if (!selectedResult) return;

    let performanceValue = selectedResult.performanceValue;
    let windSpeed = selectedResult.windSpeed;

    if (inputField === 'time') {
      performanceValue = parseTimeInput(inputValue);
    } else if (inputField === 'wind') {
      windSpeed = inputValue ? parseFloat(inputValue) : null;
    }

    updateResult.mutate(
      {
        resultEid: selectedResult.eid,
        data: {
          heatNumber: selectedResult.heatNumber,
          startingOrder: selectedResult.startingOrder,
          currentOrder: selectedResult.currentOrder,
          details: [
            {
              attemptNumber: 1,
              performanceValue: performanceValue ?? 0,
              attempts: [],
              windSpeed: windSpeed ?? undefined,
            },
          ],
        },
      },
      {
        onSuccess: () => {
          console.log('Result updated successfully');
          // Move to next athlete (only for time input)
          if (inputField === 'time') {
            const currentIndex = sortedResults.findIndex(r => r.id === selectedResultId);
            const nextResult = sortedResults[currentIndex + 1];
            if (nextResult) {
              handleSelectCell(nextResult, 'time');
            } else {
              setKeyboardOpen(false);
              setSelectedResultId(null);
              setInputValue('');
            }
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
    inputField,
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
  }, []);

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
                    <TableHead className="w-28 text-right">{t('results:time')}</TableHead>
                    {showWind && (
                      <TableHead className="w-20 text-right">{t('results:wind')}</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedResults.map(result => {
                    const { bib, clubAbbr } = getAthleteInfo(result);
                    const catAbbr = getCategoryAbbr(result);
                    const isSelected = selectedResultId === result.id;

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
                        <TableCell className="text-right">
                          <button
                            type="button"
                            className="w-full"
                            onClick={() => handleSelectCell(result, 'time')}
                          >
                            <FakeInput
                              value={
                                isSelected && inputField === 'time'
                                  ? inputValue
                                  : formatTimeValue(result.performanceValue ?? null)
                              }
                              isActive={isSelected && inputField === 'time'}
                              className="h-8 w-full text-right"
                              placeholder="—"
                            />
                          </button>
                        </TableCell>
                        {showWind && (
                          <TableCell className="text-right">
                            <button
                              type="button"
                              className="w-full"
                              onClick={() => handleSelectCell(result, 'wind')}
                            >
                              <FakeInput
                                value={
                                  isSelected && inputField === 'wind'
                                    ? inputValue
                                    : (result.windSpeed?.toString() ?? '')
                                }
                                isActive={isSelected && inputField === 'wind'}
                                className="h-8 w-full text-right"
                                placeholder="—"
                              />
                            </button>
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      <TimeKeyboard
        open={keyboardOpen}
        inputValue={inputValue}
        onKeyboardInput={handleKeyboardInput}
        onEnterPressed={handleEnterPressed}
        onClose={handleCloseKeyboard}
      />
    </div>
  );
}
