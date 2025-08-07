/**
 * Frontend-specific formatting utilities that integrate with i18next for locale detection.
 * These utilities wrap the core formatters with automatic locale detection from i18n.
 */

import {
  formatDate as coreFormatDate,
  formatDateShort as coreFormatDateShort,
  formatDateTime as coreFormatDateTime,
  formatDateFull as coreFormatDateFull,
  formatTime as coreFormatTime,
  formatTimeWithSeconds as coreFormatTimeWithSeconds,
  formatTimestamp as coreFormatTimestamp,
  formatCurrency as coreFormatCurrency,
  formatNumber as coreFormatNumber,
  formatPercentage as coreFormatPercentage,
  type FormatOptions,
  type CurrencyOptions,
} from '@repo/core/utils';
import i18n from '../lib/i18n';

/**
 * Get the current locale from i18n
 */
const getCurrentLocale = (): string => i18n.language || 'en-US';

/**
 * Format a date as a readable date string using current locale
 */
export const formatDate = (
  date: Date | string,
  options: Omit<FormatOptions, 'locale'> = {}
): string => {
  return coreFormatDate(date, { ...options, locale: getCurrentLocale() });
};

/**
 * Format a date as a short date string using current locale
 */
export const formatDateShort = (
  date: Date | string,
  options: Omit<FormatOptions, 'locale'> = {}
): string => {
  return coreFormatDateShort(date, { ...options, locale: getCurrentLocale() });
};

/**
 * Format a date with time using current locale
 */
export const formatDateTime = (
  date: Date | string,
  options: Omit<FormatOptions, 'locale'> = {}
): string => {
  return coreFormatDateTime(date, { ...options, locale: getCurrentLocale() });
};

/**
 * Format a date with full details including weekday using current locale
 */
export const formatDateFull = (
  date: Date | string,
  options: Omit<FormatOptions, 'locale'> = {}
): string => {
  return coreFormatDateFull(date, { ...options, locale: getCurrentLocale() });
};

/**
 * Format time only using current locale
 */
export const formatTime = (
  date: Date | string,
  options: Omit<FormatOptions, 'locale'> = {}
): string => {
  return coreFormatTime(date, { ...options, locale: getCurrentLocale() });
};

/**
 * Format time with seconds using current locale
 */
export const formatTimeWithSeconds = (
  date: Date | string,
  options: Omit<FormatOptions, 'locale'> = {}
): string => {
  return coreFormatTimeWithSeconds(date, {
    ...options,
    locale: getCurrentLocale(),
  });
};

/**
 * Format a timestamp for logs (locale-independent)
 */
export const formatTimestamp = coreFormatTimestamp;

/**
 * Format a number as currency using current locale
 */
export const formatCurrency = (
  amount: number,
  options: Omit<CurrencyOptions, 'locale'> = {}
): string => {
  return coreFormatCurrency(amount, { ...options, locale: getCurrentLocale() });
};

/**
 * Format a number with locale-specific formatting using current locale
 */
export const formatNumber = (
  value: number,
  options: Omit<FormatOptions, 'locale'> & {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string => {
  return coreFormatNumber(value, { ...options, locale: getCurrentLocale() });
};

/**
 * Format percentage using current locale
 */
export const formatPercentage = (
  value: number,
  options: Omit<FormatOptions, 'locale'> & {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string => {
  return coreFormatPercentage(value, {
    ...options,
    locale: getCurrentLocale(),
  });
};

// Re-export locale-independent formatters
export { formatMetadata, formatFileSize } from '@repo/core/utils';

// Re-export types
export type { FormatOptions, CurrencyOptions };
