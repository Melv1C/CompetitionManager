import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Globe } from 'lucide-react';

interface Language {
  label: string;
  code: string;
}

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (value: string) => void;
  languages: Language[];
  isMobile?: boolean;
}

export function LanguageSelector({
  selectedLanguage,
  onLanguageChange,
  languages,
  isMobile = false,
}: LanguageSelectorProps) {
  if (isMobile) {
    return (
      <div className="px-3 py-2">
        <Select value={selectedLanguage} onValueChange={onLanguageChange}>
          <SelectTrigger className="w-full">
            <div className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
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
    <Select value={selectedLanguage} onValueChange={onLanguageChange}>
      <SelectTrigger className="w-fit">
        <div className="flex items-center gap-1">
          <Globe className="h-4 w-4" />
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
