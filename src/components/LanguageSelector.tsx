'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Globe } from 'lucide-react';
import { useTranslations } from '@/hooks/useTranslations';

interface LanguageSelectorProps {
  locale: string;
  collapsed?: boolean;
}

export function LanguageSelector({ locale, collapsed = false }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslations(locale);

  const languages = [
    { code: 'it', name: t('languages.it'), flag: 'it' },
    { code: 'en', name: t('languages.en'), flag: 'us' },
    { code: 'fr', name: t('languages.fr'), flag: 'fr' },
    { code: 'es', name: t('languages.es'), flag: 'es' },
  ];

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  const handleLanguageChange = (newLocale: string) => {
    const currentPath = window.location.pathname;
    const newPath = currentPath.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
    setIsOpen(false);
  };

  // Chiude il menu quando si clicca fuori dal componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (collapsed) {
    return (
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-200"
          title={t('common.language')}
        >
          <Globe className="h-6 w-6" />
        </button>

        {isOpen && (
          <div className="absolute bottom-full left-0 mb-2 w-48 bg-gray-800 rounded-xl shadow-xl border border-gray-700 z-50">
            <div className="py-1">
              {languages.map((language) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageChange(language.code)}
                  className={`
                    w-full text-left px-4 py-3 text-sm flex items-center space-x-3 hover:bg-gray-700 transition-colors first:rounded-t-xl last:rounded-b-xl
                    ${language.code === locale 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-200'
                    }
                  `}
                >
                  <img 
                    src={`https://flagcdn.com/w40/${language.flag}.png`} 
                    alt={`${t('common.flag')} ${language.name}`}
                    className="w-6 h-4 object-cover rounded-sm"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  <span className="text-xs font-bold bg-gray-600 text-white px-2 py-1 rounded hidden">{language.flag.toUpperCase()}</span>
                  <span className="font-medium">{language.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-base font-medium rounded-xl transition-all duration-200 text-gray-300 hover:bg-gray-800 hover:text-white"
      >
        <div className="flex items-center space-x-4">
          <Globe className="h-6 w-6 text-gray-400" />
          <img 
            src={`https://flagcdn.com/w40/${currentLanguage.flag}.png`} 
            alt={`${t('common.flag')} ${currentLanguage.name}`}
            className="w-6 h-4 object-cover rounded-sm"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.nextElementSibling?.classList.remove('hidden');
            }}
          />
          <span className="text-xs font-bold bg-gray-600 text-white px-2 py-1 rounded hidden">{currentLanguage.flag.toUpperCase()}</span>
          <span className="font-medium">{currentLanguage.name}</span>
        </div>
        <ChevronDown className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 mb-2 w-full bg-gray-800 rounded-xl shadow-xl border border-gray-700 z-50">
          <div className="py-1">
            {languages.map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`
                  w-full text-left px-4 py-3 text-sm flex items-center space-x-3 hover:bg-gray-700 transition-colors first:rounded-t-xl last:rounded-b-xl
                  ${language.code === locale 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-200'
                  }
                `}
              >
                <img 
                  src={`https://flagcdn.com/w40/${language.flag}.png`} 
                  alt={`${t('common.flag')} ${language.name}`}
                  className="w-6 h-4 object-cover rounded-sm"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <span className="text-xs font-bold bg-gray-600 text-white px-2 py-1 rounded hidden">{language.flag.toUpperCase()}</span>
                <span className="font-medium">{language.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 