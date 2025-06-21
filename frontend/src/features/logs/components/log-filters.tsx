import { DateTimePicker } from '@/components/date-time-picker';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogLevel$, type LogLevel, type LogQuery } from '@repo/core/schemas';
import { FilterIcon, SearchIcon, XIcon } from 'lucide-react';
import { useState } from 'react';
import { LogLevelBadge } from './log-level-badge';

interface LogFiltersProps {
  filters: LogQuery;
  onFiltersChange: (filters: LogQuery) => void;
  isLoading?: boolean;
}

export function LogFilters({
  filters,
  onFiltersChange,
  isLoading,
}: LogFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchValue, setSearchValue] = useState(filters.search || '');

  const selectedLevels = filters.levels || LogLevel$.options;

  const handleLevelToggle = (level: LogLevel) => {
    const newLevels = selectedLevels.includes(level)
      ? selectedLevels.filter((l) => l !== level)
      : [...selectedLevels, level];

    onFiltersChange({
      ...filters,
      levels: newLevels,
      offset: 0, // Reset pagination when filters change
    });
  };

  const handleDateChange = (field: 'startDate' | 'endDate', value: string) => {
    const date = value ? new Date(value) : undefined;
    onFiltersChange({
      ...filters,
      [field]: date,
      offset: 0, // Reset pagination when filters change
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({
      ...filters,
      search: searchValue || undefined,
      offset: 0, // Reset pagination when filters change
    });
  };

  return (
    <Card className="border-border/40 py-0">
      <CardContent className="p-4">
        {/* Quick Search */}
        <div className="mb-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search in log messages..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearchSubmit(e);
                  }
                }}
                className="pl-10 pr-10 h-10 bg-background/50 border-border/50 focus:bg-background focus:border-border transition-colors"
                disabled={isLoading}
              />
              {searchValue && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted/80"
                  onClick={() => {
                    setSearchValue('');
                    onFiltersChange({
                      ...filters,
                      search: undefined,
                      offset: 0,
                    });
                  }}
                >
                  <XIcon className="w-3 h-3" />
                </Button>
              )}
            </div>
            <Button
              type="button"
              onClick={handleSearchSubmit}
              disabled={isLoading}
              className="px-6 h-10 bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors"
            >
              <SearchIcon className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
        {/* Filter Toggle */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="gap-2"
          >
            <FilterIcon className="w-4 h-4" />
            Advanced Filters
          </Button>
        </div>
        {/* Expanded Filters */}
        {isExpanded && (
          <div className="space-y-6 pt-4 border-t">
            {/* Log Levels */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Log Levels
              </Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {LogLevel$.options.map((level) => (
                  <div key={level} className="flex items-center space-x-2">
                    <Checkbox
                      id={`level-${level}`}
                      checked={selectedLevels.includes(level)}
                      onCheckedChange={() => handleLevelToggle(level)}
                      disabled={isLoading}
                    />
                    <Label
                      htmlFor={`level-${level}`}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <LogLevelBadge
                        level={level}
                        className="text-xs font-medium capitalize"
                      />
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">
                  Start Date
                </Label>
                <DateTimePicker
                  value={filters.startDate}
                  onChange={(date) =>
                    handleDateChange(
                      'startDate',
                      date ? date.toISOString() : ''
                    )
                  }
                  placeholder="Select start date and time"
                  disabled={isLoading}
                />
              </div>

              <div>
                <Label className="text-sm font-medium mb-2 block">
                  End Date
                </Label>
                <DateTimePicker
                  value={filters.endDate}
                  onChange={(date) =>
                    handleDateChange('endDate', date ? date.toISOString() : '')
                  }
                  placeholder="Select end date and time"
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
