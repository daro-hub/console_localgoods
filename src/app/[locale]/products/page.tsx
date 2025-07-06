'use client';
import { use } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Package, Plus, Search, Filter } from 'lucide-react';

export default function ProductsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const { t, loading } = useTranslations(locale);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <DashboardLayout 
      locale={locale} 
      title={t('pages.products.title')}
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca prodotti..."
                className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 hover:bg-gray-700 transition-colors">
              <Filter className="h-4 w-4" />
              <span>Filtri</span>
            </button>
          </div>
          
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            <Plus className="h-4 w-4" />
            <span>{t('pages.products.addProduct')}</span>
          </button>
        </div>

        {/* Empty State */}
        <div className="text-center py-16">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-12 max-w-md mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-6">
              <Package className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              {t('pages.products.noProducts')}
            </h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              {t('pages.products.createFirst')}
            </p>
            <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl">
              <Plus className="h-5 w-5 mr-2" />
              {t('pages.products.addProduct')}
            </button>
          </div>
        </div>

        {/* Product Grid (quando ci saranno prodotti) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 hidden">
          {/* Placeholder per future product cards */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">Nome Prodotto</h3>
              <span className="text-sm text-gray-400">Disponibile</span>
            </div>
            <p className="text-gray-400 mb-4">Descrizione del prodotto...</p>
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-white">€19.99</span>
              <button className="text-blue-400 hover:text-blue-300 transition-colors">
                Modifica
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 