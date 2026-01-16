// i18next-parser.config.js
export default {
  createOldCatalogs: false,
  defaultNamespace: 'common',
  defaultValue: (lng, ns, key) => {
    return `TODO: ${lng.toUpperCase()} - ${key}`;
  },
  locales: ['en', 'fr', 'nl'], // your locales
  namespaceSeparator: ':', // use ':' or false if you don't use namespaces
  output: 'src/translations/$LOCALE/$NAMESPACE.json',
  input: ['src/**/*.{ts,tsx}'],
  sort: true,
  verbose: false,
};
