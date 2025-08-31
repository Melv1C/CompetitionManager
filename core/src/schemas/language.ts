import z from 'zod';

export const Language$ = z.enum(['en', 'fr', 'nl']);
export type Language = z.infer<typeof Language$>;

export const SupportedLanguages = Language$.options;
export const FallBackLanguage = Language$.enum.en;
