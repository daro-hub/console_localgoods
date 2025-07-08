'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { useDebounce } from '@/hooks/useDebounce';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Toast } from '@/components/Toast';
import { Building2, MapPin, Loader2, ArrowLeft, Globe, Calendar, Wheat, Beef, Hammer, Image as ImageIcon, X, Plus, Sparkles, Trash2 } from 'lucide-react';
import Link from 'next/link';

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
  
  // Stati per il dialog di modifica traduzione
  const [isTranslationDialogOpen, setIsTranslationDialogOpen] = useState(false);
  const [selectedTranslation, setSelectedTranslation] = useState<Translation | null>(null);
  const [translationFields, setTranslationFields] = useState({
    name: '',
    description: ''
  });
  const [isTranslationSaving, setIsTranslationSaving] = useState(false);
  
  // Stati per il dialog di aggiunta traduzione
  const [isAddTranslationDialogOpen, setIsAddTranslationDialogOpen] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState<any[]>([]);
  const [selectedLanguageId, setSelectedLanguageId] = useState<number | null>(null);
  const [isAddingTranslation, setIsAddingTranslation] = useState(false);
  const [loadingLanguages, setLoadingLanguages] = useState(false);
  
  // Stati per il dialog di eliminazione traduzione
  const [isDeleteTranslationDialogOpen, setIsDeleteTranslationDialogOpen] = useState(false);
  const [translationToDelete, setTranslationToDelete] = useState<Translation | null>(null);
  const [isDeletingTranslation, setIsDeletingTranslation] = useState(false);
  
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
  const debouncedTranslationFields = useDebounce(translationFields, 1000);

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

  // Salvataggio automatico per le traduzioni
  useEffect(() => {
    if (selectedTranslation && !isTranslationSaving && isTranslationDialogOpen) {
      const hasChanges = (
        translationFields.name !== selectedTranslation.name ||
        translationFields.description !== selectedTranslation.description
      );

      if (hasChanges && translationFields.name.trim() && translationFields.description.trim()) {
        saveTranslationChanges();
      }
    }
  }, [debouncedTranslationFields]);

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
      
      console.log('Traduzione attuale trovata:', currentTranslation);
      console.log('Locale attuale:', locale);
      
      const payload = {
        company_id: company.id,
        name: editableFields.name,
        description: editableFields.description,
        lang: locale,
        translation_id: currentTranslation?.id || 0,
        type: editableFields.type,
        location: editableFields.Location,
        cover: null,
        gallery: []
      };
      
      console.log('Payload per la modifica:', payload);

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

  const handleTranslationClick = (translation: Translation) => {
    setSelectedTranslation(translation);
    setTranslationFields({
      name: translation.name,
      description: translation.description
    });
    setIsTranslationDialogOpen(true);
  };

  const handleCloseTranslationDialog = () => {
    setIsTranslationDialogOpen(false);
    setSelectedTranslation(null);
    setTranslationFields({ name: '', description: '' });
  };

  const handleTranslationFieldChange = (field: 'name' | 'description', value: string) => {
    setTranslationFields(prev => ({ ...prev, [field]: value }));
  };

  const saveTranslationChanges = async () => {
    if (!company || !selectedTranslation || isTranslationSaving) return;

    try {
      setIsTranslationSaving(true);
      
      const payload = {
        company_id: company.id,
        name: translationFields.name,
        description: translationFields.description,
        lang: selectedTranslation.language_code,
        translation_id: selectedTranslation.id,
        type: company.type,
        location: company.Location,
        cover: null,
        gallery: []
      };

      console.log('Payload per modifica traduzione:', payload);

      const response = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/company/${company.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Errore nel salvataggio traduzione: ${response.status} - ${errorText}`);
      }

      // Aggiorna la traduzione nel company state
      setCompany(prev => prev ? {
        ...prev,
        translations: prev.translations.map(t => 
          t.id === selectedTranslation.id 
            ? { ...t, name: translationFields.name, description: translationFields.description }
            : t
        )
      } : null);

      // Se sto modificando la traduzione della lingua attuale, aggiorna anche i campi principali
      if (selectedTranslation.language_code === locale) {
        setEditableFields(prev => ({
          ...prev,
          name: translationFields.name,
          description: translationFields.description
        }));
        
        // Aggiorna anche il company state con i nuovi valori principali
        setCompany(prev => prev ? {
          ...prev,
          name: translationFields.name,
          description: translationFields.description
        } : null);
      }

      // Aggiorna anche la traduzione selezionata
      setSelectedTranslation(prev => prev ? {
        ...prev,
        name: translationFields.name,
        description: translationFields.description
      } : null);

      showToast('Traduzione salvata con successo', 'success');
      
    } catch (error) {
      console.error('Errore nel salvataggio traduzione:', error);
      showToast('Errore durante il salvataggio della traduzione', 'error');
    } finally {
      setIsTranslationSaving(false);
    }
  };

  const handleAddTranslationClick = async () => {
    setLoadingLanguages(true);
    try {
      const response = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/language', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Errore nel caricamento delle lingue');
      }

      const languages = await response.json();
      
      // Filtra le lingue già presenti nelle traduzioni
      const existingLanguageCodes = company?.translations?.map(t => t.language_code) || [];
      const filteredLanguages = languages.filter((lang: any) => 
        !existingLanguageCodes.includes(lang.language_code)
      );
      
      setAvailableLanguages(filteredLanguages);
      setIsAddTranslationDialogOpen(true);
      
    } catch (error) {
      console.error('Errore nel caricamento delle lingue:', error);
      showToast('Errore nel caricamento delle lingue disponibili', 'error');
    } finally {
      setLoadingLanguages(false);
    }
  };

  const handleCloseAddTranslationDialog = () => {
    setIsAddTranslationDialogOpen(false);
    setSelectedLanguageId(null);
    setAvailableLanguages([]);
  };

  const createTranslation = async () => {
    if (!selectedLanguageId || !company || isAddingTranslation) return;

    try {
      setIsAddingTranslation(true);
      
      const payload = {
        name: "",
        description: "",
        language_id: selectedLanguageId,
        company_id: company.id
      };

      console.log('Payload per creazione traduzione:', payload);

      const response = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/company_translation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Errore nella creazione traduzione: ${response.status} - ${errorText}`);
      }

      const newTranslation = await response.json();
      console.log('Nuova traduzione creata:', newTranslation);
      
      // Trova la lingua selezionata per ottenere le informazioni complete
      const selectedLanguage = availableLanguages.find(lang => lang.id === selectedLanguageId);
      
      // Crea l'oggetto traduzione completo
      const translationToAdd: Translation = {
        id: newTranslation.id,
        name: "",
        description: "",
        language_id: selectedLanguageId,
        language_code: selectedLanguage?.language_code || "",
        language_name: selectedLanguage?.language_name || ""
      };

      // Aggiunge la nuova traduzione alla lista
      setCompany(prev => prev ? {
        ...prev,
        translations: [...prev.translations, translationToAdd]
      } : null);
      
      // Chiudi il dialog
      handleCloseAddTranslationDialog();
      
      showToast('Traduzione creata con successo', 'success');
      
    } catch (error) {
      console.error('Errore nella creazione traduzione:', error);
      showToast('Errore durante la creazione della traduzione', 'error');
    } finally {
      setIsAddingTranslation(false);
    }
  };

  const handleDeleteTranslationClick = (e: React.MouseEvent, translation: Translation) => {
    e.stopPropagation();
    setTranslationToDelete(translation);
    setIsDeleteTranslationDialogOpen(true);
  };

  const handleCloseDeleteTranslationDialog = () => {
    setIsDeleteTranslationDialogOpen(false);
    setTranslationToDelete(null);
  };

  const deleteTranslation = async () => {
    if (!translationToDelete || isDeletingTranslation) return;

    try {
      setIsDeletingTranslation(true);
      
      const response = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/company_translation/${translationToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Errore nell\'eliminazione della traduzione');
      }

      // Rimuovi la traduzione dalla lista
      setCompany(prevCompany => {
        if (!prevCompany) return prevCompany;
        
        return {
          ...prevCompany,
          translations: prevCompany.translations.filter(t => t.id !== translationToDelete.id)
        };
      });
      
      // Chiudi il dialog
      setIsDeleteTranslationDialogOpen(false);
      setTranslationToDelete(null);
      
      showToast('Traduzione eliminata con successo', 'success');
      
    } catch (error) {
      console.error('Errore nell\'eliminazione della traduzione:', error);
      showToast('Errore nell\'eliminazione della traduzione', 'error');
    } finally {
      setIsDeletingTranslation(false);
    }
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
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Traduzioni</span>
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleAddTranslationClick}
                    disabled={loadingLanguages}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Aggiungi traduzione manualmente"
                  >
                    {loadingLanguages ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                    <span>Aggiungi</span>
                  </button>
                  <button
                    type="button"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm"
                    title="Aggiungi traduzione con AI"
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>AI</span>
                  </button>
                </div>
              </div>
              
              {company.translations && company.translations.length > 0 ? (
                <div className="space-y-4">
                  {company.translations.map((translation, index) => (
                    <div 
                      key={index} 
                      className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-gray-600 hover:bg-gray-800/80 cursor-pointer transition-all duration-200 group"
                      onClick={() => handleTranslationClick(translation)}
                      title="Clicca per modificare questa traduzione"
                    >
                      <div className="flex items-start justify-between">
                        {/* Header con ID e Lingua */}
                        <div className="flex items-center space-x-4">
                          <span className="text-gray-500 text-xs font-mono bg-gray-900 px-2 py-1 rounded">
                            #{translation.id}
                          </span>
                          <div className="flex items-center space-x-2">
                            <img 
                              src={`https://flagcdn.com/w40/${translation.language_code === 'en' ? 'us' : translation.language_code}.png`} 
                              alt={`Bandiera ${translation.language_name}`}
                              className="w-6 h-4 object-cover rounded-sm"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                            <span className="text-xl hidden">
                              {translation.language_code === 'it' ? '🇮🇹' : 
                               translation.language_code === 'en' ? '🇺🇸' : 
                               translation.language_code === 'fr' ? '🇫🇷' : 
                               translation.language_code === 'es' ? '🇪🇸' : '🌐'}
                            </span>
                            <span className="text-white font-medium">{translation.language_name}</span>
                            <span className="text-gray-400 text-sm">({translation.language_code})</span>
                          </div>
                        </div>
                        
                        {/* Icone di modifica ed eliminazione */}
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <button
                            onClick={(e) => handleDeleteTranslationClick(e, translation)}
                            className="bg-red-600/60 hover:bg-red-600/80 text-white p-1.5 rounded-lg transition-colors shadow-lg"
                            title="Elimina traduzione"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Contenuto */}
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Nome */}
                        <div>
                          <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Nome</h4>
                          {translation.name && translation.name.trim() ? (
                            <p className="text-gray-200 text-sm">{translation.name}</p>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <X className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-500 text-sm italic">Non compilato</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Descrizione */}
                        <div>
                          <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Descrizione</h4>
                          {translation.description && translation.description.trim() ? (
                            <p className="text-gray-200 text-sm line-clamp-2">{translation.description}</p>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <X className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-500 text-sm italic">Non compilata</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
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

      {/* Dialog di modifica traduzione */}
      {isTranslationDialogOpen && selectedTranslation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <Globe className="h-6 w-6 text-blue-400" />
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Modifica Traduzione
                  </h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <img 
                      src={`https://flagcdn.com/w40/${selectedTranslation.language_code === 'en' ? 'us' : selectedTranslation.language_code}.png`} 
                      alt={`Bandiera ${selectedTranslation.language_name}`}
                      className="w-5 h-3 object-cover rounded-sm"
                    />
                    <span className="text-sm text-gray-400">{selectedTranslation.language_name}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {isTranslationSaving && (
                  <div className="flex items-center space-x-2 text-sm text-blue-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Salvando...</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleCloseTranslationDialog}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label htmlFor="translation-name" className="block text-sm font-medium text-white mb-2">
                  Nome (in {selectedTranslation.language_name})
                </label>
                <input
                  id="translation-name"
                  type="text"
                  value={translationFields.name}
                  onChange={(e) => handleTranslationFieldChange('name', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Nome dell'azienda in ${selectedTranslation.language_name}...`}
                />
              </div>
              
              <div>
                <label htmlFor="translation-description" className="block text-sm font-medium text-white mb-2">
                  Descrizione (in {selectedTranslation.language_name})
                </label>
                <textarea
                  id="translation-description"
                  value={translationFields.description}
                  onChange={(e) => handleTranslationFieldChange('description', e.target.value)}
                  className="w-full h-32 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder={`Descrizione dell'azienda in ${selectedTranslation.language_name}...`}
                />
              </div>
              
              <div className="text-sm text-gray-400">
                💡 Le modifiche vengono salvate automaticamente mentre scrivi
              </div>
            </div>
          </div>
                 </div>
       )}

      {/* Dialog di aggiunta traduzione */}
      {isAddTranslationDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <Plus className="h-6 w-6 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">
                  Aggiungi Traduzione
                </h2>
              </div>
              <button
                type="button"
                onClick={handleCloseAddTranslationDialog}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <label htmlFor="language-select" className="block text-sm font-medium text-white mb-3">
                  Seleziona lingua per la nuova traduzione
                </label>
                
                {availableLanguages.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Globe className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Tutte le lingue disponibili sono già state tradotte</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availableLanguages.map((language) => (
                      <label
                        key={language.id}
                        className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedLanguageId === language.id
                            ? 'border-blue-500 bg-blue-600/10'
                            : 'border-gray-700 hover:border-gray-600 hover:bg-gray-800/50'
                        }`}
                      >
                        <input
                          type="radio"
                          name="language"
                          value={language.id}
                          checked={selectedLanguageId === language.id}
                          onChange={() => setSelectedLanguageId(language.id)}
                          className="sr-only"
                        />
                        <img 
                          src={`https://flagcdn.com/w40/${language.language_code === 'en' ? 'us' : language.language_code}.png`} 
                          alt={`Bandiera ${language.language_name}`}
                          className="w-6 h-4 object-cover rounded-sm"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling?.classList.remove('hidden');
                          }}
                        />
                        <span className="text-xl hidden">
                          {language.language_code === 'it' ? '🇮🇹' : 
                           language.language_code === 'en' ? '🇺🇸' : 
                           language.language_code === 'fr' ? '🇫🇷' : 
                           language.language_code === 'es' ? '🇪🇸' : '🌐'}
                        </span>
                        <span className="text-white font-medium">{language.language_name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
              
              {availableLanguages.length > 0 && (
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={handleCloseAddTranslationDialog}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                    disabled={isAddingTranslation}
                  >
                    Annulla
                  </button>
                  <button
                    type="button"
                    onClick={createTranslation}
                    disabled={!selectedLanguageId || isAddingTranslation}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAddingTranslation ? (
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
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dialog di eliminazione traduzione */}
      {isDeleteTranslationDialogOpen && translationToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <Trash2 className="h-6 w-6 text-red-400" />
                <h2 className="text-xl font-semibold text-white">
                  Elimina Traduzione
                </h2>
              </div>
              <button
                type="button"
                onClick={handleCloseDeleteTranslationDialog}
                className="text-gray-400 hover:text-white transition-colors"
                disabled={isDeletingTranslation}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <img 
                    src={`https://flagcdn.com/w40/${translationToDelete.language_code === 'en' ? 'us' : translationToDelete.language_code}.png`} 
                    alt={`Bandiera ${translationToDelete.language_name}`}
                    className="w-6 h-4 object-cover rounded-sm"
                  />
                  <span className="text-white font-medium">{translationToDelete.language_name}</span>
                </div>
                <p className="text-gray-300 mb-4">
                  Sei sicuro di voler eliminare questa traduzione? Questa azione non può essere annullata.
                </p>
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                  <h4 className="text-red-300 font-medium mb-2">Contenuto da eliminare:</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-red-400">Nome:</span> 
                      <span className="text-red-200 ml-2">
                        {translationToDelete.name || 'Non compilato'}
                      </span>
                    </div>
                    <div>
                      <span className="text-red-400">Descrizione:</span> 
                      <span className="text-red-200 ml-2">
                        {translationToDelete.description || 'Non compilata'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseDeleteTranslationDialog}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  disabled={isDeletingTranslation}
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={deleteTranslation}
                  disabled={isDeletingTranslation}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeletingTranslation ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Eliminando...</span>
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