'use client';
import { use } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ShoppingCart, Plus, Search, Filter, Calendar, User, Package } from 'lucide-react';

export default function OrdersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const { t, loading } = useTranslations(locale);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const stats = [
    {
      name: 'Ordini Totali',
      value: '1,234',
      icon: ShoppingCart,
      color: 'text-blue-400'
    },
    {
      name: 'In Lavorazione',
      value: '23',
      icon: Package,
      color: 'text-yellow-400'
    },
    {
      name: 'Completati Oggi',
      value: '15',
      icon: Calendar,
      color: 'text-green-400'
    },
    {
      name: 'Clienti Attivi',
      value: '89',
      icon: User,
      color: 'text-purple-400'
    }
  ];

  return (
    <DashboardLayout 
      locale={locale} 
      title={t('navigation.orders')}
    >
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center space-x-4">
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                  <div>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-gray-400">{stat.name}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <Search className="h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Cerca ordini..."
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
            <span>Nuovo Ordine</span>
          </button>
        </div>

        {/* Empty State */}
        <div className="text-center py-16">
          <div className="bg-gray-900 rounded-2xl border border-gray-800 p-12 max-w-md mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full mb-6">
              <ShoppingCart className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-3">
              Nessun ordine trovato
            </h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              Inizia gestendo i tuoi primi ordini dei clienti.
            </p>
            <button className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl">
              <Plus className="h-5 w-5 mr-2" />
              Aggiungi Ordine
            </button>
          </div>
        </div>

        {/* Orders Grid (quando ci saranno ordini) */}
        <div className="grid grid-cols-1 gap-6 hidden">
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-medium text-white">#ORD-001</h3>
                <p className="text-sm text-gray-400">12 Dicembre 2024</p>
              </div>
              <span className="px-3 py-1 bg-green-600 text-white text-sm rounded-full">
                Completato
              </span>
            </div>
            <div className="space-y-2">
              <p className="text-gray-300"><span className="text-gray-500">Cliente:</span> Mario Rossi</p>
              <p className="text-gray-300"><span className="text-gray-500">Prodotti:</span> 3 articoli</p>
              <p className="text-gray-300"><span className="text-gray-500">Totale:</span> €45.90</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 