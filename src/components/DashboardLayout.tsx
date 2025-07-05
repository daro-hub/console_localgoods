'use client';
import { ReactNode } from 'react';
import { Sidebar } from './Sidebar';

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
  return (
    <div className="flex h-screen bg-gray-950">
      {/* Sidebar */}
      <Sidebar locale={locale} />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
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