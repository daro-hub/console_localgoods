'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Building2, Plus, MapPin, Clock, Loader2, X } from 'lucide-react';
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
  
  // Stati per il dialog di aggiunta azienda
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

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

  const createCompany = async () => {
    if (!newCompanyName.trim()) return;
    
    try {
      setIsCreating(true);
      const response = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCompanyName.trim(),
          lang: locale,
          cover: null,
          gallery: [],
          Location: "",
          type: ""
        })
      });

      if (!response.ok) {
        throw new Error('Errore nella creazione dell\'azienda');
      }

      const newCompany = await response.json();
      
      // Aggiungi la nuova azienda alla lista
      setCompanies(prevCompanies => [newCompany, ...prevCompanies]);
      
      // Chiudi il dialog e resetta il form
      setIsDialogOpen(false);
      setNewCompanyName('');
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setIsCreating(false);
    }
  };

  const handleOpenDialog = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDialogOpen(true);
    setError(null);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setNewCompanyName('');
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
            <button 
              type="button"
              onClick={handleOpenDialog}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors"
            >
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
              <button 
                type="button"
                onClick={handleOpenDialog}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors mx-auto"
              >
                <Plus className="h-5 w-5" />
                <span>{t('pages.companies.addCompany')}</span>
              </button>
            </div>
          </div>
        )}

        {!loading && !error && companies.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {companies.map((company) => (
              <div key={company.id} className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 hover:border-gray-700 transition-colors overflow-hidden aspect-square flex flex-col">
                {/* Immagine dell'azienda - 3/4 dell'altezza */}
                <div className="flex-1 relative bg-gray-800">
                  {company.cover ? (
                    <img 
                      src={company.cover} 
                      alt={company.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Building2 className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                </div>
                
                {/* Informazioni azienda - 1/4 dell'altezza */}
                <div className="p-4 flex flex-col justify-center min-h-0">
                  <h3 className="text-lg font-semibold text-white truncate mb-1">
                    {company.name}
                  </h3>
                  {company.type && (
                    <span className="text-sm text-gray-400 truncate">
                      {company.type}
                    </span>
                  )}
                </div>
                
                {/* Overlay per il link */}
                <Link 
                  href={`/${locale}/companies/${company.id}`}
                  className="absolute inset-0 z-10"
                  title={`Visualizza ${company.name}`}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dialog per aggiungere nuova azienda */}
      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-xl font-semibold text-white">
                Aggiungi Nuova Azienda
              </h2>
              <button
                type="button"
                onClick={handleCloseDialog}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-4">
                <label htmlFor="company-name" className="block text-sm font-medium text-white mb-2">
                  Nome dell'azienda
                </label>
                <input
                  id="company-name"
                  type="text"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="Inserisci il nome dell'azienda"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isCreating}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newCompanyName.trim()) {
                      createCompany();
                    }
                  }}
                />
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseDialog}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  disabled={isCreating}
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={createCompany}
                  disabled={!newCompanyName.trim() || isCreating}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creazione...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>Aggiungi</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
} 