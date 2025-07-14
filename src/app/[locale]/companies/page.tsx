'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Building2, Plus, MapPin, Clock, Loader2, X, Trash2, Wheat, Hammer, Beef } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Translation {
  id: number;
  name: string;
  description: string;
  language_id: number;
  language_code: string;
  language_name: string;
}

interface Company {
  id: number;
  created_at: number;
  Location: string;
  type: string;
  name: string;
  description: string;
  cover: string | null;
  gallery: string[];
  translations?: Translation[];
}

export default function CompaniesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const { t } = useTranslations(locale);
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);

  const [error, setError] = useState<string | null>(null);
  
  // Stati per il dialog di aggiunta azienda
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  
  // Stati per il dialog di eliminazione azienda
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Ottieni il ruolo dell'utente corrente
  const currentUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
  const isSuperAdmin = currentUser.role === 'superadmin';

  // Controlla se c'è un'ultima azienda visitata o se l'utente ha una sola azienda e reindirizza
  useEffect(() => {
    const lastCompanyId = localStorage.getItem('lastVisitedCompanyId');
    if (lastCompanyId) {
      router.push(`/${locale}/companies/${lastCompanyId}`);
    }
  }, [locale, router]);

  // Controlla se l'utente ha una sola azienda e reindirizza automaticamente
  useEffect(() => {
    const checkSingleCompany = async () => {
      if (companies.length === 1) {
        const singleCompany = companies[0];
        localStorage.setItem('lastVisitedCompanyId', singleCompany.id.toString());
        router.push(`/${locale}/companies/${singleCompany.id}`);
      }
    };

    if (companies.length > 0) {
      checkSingleCompany();
    }
  }, [companies, locale, router]);

  useEffect(() => {
            const fetchCompanies = async () => {
      try {
        // Determina quale API usare in base al ruolo dell'utente corrente
        // Usa la variabile isSuperAdmin già definita sopra
        
        
        
        let response;
        let apiUrl;
        
        if (isSuperAdmin) {
          // Per superadmin, usa l'API companies per ottenere tutte le aziende
          apiUrl = new URL('https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/companies');
          apiUrl.searchParams.append('lang', locale === 'it' ? 'it' : 'en');
          

          
          response = await fetch(apiUrl.toString(), {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          });
        } else {
          // Per utenti non superadmin, usa l'API user_company per ottenere le loro aziende
          apiUrl = new URL('https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/user_company');
          apiUrl.searchParams.append('user_id', currentUser.id || '');
          apiUrl.searchParams.append('lang', locale === 'it' ? 'it' : 'en');
          

          
          response = await fetch(apiUrl.toString(), {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          });
        }



        if (!response.ok) {
          const errorText = await response.text();
          
          // Se non è superadmin e l'API dà errore, probabilmente non ha aziende
          if (!isSuperAdmin) {
            setCompanies([]);
            return; // Non lanciare errore, mostra lista vuota
          }
          
          throw new Error('Errore nel recupero delle aziende');
        }

        const data = await response.json();
        setCompanies(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      } finally {

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

  const getCompanyTypeIcon = (type: string) => {
    switch (type) {
      case 'agriculture':
        return <Wheat className="h-3 w-3 text-green-400" />;
      case 'artisanal':
        return <Hammer className="h-3 w-3 text-orange-400" />;
      case 'livestock':
        return <Beef className="h-3 w-3 text-red-400" />;
      default:
        return <Building2 className="h-3 w-3 text-gray-400" />;
    }
  };

  const getCompanyTypeStyles = (type: string) => {
    switch (type) {
      case 'agriculture':
        return 'bg-green-900/20 border-green-600/30 text-green-400';
      case 'artisanal':
        return 'bg-orange-900/20 border-orange-600/30 text-orange-400';
      case 'livestock':
        return 'bg-red-900/20 border-red-600/30 text-red-400';
      default:
        return 'bg-gray-800/50 border-gray-600/30 text-gray-400';
    }
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
          type: "agricolture"
        })
      });

      if (!response.ok) {
        throw new Error('Errore nella creazione dell\'azienda');
      }

      const newCompany = await response.json();
      
      // Assicurati che l'oggetto abbia tutti i campi necessari
      const mappedCompany: Company = {
        id: newCompany.id,
        created_at: newCompany.created_at || Date.now(),
        Location: newCompany.Location || "",
        type: newCompany.type || "agricolture",
        name: newCompany.name || newCompanyName.trim(),
        description: newCompany.description || "",
        cover: newCompany.cover || null,
        gallery: newCompany.gallery || [],
        translations: newCompany.translations || []
      };
      
      console.log('Azienda mappata:', mappedCompany);
      
      // Aggiungi la nuova azienda alla lista
      setCompanies(prevCompanies => [mappedCompany, ...prevCompanies]);
      
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

  const handleDeleteClick = (e: React.MouseEvent, company: Company) => {
    e.preventDefault();
    e.stopPropagation();
    setCompanyToDelete(company);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false);
    setCompanyToDelete(null);
  };

  const deleteCompany = async () => {
    if (!companyToDelete || isDeleting) return;
    
    try {
      setIsDeleting(true);
      const response = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/company/${companyToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_id: companyToDelete.id
        })
      });

      if (!response.ok) {
        throw new Error('Errore nell\'eliminazione dell\'azienda');
      }

      // Rimuovi l'azienda dalla lista
      setCompanies(prevCompanies => 
        prevCompanies.filter(company => company.id !== companyToDelete.id)
      );
      
      // Chiudi il dialog
      setIsDeleteDialogOpen(false);
      setCompanyToDelete(null);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setIsDeleting(false);
    }
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
            {isSuperAdmin && (
              <button 
                type="button"
                onClick={handleOpenDialog}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>{t('pages.companies.addCompany')}</span>
              </button>
            )}
          </div>
        </div>



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

        {!error && companies.length === 0 && (
          <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-8">
            <div className="text-center py-12">
              <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                {isSuperAdmin ? t('pages.companies.noCompanies') : 'Non appartieni a nessuna azienda'}
              </h3>
              <p className="text-gray-300 mb-6">
                {isSuperAdmin ? t('pages.companies.createFirst') : 'Contatta un amministratore per essere collegato a un\'azienda.'}
              </p>
              {isSuperAdmin && (
                <button 
                  type="button"
                  onClick={handleOpenDialog}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors mx-auto"
                >
                  <Plus className="h-5 w-5" />
                  <span>{t('pages.companies.addCompany')}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {!error && companies.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {companies.map((company) => (
              <div key={company.id} className="group relative bg-gray-900 rounded-xl shadow-sm border border-gray-800 hover:border-gray-700 transition-colors overflow-hidden aspect-square flex flex-col">
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
                    <div className={`inline-flex items-center space-x-1 text-xs font-medium rounded-full px-2 py-1 border self-start ${getCompanyTypeStyles(company.type)}`}>
                      {getCompanyTypeIcon(company.type)}
                      <span className="capitalize">{company.type}</span>
                    </div>
                  )}
                </div>
                
                {/* Pulsante di eliminazione - visibile solo al hover e solo per superadmin */}
                {isSuperAdmin && (
                  <button
                    onClick={(e) => handleDeleteClick(e, company)}
                    className="absolute top-2 right-2 z-20 bg-red-600/60 hover:bg-red-600/80 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                    title="Elimina azienda"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
                
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
                  Nome dell&apos;azienda
                </label>
                <input
                  id="company-name"
                  type="text"
                  value={newCompanyName}
                  onChange={(e) => setNewCompanyName(e.target.value)}
                  placeholder="Inserisci il nome dell&apos;azienda"
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

      {/* Dialog di conferma eliminazione */}
      {isDeleteDialogOpen && companyToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-xl font-semibold text-white">
                Conferma Eliminazione
              </h2>
              <button
                type="button"
                onClick={handleCloseDeleteDialog}
                className="text-gray-400 hover:text-white transition-colors"
                disabled={isDeleting}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <p className="text-white mb-2">
                  Sei sicuro di voler eliminare l&apos;azienda:
                </p>
                <p className="text-lg font-semibold text-blue-400">
                  {companyToDelete.name}
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Questa azione non pu&ograve; essere annullata.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseDeleteDialog}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  disabled={isDeleting}
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={deleteCompany}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Eliminazione...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      <span>Elimina</span>
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