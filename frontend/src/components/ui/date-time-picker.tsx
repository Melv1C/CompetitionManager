import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, ClockIcon, XIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  defaultTime?: string;
  allowClear?: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder,
  disabled,
  defaultTime = '10:00',
  allowClear = true,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [timeValue, setTimeValue] = useState(value ? format(value, 'HH:mm') : defaultTime);

  useEffect(() => {
    if (value) {
      setTimeValue(format(value, 'HH:mm'));
    }
  }, [value]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      if (allowClear) onChange(undefined);
      return;
    }

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
    setTimeValue(defaultTime);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={`w-full justify-start text-left font-normal ${!value && 'text-muted-foreground'}`}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, 'MMM d, yyyy HH:mm') : placeholder || 'Pick a date'}
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
              {allowClear && value && (
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
