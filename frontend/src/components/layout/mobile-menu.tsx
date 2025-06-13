import { AuthButton } from '../../features/auth/components/auth-button';
import { LanguageSelector } from './language-selector';
import { Navigation } from './navigation';

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
  if (!isOpen) return null;

  return (
    <div className="md:hidden">
      <div className="px-2 pt-2 pb-3 space-y-1 border-t">
        <Navigation navItems={navItems} isMobile onMobileMenuClose={onClose} />
        <LanguageSelector isMobile />
        <AuthButton isMobile onMobileMenuClose={onClose} />
      </div>
    </div>
  );
}
