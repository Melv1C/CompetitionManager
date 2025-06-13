import { AuthButton } from './auth-button';
import { LanguageSelector } from './language-selector';
import { Navigation } from './navigation';

interface NavItem {
  href: string;
  label: string;
}

interface Language {
  label: string;
  code: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  navItems: NavItem[];
  languages: Language[];
  selectedLanguage: string;
  onLanguageChange: (value: string) => void;
  onClose: () => void;
}

export function MobileMenu({
  isOpen,
  navItems,
  languages,
  selectedLanguage,
  onLanguageChange,
  onClose,
}: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="md:hidden">
      <div className="px-2 pt-2 pb-3 space-y-1 border-t">
        <Navigation navItems={navItems} isMobile onMobileMenuClose={onClose} />{' '}
        <LanguageSelector
          selectedLanguage={selectedLanguage}
          onLanguageChange={onLanguageChange}
          languages={languages}
          isMobile
        />
        <AuthButton isMobile onMobileMenuClose={onClose} />
      </div>
    </div>
  );
}
