import { FallBackLanguage, SupportedLanguages } from '@repo/core/schemas';
import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';

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
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
