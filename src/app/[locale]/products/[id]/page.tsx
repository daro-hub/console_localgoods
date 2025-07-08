'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Toast } from '@/components/Toast';
import { Package, ArrowLeft, Calendar, Building2, Loader2, ImageIcon } from 'lucide-react';
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

export default function ProductDetailsPage({ 
  params 
}: { 
  params: Promise<{ locale: string; id: string }> 
}) {
  const { locale, id } = use(params);
  const { t } = useTranslations(locale);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const url = new URL('https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/product');
        url.searchParams.append('product_id', id);
        url.searchParams.append('lang', locale);
        
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Errore nel recupero dei dettagli prodotto');
        }

        const data = await response.json();
        if (data && data.length > 0) {
          setProduct(data[0]);
        } else {
          throw new Error('Prodotto non trovato');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

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

  if (loading) {
    return (
      <DashboardLayout locale={locale}>
        <div className="p-8">
          <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-8">
            <div className="text-center py-12">
              <Loader2 className="h-16 w-16 text-blue-500 mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-semibold text-white mb-2">
                Caricamento dettagli prodotto...
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
              href={`/${locale}/products`}
              className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Torna ai prodotti</span>
            </Link>
          </div>
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="text-red-400">
                <Package className="h-6 w-6" />
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

  if (!product) {
    return null;
  }

  return (
    <DashboardLayout locale={locale}>
      <div className="p-8">
        {/* Header con breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link 
              href={`/${locale}/products`}
              className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Torna ai prodotti</span>
            </Link>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start space-x-6">
              {/* Cover Image */}
              <div className="relative">
                {product.cover && getImageUrl(product.cover) ? (
                  <div className="relative">
                    <img
                      src={getImageUrl(product.cover)!}
                      alt="Cover prodotto"
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
                <h1 className="text-3xl font-bold text-white mb-2">
                  {product.name.trim() || `Prodotto #${product.id}`}
                </h1>
                
                {/* Categoria e prezzo */}
                <div className="flex items-center gap-4 mb-3">
                  {product.category && product.category.trim() && (
                    <span className={`inline-flex items-center text-sm font-medium rounded-full px-3 py-1 border ${getProductCategoryStyles(product.category)}`}>
                      {product.category}
                    </span>
                  )}
                  
                  {(product.price > 0 || (product.uom && product.uom.trim())) && (
                    <span className="bg-green-900/20 border border-green-600/30 text-green-400 text-sm px-3 py-1 rounded-full">
                      {product.price > 0 ? `€${product.price.toFixed(2)}` : '€0,00'}
                      {product.uom && product.uom.trim() && ` per ${product.uom}`}
                    </span>
                  )}
                </div>

                {product.description && product.description.trim() && (
                  <p className="text-lg text-gray-300">
                    {product.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {/* Galleria */}
            {product.gallery && product.gallery.length > 0 && (
              <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-6">
                <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                  <ImageIcon className="h-5 w-5" />
                  <span>Galleria immagini</span>
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {product.gallery
                    .filter(image => getImageUrl(image))
                    .map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={getImageUrl(image)!}
                        alt={`Galleria ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden w-full h-32 bg-gray-700 rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
                    <p className="text-gray-300">{formatDate(product.created_at)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Package className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">ID Prodotto</p>
                    <p className="text-gray-300">#{product.id}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Building2 className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-400">ID Azienda</p>
                    <p className="text-gray-300">#{product.company_id}</p>
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
      </div>
    </DashboardLayout>
  );
} 