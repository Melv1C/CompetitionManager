import { useIsMobile } from '@/hooks/use-mobile';
import type { Club } from '@repo/core/schemas';
import {
  Badge,
  Button,
  Checkbox,
  cn,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@repo/ui';
import { Check, ChevronDown, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useClubs } from '../hooks/use-clubs';

interface ClubSelectorProps {
  // Multi-select mode
  selectedIds?: number[];
  onSelectionChange?: (ids: number[]) => void;
  // Single-select mode
  value?: number;
  onValueChange?: (value: number | undefined) => void;
  // Common
  disabled?: boolean;
  placeholder?: string;
  mode?: 'single' | 'multiple';
  // Optional: provide clubs externally (for backward compatibility)
  clubs?: Club[];
}

export function ClubSelector({
  selectedIds,
  onSelectionChange,
  value,
  onValueChange,
  disabled = false,
  placeholder = 'Select clubs...',
  mode = 'multiple',
  clubs: externalClubs,
}: ClubSelectorProps) {
  const clubsQuery = useClubs();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Use external clubs if provided, otherwise use hook data
  const clubs = externalClubs || clubsQuery.data || [];

  // Show loading state only if clubs are not provided externally
  if (!externalClubs && clubsQuery.isPending) {
    return <div className="text-center py-4">Loading clubs...</div>;
  }

  if (!externalClubs && clubsQuery.isError) {
    return <div className="text-center py-4">Failed to load clubs</div>;
  }

  // Filter clubs based on search query
  const filteredClubs = useMemo(() => {
    if (!searchQuery.trim()) return clubs;
    const query = searchQuery.toLowerCase();
    return clubs.filter(
      club =>
        club.name.toLowerCase().includes(query) || club.abbr.toLowerCase().includes(query),
    );
  }, [clubs, searchQuery]);

  // Group clubs alphabetically by first letter
  const groupedClubs = useMemo(() => {
    const groups: Record<string, Club[]> = {};
    filteredClubs.forEach(club => {
      const firstLetter = club.name.charAt(0).toUpperCase();
      if (!groups[firstLetter]) {
        groups[firstLetter] = [];
      }
      groups[firstLetter].push(club);
    });
    // Sort clubs within each group
    Object.keys(groups).forEach(letter => {
      groups[letter].sort((a, b) => a.name.localeCompare(b.name));
    });
    return groups;
  }, [filteredClubs]);

  const sortedLetters = Object.keys(groupedClubs).sort();

  // Get selected clubs for display
  const selectedClubsList =
    mode === 'multiple'
      ? clubs.filter(club => selectedIds?.includes(club.id))
      : value
        ? clubs.filter(club => club.id === value)
        : [];

  const handleToggleClub = (clubId: number) => {
    if (mode === 'single') {
      if (value === clubId) {
        onValueChange?.(undefined);
      } else {
        onValueChange?.(clubId);
      }
      setOpen(false);
    } else {
      const isSelected = selectedIds?.includes(clubId);
      if (isSelected) {
        onSelectionChange?.(selectedIds?.filter(id => id !== clubId) || []);
      } else {
        onSelectionChange?.([...(selectedIds || []), clubId]);
      }
    }
  };

  const handleClearAll = () => {
    if (mode === 'single') {
      onValueChange?.(undefined);
    } else {
      onSelectionChange?.([]);
    }
  };

  // Trigger button component
  const TriggerButton = (
    <Button
      variant="outline"
      className="w-full justify-between min-h-10 h-auto py-2"
      disabled={disabled}
      type="button"
    >
      <div className="flex flex-1 items-center gap-2 overflow-hidden">
        {selectedClubsList.length > 0 ? (
          mode === 'multiple' ? (
            <div className="flex flex-wrap gap-1 flex-1 overflow-hidden">
              {selectedClubsList
                .sort((a, b) => a.name.localeCompare(b.name))
                .slice(0, isMobile ? 3 : 5)
                .map(club => (
                  <Badge key={club.id} variant="secondary" className="gap-1 text-xs">
                    {club.abbr}
                  </Badge>
                ))}
              {selectedClubsList.length > (isMobile ? 3 : 5) && (
                <Badge variant="secondary" className="text-xs">
                  +{selectedClubsList.length - (isMobile ? 3 : 5)} more
                </Badge>
              )}
            </div>
          ) : (
            <span className="truncate">{selectedClubsList[0].name}</span>
          )
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </div>
      <ChevronDown className="h-4 w-4 opacity-50 shrink-0 ml-2" />
    </Button>
  );

  // Content component
  const ContentComponent = (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className={cn('border-b', isMobile ? 'p-4' : 'p-3')}>
        <div className="relative">
          <Search
            className={cn(
              'absolute left-3 text-muted-foreground',
              isMobile ? 'top-3 h-5 w-5' : 'top-2.5 h-4 w-4',
            )}
          />
          <Input
            placeholder="Search clubs..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className={cn(isMobile ? 'pl-10 h-10' : 'pl-9 h-9')}
          />
        </div>
        {mode === 'multiple' && (
          <div className="flex gap-2 mt-3">
            <Button
              size={isMobile ? 'default' : 'sm'}
              variant="outline"
              className={cn(isMobile ? 'h-9 px-3 text-sm' : 'h-7 px-2 text-xs')}
              onClick={handleClearAll}
              type="button"
            >
              Clear All
            </Button>
          </div>
        )}
      </div>

      {/* Clubs list */}
      <div className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className={cn(isMobile ? 'p-4' : 'p-2')}>
            {sortedLetters.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">No clubs found</div>
            ) : (
              <div className="space-y-4">
                {sortedLetters.map(letter => (
                  <div key={letter} className="space-y-1">
                    <h5
                      className={cn(
                        'font-medium text-muted-foreground border-b pb-1',
                        isMobile ? 'text-base' : 'text-sm',
                      )}
                    >
                      {letter}
                    </h5>
                    <div className="space-y-1">
                      {groupedClubs[letter].map(club => {
                        const isSelected =
                          mode === 'single'
                            ? value === club.id
                            : selectedIds?.includes(club.id);
                        return (
                          <div
                            key={club.id}
                            className={cn(
                              'flex items-center space-x-2 rounded-sm text-sm hover:bg-accent cursor-pointer',
                              isMobile ? 'px-3 py-2.5' : 'px-2 py-1.5',
                            )}
                            onClick={() => handleToggleClub(club.id)}
                          >
                            {mode === 'multiple' && (
                              <Checkbox checked={isSelected} className={isMobile ? 'h-5 w-5' : ''} />
                            )}
                            <div className="flex-1 min-w-0">
                              <div
                                className={cn('font-medium truncate', isMobile ? 'text-base' : '')}
                              >
                                {club.name}
                              </div>
                              <div
                                className={cn(
                                  'text-muted-foreground',
                                  isMobile ? 'text-sm' : 'text-xs',
                                )}
                              >
                                {club.abbr}
                                {club.province && ` • ${club.province}`}
                              </div>
                            </div>
                            {isSelected && (
                              <Check className={cn('shrink-0', isMobile ? 'h-5 w-5' : 'h-4 w-4')} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <div>
        <Sheet open={open} onOpenChange={setOpen} modal={true}>
          <SheetTrigger asChild>{TriggerButton}</SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] max-h-[700px] p-0">
            <SheetHeader className="px-4 py-3 border-b">
              <SheetTitle>
                {mode === 'single' ? 'Select a Club' : 'Select Clubs'}
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-hidden">{ContentComponent}</div>
          </SheetContent>
        </Sheet>
      </div>
    );
  }

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>{TriggerButton}</PopoverTrigger>
        <PopoverContent className="w-[500px] h-[450px] p-0" align="start">
          {ContentComponent}
        </PopoverContent>
      </Popover>
    </div>
  );
}
