import type { AppliedTheme, Theme } from '../types';

export function getThemeValue(theme: Theme): AppliedTheme {
  switch (theme) {
    case 'system':
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    default:
      return theme;
  }
}

export function getSystemTheme(): AppliedTheme {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
}

export function applyThemeToDOM(theme: Theme): void {
  const root = window.document.documentElement;

  root.classList.remove('light', 'dark');

  if (theme === 'system') {
    const systemTheme = getSystemTheme();
    root.classList.add(systemTheme);
    return;
  }

  root.classList.add(theme);
}
