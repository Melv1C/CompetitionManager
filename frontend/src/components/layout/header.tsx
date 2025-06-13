import { Button } from '@/components/ui/button';
import { AuthButton } from '@/features/auth';
import { getThemeValue, ThemeToggle, useTheme } from '@/features/theme';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { LanguageSelector } from './language-selector';
import { MobileMenu } from './mobile-menu';
import { Navigation } from './navigation';

export function Header() {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation('common');

  const navItems = [
    { href: '/', label: t('home') },
    { href: '/competitions', label: t('competitions') },
    { href: '/results', label: t('results') },
  ];

  const handleMobileMenuClose = () => setIsOpen(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <img
              src={
                getThemeValue(theme) === 'dark'
                  ? '/logo-white.png'
                  : '/logo-black.png'
              }
              alt="Competition Manager Logo"
              className="h-8 w-10"
            />
            <span className="hidden font-bold sm:inline-block">
              Competition Manager
            </span>
          </Link>
          {/* Desktop Navigation */}
          <Navigation navItems={navItems} /> {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            <LanguageSelector />
            <ThemeToggle />
            <AuthButton />
          </div>
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <AuthButton />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
        {/* Mobile Navigation */}
        <MobileMenu
          isOpen={isOpen}
          navItems={navItems}
          onClose={handleMobileMenuClose}
        />
      </div>
    </header>
  );
}
