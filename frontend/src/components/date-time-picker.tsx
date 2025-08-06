import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Clock, X, Check } from 'lucide-react';
import { useMemo, useRef, useState, useEffect } from 'react';
import { Input } from './ui/input';

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
  placeholder,
  disabled,
  allowClear = true,
  minDate,
  maxDate,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const timeInputRef = useRef<HTMLInputElement>(null);
  const timeValue = useMemo(() => {
    return value
      ? value.toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })
      : '00:00';
  }, [value]);

  const [error, setError] = useState<string | null>(null);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      if (allowClear) onChange(undefined);
      return;
    }

    const [hours, minutes] = timeValue.split(':').map(Number);
    const newDate = new Date(selectedDate);
    newDate.setHours(hours, minutes, 0, 0);
    setError(null); // Clear error when selecting a new date
    onChange(newDate);

    // Focus the time input after a short delay to ensure the component has updated
    setTimeout(() => {
      timeInputRef.current?.focus();
    }, 50);
  };

  const handleTimeChange = (time: string | undefined) => {
    if (value) {
      const [hours, minutes] = time ? time.split(':').map(Number) : [0, 0];
      const newDate = new Date(value);
      newDate.setHours(hours, minutes, 0, 0);
      onChange(newDate);

      // Check if the new datetime is within min/max bounds
      if (minDate && newDate < minDate) {
        setError(`Time cannot be before ${format(minDate, 'HH:mm')}`);
        return;
      }
      if (maxDate && newDate > maxDate) {
        setError(`Time cannot be after ${format(maxDate, 'HH:mm')}`);
        return;
      }

      setError(null);
    } else {
      setError('Please select a date first');
    }
  };

  const handleClear = () => {
    onChange(undefined);
    setIsOpen(false);
  };

  const handleConfirm = () => {
    setIsOpen(false);
  };

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (isOpen && event.key === 'Enter' && !error) {
        event.preventDefault();
        handleConfirm();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, error]);

  return (
    <div className="relative">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={`w-full justify-start text-left font-normal pr-12 ${
              !value && 'text-muted-foreground'
            }`}
            disabled={disabled}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {value
              ? format(value, 'dd MMM yyyy, HH:mm')
              : placeholder || 'Pick a date'}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0"
          align="center"
          side="right"
          sideOffset={4}
          onInteractOutside={(e) => {
            // Prevent closing when clicking inside the calendar or time input
            e.preventDefault();
          }}
        >
          <div className="p-3">
            <Calendar
              mode="single"
              selected={value}
              onSelect={handleDateSelect}
              captionLayout="dropdown"
              className="w-auto max-w-xs"
              disabled={(date) => {
                // Create start and end of day for comparison
                const startOfDay = new Date(date);
                startOfDay.setHours(0, 0, 0, 0);
                const endOfDay = new Date(date);
                endOfDay.setHours(23, 59, 59, 999);

                // Disable if entire day is before minDate or after maxDate
                if (minDate && endOfDay < minDate) return true;
                if (maxDate && startOfDay > maxDate) return true;
                return false;
              }}
            />
            <div className="mt-2 relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              {/* <Input
                type="time"
                value={timeValue}
                onChange={(e) => handleTimeChange(e.target.value)}
                disabled={disabled}
                className="no-native-time-indicator pl-10"
              /> */}
              <Input
                ref={timeInputRef}
                type="time"
                value={timeValue}
                onChange={(e) => handleTimeChange(e.target.value)}
                disabled={value ? false : true}
                className="peer ps-9 [&::-webkit-calendar-picker-indicator]:hidden"
              />
            </div>
            {error && (
              <div className="mt-2 text-sm text-destructive">{error}</div>
            )}
            <div className="mt-3 pt-3 border-t flex gap-2">
              {allowClear && value && (
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 justify-center"
                  onClick={handleClear}
                  disabled={disabled}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              )}
              <Button
                size="sm"
                className="flex-1 justify-center"
                onClick={handleConfirm}
                disabled={!!error}
              >
                <Check className="h-4 w-4 mr-2" />
                Confirm
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
