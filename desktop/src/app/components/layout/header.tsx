import { AuthButton } from '@/features/auth'
import { getThemeValue, ThemeToggle, useTheme } from '@/features/theme'
import { LanguageSelector } from './language-selector'
import LightLogo from '@/assets/logo-white.png'
import DarkLogo from '@/assets/logo-black.png'

export function Header() {
  const { theme } = useTheme()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <img
              src={getThemeValue(theme) === 'dark' ? LightLogo : DarkLogo}
              alt="Competition Manager Logo"
              className="h-8 w-10"
            />
            <span className="hidden font-bold sm:inline-block">Competition Manager</span>
          </div>
          <div className="hidden md:flex items-center space-x-3">
            <LanguageSelector />
            <ThemeToggle />
            <AuthButton />
          </div>
        </div>
      </div>
    </header>
  )
}
