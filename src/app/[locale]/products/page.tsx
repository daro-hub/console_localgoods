'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { useDebounce } from '@/hooks/useDebounce';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Toast } from '@/components/Toast';
import { Package, Plus, Search, Filter, Building2, Loader2, ChevronDown, X } from 'lucide-react';
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
}

export default function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const { t, loading: translationsLoading } = useTranslations(locale);
  
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

  // Stati per i toast
  const [toast, setToast] = useState({
    message: '',
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    isVisible: false
  });

  // Carica l'ultima azienda visitata dal localStorage
  useEffect(() => {
    const lastCompanyId = localStorage.getItem('lastVisitedCompanyId');
    if (lastCompanyId) {
      setSelectedCompanyId(parseInt(lastCompanyId));
    }
  }, []);

  // Carica la lista delle aziende se non c'è una selezionata
  useEffect(() => {
    const fetchCompanies = async () => {
      if (selectedCompanyId) return; // Se c'è già un'azienda selezionata, non caricare la lista
      
      try {
        setLoadingCompanies(true);
        setCompaniesError(null);
        
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
        setCompaniesError(err instanceof Error ? err.message : 'Errore sconosciuto');
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, [selectedCompanyId, locale]);

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

      console.log('Payload per creazione prodotto:', payload);

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
      console.log('Nuovo prodotto creato:', newProduct);
      
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
      
      showToast('Prodotto creato con successo', 'success');
      
    } catch (err) {
      setProductsError(err instanceof Error ? err.message : 'Errore sconosciuto');
      showToast('Errore durante la creazione del prodotto', 'error');
    } finally {
      setIsAddingProduct(false);
    }
  };

  if (translationsLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

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
              <span>Seleziona un&apos;azienda per visualizzare i suoi prodotti</span>
            </h2>
            
            {loadingCompanies && (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 text-blue-500 mx-auto mb-2 animate-spin" />
                <p className="text-gray-400">Caricamento aziende...</p>
              </div>
            )}

            {companiesError && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-4">
                <p className="text-red-200">{companiesError}</p>
              </div>
            )}

            {!loadingCompanies && !companiesError && companies.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {companies.map((company) => (
                  <button
                    key={company.id}
                    onClick={() => handleCompanySelect(company.id)}
                    className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-gray-600 hover:bg-gray-800/80 transition-all duration-200 text-left"
                  >
                    <h3 className="text-white font-medium text-sm mb-1 truncate">
                      {company.name}
                    </h3>
                    {company.Location && (
                      <p className="text-gray-400 text-xs mb-2">
                        {company.Location}
                      </p>
                    )}
                    <div className="text-xs text-gray-500">
                      ID: #{company.id}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {!loadingCompanies && !companiesError && companies.length === 0 && (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400">Nessuna azienda trovata</p>
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
                    Prodotti dell&apos;azienda
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedCompanyId(null);
                  localStorage.removeItem('lastVisitedCompanyId');
                }}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cambia azienda
              </button>
            </div>
          </div>
        )}

        {/* Prodotti */}
        {selectedCompanyId && (
          <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Prodotti</span>
              </h2>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <Search className="h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cerca prodotti..."
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
                  <span>Aggiungi</span>
                </button>
              </div>
            </div>
            
            {loadingProducts && (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 text-blue-500 mx-auto mb-2 animate-spin" />
                <p className="text-gray-400">Caricamento prodotti...</p>
              </div>
            )}

            {productsError && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-4">
                <p className="text-red-200">{productsError}</p>
              </div>
            )}

            {!loadingProducts && !productsError && products.length === 0 && (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400 mb-4">Nessun prodotto trovato per questa azienda</p>
              </div>
            )}

            {!loadingProducts && !productsError && products.length > 0 && filteredProducts.length === 0 && debouncedSearchTerm.trim() && (
              <div className="text-center py-8">
                <Search className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400 mb-2">Nessun prodotto trovato per la ricerca:</p>
                <p className="text-white font-medium mb-4">&quot;{debouncedSearchTerm}&quot;</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
                >
                  Cancella ricerca
                </button>
              </div>
            )}

            {!loadingProducts && !productsError && filteredProducts.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredProducts.map((product) => (
                  <Link
                    key={product.id}
                    href={`/${locale}/products/${product.id}`}
                    className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-gray-600 hover:bg-gray-800/80 transition-all duration-200 cursor-pointer block"
                    title={`Visualizza dettagli di ${product.name.trim() || `Prodotto #${product.id}`}`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-gray-500 text-xs font-mono bg-gray-900 px-2 py-1 rounded">
                        #{product.id}
                      </span>
                      {(product.price > 0 || (product.uom && product.uom.trim())) && (
                        <div className="flex items-center space-x-1">
                          <span className="bg-green-900/20 border border-green-600/30 text-green-400 text-xs px-2 py-1 rounded-full">
                            {product.price > 0 ? `€${product.price.toFixed(2)}` : '€0,00'}
                            {product.uom && product.uom.trim() && ` per ${product.uom}`}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {/* Immagine prodotto */}
                    <div className="mb-3 aspect-square bg-gray-700 rounded-lg overflow-hidden">
                      {product.cover ? (
                        <img 
                          src={product.cover} 
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-8 w-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* Informazioni prodotto */}
                    <div>
                      <h3 className="text-white font-medium text-sm mb-1 truncate">
                        {product.name.trim() || `Prodotto #${product.id}`}
                      </h3>
                      
                      {/* Categoria prodotto */}
                      {product.category && product.category.trim() && (
                        <div className="mb-2">
                          <span className={`inline-flex items-center text-xs font-medium rounded-full px-2 py-1 border ${getProductCategoryStyles(product.category)}`}>
                            {product.category}
                          </span>
                        </div>
                      )}
                      
                      {product.description && product.description.trim() && (
                        <p className="text-gray-400 text-xs line-clamp-2 mb-2">
                          {product.description}
                        </p>
                      )}
                      {product.created_at && (
                        <div className="text-xs text-gray-400 text-center">
                          {formatDate(product.created_at)}
                        </div>
                      )}
                    </div>
                  </Link>
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
                  Aggiungi Nuovo Prodotto
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
                  Nome del prodotto
                </label>
                <input
                  id="product-name"
                  type="text"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder="Inserisci il nome del prodotto"
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
                  Annulla
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