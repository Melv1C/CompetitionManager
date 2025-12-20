import { cn } from '@/lib/utils';
import { format, isSameDay } from 'date-fns';
import { CalendarIcon, Check, Clock, X } from 'lucide-react';
import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { Button } from './shadcn/button';
import { Calendar } from './shadcn/calendar';
import { Input } from './shadcn/input';
import { Label } from './shadcn/label';
import { Popover, PopoverContent, PopoverTrigger } from './shadcn/popover';

interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  allowClear?: boolean;
  minDate?: Date;
  maxDate?: Date;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  disabled,
  allowClear = true,
  minDate,
  maxDate,
}: DateTimePickerProps) {
  const id = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [timeError, setTimeError] = useState<string | null>(null);

  const timeValue = useMemo(() => {
    if (!value) return '00:00';
    const hours = value.getHours().toString().padStart(2, '0');
    const minutes = value.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }, [value]);

  // Calculate the default month to display when the calendar opens
  const defaultMonth = useMemo(() => {
    if (value) return value;

    const today = new Date();
    const startOfToday = new Date(today);
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date(today);
    endOfToday.setHours(23, 59, 59, 999);

    const isTodayAvailable =
      (!minDate || endOfToday >= minDate) && (!maxDate || startOfToday <= maxDate);

    if (isTodayAvailable) return today;
    if (minDate) return minDate;
    return today;
  }, [value, minDate, maxDate]);

  // Auto-prefill when only one day is possible
  useEffect(() => {
    if (!value && minDate && maxDate && isSameDay(minDate, maxDate)) {
      // Use minDate's time as the starting point (it's guaranteed to be valid)
      const newDate = new Date(minDate);
      onChange(newDate);
    }
  }, [minDate, maxDate, value, onChange]);

  // Validate time against min/max constraints
  const validateTime = useCallback(
    (date: Date, h: number, m: number): string | null => {
      const testDate = new Date(date);
      testDate.setHours(h, m, 0, 0);
      if (minDate && testDate < minDate) {
        return `Time cannot be before ${format(minDate, 'HH:mm')}`;
      }
      if (maxDate && testDate > maxDate) {
        return `Time cannot be after ${format(maxDate, 'HH:mm')}`;
      }
      return null;
    },
    [minDate, maxDate],
  );

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      if (allowClear) onChange(undefined);
      return;
    }

    const [hours, minutes] = timeValue.split(':').map(Number);
    const newDate = new Date(selectedDate);
    newDate.setHours(hours, minutes, 0, 0);

    const error = validateTime(newDate, hours, minutes);
    setTimeError(error);
    onChange(newDate);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value;
    if (!value || !time) return;

    const [hours, minutes] = time.split(':').map(Number);
    const newDate = new Date(value);
    newDate.setHours(hours, minutes, 0, 0);

    const error = validateTime(newDate, hours, minutes);
    setTimeError(error);
    // Always update the value, validation error will prevent confirming
    onChange(newDate);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(undefined);
    setTimeError(null);
    setIsOpen(false);
  };

  const handleConfirm = () => {
    setIsOpen(false);
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isOpen && event.key === 'Enter' && !timeError) {
        event.preventDefault();
        handleConfirm();
      }
      if (isOpen && event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, timeError]);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal',
            !value && 'text-muted-foreground',
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span className="flex-1 truncate">
            {value ? format(value, 'dd MMM yyyy, HH:mm') : placeholder}
          </span>
          {allowClear && value && !disabled && (
            <X
              className="ml-2 h-4 w-4 shrink-0 opacity-50 hover:opacity-100"
              onClick={handleClear}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start" sideOffset={4}>
        <Calendar
          mode="single"
          selected={value}
          onSelect={handleDateSelect}
          captionLayout="dropdown"
          className="p-2"
          defaultMonth={defaultMonth}
          startMonth={minDate ?? new Date(new Date().getFullYear() - 5, 0)}
          endMonth={maxDate ?? new Date(new Date().getFullYear() + 10, 11)}
          disabled={date => {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            if (minDate && endOfDay < minDate) return true;
            if (maxDate && startOfDay > maxDate) return true;
            return false;
          }}
        />
        <div className="border-t p-3">
          <div className="flex items-center gap-3">
            <Label htmlFor={id} className="text-xs">
              Time
            </Label>
            <div className="relative grow">
              <Input
                id={id}
                type="time"
                value={timeValue}
                onChange={handleTimeChange}
                disabled={!value}
                className="peer ps-9 [&::-webkit-calendar-picker-indicator]:hidden"
              />
              <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
                <Clock size={16} strokeWidth={2} aria-hidden="true" />
              </div>
            </div>
          </div>
          {timeError && <div className="mt-2 text-sm text-destructive">{timeError}</div>}
        </div>

        {/* Actions */}
        <div className="border-t p-3 flex gap-2">
          {allowClear && value && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={handleClear}
              disabled={disabled}
            >
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
          <Button size="sm" className="flex-1" onClick={handleConfirm} disabled={!!timeError}>
            <Check className="h-4 w-4 mr-1" />
            Confirm
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
