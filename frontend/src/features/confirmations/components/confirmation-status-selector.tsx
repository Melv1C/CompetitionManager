import type { PresenceStatus } from '@repo/core/schemas';
import { Label, RadioGroup, RadioGroupItem } from '@repo/ui';
import { useTranslation } from 'react-i18next';

interface ConfirmationStatusSelectorProps {
  value: PresenceStatus;
  onChange: (value: PresenceStatus) => void;
  disabled?: boolean;
}

export const ConfirmationStatusSelector = ({
  value,
  onChange,
  disabled = false,
}: ConfirmationStatusSelectorProps) => {
  const { t } = useTranslation();

  return (
    <RadioGroup
      value={value}
      onValueChange={onChange}
      disabled={disabled}
      className="flex space-x-4"
    >
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="PRESENT" id="present" />
        <Label htmlFor="present" className="cursor-pointer">
          {t('confirmations:statusPresent')}
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="ABSENT" id="absent" />
        <Label htmlFor="absent" className="cursor-pointer">
          {t('confirmations:statusAbsent')}
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="UNKNOWN" id="unknown" />
        <Label htmlFor="unknown" className="cursor-pointer">
          {t('confirmations:statusUnknown')}
        </Label>
      </div>
    </RadioGroup>
  );
};
