import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useTranslation } from 'react-i18next';

interface Language {
  label: string;
  code: string;
}

interface LanguageSelectorProps {
  isMobile?: boolean;
}

const languages: Language[] = [
  { label: 'EN', code: 'en' },
  { label: 'FR', code: 'fr' },
  { label: 'NL', code: 'nl' },
];

export function LanguageSelector({ isMobile = false }: LanguageSelectorProps) {
  const { i18n } = useTranslation();

  const handleLanguageChange = (value: string) => {
    i18n.changeLanguage(value);
  };

  if (isMobile) {
    return (
      <div className="px-3 py-2">
        <Select value={i18n.language} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-full">
            <div className="flex items-center gap-1">
              <SelectValue />
            </div>
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                <div className="flex items-center gap-2">{lang.label}</div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <Select value={i18n.language} onValueChange={handleLanguageChange}>
      <SelectTrigger className="w-fit">
        <div className="flex items-center gap-1">
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <div className="flex items-center gap-2">{lang.label}</div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
