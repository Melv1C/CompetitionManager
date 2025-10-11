import { FallBackLanguage, SupportedLanguages } from '@repo/core/schemas';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';

// Dynamically get namespaces from en translation files
const enTranslationFiles = import.meta.glob('../translations/en/*.json', { eager: false });
const namespaces = Object.keys(enTranslationFiles)
  .map(path => path.match(/\/([^/]+)\.json$/)?.[1])
  .filter((ns): ns is string => typeof ns === 'string');

i18n
  .use(LanguageDetector)
  .use(
    resourcesToBackend((language: string, namespace: string) => {
      return import(`../translations/${language}/${namespace}.json`);
    }),
  )
  .use(initReactI18next)
  .init({
    fallbackLng: FallBackLanguage,
    debug: false,
    supportedLngs: SupportedLanguages,
    defaultNS: 'common',
    ns: namespaces,
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
