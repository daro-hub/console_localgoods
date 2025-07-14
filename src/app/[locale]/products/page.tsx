'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { useDebounce } from '@/hooks/useDebounce';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Toast } from '@/components/Toast';
import { Package, Plus, Search, Filter, Building2, Loader2, ChevronDown, X, Wheat, Hammer, Beef, Trash2 } from 'lucide-react';
import Link from 'next/link';

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
}

interface Company {
  id: number;
  name: string;
  description: string;
  Location: string;
  type: string;
  created_at: number;
  cover: string | null;
  gallery: string[];
}

export default function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const { t } = useTranslations(locale);
  
  // Stati per le aziende
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [companiesError, setCompaniesError] = useState<string | null>(null);
  
  // Stati per i prodotti
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  
  // State per il dropdown aziende
  const [isCompanyDropdownOpen, setIsCompanyDropdownOpen] = useState(false);

  // Stati per la ricerca
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Stati per l'aggiunta prodotti
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [isAddingProduct, setIsAddingProduct] = useState(false);

  // Stati per l'eliminazione prodotti
  const [isDeleteProductDialogOpen, setIsDeleteProductDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  // Stati per i toast
  const [toast, setToast] = useState({
    message: '',
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    isVisible: false
  });

  // Ottieni il ruolo dell'utente corrente
  const currentUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
  const isSuperAdmin = currentUser.role === 'superadmin';

  // Carica l'ultima azienda visitata dal localStorage o se l'utente ha una sola azienda
  useEffect(() => {
    const lastCompanyId = localStorage.getItem('lastVisitedCompanyId');
    if (lastCompanyId) {
      setSelectedCompanyId(parseInt(lastCompanyId));
    }
  }, []);

  // Controlla se l'utente ha una sola azienda e la seleziona automaticamente
  useEffect(() => {
    if (companies.length === 1 && !selectedCompanyId) {
      const singleCompany = companies[0];
      setSelectedCompanyId(singleCompany.id);
      localStorage.setItem('lastVisitedCompanyId', singleCompany.id.toString());
    }
  }, [companies, selectedCompanyId]);

  // Carica la lista delle aziende se non c'è una selezionata
  useEffect(() => {
    const fetchCompanies = async () => {
      if (selectedCompanyId) return; // Se c'è già un'azienda selezionata, non caricare la lista
      
      try {
        setLoadingCompanies(true);
        setCompaniesError(null);
        
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
        setCompaniesError(err instanceof Error ? err.message : 'Errore sconosciuto');
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, [selectedCompanyId, locale, isSuperAdmin, currentUser.id]);

  // Carica i prodotti quando c'è un'azienda selezionata
  useEffect(() => {
    const fetchProducts = async () => {
      if (!selectedCompanyId) return;
      
      try {
        setLoadingProducts(true);
        setProductsError(null);
        
        const url = new URL('https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/product');
        url.searchParams.append('company_id', selectedCompanyId.toString());
        url.searchParams.append('lang', locale);
        
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Errore nel recupero dei prodotti');
        }

        const productsData = await response.json();
        setProducts(productsData || []);
      } catch (err) {
        setProductsError(err instanceof Error ? err.message : 'Errore sconosciuto');
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [selectedCompanyId, locale]);

  const handleCompanySelect = (companyId: number) => {
    setSelectedCompanyId(companyId);
    localStorage.setItem('lastVisitedCompanyId', companyId.toString());
    setIsCompanyDropdownOpen(false);
  };

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

  // Filtra i prodotti in base al termine di ricerca
  const filteredProducts = products.filter(product => {
    if (!debouncedSearchTerm.trim()) return true;
    
    const searchLower = debouncedSearchTerm.toLowerCase();
    
    // Cerca nel nome del prodotto
    const nameMatch = product.name.toLowerCase().includes(searchLower);
    
    // Cerca nella descrizione del prodotto
    const descriptionMatch = product.description.toLowerCase().includes(searchLower);
    
    // Cerca nella categoria del prodotto
    const categoryMatch = product.category.toLowerCase().includes(searchLower);
    
    return nameMatch || descriptionMatch || categoryMatch;
  });

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);

  // Funzioni per i toast
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

  // Funzioni per la gestione dei prodotti
  const handleAddProductClick = () => {
    setIsAddProductDialogOpen(true);
    setNewProductName('');
    setProductsError(null);
  };

  const handleCloseProductDialog = () => {
    setIsAddProductDialogOpen(false);
    setNewProductName('');
  };

  const createProduct = async () => {
    if (!newProductName.trim() || !selectedCompanyId || isAddingProduct) return;
    
    try {
      setIsAddingProduct(true);
      setProductsError(null);
      
      const payload = {
        name: newProductName.trim(),
        description: "",
        lang: locale,
        cover: null,
        gallery: [],
        price: 0,
        uom: "",
        company_id: selectedCompanyId
      };



      const response = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Errore nella creazione del prodotto: ${response.status} - ${errorText}`);
      }

      const newProduct = await response.json();
      
      // Mappa il prodotto per assicurarsi che abbia tutti i campi necessari
      const mappedProduct: Product = {
        id: newProduct.id,
        name: newProduct.name.trim() || newProductName.trim(),
        description: newProduct.description || "",
        price: newProduct.price || 0,
        uom: newProduct.uom || "",
        cover: newProduct.cover || null,
        gallery: newProduct.gallery || [],
        company_id: selectedCompanyId,
        created_at: newProduct.created_at || Date.now(),
        category: newProduct.category || ""
      };
      
      // Aggiungi il nuovo prodotto alla lista
      setProducts(prevProducts => [mappedProduct, ...prevProducts]);
      
      // Chiudi il dialog
      handleCloseProductDialog();
      
      showToast(t('pages.products.createSuccess') || 'Prodotto creato con successo', 'success');
      
    } catch (err) {
      setProductsError(err instanceof Error ? err.message : 'Errore sconosciuto');
      showToast(t('pages.products.createError') || 'Errore durante la creazione del prodotto', 'error');
    } finally {
      setIsAddingProduct(false);
    }
  };

  // Funzioni per l'eliminazione prodotti
  const handleDeleteProductClick = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    e.nativeEvent.stopImmediatePropagation();
    setProductToDelete(product);
    setIsDeleteProductDialogOpen(true);
  };

  const handleCloseDeleteProductDialog = () => {
    setIsDeleteProductDialogOpen(false);
    setProductToDelete(null);
  };

  const deleteProduct = async () => {
    if (!productToDelete || isDeletingProduct) return;
    
    try {
      setIsDeletingProduct(true);
      const response = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/product/${productToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(t('pages.products.deleteError'));
      }

      // Rimuovi il prodotto dalla lista
      setProducts(prevProducts => 
        prevProducts.filter(product => product.id !== productToDelete.id)
      );
      
      // Chiudi il dialog
      setIsDeleteProductDialogOpen(false);
      setProductToDelete(null);
      
      showToast(t('pages.products.deleteSuccess'), 'success');
      
    } catch (err) {
      showToast(err instanceof Error ? err.message : t('pages.products.deleteError'), 'error');
    } finally {
      setIsDeletingProduct(false);
    }
  };

  return (
    <DashboardLayout locale={locale}>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {t('pages.products.title')}
          </h1>
          <p className="text-gray-300">
            {t('pages.products.description')}
          </p>
        </div>

        {/* Selettore azienda se non c'è una selezionata */}
        {!selectedCompanyId && (
          <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>{t('pages.products.selectCompany') || 'Seleziona un\'azienda per visualizzare i suoi prodotti'}</span>
            </h2>
            


            {companiesError && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-4">
                <p className="text-red-200">{companiesError}</p>
              </div>
            )}

            {!companiesError && companies.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {companies.map((company) => (
                  <div 
                    key={company.id} 
                    className="group relative bg-gray-900 rounded-xl shadow-sm border border-gray-800 hover:border-gray-700 transition-colors overflow-hidden aspect-square flex flex-col cursor-pointer"
                    onClick={() => handleCompanySelect(company.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCompanySelect(company.id);
                      }
                    }}
                  >
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
                  </div>
                ))}
              </div>
            )}

            {!companiesError && companies.length === 0 && (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  {isSuperAdmin ? 'Nessuna azienda trovata' : 'Non appartieni a nessuna azienda'}
                </h3>
                <p className="text-gray-300 mb-6">
                  {isSuperAdmin ? 'Non ci sono aziende nel sistema.' : 'Contatta un amministratore per essere collegato a un\'azienda.'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Header con azienda selezionata */}
        {selectedCompanyId && (
          <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Building2 className="h-6 w-6 text-blue-400" />
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {selectedCompany ? selectedCompany.name : `Azienda #${selectedCompanyId}`}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {t('pages.products.companyProducts') || 'Prodotti dell\'azienda'}
                  </p>
                </div>
              </div>
              {companies.length > 1 && (
                <button
                  onClick={() => {
                    setSelectedCompanyId(null);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  {t('pages.products.changeCompany') || 'Cambia azienda'}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Prodotti */}
        {selectedCompanyId && (
          <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>{t('pages.products.title')}</span>
              </h2>
              
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder={t('navigation.searchProducts') || 'Cerca prodotti...'}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
                <button 
                  onClick={handleAddProductClick}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  <Plus className="h-4 w-4" />
                  <span>{t('common.add')}</span>
            </button>
          </div>
            </div>
            


            {productsError && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-4">
                <p className="text-red-200">{productsError}</p>
              </div>
            )}

            {!productsError && products.length === 0 && (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400 mb-4">{t('pages.products.noProducts')}</p>
              </div>
            )}

            {!productsError && products.length > 0 && filteredProducts.length === 0 && debouncedSearchTerm.trim() && (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400 mb-2">{t('navigation.searchNoResults') || 'Nessun prodotto trovato per la ricerca:'}</p>
                <p className="text-white font-medium mb-4">&quot;{debouncedSearchTerm}&quot;</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
                >
                  {t('navigation.clearSearch') || 'Cancella ricerca'}
          </button>
        </div>
            )}

            {!productsError && filteredProducts.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <div
                    key={product.id}
                    className="group relative bg-gray-900 rounded-xl shadow-sm border border-gray-800 hover:border-gray-700 transition-colors overflow-hidden aspect-square flex flex-col"
                  >
                    {/* Immagine del prodotto - 3/4 dell'altezza */}
                    <div className="flex-1 relative bg-gray-800">
                      {product.cover ? (
                        <img 
                          src={product.cover} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      
                      {/* ID del prodotto in basso a sinistra */}
                      <div className="absolute bottom-2 left-2 z-10">
                        <span className="bg-gray-900/90 text-gray-300 text-xs px-2 py-1 rounded font-mono backdrop-blur-sm">
                          #{product.id}
                        </span>
                      </div>
                      
                      {/* Pulsante di eliminazione - in alto a destra, visibile solo al hover */}
                      <button
                        onClick={(e) => handleDeleteProductClick(e, product)}
                        className="absolute top-2 right-2 z-30 bg-red-600/60 hover:bg-red-600/80 text-white p-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg"
                        title={t('pages.products.deleteProduct')}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      
                      {/* Categoria in overlay se presente - in alto a sinistra */}
                      {product.category && product.category.trim() && (
                        <div className="absolute top-2 left-2 z-10">
                          <span className={`inline-flex items-center text-xs font-medium rounded-full px-2 py-1 border backdrop-blur-sm ${getProductCategoryStyles(product.category)}`}>
                            {product.category}
                          </span>
                        </div>
                      )}
            </div>
                    
                    {/* Informazioni prodotto - 1/4 dell'altezza */}
                    <div className="p-4 flex flex-col justify-center min-h-0">
                      <h3 className="text-lg font-semibold text-white truncate mb-1">
                        {product.name.trim() || `${t('pages.products.title')} #${product.id}`}
                      </h3>
                      
                      {/* Prezzo se presente */}
                      {product.price > 0 && (
                        <div className="mt-1">
                          <span className="text-green-400 text-sm font-medium">
                            €{product.price.toFixed(2)}
                            {product.uom && product.uom.trim() && ` per ${product.uom}`}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Overlay per il link */}
                    <Link 
                      href={`/${locale}/products/${product.id}`}
                      className="absolute inset-0 z-10"
                      title={`${t('navigation.viewDetails') || 'Visualizza dettagli di'} ${product.name.trim() || `${t('pages.products.title')} #${product.id}`}`}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dialog di aggiunta prodotto */}
      {isAddProductDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <Package className="h-6 w-6 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">
                  {t('pages.products.addProduct')}
                </h2>
            </div>
              <button
                type="button"
                onClick={handleCloseProductDialog}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <label htmlFor="product-name" className="block text-sm font-medium text-white mb-2">
                  {t('pages.productDetail.fields.name')}
                </label>
                <input
                  id="product-name"
                  type="text"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder={t('pages.productDetail.placeholders.productName')}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isAddingProduct}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newProductName.trim()) {
                      createProduct();
                    }
                  }}
                />
              </div>

              {productsError && (
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 mb-4">
                  <p className="text-red-200 text-sm">{productsError}</p>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseProductDialog}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  disabled={isAddingProduct}
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="button"
                  onClick={createProduct}
                  disabled={!newProductName.trim() || isAddingProduct}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingProduct ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t('pages.productDetail.translations.creating')}</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>{t('common.add')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dialog di conferma eliminazione prodotto */}
      {isDeleteProductDialogOpen && productToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-xl font-semibold text-white">
                {t('pages.products.confirmDelete')}
              </h2>
              <button
                type="button"
                onClick={handleCloseDeleteProductDialog}
                className="text-gray-400 hover:text-white transition-colors"
                disabled={isDeletingProduct}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <p className="text-white mb-2">
                  {t('pages.products.confirmDeleteMessage')}
                </p>
                                 <p className="text-lg font-semibold text-blue-400">
                   {productToDelete.name.trim() || `${t('pages.products.title')} #${productToDelete.id}`}
                 </p>
                <p className="text-sm text-gray-400 mt-2">
                  {t('pages.products.deleteWarning')}
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseDeleteProductDialog}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  disabled={isDeletingProduct}
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="button"
                  onClick={deleteProduct}
                  disabled={isDeletingProduct}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeletingProduct ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t('pages.products.deleting')}</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      <span>{t('common.delete')}</span>
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