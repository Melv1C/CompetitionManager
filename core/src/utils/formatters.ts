/**
 * Centralized formatting utilities for dates, times, currency, and other common formats.
 * These utilities support internationalization and consistent formatting across the application.
 */

export interface FormatOptions {
  locale?: string;
  timezone?: string;
}

/**
 * Format a date as a readable date string (e.g., "January 15, 2024")
 */
export const formatDate = (
  date: Date | string,
  options: FormatOptions = {}
): string => {
  const { locale = 'en-US' } = options;

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

/**
 * Format a date as a short date string (e.g., "Jan 15, 2024")
 */
export const formatDateShort = (
  date: Date | string,
  options: FormatOptions = {}
): string => {
  const { locale = 'en-US' } = options;

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(date));
};

/**
 * Format a date with time (e.g., "January 15, 2024 at 2:30 PM")
 */
export const formatDateTime = (
  date: Date | string,
  options: FormatOptions = {}
): string => {
  const { locale = 'en-US' } = options;

  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

/**
 * Format a date with full details including weekday (e.g., "Monday, January 15, 2024")
 */
export const formatDateFull = (
  date: Date | string,
  options: FormatOptions = {}
): string => {
  const { locale = 'en-US' } = options;

  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

/**
 * Format time only (e.g., "2:30 PM")
 */
export const formatTime = (
  date: Date | string,
  options: FormatOptions = {}
): string => {
  const { locale = 'en-US' } = options;

  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(date));
};

/**
 * Format time with seconds (e.g., "2:30:45 PM")
 */
export const formatTimeWithSeconds = (
  date: Date | string,
  options: FormatOptions = {}
): string => {
  const { locale = 'en-US' } = options;

  return new Intl.DateTimeFormat(locale, {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(date));
};

/**
 * Format a timestamp for logs (e.g., "2024-01-15 14:30:45.123")
 */
export const formatTimestamp = (date: Date | string): string => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');
  const milliseconds = String(d.getMilliseconds()).padStart(3, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${milliseconds}`;
};

/**
 * Currency formatting options
 */
export interface CurrencyOptions extends FormatOptions {
  currency?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Format a number as currency (e.g., "€25.00")
 */
export const formatCurrency = (
  amount: number,
  options: CurrencyOptions = {}
): string => {
  const {
    locale = 'en-US',
    currency = 'EUR',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2,
  } = options;

  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(amount);
};

/**
 * Format a number with locale-specific formatting (e.g., "1,234.56")
 */
export const formatNumber = (
  value: number,
  options: FormatOptions & {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string => {
  const {
    locale = 'en-US',
    minimumFractionDigits,
    maximumFractionDigits,
  } = options;

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value);
};

/**
 * Format metadata (JSON stringification with pretty printing)
 */
export const formatMetadata = (
  meta: string | null | undefined
): string | null => {
  if (!meta) return null;

  try {
    return JSON.stringify(JSON.parse(meta), null, 2);
  } catch {
    return meta;
  }
};

/**
 * Format file size in human readable format (e.g., "1.2 MB")
 */
export const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
};

/**
 * Format percentage (e.g., "75.5%")
 */
export const formatPercentage = (
  value: number,
  options: FormatOptions & {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string => {
  const {
    locale = 'en-US',
    minimumFractionDigits = 1,
    maximumFractionDigits = 1,
  } = options;

  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(value / 100);
};
