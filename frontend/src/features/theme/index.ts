// Theme feature exports

// Types
export type {
  AppliedTheme,
  Theme,
  ThemeProviderProps,
  ThemeProviderState,
} from './types';

// Components
export { ThemeProvider } from './components/theme-provider';
export { ThemeToggle } from './components/theme-toggle';

// Hooks
export { useTheme } from './hooks/use-theme';

// Utils
export {
  applyThemeToDOM,
  getSystemTheme,
  getThemeValue,
} from './utils/theme-utils';

// Context (if needed for advanced usage)
export { ThemeProviderContext } from './context/theme-context';
