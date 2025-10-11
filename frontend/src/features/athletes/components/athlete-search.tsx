import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { AthleteKey$, type Athlete } from '@repo/core/schemas';
import { getSeasonBib } from '@repo/core/utils';
import { debounce } from 'lodash';
import { Search } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchAthletes } from '../hooks/use-athletes';
import { AthleteCard } from './athlete-card';

interface AthleteSearchProps {
  athletes?: Athlete[]; // Optional list of athletes to search within
  value?: Athlete;
  onChange: (athlete: Athlete | undefined) => void;
  disabled?: boolean;
  className?: string;
  referenceDate?: Date;
}

/**
 * A comprehensive athlete search component that can work in two modes:
 * 1. API mode: If no athletes list is provided, it will search using the API
 * 2. Local mode: If athletes list is provided, it will search within that list
 *
 * Features:
 * - Racing bib display that mimics real dosars
 * - Prioritizes bib number, athlete name, club, and category information
 * - Clean, athletic-focused design
 * - Debounced search for better performance
 */
export function AthleteSearch({
  athletes: localAthletes,
  value,
  onChange,
  disabled = false,
  className,
  referenceDate,
}: AthleteSearchProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const isLocalMode = !!localAthletes;

  // Debounced search term update
  const debouncedSetSearchTerm = useMemo(
    () =>
      debounce((term: string) => {
        setDebouncedSearchTerm(term);
      }, 300),
    [],
  );

  useEffect(() => {
    debouncedSetSearchTerm(searchTerm);
    return () => {
      debouncedSetSearchTerm.cancel();
    };
  }, [searchTerm, debouncedSetSearchTerm]);

  // API search - only used when no local athletes provided
  const apiSearch = useSearchAthletes(
    debouncedSearchTerm,
    !isLocalMode && AthleteKey$.safeParse(debouncedSearchTerm).success,
  );

  // Local search - filter provided athletes
  const localSearchResults = useMemo(() => {
    if (!localAthletes || !searchTerm.trim()) return [];

    const searchTermLower = searchTerm.toLowerCase();
    const searchWords = searchTermLower.split(' ').filter(word => word.length > 0);

    return localAthletes.filter(athlete => {
      const fullName = `${athlete.firstName} ${athlete.lastName}`.toLowerCase();
      const license = athlete.license.toLowerCase();

      // Get bib number for current season
      const bib = getSeasonBib(athlete, referenceDate);
      const bibString = bib ? bib.toString() : '';

      return searchWords.every(
        word => fullName.includes(word) || license.includes(word) || bibString.includes(word),
      );
    });
  }, [localAthletes, searchTerm, referenceDate]);

  // Get the appropriate athletes list and loading state
  const athletes = isLocalMode ? localSearchResults : apiSearch.data || [];
  const isLoading = !isLocalMode && apiSearch.isLoading;
  const error = !isLocalMode ? apiSearch.error : null;

  // Update search term when value changes externally
  useEffect(() => {
    if (value) {
      setSearchTerm(getAthleteDisplayName(value));
    } else if (!showResults) {
      setSearchTerm('');
    }
  }, [value, showResults]);

  const handleAthleteSelect = (athlete: Athlete) => {
    setSearchTerm(getAthleteDisplayName(athlete));
    setShowResults(false);
    onChange(athlete);
    inputRef.current?.blur();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);

    if (newValue.trim().length > 0) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }

    if (value && newValue != getAthleteDisplayName(value)) {
      onChange(undefined);
    }
  };

  const getAthleteDisplayName = (athlete: Athlete) => {
    return `${athlete.firstName} ${athlete.lastName}`;
  };

  const shouldShowResults = showResults && searchTerm.trim().length > 0 && !disabled;

  return (
    <div className={cn('relative w-full', className)}>
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={t('athletes:searchAthletes')}
          value={searchTerm}
          onChange={handleInputChange}
          disabled={disabled}
          className="pl-10"
        />
      </div>

      {/* Search Results Dropdown */}
      {shouldShowResults && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border bg-popover shadow-lg"
        >
          <ScrollArea>
            <div className="p-2 max-h-80">
              {/* Loading State */}
              {isLoading && (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 p-3">
                      <Skeleton className="h-10 w-16 rounded-sm" />
                      <div className="space-y-1 flex-1">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Error State */}
              {error && (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  {t('athletes:errorSearchingAthletes')}
                </div>
              )}

              {/* No Results */}
              {!isLoading && !error && athletes.length === 0 && (
                <div className="p-6 text-center text-sm text-muted-foreground">
                  {t('athletes:noAthletesFound')}
                </div>
              )}

              {/* Athletes List */}
              {!isLoading && !error && athletes.length > 0 && (
                <div className="space-y-1">
                  {athletes.map(athlete => (
                    <AthleteCard
                      key={athlete.id}
                      athlete={athlete}
                      referenceDate={referenceDate}
                      onClick={() => handleAthleteSelect(athlete)}
                    />
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
