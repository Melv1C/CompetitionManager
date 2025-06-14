import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  LogLevel$,
  type LogLevel,
  type LogQuery,
} from '@competition-manager/core/schemas';
import { format } from 'date-fns';
import {
  CalendarIcon,
  ClockIcon,
  FilterIcon,
  SearchIcon,
  XIcon,
} from 'lucide-react';
import { useState } from 'react';
import { LogLevelBadge } from './log-level-badge';

interface LogFiltersProps {
  filters: LogQuery;
  onFiltersChange: (filters: LogQuery) => void;
  isLoading?: boolean;
}

interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder: string;
  disabled?: boolean;
}

function DateTimePicker({
  value,
  onChange,
  placeholder,
  disabled,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [timeValue, setTimeValue] = useState(
    value ? format(value, 'HH:mm') : '00:00'
  );

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      onChange(undefined);
      return;
    }

    // Combine selected date with current time
    const [hours, minutes] = timeValue.split(':').map(Number);
    const newDate = new Date(selectedDate);
    newDate.setHours(hours, minutes, 0, 0);
    onChange(newDate);
  };

  const handleTimeChange = (time: string) => {
    setTimeValue(time);
    if (value) {
      const [hours, minutes] = time.split(':').map(Number);
      const newDate = new Date(value);
      newDate.setHours(hours, minutes, 0, 0);
      onChange(newDate);
    }
  };

  const handleClear = () => {
    onChange(undefined);
    setTimeValue('00:00');
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-start text-left font-normal ${
            !value && 'text-muted-foreground'
          }`}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, 'MMM d, yyyy HH:mm') : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          <Calendar
            mode="single"
            selected={value}
            onSelect={handleDateSelect}
            initialFocus
          />
          <div className="border-t pt-3 mt-3">
            <div className="flex items-center gap-2">
              <ClockIcon className="h-4 w-4 text-muted-foreground" />
              <Input
                type="time"
                value={timeValue}
                onChange={(e) => handleTimeChange(e.target.value)}
                className="w-auto flex-1"
              />
              {value && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="px-2"
                >
                  <XIcon className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
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
