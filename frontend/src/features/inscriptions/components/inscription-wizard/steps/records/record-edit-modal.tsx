import { formatDate } from '@/lib/formatters';
import type { CompetitionEvent, Performance, UpsertRecord } from '@repo/core/schemas';
import { formatPerformance } from '@repo/core/utils';
import {
  Button,
  Calendar,
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@repo/ui';
import { CalendarIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  getInputHelp,
  getInputLabel,
  getInputPlaceholder,
  normalizePerformanceInput,
  parsePerformanceInput,
} from './performance-utils';

interface RecordEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: CompetitionEvent;
  record: UpsertRecord | undefined;
  matchingPerformance: Performance | null;
  onSave: (record: UpsertRecord | null) => void;
}

export function RecordEditModal({
  open,
  onOpenChange,
  event,
  record,
  matchingPerformance,
  onSave,
}: RecordEditModalProps) {
  const { t } = useTranslation();

  // Get initial values from record or matching performance
  const getInitialValues = (): {
    performance: string;
    date: Date | undefined;
    location: string;
  } => {
    if (record) {
      return {
        performance: formatPerformance(record.performanceValue, event.event.type),
        date: new Date(record.achievedDate),
        location: record.location ?? '',
      };
    }
    if (matchingPerformance) {
      return {
        performance: formatPerformance(matchingPerformance.value, event.event.type),
        date: new Date(matchingPerformance.date),
        location: matchingPerformance.location ?? '',
      };
    }
    return { performance: '', date: undefined, location: '' };
  };

  const [formValues, setFormValues] = useState(getInitialValues);
  const [errors, setErrors] = useState<{ performance?: string; date?: string }>({});
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFormValues(getInitialValues());
      setErrors({});
    }
  }, [open, record, matchingPerformance, event.event.type]);

  const validatePerformance = (value: string): string | undefined => {
    if (!value.trim()) {
      return t('inscriptions:validation.performanceRequired');
    }
    const parsed = parsePerformanceInput(value, event.event.type);
    if (parsed === null) {
      // Return event-type-specific error message
      switch (event.event.type) {
        case 'time':
          return t('inscriptions:validation.invalidTimeFormat');
        case 'distance':
        case 'height':
          return t('inscriptions:validation.invalidDistanceFormat');
        case 'points':
          return t('inscriptions:validation.invalidPointsFormat');
        default:
          return t('inscriptions:validation.invalidPerformance');
      }
    }
    return undefined;
  };

  const validateDate = (date: Date | undefined): string | undefined => {
    if (!date) {
      return t('inscriptions:validation.dateRequired');
    }
    if (date > new Date()) {
      return t('inscriptions:validation.dateInFuture');
    }
    return undefined;
  };

  const handlePerformanceBlur = () => {
    // Normalize input (replace comma with period)
    const normalized = normalizePerformanceInput(formValues.performance, event.event.type);
    setFormValues(prev => ({ ...prev, performance: normalized }));
    // Validate
    const error = validatePerformance(normalized);
    setErrors(prev => ({ ...prev, performance: error }));
  };

  const handleDateSelect = (date: Date | undefined) => {
    setFormValues(prev => ({ ...prev, date }));
    setIsDatePickerOpen(false);
    // Validate on selection
    const error = validateDate(date);
    setErrors(prev => ({ ...prev, date: error }));
  };

  const handleSubmit = () => {
    const performanceError = validatePerformance(formValues.performance);
    const dateError = validateDate(formValues.date);

    if (performanceError || dateError) {
      setErrors({ performance: performanceError, date: dateError });
      return;
    }

    const parsedValue = parsePerformanceInput(formValues.performance, event.event.type);
    if (parsedValue === null || !formValues.date) return;

    onSave({
      performanceValue: parsedValue,
      achievedDate: formValues.date,
      location: formValues.location || null,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('inscriptions:editRecordFor', { event: event.name })}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Performance input */}
          <div className="space-y-2">
            <Label htmlFor="edit-performance">{getInputLabel(event.event.type, t)}</Label>
            <Input
              id="edit-performance"
              value={formValues.performance}
              onChange={e => setFormValues(prev => ({ ...prev, performance: e.target.value }))}
              onBlur={handlePerformanceBlur}
              placeholder={getInputPlaceholder(event.event.type)}
              className={errors.performance ? 'border-destructive' : ''}
            />
            {errors.performance ? (
              <p className="text-xs text-destructive">{errors.performance}</p>
            ) : (
              <p className="text-xs text-muted-foreground">{getInputHelp(event.event.type, t)}</p>
            )}
          </div>

          {/* Date picker */}
          <div className="space-y-2">
            <Label>{t('inscriptions:achievedDate')}</Label>
            <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${
                    !formValues.date ? 'text-muted-foreground' : ''
                  } ${errors.date ? 'border-destructive' : ''}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formValues.date ? formatDate(formValues.date) : t('inscriptions:selectDate')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  captionLayout="dropdown"
                  selected={formValues.date}
                  onSelect={handleDateSelect}
                  disabled={date => date > new Date()}
                  defaultMonth={formValues.date}
                />
              </PopoverContent>
            </Popover>
            {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
          </div>

          {/* Location input */}
          <div className="space-y-2">
            <Label htmlFor="edit-location">{t('inscriptions:location')}</Label>
            <Input
              id="edit-location"
              value={formValues.location}
              onChange={e => setFormValues(prev => ({ ...prev, location: e.target.value }))}
              placeholder={t('inscriptions:locationPlaceholder')}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            {t('buttons:cancel')}
          </Button>
          <Button type="button" onClick={handleSubmit}>
            {t('buttons:save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
