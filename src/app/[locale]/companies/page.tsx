'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Building2, Plus, MapPin, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Company {
  id: number;
  created_at: number;
  Location: string;
  type: string;
  name: string;
  description: string;
  cover: string | null;
  gallery: string[];
}

export default function CompaniesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const { t } = useTranslations(locale);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const url = new URL('https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/companies');
        url.searchParams.append('lang', locale === 'it' ? 'it' : 'en');
        
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Errore nel recupero delle aziende');
        }

        const data = await response.json();
        setCompanies(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, [locale]);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

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

        {loading && (
          <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-8">
            <div className="text-center py-12">
              <Loader2 className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Caricamento aziende...
              </h3>
              <p className="text-gray-300">
                Attendere prego
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-2">
              <div className="text-red-400">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-red-300 font-semibold">Errore</h3>
                <p className="text-red-200">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && companies.length === 0 && (
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
        )}

        {!loading && !error && companies.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <div key={company.id} className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-6 hover:border-gray-700 transition-colors">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                      <Building2 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">
                        {company.name}
                      </h3>
                      {company.type && (
                        <span className="text-sm text-gray-400">
                          {company.type}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {company.description && (
                  <p className="text-gray-300 text-sm mb-4 line-clamp-3">
                    {company.description}
                  </p>
                )}

                <div className="space-y-2 mb-4">
                  {company.Location && (
                    <div className="flex items-center space-x-2 text-sm text-gray-400">
                      <MapPin className="h-4 w-4" />
                      <span>{company.Location}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <Clock className="h-4 w-4" />
                    <span>Creata il {formatDate(company.created_at)}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Link 
                    href={`/${locale}/companies/${company.id}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors text-center"
                  >
                    Visualizza
                  </Link>
                  <button className="px-4 py-2 border border-gray-600 text-gray-300 hover:bg-gray-800 rounded-lg text-sm transition-colors">
                    Modifica
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 