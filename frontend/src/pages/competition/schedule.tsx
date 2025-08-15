import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  CalendarIcon,
  ClockIcon,
  UsersIcon,
  SearchIcon,
  XIcon,
} from 'lucide-react';
import { useCompetition } from '@/features/competitions';
import { EventSelector } from '@/features/events/components/event-selector';
import { CategorySelector } from '@/features/categories/components/category-selector';
import { formatTime, formatDateFull } from '@/lib/formatters';
import type { CompetitionEvent } from '@repo/core/schemas';
import { useCompetitionEid } from '@/hooks';

export function CompetitionSchedulePage() {
  const eid = useCompetitionEid();
  const { t } = useTranslation('common');

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEventId, setSelectedEventId] = useState<number | undefined>();
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);

  const { data: competition } = useCompetition(eid);

  // Get unique events from competition events for filtering
  const competitionEvents = useMemo(() => {
    const uniqueEvents = new Map();
    competition.events.forEach((event) => {
      if (event.event) {
        uniqueEvents.set(event.event.id, event.event);
      }
    });
    return Array.from(uniqueEvents.values());
  }, [competition.events]);

  // Filter events based on search and filter criteria
  const filteredEvents = useMemo(() => {
    return competition.events.filter((event) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesCompetitionEventName = event.name
          ?.toLowerCase()
          .includes(query);
        const matchesEventName = event.event?.name
          ?.toLowerCase()
          .includes(query);
        const matchesEventAbbr = event.event?.abbr
          ?.toLowerCase()
          .includes(query);
        const matchesCategory = event.categories?.some(
          (cat) =>
            cat.name.toLowerCase().includes(query) ||
            cat.abbr.toLowerCase().includes(query)
        );

        if (
          !matchesCompetitionEventName &&
          !matchesEventName &&
          !matchesEventAbbr &&
          !matchesCategory
        ) {
          return false;
        }
      }

      // Event filter
      if (selectedEventId && event.event?.id !== selectedEventId) {
        return false;
      }

      // Category filter
      if (selectedCategoryIds.length > 0) {
        const eventCategoryIds = event.categories?.map((cat) => cat.id) || [];
        if (
          !selectedCategoryIds.some((selectedCatId) =>
            eventCategoryIds.includes(selectedCatId)
          )
        ) {
          return false;
        }
      }

      return true;
    });
  }, [competition.events, searchQuery, selectedEventId, selectedCategoryIds]);

  // Group filtered events by day
  const groupedEvents = filteredEvents.reduce((groups, event) => {
    const eventDate = new Date(event.eventStartTime);
    const dateKey = eventDate.toDateString();

    if (!groups[dateKey]) {
      groups[dateKey] = {
        date: eventDate,
        events: [],
      };
    }

    groups[dateKey].events.push(event);
    return groups;
  }, {} as Record<string, { date: Date; events: CompetitionEvent[] }>);

  // Sort groups by date and sort events within each group by time
  const sortedGroups = Object.values(groupedEvents)
    .sort((a, b) => a.date.getTime() - b.date.getTime())
    .map((group) => ({
      ...group,
      events: group.events.sort(
        (a, b) =>
          new Date(a.eventStartTime).getTime() -
          new Date(b.eventStartTime).getTime()
      ),
    }));

  // Clear all filters
  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedEventId(undefined);
    setSelectedCategoryIds([]);
  };

  // Check if any filters are active
  const hasActiveFilters =
    searchQuery || selectedEventId || selectedCategoryIds.length > 0;

  if (competition.events.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              {t('schedule')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">
                Schedule not yet available
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                The detailed competition schedule will be published here closer
                to the event.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Search and Filters */}
      <Card>
        <CardContent className="space-y-3">
          {/* Search and Filters Row */}
          <div className="flex flex-wrap gap-2">
            {/* Search Bar */}
            <div className="relative flex-1 min-w-[200px]">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search events, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchQuery && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                  onClick={() => setSearchQuery('')}
                >
                  <XIcon className="h-3 w-3" />
                </Button>
              )}
            </div>

            {/* Event Filter */}
            <div className="min-w-[180px] max-w-[200px]">
              <EventSelector
                events={competitionEvents}
                value={selectedEventId}
                onValueChange={setSelectedEventId}
                placeholder="Filter by event..."
              />
            </div>

            {/* Categories Filter */}
            <div className="min-w-[180px] max-w-[200px]">
              <CategorySelector
                selectedIds={selectedCategoryIds}
                onSelectionChange={setSelectedCategoryIds}
                placeholder="Filter by categories..."
              />
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                Clear All
              </Button>
            )}
          </div>

          {/* Active Filters and Results Summary */}
          {hasActiveFilters && (
            <div className="flex flex-wrap items-center gap-2 justify-between">
              <div className="flex flex-wrap gap-1">
                {searchQuery && (
                  <Badge variant="outline" className="gap-1">
                    Search: "{searchQuery}"
                    <button
                      onClick={() => setSearchQuery('')}
                      className="ml-1 hover:bg-muted rounded-full"
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedEventId && (
                  <Badge variant="outline" className="gap-1">
                    Event:{' '}
                    {
                      competitionEvents.find((e) => e.id === selectedEventId)
                        ?.name
                    }
                    <button
                      onClick={() => setSelectedEventId(undefined)}
                      className="ml-1 hover:bg-muted rounded-full"
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {selectedCategoryIds.length > 0 && (
                  <Badge variant="outline" className="gap-1">
                    {selectedCategoryIds.length}{' '}
                    {selectedCategoryIds.length === 1
                      ? 'Category'
                      : 'Categories'}
                    <button
                      onClick={() => setSelectedCategoryIds([])}
                      className="ml-1 hover:bg-muted rounded-full"
                    >
                      <XIcon className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground whitespace-nowrap">
                {filteredEvents.length} of {competition.events.length} events
              </div>
            </div>
          )}

          {/* Results Summary when no filters */}
          {!hasActiveFilters && (
            <div className="text-sm text-muted-foreground">
              {competition.events.length} events total
            </div>
          )}
        </CardContent>
      </Card>

      {/* Events List */}
      {sortedGroups.length === 0 ? (
        <Card>
          <CardContent className="py-8">
            <div className="text-center">
              <SearchIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">
                No events match your filters
              </h3>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your search criteria or clearing the filters.
              </p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearAllFilters}
                  className="mt-4"
                >
                  Clear All Filters
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {sortedGroups.map((group) => (
            <Card key={group.date.toDateString()}>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                  {formatDateFull(group.date)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {group.events.map((event) => (
                    <Link
                      key={event.id}
                      to={`/competitions/${eid}/events/${event.eid}`}
                      className="block p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      {/* Desktop Layout */}
                      <div className="hidden sm:flex items-center gap-4">
                        {/* Time */}
                        <div className="flex items-center gap-2 min-w-[100px]">
                          <ClockIcon className="h-4 w-4 text-muted-foreground" />
                          <span className="font-mono text-sm font-medium">
                            {formatTime(event.eventStartTime)}
                          </span>
                        </div>

                        {/* Event Name */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium truncate">{event.name}</h4>
                        </div>

                        {/* Participants */}
                        <div className="flex items-center gap-2">
                          <UsersIcon className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="secondary" className="gap-1">
                            <span>0</span>
                            {event.maxParticipants && (
                              <>
                                <span>/</span>
                                <span>{event.maxParticipants}</span>
                              </>
                            )}
                          </Badge>
                        </div>
                      </div>

                      {/* Mobile Layout */}
                      <div className="sm:hidden space-y-2">
                        {/* First line: Time and Participants */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <ClockIcon className="h-4 w-4 text-muted-foreground" />
                            <span className="font-mono text-sm font-medium">
                              {formatTime(event.eventStartTime)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <UsersIcon className="h-4 w-4 text-muted-foreground" />
                            <Badge variant="secondary" className="gap-1">
                              <span>0</span>
                              {event.maxParticipants && (
                                <>
                                  <span>/</span>
                                  <span>{event.maxParticipants}</span>
                                </>
                              )}
                            </Badge>
                          </div>
                        </div>

                        {/* Second line: Event Name */}
                        <div>
                          <h4 className="font-medium">{event.name}</h4>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
