'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslations } from '@/hooks/useTranslations';
import { LanguageSelector } from './LanguageSelector';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Package, 
  ShoppingCart,
  BarChart3, 
  Info,
  ChevronLeft,
  ChevronRight,
  User,
  Users,
  Building2,
  LogOut
} from 'lucide-react';

interface SidebarProps {
  locale: string;
}

export function Sidebar({ locale }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();
  const { t } = useTranslations(locale);
  const { logout, user } = useAuth();

  // Carica lo stato della sidebar dal localStorage all'avvio
  useEffect(() => {
    const savedState = localStorage.getItem('sidebar-collapsed');
    if (savedState !== null) {
      setIsCollapsed(JSON.parse(savedState));
    }
  }, []);

  // Salva lo stato della sidebar nel localStorage quando cambia
  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', JSON.stringify(newState));
  };

  // Ottieni il ruolo dell'utente corrente
  const currentUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
  const isSuperAdmin = currentUser.role === 'superadmin';

  const navigationSections = [
    {
      title: t('navigation.sections.management'),
      items: [
        {
          name: t('navigation.companies'),
          href: `/${locale}/companies`,
          icon: Building2,
        },
        // Mostra la sezione utenti solo ai superadmin
        ...(isSuperAdmin ? [{
          name: t('navigation.users'),
          href: `/${locale}/users`,
          icon: Users,
        }] : []),
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
      ]
    },
    {
      title: t('navigation.sections.reports'),
      items: [
        {
          name: t('navigation.analytics'),
          href: `/${locale}/analytics`,
          icon: BarChart3,
        },
      ]
    },
    {
      title: t('navigation.sections.info'),
      items: [
        {
          name: t('navigation.information'),
          href: `/${locale}/information`,
          icon: Info,
        },
      ]
    }
  ];

  return (
    <div className={`flex flex-col bg-gray-900 border-r border-gray-800 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-72'
    }`}>
      {/* Header con Logo e Toggle */}
      <div className={`flex items-center h-20 border-b border-gray-800 ${
        isCollapsed ? 'justify-center px-3' : 'justify-between px-6'
      }`}>
        <Link href={`/${locale}`} className={`flex flex-col ${isCollapsed ? 'hidden' : 'flex'}`}>
          <span className="text-2xl font-bold text-gray-100">
            {t('navigation.title')}
          </span>
          <span className="text-xs text-gray-400 mt-1">
            {t('navigation.tagline')}
          </span>
        </Link>
        
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-xl hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-200"
          title={isCollapsed ? t('navigation.expand') : t('navigation.collapse')}
        >
          {isCollapsed ? (
            <ChevronRight className="h-6 w-6" />
          ) : (
            <ChevronLeft className="h-6 w-6" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6">
        {navigationSections.map((section, sectionIndex) => (
          <div key={section.title} className={sectionIndex > 0 ? 'mt-6' : ''}>
            {/* Titolo della sezione (solo quando espansa) */}
            {!isCollapsed && (
              <div className="px-3 mb-3">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  {section.title}
                </h3>
              </div>
            )}
            
            {/* Separatore visivo (solo quando compatta) */}
            {isCollapsed && sectionIndex > 0 && (
              <div className="flex justify-center mb-3">
                <div className="w-8 h-px bg-gray-700"></div>
              </div>
            )}
            
            {/* Items della sezione */}
            <div className="space-y-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                
                if (isCollapsed) {
                  return (
                    <div key={item.name} className="flex justify-center">
                      <Link
                        href={item.href}
                        className={`
                          p-2 rounded-xl transition-colors
                          ${isActive 
                            ? 'bg-blue-600 text-white shadow-lg' 
                            : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                          }
                        `}
                        title={item.name}
                      >
                        <Icon className={`h-6 w-6 ${isActive ? 'text-white' : ''}`} />
                      </Link>
                    </div>
                  );
                }
                
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center px-3 py-2 text-base font-medium rounded-xl transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-600 text-white shadow-lg' 
                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                      }
                    `}
                  >
                    <Icon className={`h-6 w-6 mr-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer con Language Selector, User e Logout */}
      <div className="px-3 py-6 border-t border-gray-800 space-y-2">
        {/* Language Selector */}
        <div className={isCollapsed ? 'flex justify-center' : ''}>
          <LanguageSelector locale={locale} collapsed={isCollapsed} />
        </div>
        
        {/* User Button */}
        <div className={isCollapsed ? 'flex justify-center' : ''}>
          {isCollapsed ? (
            <Link
              href={`/${locale}/profile`}
              className="p-2 rounded-xl hover:bg-gray-800 transition-colors text-gray-400 hover:text-gray-200"
              title={user?.email || t('navigation.profile')}
            >
              <User className="h-6 w-6" />
            </Link>
          ) : (
            <Link
              href={`/${locale}/profile`}
              className="flex items-center px-3 py-2 text-base font-medium rounded-xl transition-all duration-200 text-gray-300 hover:bg-gray-800 hover:text-white w-full"
            >
              <User className="h-6 w-6 text-gray-400 mr-4" />
              <div className="flex flex-col items-start">
                <span className="text-sm">{t('navigation.profile')}</span>
                {user?.email && (
                  <span className="text-xs text-gray-500 truncate max-w-[150px]">{user.email}</span>
                )}
              </div>
            </Link>
          )}
        </div>

        {/* Logout Button */}
        <div className={isCollapsed ? 'flex justify-center' : ''}>
          {isCollapsed ? (
            <button 
              onClick={logout}
              className="p-2 rounded-xl hover:bg-red-600 transition-colors text-gray-400 hover:text-white"
              title={t('navigation.logout')}
            >
              <LogOut className="h-6 w-6" />
            </button>
          ) : (
            <button 
              onClick={logout}
              className="flex items-center px-3 py-2 text-base font-medium rounded-xl transition-all duration-200 text-gray-300 hover:bg-red-600 hover:text-white w-full"
            >
              <LogOut className="h-6 w-6 text-gray-400 mr-4" />
              {t('navigation.logout')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 