import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@melv1c/ui-kit';

interface Language {
  label: string;
  code: string;
}

interface LanguageSelectorProps {
  isMobile?: boolean;
  value: Language['code'];
  onValueChange: (value: Language['code']) => void;
}

const languages: Language[] = [
  { label: 'EN', code: 'en' },
  { label: 'FR', code: 'fr' },
  { label: 'NL', code: 'nl' },
];

export function LanguageSelector({
  isMobile = false,
  value,
  onValueChange,
}: LanguageSelectorProps) {
  if (isMobile) {
    return (
      <div className="px-3 py-2">
        <Select value={value} onValueChange={onValueChange}>
          <SelectTrigger className="w-full">
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
      </div>
    );
  }

  return (
    <Select value={value} onValueChange={onValueChange}>
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
