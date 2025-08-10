import { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Search,
  User,
  Calendar,
  Hash,
  MapPin,
  X,
  CheckCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Athlete } from '@repo/core/schemas';
import { useSearchAthletes } from '../hooks/use-athletes';
import { useTranslation } from 'react-i18next';
import { debounce } from 'lodash';

interface AthleteSearchProps {
  athletes?: Athlete[]; // Optional list of athletes to search within
  value?: number; // Selected athlete ID
  onValueChange: (athleteId: number | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * A comprehensive athlete search component that can work in two modes:
 * 1. API mode: If no athletes list is provided, it will search using the API
 * 2. Local mode: If athletes list is provided, it will search within that list
 */
export function AthleteSearch({
  athletes: localAthletes,
  value,
  onValueChange,
  placeholder,
  disabled = false,
  className,
}: AthleteSearchProps) {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [selectedAthlete, setSelectedAthlete] = useState<Athlete | undefined>();
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const isLocalMode = !!localAthletes;

  // Debounced search term update
  const debouncedSetSearchTerm = useCallback(
    debounce((term: string) => {
      setDebouncedSearchTerm(term);
    }, 300),
    []
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
    !isLocalMode && debouncedSearchTerm.trim().length > 0
  );

  // Local search - filter provided athletes
  const localSearchResults = useMemo(() => {
    if (!localAthletes || !searchTerm.trim()) return [];

    const searchTermLower = searchTerm.toLowerCase();
    const searchWords = searchTermLower
      .split(' ')
      .filter((word) => word.length > 0);

    return localAthletes.filter((athlete) => {
      const fullName = `${athlete.firstName} ${athlete.lastName}`.toLowerCase();
      const license = athlete.license.toLowerCase();

      // Check if athlete has bib numbers
      const bibNumbers = athlete.athleteInfo.map((info) => info.bib.toString());

      return searchWords.every(
        (word) =>
          fullName.includes(word) ||
          license.includes(word) ||
          bibNumbers.some((bib) => bib.includes(word))
      );
    });
  }, [localAthletes, searchTerm]);

  // Get the appropriate athletes list and loading state
  const athletes = isLocalMode ? localSearchResults : apiSearch.data || [];
  const isLoading = !isLocalMode && apiSearch.isLoading;
  const error = !isLocalMode ? apiSearch.error : null;

  // Update selected athlete when value changes
  useEffect(() => {
    if (value) {
      const athlete = [
        ...(localAthletes || []),
        ...(apiSearch.data || []),
      ].find((a) => a.id === value);
      if (athlete) {
        setSelectedAthlete(athlete);
        setSearchTerm(getAthleteDisplayName(athlete));
        setShowResults(false);
      }
    } else {
      setSelectedAthlete(undefined);
      if (!showResults) {
        setSearchTerm('');
      }
    }
  }, [value, localAthletes, apiSearch.data]);

  // Handle click outside to close results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        resultsRef.current &&
        !resultsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
        // If no athlete is selected, clear the search term
        if (!selectedAthlete) {
          setSearchTerm('');
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectedAthlete]);

  const handleAthleteSelect = (athlete: Athlete) => {
    setSelectedAthlete(athlete);
    setSearchTerm(getAthleteDisplayName(athlete));
    setShowResults(false);
    onValueChange(athlete.id);
    inputRef.current?.blur();
  };

  const handleClear = () => {
    setSelectedAthlete(undefined);
    setSearchTerm('');
    setShowResults(false);
    onValueChange(undefined);
    inputRef.current?.focus();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);

    // If user clears the input or changes it significantly, clear selection
    if (
      !newValue ||
      (selectedAthlete &&
        !getAthleteDisplayName(selectedAthlete)
          .toLowerCase()
          .includes(newValue.toLowerCase()))
    ) {
      setSelectedAthlete(undefined);
      onValueChange(undefined);
    }

    // Show results when typing
    if (newValue.trim().length > 0) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const handleInputFocus = () => {
    if (searchTerm.trim().length > 0) {
      setShowResults(true);
    }
  };

  const getAthleteDisplayName = (athlete: Athlete) => {
    return `${athlete.firstName} ${athlete.lastName}`;
  };

  const getAthleteInitials = (athlete: Athlete) => {
    return `${athlete.firstName[0]}${athlete.lastName[0]}`.toUpperCase();
  };

  const formatBirthdate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  };

  const shouldShowResults =
    showResults && searchTerm.trim().length > 0 && !disabled;

  return (
    <div className={cn('relative w-full', className)}>
      {/* Main Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder || t('searchAthletes')}
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          disabled={disabled}
          className="pl-10 pr-10"
        />
        {selectedAthlete && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0 hover:bg-destructive hover:text-destructive-foreground"
            onClick={handleClear}
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Selected Athlete Display */}
      {selectedAthlete && !showResults && (
        <div className="mt-2">
          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="p-3">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    {getAthleteInitials(selectedAthlete)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-sm">
                      {getAthleteDisplayName(selectedAthlete)}
                    </h4>
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatBirthdate(selectedAthlete.birthdate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {selectedAthlete.gender}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search Results Dropdown */}
      {shouldShowResults && (
        <div
          ref={resultsRef}
          className="absolute top-full left-0 right-0 z-50 mt-1 max-h-80 overflow-auto rounded-md border bg-popover shadow-md"
        >
          <div className="p-2">
            {isLoading && (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="space-y-1 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {error && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {t('errorSearchingAthletes')}
              </div>
            )}

            {!isLoading && !error && athletes.length === 0 && (
              <div className="p-4 text-center text-sm text-muted-foreground">
                {t('noAthletesFound')}
              </div>
            )}

            {!isLoading && !error && athletes.length > 0 && (
              <div className="space-y-1">
                {athletes.map((athlete) => (
                  <Card
                    key={athlete.id}
                    className={cn(
                      'cursor-pointer hover:bg-accent transition-colors border-0 shadow-none',
                      athlete.id === value && 'bg-accent'
                    )}
                    onClick={() => handleAthleteSelect(athlete)}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {getAthleteInitials(athlete)}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-sm truncate">
                              {getAthleteDisplayName(athlete)}
                            </h4>
                            {athlete.id === value && (
                              <CheckCircle className="h-4 w-4 text-primary shrink-0" />
                            )}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatBirthdate(athlete.birthdate)}
                              </span>
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {athlete.gender}
                              </span>
                            </div>

                            {athlete.athleteInfo.length > 0 && (
                              <div className="flex items-center gap-2 flex-wrap">
                                {athlete.athleteInfo.map((info) => (
                                  <div
                                    key={info.id}
                                    className="flex items-center gap-2"
                                  >
                                    <Badge
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      <Hash className="h-3 w-3 mr-1" />
                                      {info.bib}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                      <MapPin className="h-3 w-3" />
                                      {info.club.name}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
