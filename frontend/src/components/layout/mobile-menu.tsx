import { LanguageSelector } from '@repo/ui';
import { Navigation } from './navigation';
import { useTranslation } from 'react-i18next';

interface NavItem {
  href: string;
  label: string;
}

interface MobileMenuProps {
  isOpen: boolean;
  navItems: NavItem[];
  onClose: () => void;
}

export function MobileMenu({ isOpen, navItems, onClose }: MobileMenuProps) {
  const { i18n } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="md:hidden">
      <div className="px-2 pt-2 pb-3 space-y-1 border-t">
        <Navigation navItems={navItems} isMobile onMobileMenuClose={onClose} />
        <LanguageSelector isMobile value={i18n.language} onValueChange={i18n.changeLanguage} />
      </div>
    </div>
  );
}
