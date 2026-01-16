import { FallBackLanguage, Language$, SupportedLanguages } from '@repo/core/schemas';
import { createMiddleware } from 'hono/factory';
import i18next, { TFunction } from 'node_modules/i18next';
import { resources } from 'translations';

declare module 'hono' {
  interface ContextVariableMap {
    t: TFunction;
  }
}

i18next.init({
  lng: FallBackLanguage,
  fallbackLng: FallBackLanguage,
  supportedLngs: SupportedLanguages,
  resources: resources,
});

export const i18nMiddleware = createMiddleware<{
  Variables: {
    t: TFunction;
  };
}>(async (c, next) => {
  const lang = Language$.parse(c.get('language'));
  await i18next.changeLanguage(lang);
  const t = i18next.getFixedT(lang);
  c.set('t', t);
  await next();
});
