import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import resourcesToBackend from 'i18next-resources-to-backend';
import { initReactI18next } from 'react-i18next';

i18n
  // Language detection
  .use(LanguageDetector)
  // Load translation files dynamically
  .use(
    resourcesToBackend((language: string, namespace: string) => {
      return import(`../translations/${language}/${namespace}.json`);
    })
  )
  // React integration
  .use(initReactI18next)
  // Initialize
  .init({
    fallbackLng: 'en',
    debug: false,

    // Define namespaces
    ns: ['common', 'auth', 'validation', 'messages'],
    defaultNS: 'common',

    interpolation: {
      escapeValue: false, // React already escapes by default
    },

    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

export default i18n;
