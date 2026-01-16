import { Input } from '@repo/ui';
import { Search } from 'lucide-react';
import { useTranslation } from 'node_modules/react-i18next';

interface ConfirmationAthleteSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const ConfirmationAthleteSearch = ({
  value,
  onChange,
  placeholder,
}: ConfirmationAthleteSearchProps) => {
  const { t } = useTranslation();

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="text"
        placeholder={placeholder || t('confirmations:searchPlaceholder')}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};
