import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui';
import { useTranslation } from 'react-i18next';

interface Language {
  label: string;
  code: string;
}

const languages: Language[] = [
  { label: 'EN', code: 'en' },
  { label: 'FR', code: 'fr' },
  { label: 'NL', code: 'nl' },
];

export function LanguageSelector() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
  };

  return (
    <Select value={i18n.language} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-fit">
        <div className="flex items-center gap-1">
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {languages.map(lang => (
          <SelectItem key={lang.code} value={lang.code}>
            <div className="flex items-center gap-2">{lang.label}</div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
