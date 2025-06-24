import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Check, ChevronDown, X } from 'lucide-react';

interface ClubSelectorProps {
  clubs: Array<{ id: number; name: string; abbr: string }>;
  selectedIds: number[];
  onSelectionChange: (ids: number[]) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function ClubSelector({
  clubs,
  selectedIds,
  onSelectionChange,
  disabled = false,
  placeholder = 'Select clubs...',
}: ClubSelectorProps) {
  const selectedClubs = clubs.filter((club) => selectedIds.includes(club.id));

  const toggleClub = (clubId: number) => {
    const isSelected = selectedIds.includes(clubId);
    if (isSelected) {
      onSelectionChange(selectedIds.filter((id) => id !== clubId));
    } else {
      onSelectionChange([...selectedIds, clubId]);
    }
  };

  const removeClub = (clubId: number) => {
    onSelectionChange(selectedIds.filter((id) => id !== clubId));
  };

  return (
    <div className="space-y-2">
      {/* Selected clubs display */}
      {selectedClubs.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedClubs.map((club) => (
            <Badge key={club.id} variant="secondary" className="gap-1 pr-1">
              <span>{club.name}</span>
              {!disabled && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => removeClub(club.id)}
                  type="button"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </Badge>
          ))}
        </div>
      )}

      {/* Club selector popover */}
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between"
            disabled={disabled}
            type="button"
          >
            {selectedClubs.length > 0
              ? `${selectedClubs.length} club${
                  selectedClubs.length === 1 ? '' : 's'
                } selected`
              : placeholder}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <ScrollArea className="h-60">
            <div className="p-2">
              {clubs.map((club) => {
                const isSelected = selectedIds.includes(club.id);
                return (
                  <div
                    key={club.id}
                    className="flex items-center space-x-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer"
                    onClick={() => toggleClub(club.id)}
                  >
                    <Checkbox
                      checked={isSelected}
                      onChange={() => {}} // Controlled by parent click
                    />
                    <div className="flex-1">
                      <div className="font-medium">{club.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {club.abbr}
                      </div>
                    </div>
                    {isSelected && <Check className="h-4 w-4" />}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}
