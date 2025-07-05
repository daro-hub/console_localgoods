import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
 
// Can be imported from a shared config
const locales = ['it', 'en', 'fr', 'es'];
 
export default getRequestConfig(async ({ locale }: any) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) notFound();
 
  return {
    locale,
    messages: (await import(`../locales/${locale}.json`)).default
  };
}); 