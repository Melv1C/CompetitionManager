import { Button } from '@/components/ui/button';
import { AuthButton } from '@/features/auth';
import { getThemeValue, ThemeToggle, useTheme } from '@/features/theme';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LanguageSelector } from './language-selector';
import { MobileMenu } from './mobile-menu';
import { Navigation } from './navigation';

const navItems = [
  { href: '/', label: 'Home' },
  { href: '/competitions', label: 'Competitions' },
  { href: '/results', label: 'Results' },
];

const languages = [
  { label: 'EN', code: 'en' },
  { label: 'FR', code: 'fr' },
  { label: 'NL', code: 'nl' },
];

export function Header() {
  const { theme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');

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
            <LanguageSelector
              selectedLanguage={selectedLanguage}
              onLanguageChange={setSelectedLanguage}
              languages={languages}
            />
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
        </div>{' '}
        {/* Mobile Navigation */}
        <MobileMenu
          isOpen={isOpen}
          navItems={navItems}
          languages={languages}
          selectedLanguage={selectedLanguage}
          onLanguageChange={setSelectedLanguage}
          onClose={handleMobileMenuClose}
        />
      </div>
    </header>
  );
}
