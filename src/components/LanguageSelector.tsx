'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Globe } from 'lucide-react';

interface LanguageSelectorProps {
  locale: string;
  collapsed?: boolean;
}

export function LanguageSelector({ locale, collapsed = false }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const languages = [
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
  ];

  const currentLanguage = languages.find(lang => lang.code === locale) || languages[0];

  const handleLanguageChange = (newLocale: string) => {
    const currentPath = window.location.pathname;
    const newPath = currentPath.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
    setIsOpen(false);
  };

  if (collapsed) {
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-3 rounded-xl hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-200"
          title="Lingua"
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
                  <span className="text-lg">{language.flag}</span>
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
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-4 text-base font-medium rounded-xl transition-all duration-200 text-gray-300 hover:bg-gray-800 hover:text-white"
      >
        <div className="flex items-center space-x-4">
          <Globe className="h-6 w-6 text-gray-400" />
          <span className="text-lg">{currentLanguage.flag}</span>
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
                <span className="text-lg">{language.flag}</span>
                <span className="font-medium">{language.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 