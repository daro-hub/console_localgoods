'use client';

import { use } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Building2, Plus } from 'lucide-react';

export default function CompaniesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const { t } = useTranslations(locale);

  return (
    <DashboardLayout locale={locale}>
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {t('pages.companies.title')}
              </h1>
              <p className="text-gray-300">
                {t('pages.companies.description')}
              </p>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors">
              <Plus className="h-5 w-5" />
              <span>{t('pages.companies.addCompany')}</span>
            </button>
          </div>
        </div>

        <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-8">
          <div className="text-center py-12">
            <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {t('pages.companies.noCompanies')}
            </h3>
            <p className="text-gray-300 mb-6">
              {t('pages.companies.createFirst')}
            </p>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors mx-auto">
              <Plus className="h-5 w-5" />
              <span>{t('pages.companies.addCompany')}</span>
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 