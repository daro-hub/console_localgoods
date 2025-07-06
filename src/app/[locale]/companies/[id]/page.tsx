'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { useDebounce } from '@/hooks/useDebounce';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Toast } from '@/components/Toast';
import { Building2, MapPin, Loader2, ArrowLeft, Globe, Calendar, Wheat, Beef, Hammer, Image as ImageIcon } from 'lucide-react';
import Link from 'next/link';

interface Translation {
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
  cover: any;
  gallery: any[];
  translations: Translation[];
}

interface EditableCompany {
  name: string;
  description: string;
  Location: string;
  type: string;
}

export default function CompanyDetailsPage({ 
  params 
}: { 
  params: Promise<{ locale: string; id: string }> 
}) {
  const { locale, id } = use(params);
  const { t } = useTranslations(locale);
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Stati per i campi editabili
  const [editableFields, setEditableFields] = useState<EditableCompany>({
    name: '',
    description: '',
    Location: '',
    type: ''
  });
  
  // Toast notification
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    isVisible: boolean;
  }>({
    message: '',
    type: 'success',
    isVisible: false
  });
  
  // Debounce per l'autosave
  const debouncedFields = useDebounce(editableFields, 1000);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);
        const url = new URL('https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/company');
        url.searchParams.append('company_id', id);
        url.searchParams.append('lang', locale === 'it' ? 'it' : 'en');
        
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Errore nel recupero dei dettagli azienda');
        }

        const data = await response.json();
        if (data && data.length > 0) {
          const companyData = data[0];
          setCompany(companyData);
          setEditableFields({
            name: companyData.name || '',
            description: companyData.description || '',
            Location: companyData.Location || '',
            type: companyData.type || ''
          });
        } else {
          throw new Error('Azienda non trovata');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id, locale]);

  // Salvataggio automatico
  useEffect(() => {
    if (company && !loading && !isSaving) {
      const hasChanges = (
        editableFields.name !== company.name ||
        editableFields.description !== company.description ||
        editableFields.Location !== company.Location ||
        editableFields.type !== company.type
      );

      if (hasChanges) {
        saveChanges();
      }
    }
  }, [debouncedFields]);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info') => {
    setToast({
      message,
      type,
      isVisible: true
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, isVisible: false }));
  };

  const saveChanges = async () => {
    if (!company || isSaving) return;

    try {
      setIsSaving(true);
      
      // Trova la traduzione corrispondente alla lingua attuale
      const currentTranslation = company.translations?.find(
        translation => translation.language_code === locale
      );
      
      const payload = {
        company_id: company.id,
        name: editableFields.name,
        description: editableFields.description,
        lang: locale,
        translation_id: currentTranslation?.language_id || 0,
        type: editableFields.type,
        location: editableFields.Location,
        cover: null,
        gallery: []
      };

      const response = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/company/${company.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Errore nel salvataggio: ${response.status} - ${errorText}`);
      }

      // Aggiorna i dati locali
      setCompany(prev => prev ? {
        ...prev,
        name: editableFields.name,
        description: editableFields.description,
        Location: editableFields.Location,
        type: editableFields.type
      } : null);

      showToast('Modifiche salvate con successo', 'success');
      
    } catch (error) {
      showToast('Errore durante il salvataggio', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (field: keyof EditableCompany, value: string) => {
    setEditableFields(prev => ({ ...prev, [field]: value }));
  };

  const getImageUrl = (image: any): string | null => {
    if (!image) return null;
    
    if (typeof image === 'string') {
      return image;
    }
    
    if (typeof image === 'object' && image.url) {
      return image.url;
    }
    
    return null;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCompanyTypeIcon = (type: string) => {
    switch (type) {
      case 'agriculture':
        return <Wheat className="h-4 w-4 text-green-800" />;
      case 'artisanal':
        return <Hammer className="h-4 w-4 text-orange-800" />;
      case 'livestock':
        return <Beef className="h-4 w-4 text-red-800" />;
      default:
        return <Building2 className="h-4 w-4 text-gray-800" />;
    }
  };

  const getCompanyTypeStyles = (type: string) => {
    switch (type) {
      case 'agriculture':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'artisanal':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'livestock':
        return 'bg-red-100 border-red-300 text-red-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getCompanyTypeTextColor = (type: string) => {
    switch (type) {
      case 'agriculture':
        return 'text-green-800';
      case 'artisanal':
        return 'text-orange-800';
      case 'livestock':
        return 'text-red-800';
      default:
        return 'text-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout locale={locale}>
        <div className="p-8">
          <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-8">
            <div className="text-center py-12">
              <Loader2 className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Caricamento dettagli azienda...
              </h3>
              <p className="text-gray-300">
                Attendere prego
              </p>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout locale={locale}>
        <div className="p-8">
          <div className="mb-6">
            <Link 
              href={`/${locale}/companies`}
              className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Torna alle aziende</span>
            </Link>
          </div>
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="text-red-400">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-red-300 font-semibold text-lg">Errore</h3>
                <p className="text-red-200">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!company) {
    return null;
  }

  return (
    <DashboardLayout locale={locale}>
      <div className="p-8">
        {/* Header con breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link 
              href={`/${locale}/companies`}
              className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Torna alle aziende</span>
            </Link>
            
            {/* Indicatore di salvataggio */}
            {isSaving && (
              <div className="flex items-center space-x-2 text-sm text-blue-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Salvando...</span>
              </div>
            )}
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start space-x-6">
              {/* Cover Image */}
              <div className="relative">
                {company.cover && getImageUrl(company.cover) ? (
                  <div className="relative">
                    <img
                      src={getImageUrl(company.cover)!}
                      alt="Cover azienda"
                      className="w-32 h-32 object-cover rounded-xl"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden w-32 h-32 bg-gray-700 rounded-xl flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-gray-700 rounded-xl flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Company Info */}
              <div className="flex-1">
                <input
                  type="text"
                  value={editableFields.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className="text-3xl font-bold text-white bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 w-full"
                  placeholder="Nome azienda"
                />
                <div className="mt-2 mb-3 flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={editableFields.Location}
                    onChange={(e) => handleFieldChange('Location', e.target.value)}
                    className="text-lg text-gray-300 bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 flex-1"
                    placeholder="Posizione"
                  />
                </div>
                <div className="relative inline-block group">
                  <select
                    value={editableFields.type}
                    onChange={(e) => handleFieldChange('type', e.target.value)}
                    className={`appearance-none text-sm font-medium rounded-full pl-4 pr-12 py-1 border transition-colors hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${getCompanyTypeStyles(editableFields.type)}`}
                  >
                    <option value="agriculture" className="bg-white text-gray-900">
                      Agriculture
                    </option>
                    <option value="artisanal" className="bg-white text-gray-900">
                      Artisanal
                    </option>
                    <option value="livestock" className="bg-white text-gray-900">
                      Livestock
                    </option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <div className="flex items-center space-x-1">
                      {getCompanyTypeIcon(editableFields.type)}
                      <svg className={`h-4 w-4 ${getCompanyTypeTextColor(editableFields.type)} transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Informazioni principali */}
          <div className="space-y-6">
            {/* Descrizione */}
            <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Descrizione
              </h2>
              <textarea
                value={editableFields.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className="w-full h-32 text-gray-300 bg-gray-800 border border-gray-700 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder="Descrizione dell'azienda..."
              />
            </div>

            {/* Galleria */}
            <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <ImageIcon className="h-5 w-5" />
                <span>Galleria immagini</span>
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Immagini esistenti */}
                {company.gallery && company.gallery.length > 0 ? (
                  company.gallery
                    .filter(image => getImageUrl(image))
                    .map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={getImageUrl(image)!}
                        alt={`Galleria ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden w-full h-24 bg-gray-700 rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-400">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Nessuna immagine nella galleria</p>
                  </div>
                )}
              </div>
            </div>

            {/* Traduzioni */}
            <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <Globe className="h-5 w-5" />
                <span>Traduzioni</span>
              </h2>
              
              {company.translations && company.translations.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left text-gray-300 font-bold pb-2">Lingua</th>
                        <th className="text-left text-gray-300 font-bold pb-2">Nome</th>
                        <th className="text-left text-gray-300 font-bold pb-2">Descrizione</th>
                      </tr>
                    </thead>
                    <tbody>
                      {company.translations.map((translation, index) => (
                        <tr key={index} className="border-b border-gray-800">
                          <td className="py-3 pr-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-2xl">
                                {translation.language_code === 'it' ? '🇮🇹' : 
                                 translation.language_code === 'en' ? '🇬🇧' : 
                                 translation.language_code === 'fr' ? '🇫🇷' : 
                                 translation.language_code === 'es' ? '🇪🇸' : '🌐'}
                              </span>
                              <span className="text-gray-300">{translation.language_name}</span>
                            </div>
                          </td>
                          <td className="py-3 pr-4">
                            <span className="text-gray-300 text-sm">{translation.name}</span>
                          </td>
                          <td className="py-3">
                            <span className="text-gray-300 text-sm line-clamp-2">{translation.description}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-400">Nessuna traduzione disponibile</p>
              )}
            </div>

            {/* Informazioni aggiuntive */}
            <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                Informazioni aggiuntive
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">Data di creazione</p>
                    <p className="text-gray-300">{formatDate(company.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">ID Azienda</p>
                    <p className="text-gray-300">#{company.id}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </DashboardLayout>
  );
} 