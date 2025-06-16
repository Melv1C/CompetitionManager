import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Clock, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Input } from './ui/input';

interface DateTimePickerProps {
  value?: Date;
  onChange: (date: Date | undefined) => void;
  placeholder?: string;
  disabled?: boolean;
  initialTime?: string; // Format: 'HH:mm'
  allowClear?: boolean;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder,
  disabled,
  initialTime = '00:00',
  allowClear = true,
}: DateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [timeValue, setTimeValue] = useState(initialTime || '00:00');

  // set the value based on the initial value prop
  useEffect(() => {
    if (initialTime && value) {
      const [hours, minutes] = initialTime.split(':').map(Number);
      const newDate = new Date(value);
      newDate.setHours(hours, minutes, 0, 0);
      onChange(newDate);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialTime]);

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
    setTimeValue('00:00');
    setIsOpen(false);
  };
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
        >
          <div className="p-3">
            <Calendar
              mode="single"
              selected={value}
              onSelect={handleDateSelect}
              captionLayout="dropdown"
              className="w-auto max-w-xs"
            />
            <div className="mt-2 relative">
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="time"
                value={timeValue}
                onChange={(e) => handleTimeChange(e.target.value)}
                disabled={disabled}
                className="no-native-time-indicator pl-10"
              />
            </div>
            {allowClear && value && (
              <div className="mt-2 pt-2 border-t">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-center"
                  onClick={handleClear}
                  disabled={disabled}
                >
                  <X className="h-4 w-4 mr-2" />
                  Clear
                </Button>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
      {value && allowClear && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-2 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-muted/80 rounded-full z-10"
          onClick={(e) => {
            e.stopPropagation();
            handleClear();
          }}
          disabled={disabled}
          type="button"
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}
