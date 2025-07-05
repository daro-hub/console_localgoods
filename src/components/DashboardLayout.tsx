'use client';

import { Sidebar } from './Sidebar';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      {/* Contenuto principale - il margine si adatta automaticamente alla sidebar */}
      <main className="ml-64 transition-all duration-300 peer-[.sidebar-collapsed]:ml-16">
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
} 