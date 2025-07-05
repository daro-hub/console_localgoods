'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { locales } from '@/i18n';
import { Globe, ChevronDown, Check } from 'lucide-react';
import clsx from 'clsx';

interface LanguageSelectorProps {
  isCollapsed?: boolean;
}

export function LanguageSelector({ isCollapsed = false }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations('languages');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (newLocale: string) => {
    // Rimuovi la lingua attuale dall'URL se presente
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '');
    
    // Crea il nuovo URL con la nuova lingua
    const newUrl = newLocale === 'it' ? pathWithoutLocale || '/' : `/${newLocale}${pathWithoutLocale || '/'}`;
    
    router.push(newUrl);
    setIsOpen(false);
  };

  if (isCollapsed) {
    return (
      <div ref={dropdownRef} className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center p-3 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 w-full"
        >
          <Globe className="h-5 w-5" />
        </button>
        
        {isOpen && (
          <div className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50">
            {locales.map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={clsx(
                  'flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left',
                  locale === lang && 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                )}
              >
                {locale === lang && <Check className="h-3 w-3" />}
                <span className={locale !== lang ? 'ml-5' : ''}>{t(lang)}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-3 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 w-full"
      >
        <Globe className="h-5 w-5 flex-shrink-0" />
        <span className="font-medium flex-1">{t(locale)}</span>
        <ChevronDown className={clsx('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
      </button>
      
      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50">
          {locales.map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              className={clsx(
                'flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left',
                locale === lang && 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
              )}
            >
              {locale === lang && <Check className="h-3 w-3" />}
              <span className={locale !== lang ? 'ml-5' : ''}>{t(lang)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 