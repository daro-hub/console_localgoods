'use client';
import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from '@/hooks/useTranslations';
import { LanguageSelector } from './LanguageSelector';
import { 
  Package, 
  ShoppingCart,
  BarChart3, 
  Info,
  ChevronLeft,
  ChevronRight,
  User
} from 'lucide-react';

interface SidebarProps {
  locale: string;
}

export function Sidebar({ locale }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { t } = useTranslations(locale);

  const navigation = [
    {
      name: t('navigation.products'),
      href: `/${locale}/products`,
      icon: Package,
    },
    {
      name: t('navigation.orders'),
      href: `/${locale}/orders`,
      icon: ShoppingCart,
    },
    {
      name: t('navigation.analytics'),
      href: `/${locale}/analytics`,
      icon: BarChart3,
    },
    {
      name: t('navigation.information'),
      href: `/${locale}/information`,
      icon: Info,
    },
  ];

  return (
    <div className={`flex flex-col bg-gray-900 border-r border-gray-800 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-72'
    }`}>
      {/* Header con Logo e Toggle */}
      <div className="flex items-center justify-between h-20 px-6 border-b border-gray-800">
        <Link href={`/${locale}`} className={`flex flex-col ${isCollapsed ? 'hidden' : 'flex'}`}>
          <span className="text-3xl font-bold text-gray-100">
            {t('navigation.title')}
          </span>
          <span className="text-sm text-gray-400 mt-1">
            {t('navigation.tagline')}
          </span>
        </Link>
        
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-3 rounded-lg hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-200"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-8 space-y-3">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-4 py-4 text-base font-medium rounded-xl transition-all duration-200
                ${isActive 
                  ? 'bg-blue-600 text-white shadow-lg' 
                  : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                }
                ${isCollapsed ? 'justify-center' : ''}
              `}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon className={`h-6 w-6 ${isActive ? 'text-white' : 'text-gray-400'} ${
                isCollapsed ? 'mr-0' : 'mr-4'
              }`} />
              {!isCollapsed && item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer con Language Selector e User */}
      <div className="px-3 py-6 border-t border-gray-800 space-y-3">
        {/* Language Selector */}
        <div className={isCollapsed ? 'flex justify-center' : ''}>
          <LanguageSelector locale={locale} collapsed={isCollapsed} />
        </div>
        
        {/* User Button */}
        <button 
          className={`
            flex items-center px-4 py-4 text-base font-medium rounded-xl transition-all duration-200 text-gray-300 hover:bg-gray-800 hover:text-white
            ${isCollapsed ? 'justify-center' : 'w-full'}
          `}
          title={isCollapsed ? t('navigation.profile') : undefined}
        >
          <User className={`h-6 w-6 text-gray-400 ${isCollapsed ? 'mr-0' : 'mr-4'}`} />
          {!isCollapsed && t('navigation.profile')}
        </button>
      </div>
    </div>
  );
} 