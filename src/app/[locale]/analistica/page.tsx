import { getTranslations } from 'next-intl/server';
import { DashboardLayout } from '@/components/DashboardLayout';
import { BarChart3, TrendingUp, DollarSign, Package, Users, Calendar } from 'lucide-react';

export default async function AnalyticaPage({ params }: { params: Promise<{ locale: string }> }) {
  await params; // Validate params exist
  const t = await getTranslations('analytics');

  // Dati mock per l'analisi
  const salesData = {
    totalRevenue: 15420,
    monthlyGrowth: 12.5,
    totalOrders: 234,
    averageOrderValue: 65.90,
    topProducts: [
      { name: 'Pomodori San Marzano', sales: 89, revenue: 311.50 },
      { name: 'Olio Extra Vergine', sales: 45, revenue: 540.00 },
      { name: 'Miele di Acacia', sales: 32, revenue: 272.00 },
      { name: 'Basilico Fresco', sales: 67, revenue: 134.00 }
    ],
    monthlyTrend: [
      { month: 'Gen', sales: 12500 },
      { month: 'Feb', sales: 13200 },
      { month: 'Mar', sales: 11800 },
      { month: 'Apr', sales: 14500 },
      { month: 'Mag', sales: 15420 }
    ]
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {t('subtitle')}
          </p>
        </div>

        {/* Period Selector */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <select className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
              <option value="thisMonth">{t('thisMonth')}</option>
              <option value="lastMonth">{t('lastMonth')}</option>
              <option value="thisYear">{t('thisYear')}</option>
            </select>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{t('totalSales')}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  €{salesData.totalRevenue.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">
                    +{salesData.monthlyGrowth}%
                  </span>
                </div>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Ordini Totali</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {salesData.totalOrders}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-600 font-medium">+8.2%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Package className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Valore Medio Ordine</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  €{salesData.averageOrderValue.toFixed(2)}
                </p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-purple-600 font-medium">+3.5%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Clienti Attivi</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">142</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                  <span className="text-sm text-orange-600 font-medium">+15.3%</span>
                </div>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <Users className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Sales Trend */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('salesTrend')}
            </h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {salesData.monthlyTrend.map((data, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div
                    className="w-full bg-green-600 rounded-t-lg"
                    style={{
                      height: `${(data.sales / Math.max(...salesData.monthlyTrend.map(d => d.sales))) * 200}px`
                    }}
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    {data.month}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Products */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {t('topProducts')}
            </h3>
            <div className="space-y-4">
              {salesData.topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                      <Package className="h-4 w-4 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {product.sales} vendite
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white">
                      €{product.revenue.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Indicators */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Indicatori di Performance
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">94%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Soddisfazione Cliente</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Package className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">2.3</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Giorni Consegna Media</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <BarChart3 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">87%</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tasso di Ritorno</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 