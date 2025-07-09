'use client';
import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { useNavigation } from '@/contexts/NavigationContext';
import { Loader2 } from 'lucide-react';

interface DashboardLayoutProps {
  children: ReactNode;
  locale: string;
  title?: string;
  breadcrumbs?: { label: string; href?: string }[];
}

export function DashboardLayout({ 
  children, 
  locale, 
  title
}: DashboardLayoutProps) {
  const { isLoading } = useNavigation();

  return (
    <div className="flex h-screen bg-gray-950">
      {/* Sidebar */}
      <Sidebar locale={locale} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {/* Loading Overlay - solo sopra l'area del contenuto */}
        {isLoading && (
          <div className="absolute inset-0 bg-gray-950/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
              <p className="text-white font-medium">Caricamento...</p>
            </div>
          </div>
        )}

        {/* Simple Page Title */}
        {title && (
          <div className="px-8 py-6 bg-gray-950">
            <h1 className="text-3xl font-bold text-white">
              {title}
            </h1>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-gray-950">
          <div className="px-8 pb-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 