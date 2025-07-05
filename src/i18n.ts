import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';

// Lingue supportate
export const locales = ['it', 'en', 'fr', 'es'] as const;
export const defaultLocale = 'it' as const;

export default getRequestConfig(async ({ locale }) => {
  // Valida che la lingua sia supportata
  if (!locales.includes(locale as (typeof locales)[number])) notFound();

  return {
    messages: (await import(`./locales/${locale}.json`)).default
  };
}); 