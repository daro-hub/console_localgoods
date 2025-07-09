'use client';

import { use, useEffect, useState } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import { useTranslations } from '@/hooks/useTranslations';
import { useDebounce } from '@/hooks/useDebounce';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Toast } from '@/components/Toast';
import { Package, ArrowLeft, Calendar, Building2, Loader2, ImageIcon, Euro, Tag, FileText, Hash, Globe, X, Plus, Sparkles, Trash2 } from 'lucide-react';
import Link from 'next/link';

interface Translation {
  id: number;
  name: string;
  description: string;
  language_id: number;
  language_code: string;
  language_name: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  uom: string;
  cover: string | null;
  gallery: any[];
  company_id: number;
  created_at: number;
  category: string;
  translations: Translation[];
}

interface EditableProduct {
  name: string;
  description: string;
  price: string;
  uom: string;
  category: string;
}

export default function ProductDetailsPage({ 
  params 
}: { 
  params: Promise<{ locale: string; id: string }> 
}) {
  const { locale, id } = use(params);
  const { t } = useTranslations(locale);
  const { goBack } = useNavigation();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Stati per i campi editabili
  const [editableFields, setEditableFields] = useState<EditableProduct>({
    name: '',
    description: '',
    price: '0',
    uom: '',
    category: ''
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
  
  // Opzioni per i select
  const uomOptions = [
    { value: 'unit', label: t('pages.productDetail.units.unit') },
    { value: 'g', label: t('pages.productDetail.units.g') },
    { value: 'kg', label: t('pages.productDetail.units.kg') },
    { value: 'ml', label: t('pages.productDetail.units.ml') },
    { value: 'l', label: t('pages.productDetail.units.l') }
  ];
  
  const categoryOptions = [
    { value: 'vegetable', label: t('pages.productDetail.categories.vegetable') },
    { value: 'meat', label: t('pages.productDetail.categories.meat') },
    { value: 'cheese', label: t('pages.productDetail.categories.cheese') },
    { value: 'bread', label: t('pages.productDetail.categories.bread') }
  ];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const url = new URL(`https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/product/${id}`);
        url.searchParams.append('product_id', id);
        url.searchParams.append('lang', locale);
        
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error(t('pages.productDetail.error'));
        }

        const data = await response.json();
        if (data && data.length > 0) {
          const productData = data[0];
          setProduct(productData);
          setEditableFields({
            name: productData.name || '',
            description: productData.description || '',
            price: productData.price ? productData.price.toString() : '0',
            uom: productData.uom || '',
            category: productData.category || ''
          });
        } else {
          throw new Error(t('pages.productDetail.productNotFound'));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t('pages.productDetail.error'));
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, locale]);

  // Salvataggio automatico
  useEffect(() => {
    if (product && !isSaving) {
      const priceNumber = parseFloat(editableFields.price) || 0;
      const hasChanges = (
        editableFields.name !== product.name ||
        editableFields.description !== product.description ||
        priceNumber !== product.price ||
        editableFields.uom !== product.uom ||
        editableFields.category !== product.category
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
    if (!product || isSaving) return;

    try {
      setIsSaving(true);
      
      // Trova la traduzione corrispondente alla lingua attuale
      const currentTranslation = product.translations?.find(
        translation => translation.language_code === locale
      );
      
      // Prepara il payload
      const payload = {
        product_id: product.id,
        name: editableFields.name,
        description: editableFields.description,
        translation_id: currentTranslation ? currentTranslation.id : 0,
        cover: product.cover,
        gallery: product.gallery || [],
        price: parseFloat(editableFields.price) || 0,
        uom: editableFields.uom,
        company_id: product.company_id,
        category: editableFields.category
      };

      console.log('Payload inviato all\'API:', payload);

      const response = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/product/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(t('pages.productDetail.messages.saveError'));
      }

      const updatedProduct = await response.json();
      
      // Aggiorna il prodotto locale
      setProduct(prev => prev ? {
        ...prev,
        name: editableFields.name,
        description: editableFields.description,
        price: parseFloat(editableFields.price) || 0,
        uom: editableFields.uom,
        category: editableFields.category,
        // Aggiorna anche la traduzione della lingua corrente se esiste
        translations: prev.translations.map(t => 
          t.language_code === locale 
            ? { ...t, name: editableFields.name, description: editableFields.description }
            : t
        )
      } : null);

      // Se il dialog di traduzione è aperto e riguarda la lingua corrente, aggiorna anche quei campi
      if (isTranslationDialogOpen && selectedTranslation && selectedTranslation.language_code === locale) {
        setTranslationFields({
          name: editableFields.name,
          description: editableFields.description
        });
        setSelectedTranslation(prev => prev ? {
          ...prev,
          name: editableFields.name,
          description: editableFields.description
        } : null);
      }

      showToast(t('pages.productDetail.messages.changesSaved'), 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : t('pages.productDetail.messages.saveError'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (field: keyof EditableProduct, value: string) => {
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
    if (!product || !selectedTranslation || isTranslationSaving) return;

    try {
      setIsTranslationSaving(true);
      
      const payload = {
        product_id: product.id,
        name: translationFields.name,
        description: translationFields.description,
        translation_id: selectedTranslation.id,
        cover: product.cover,
        gallery: product.gallery || [],
        price: product.price,
        uom: product.uom,
        company_id: product.company_id,
        category: product.category
      };

      console.log('Payload per modifica traduzione prodotto:', payload);

      const response = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/product/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${t('pages.productDetail.messages.translationSaveError')}: ${response.status} - ${errorText}`);
      }

      // Aggiorna la traduzione nel product state
      setProduct(prev => prev ? {
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
        
        // Aggiorna anche il product state con i nuovi valori principali
        setProduct(prev => prev ? {
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

      showToast(t('pages.productDetail.messages.translationSaved'), 'success');
      
    } catch (error) {
      console.error('Errore nel salvataggio traduzione:', error);
      showToast(t('pages.productDetail.messages.translationSaveError'), 'error');
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
        throw new Error(t('pages.productDetail.messages.languagesLoadError'));
      }

      const languages = await response.json();
      
      // Filtra le lingue già presenti nelle traduzioni
      const existingLanguageCodes = product?.translations?.map(t => t.language_code) || [];
      const filteredLanguages = languages.filter((lang: any) => 
        !existingLanguageCodes.includes(lang.language_code)
      );
      
      setAvailableLanguages(filteredLanguages);
      setIsAddTranslationDialogOpen(true);
      
    } catch (error) {
      console.error('Errore nel caricamento delle lingue:', error);
      showToast(t('pages.productDetail.messages.languagesLoadError'), 'error');
    } finally {
      setLoadingLanguages(false);
    }
  };

  const handleCloseAddTranslationDialog = () => {
    setIsAddTranslationDialogOpen(false);
    setSelectedLanguageId(null);
    setAvailableLanguages([]);
  };

  const handleDeleteTranslationClick = (e: React.MouseEvent, translation: Translation) => {
    e.preventDefault();
    e.stopPropagation();
    setTranslationToDelete(translation);
    setIsDeleteTranslationDialogOpen(true);
  };

  const handleCloseDeleteTranslationDialog = () => {
    setIsDeleteTranslationDialogOpen(false);
    setTranslationToDelete(null);
  };

  const deleteTranslation = async () => {
    if (!product || !translationToDelete || isDeletingTranslation) return;
    
    try {
      setIsDeletingTranslation(true);
      const response = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/product_translation/${translationToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(t('pages.productDetail.messages.translationDeleteError'));
      }

      // Rimuovi la traduzione dalla lista
      setProduct(prev => prev ? {
        ...prev,
        translations: prev.translations.filter(translation => translation.id !== translationToDelete.id)
      } : null);
      
      // Chiudi il dialog
      setIsDeleteTranslationDialogOpen(false);
      setTranslationToDelete(null);
      
      showToast(t('pages.productDetail.messages.translationDeleted'), 'success');
      
    } catch (err) {
      showToast(err instanceof Error ? err.message : t('pages.productDetail.messages.translationDeleteError'), 'error');
    } finally {
      setIsDeletingTranslation(false);
    }
  };

  const createTranslation = async () => {
    if (!selectedLanguageId || !product || isAddingTranslation) return;

    try {
      setIsAddingTranslation(true);
      
      const payload = {
        product_id: product.id,
        name: "",
        description: "",
        language_id: selectedLanguageId
      };

      console.log('Payload per creazione traduzione prodotto:', payload);

      const response = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/product_translation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${t('pages.productDetail.messages.translationCreateError')}: ${response.status} - ${errorText}`);
      }

      const newTranslation = await response.json();
      console.log('Nuova traduzione prodotto creata:', newTranslation);
      
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
      setProduct(prev => prev ? {
        ...prev,
        translations: [...prev.translations, translationToAdd]
      } : null);
      
      // Chiudi il dialog
      handleCloseAddTranslationDialog();
      
      showToast(t('pages.productDetail.messages.translationCreated'), 'success');
      
    } catch (error) {
      console.error('Errore nella creazione traduzione:', error);
      showToast(t('pages.productDetail.messages.translationCreateError'), 'error');
    } finally {
      setIsAddingTranslation(false);
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getProductCategoryStyles = (category: string) => {
    switch (category.toLowerCase()) {
      case 'fruit':
      case 'frutta':
        return 'bg-red-900/20 border-red-600/30 text-red-400';
      case 'vegetable':
      case 'verdura':
        return 'bg-green-900/20 border-green-600/30 text-green-400';
      case 'dairy':
      case 'latticini':
        return 'bg-blue-900/20 border-blue-600/30 text-blue-400';
      case 'meat':
      case 'carne':
        return 'bg-red-900/20 border-red-600/30 text-red-400';
      case 'grain':
      case 'cereali':
        return 'bg-yellow-900/20 border-yellow-600/30 text-yellow-400';
      case 'beverage':
      case 'bevande':
        return 'bg-purple-900/20 border-purple-600/30 text-purple-400';
      case 'bakery':
      case 'panetteria':
        return 'bg-orange-900/20 border-orange-600/30 text-orange-400';
      default:
        return 'bg-gray-800/50 border-gray-600/30 text-gray-400';
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



  if (error) {
    return (
      <DashboardLayout locale={locale}>
        <div className="p-8">
          <div className="mb-6">
            <button
              onClick={() => goBack()}
              className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t('pages.productDetail.backToProducts')}</span>
            </button>
          </div>
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="text-red-400">
                <Package className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-red-300 font-semibold text-lg">{t('pages.productDetail.error')}</h3>
                <p className="text-red-200">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <DashboardLayout locale={locale}>
      <div className="p-8">
        {/* Header con breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => goBack()}
              className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t('pages.productDetail.backToProducts')}</span>
            </button>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start space-x-6">
              {/* Cover Image */}
              <div className="relative">
                {product.cover && getImageUrl(product.cover) ? (
                  <div className="relative">
                    <img
                      src={getImageUrl(product.cover)!}
                      alt={t('pages.productDetail.fields.name')}
                      className="w-32 h-32 object-cover rounded-xl"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden w-32 h-32 bg-gray-700 rounded-xl flex items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-gray-700 rounded-xl flex items-center justify-center">
                    <Package className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-lg font-mono text-gray-400 bg-gray-800 px-3 py-1 rounded-lg">
                    #{product.id}
                  </span>
                  <div className="flex-1">
                    <input
                      type="text"
                      value={editableFields.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      className="text-3xl font-bold text-white bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 w-full"
                      placeholder={t('pages.productDetail.placeholders.productName')}
                    />
                  </div>
                  {isSaving && (
                    <div className="flex items-center space-x-2 text-sm text-blue-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t('pages.productDetail.translations.saving')}</span>
                    </div>
                  )}
                </div>
                
                <div className="mb-3 flex items-center space-x-2">
                  <Package className="h-5 w-5 text-gray-400" />
                  <select
                    value={editableFields.category}
                    onChange={(e) => handleFieldChange('category', e.target.value)}
                    className="text-lg text-gray-300 bg-gray-800 border border-gray-700 rounded-lg pl-3 pr-8 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 hover:text-gray-300"
                    style={{
                      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgb(156 163 175)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 8px center',
                      backgroundSize: '16px',
                      appearance: 'none'
                    }}
                  >
                    <option value="">{t('pages.productDetail.placeholders.selectCategory')}</option>
                    {categoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex items-center gap-4 mb-3">
                  {editableFields.category ? (
                    <span className={`inline-flex items-center text-sm font-medium rounded-full px-3 py-1 border ${getProductCategoryStyles(editableFields.category)}`}>
                      {categoryOptions.find(opt => opt.value === editableFields.category)?.label || editableFields.category}
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-sm font-medium rounded-full px-3 py-1 border bg-gray-800/50 border-gray-600/30 text-gray-400">
                      {t('pages.productDetail.states.categoryNotSpecified')}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {/* Descrizione */}
            <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                {t('pages.productDetail.sections.description')}
              </h2>
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <textarea
                  value={editableFields.description}
                  onChange={(e) => handleFieldChange('description', e.target.value)}
                  className="w-full h-24 text-gray-300 bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 resize-none"
                  placeholder={t('pages.productDetail.placeholders.productDescription')}
                />
              </div>
            </div>

            {/* Prezzo e unità di misura */}
            <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <Euro className="h-5 w-5" />
                <span>{t('pages.productDetail.sections.priceAndUnit')}</span>
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Prezzo */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <Euro className="h-5 w-5 text-green-400" />
                    <h3 className="text-lg font-medium text-white">{t('pages.productDetail.fields.price')}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xl font-bold text-green-400">€</span>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={editableFields.price}
                      onChange={(e) => handleFieldChange('price', e.target.value)}
                      className="text-xl font-bold text-green-400 bg-transparent border border-gray-600 rounded px-2 py-1 w-24 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={t('pages.productDetail.placeholders.price')}
                    />
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    {parseFloat(editableFields.price) > 0 ? t('pages.productDetail.states.priceSet') : t('pages.productDetail.states.freeOrUnset')}
                  </p>
                </div>

                {/* Unità di misura */}
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <Tag className="h-5 w-5 text-blue-400" />
                    <h3 className="text-lg font-medium text-white">{t('pages.productDetail.fields.unitOfMeasure')}</h3>
                  </div>
                  <select
                    value={editableFields.uom}
                    onChange={(e) => handleFieldChange('uom', e.target.value)}
                    className="text-xl font-bold text-blue-400 bg-gray-700 border border-gray-600 rounded pl-3 pr-8 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-500 hover:text-blue-400"
                    style={{
                      backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='rgb(96 165 250)' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 8px center',
                      backgroundSize: '16px',
                      appearance: 'none'
                    }}
                  >
                    <option value="">{t('pages.productDetail.placeholders.selectUnit')}</option>
                    {uomOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-sm text-gray-400 mt-1">
                    {editableFields.uom ? t('pages.productDetail.states.unitSpecified') : t('pages.productDetail.states.unitNotSpecified')}
                  </p>
                </div>
              </div>


            </div>

            {/* Galleria */}
            <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <ImageIcon className="h-5 w-5" />
                <span>{t('pages.productDetail.sections.gallery')}</span>
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Immagini esistenti */}
                {product.gallery && product.gallery.length > 0 ? (
                  product.gallery
                    .filter(image => getImageUrl(image))
                    .map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={getImageUrl(image)!}
                        alt={`${t('pages.productDetail.sections.gallery')} ${index + 1}`}
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
                    <p>{t('pages.productDetail.gallery.noImages')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Traduzioni */}
            <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>{t('pages.productDetail.sections.translations')}</span>
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleAddTranslationClick}
                                            disabled={false}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    title={t('pages.productDetail.translations.addTranslationManually')}
                  >
                                          <Plus className="h-4 w-4" />
                    <span>{t('pages.productDetail.translations.addTranslation')}</span>
                  </button>
                  <button
                    type="button"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm"
                    title={t('pages.productDetail.translations.addTranslationWithAI')}
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>{t('pages.productDetail.translations.addWithAI')}</span>
                  </button>
                </div>
              </div>
              
              {product.translations && product.translations.length > 0 ? (
                <div className="space-y-4">
                  {product.translations.map((translation, index) => (
                    <div 
                      key={index} 
                      className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-gray-600 hover:bg-gray-800/80 cursor-pointer transition-all duration-200 group"
                      onClick={() => handleTranslationClick(translation)}
                      title={`${t('pages.productDetail.translations.editTranslation')} ${translation.language_name}`}
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
                              alt={`${t('pages.productDetail.translations.editTranslation')} ${translation.language_name}`}
                              className="w-6 h-4 object-cover rounded-sm"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                            <span className="text-white font-medium">
                              {translation.language_name}
                            </span>
                            <span className="text-gray-400 text-sm">
                              ({translation.language_code})
                            </span>
                          </div>
                        </div>
                        
                        {/* Icone di modifica ed eliminazione */}
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <button
                            onClick={(e) => handleDeleteTranslationClick(e, translation)}
                            className="bg-red-600/60 hover:bg-red-600/80 text-white p-1.5 rounded-lg transition-colors shadow-lg"
                            title={t('pages.productDetail.translations.deleteTranslation')}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      
                                             {/* Contenuto traduzione */}
                       <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                         {/* Nome */}
                         <div>
                           <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{t('pages.productDetail.fields.name')}</h4>
                           {translation.name && translation.name.trim() ? (
                             <p className="text-gray-200 text-sm">{translation.name}</p>
                           ) : (
                             <div className="flex items-center space-x-2">
                               <X className="h-4 w-4 text-gray-500" />
                               <span className="text-gray-500 text-sm italic">{t('pages.productDetail.translations.notFilled')}</span>
                             </div>
                           )}
                         </div>
                         
                         {/* Descrizione */}
                         <div>
                           <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{t('pages.productDetail.fields.description')}</h4>
                           {translation.description && translation.description.trim() ? (
                             <p className="text-gray-200 text-sm line-clamp-2">{translation.description}</p>
                           ) : (
                             <div className="flex items-center space-x-2">
                               <X className="h-4 w-4 text-gray-500" />
                               <span className="text-gray-500 text-sm italic">{t('pages.productDetail.translations.notFilledDesc')}</span>
                             </div>
                           )}
                         </div>
                       </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Globe className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>{t('pages.productDetail.translations.noTranslations')}</p>
                </div>
              )}
            </div>

            {/* Dettagli tecnici */}
            <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                {t('pages.productDetail.sections.technicalDetails')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* ID Azienda */}
                <div className="flex items-start space-x-3">
                  <Building2 className="h-5 w-5 text-blue-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-400">{t('pages.productDetail.fields.companyId')}</p>
                    <p className="text-white font-mono">{product.company_id}</p>
                  </div>
                </div>

                {/* Data di creazione */}
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-indigo-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-400">{t('pages.productDetail.fields.createdAt')}</p>
                    <p className="text-white">{formatDate(product.created_at)}</p>
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
                    {t('pages.productDetail.translations.editTranslation')}
                  </h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <img 
                      src={`https://flagcdn.com/w40/${selectedTranslation.language_code === 'en' ? 'us' : selectedTranslation.language_code}.png`} 
                      alt={`${t('pages.productDetail.translations.editTranslation')} ${selectedTranslation.language_name}`}
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
                    <span>{t('pages.productDetail.translations.saving')}</span>
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
                  {t('pages.productDetail.translations.productNameIn').replace('{language}', selectedTranslation.language_name)}
                </label>
                <input
                  id="translation-name"
                  type="text"
                  value={translationFields.name}
                  onChange={(e) => handleTranslationFieldChange('name', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={t('pages.productDetail.translations.namePlaceholder').replace('{language}', selectedTranslation.language_name)}
                />
              </div>
              
              <div>
                <label htmlFor="translation-description" className="block text-sm font-medium text-white mb-2">
                  {t('pages.productDetail.translations.descriptionIn').replace('{language}', selectedTranslation.language_name)}
                </label>
                <textarea
                  id="translation-description"
                  value={translationFields.description}
                  onChange={(e) => handleTranslationFieldChange('description', e.target.value)}
                  className="w-full h-32 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder={t('pages.productDetail.translations.descriptionPlaceholder').replace('{language}', selectedTranslation.language_name)}
                />
              </div>
              
              <div className="text-sm text-gray-400">
                {t('pages.productDetail.translations.autoSaveNote')}
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
                  {t('pages.productDetail.translations.addTranslation')}
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
                  {t('pages.productDetail.translations.selectLanguage')}
                </label>
                
                {availableLanguages.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Globe className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>{t('pages.productDetail.translations.allLanguagesUsed')}</p>
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
                          alt={`${t('pages.productDetail.translations.selectLanguage')} ${language.language_name}`}
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
                    {t('common.cancel')}
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
                        <span>{t('pages.productDetail.translations.creating')}</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        <span>{t('pages.productDetail.translations.addTranslation')}</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dialog di conferma eliminazione traduzione */}
      {isDeleteTranslationDialogOpen && translationToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-xl font-semibold text-white">
                {t('pages.productDetail.translations.confirmDelete')}
              </h2>
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
                <p className="text-white mb-2">
                  {t('pages.productDetail.translations.confirmDeleteMessage')}
                </p>
                <div className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg">
                  <img 
                    src={`https://flagcdn.com/w40/${translationToDelete.language_code === 'en' ? 'us' : translationToDelete.language_code}.png`} 
                    alt={translationToDelete.language_name}
                    className="w-6 h-4 object-cover rounded-sm"
                  />
                  <span className="text-blue-400 font-medium">
                    {translationToDelete.language_name}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  {t('pages.productDetail.translations.deleteWarning')}
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseDeleteTranslationDialog}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  disabled={isDeletingTranslation}
                >
                  {t('common.cancel')}
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
                      <span>{t('pages.productDetail.translations.deleting')}</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      <span>{t('pages.productDetail.translations.deleteTranslation')}</span>
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