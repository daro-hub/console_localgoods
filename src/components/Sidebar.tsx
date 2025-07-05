'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { 
  Package, 
  BarChart3, 
  Info, 
  User,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { LanguageSelector } from './LanguageSelector';
import clsx from 'clsx';

const navigationItems = [
  { key: 'products', href: '/prodotti', icon: Package },
  { key: 'analytics', href: '/analistica', icon: BarChart3 },
  { key: 'information', href: '/informazioni', icon: Info },
];

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const t = useTranslations('navigation');

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const isActive = (href: string) => {
    const pathWithoutLocale = pathname.replace(/^\/[a-z]{2}/, '');
    return pathWithoutLocale === href || pathname === href;
  };

  return (
    <div
      className={clsx(
        'fixed left-0 top-0 h-full bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 z-50 peer',
        isCollapsed ? 'w-16 sidebar-collapsed' : 'w-64'
      )}
    >
      {/* Header con logo e toggle */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        {!isCollapsed && (
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <span className="font-bold text-2xl text-gray-900 dark:text-white">
                Local Goods
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                Freschezza artigianale sostenibile
              </span>
            </div>
            
            <button
              onClick={toggleSidebar}
              className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <ChevronLeft className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        )}
        
        {isCollapsed && (
          <div className="flex flex-col items-center">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors mb-2"
            >
              <ChevronRight className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            </button>
            <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
              <Package className="h-5 w-5 text-white" />
            </div>
          </div>
        )}
      </div>

      {/* Navigazione principale */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            
            return (
              <Link
                key={item.key}
                href={item.href}
                className={clsx(
                  'flex items-center p-3 rounded-lg transition-colors group',
                  isCollapsed ? 'justify-center' : 'gap-3',
                  active
                    ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                )}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && (
                  <span className="font-medium">{t(item.key)}</span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Footer con lingua e profilo */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="space-y-3">
          {/* Selettore lingua */}
          <LanguageSelector isCollapsed={isCollapsed} />
          
          {/* Profilo utente */}
          <button
            className={clsx(
              'flex items-center gap-3 p-3 rounded-lg transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 w-full',
              isCollapsed && 'justify-center'
            )}
          >
            <User className="h-5 w-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="font-medium">{t('profile')}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 