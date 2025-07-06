'use client';

import { useEffect, useState } from 'react';

interface Translations {
  [key: string]: any;
}

const cachedTranslations: { [locale: string]: Translations } = {};

export function useTranslations(locale: string) {
  const [translations, setTranslations] = useState<Translations>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTranslations() {
      // Usa cache se già caricato
      if (cachedTranslations[locale]) {
        setTranslations(cachedTranslations[locale]);
        setLoading(false);
        return;
      }

      try {
        const messages = (await import(`../locales/${locale}.json`)).default;
        cachedTranslations[locale] = messages;
        setTranslations(messages);
      } catch {
        console.warn(`Traduzioni non trovate per: ${locale}`);
        setTranslations({});
      } finally {
        setLoading(false);
      }
    }

    loadTranslations();
  }, [locale]);

  // Funzione per ottenere una traduzione usando dot notation
  const t = (key: string, fallback?: string): string => {
    const keys = key.split('.');
    let value: any = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return fallback || key;
      }
    }
    
    return typeof value === 'string' ? value : fallback || key;
  };

  return { t, loading, locale };
} 