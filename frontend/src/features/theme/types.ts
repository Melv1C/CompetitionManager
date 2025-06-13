import z from 'zod';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const themeEnum = z.enum(['light', 'dark', 'system'] as const)
export type Theme = z.infer<typeof themeEnum>;
export type AppliedTheme = Exclude<Theme, 'system'>;

export type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

export type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};
