'use client';
import { use } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { DashboardLayout } from '@/components/DashboardLayout';
import { BarChart3, TrendingUp, TrendingDown, DollarSign, Calendar, Users } from 'lucide-react';

export default function AnalyticsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const { t } = useTranslations(locale);

  const metrics = [
    {
      name: 'Vendite Totali',
      value: '€24,500',
      change: '+12.5%',
      changeType: 'positive',
      icon: DollarSign
    },
    {
      name: 'Prodotti Venduti',
      value: '1,234',
      change: '+8.2%',
      changeType: 'positive',
      icon: BarChart3
    },
    {
      name: 'Clienti Attivi',
      value: '89',
      change: '-2.1%',
      changeType: 'negative',
      icon: Users
    },
    {
      name: 'Ordini Mensili',
      value: '156',
      change: '+5.7%',
      changeType: 'positive',
      icon: Calendar
    }
  ];

  return (
    <DashboardLayout 
      locale={locale} 
      title={t('pages.analytics.title')}
    >
      <div className="space-y-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const TrendIcon = metric.changeType === 'positive' ? TrendingUp : TrendingDown;
            const trendColor = metric.changeType === 'positive' ? 'text-green-400' : 'text-red-400';
            
            return (
              <div key={metric.name} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Icon className="h-8 w-8 text-blue-400" />
                    <h3 className="text-sm font-medium text-gray-400">{metric.name}</h3>
                  </div>
                  <div className={`flex items-center space-x-1 ${trendColor}`}>
                    <TrendIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">{metric.change}</span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-white">{metric.value}</p>
              </div>
            );
          })}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1 */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Vendite Mensili</h3>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <BarChart3 className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Grafico in arrivo</p>
              </div>
            </div>
          </div>

          {/* Chart 2 */}
          <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
            <h3 className="text-lg font-semibold text-white mb-4">Prodotti Più Venduti</h3>
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <TrendingUp className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">Grafico in arrivo</p>
              </div>
            </div>
          </div>
        </div>

        {/* Coming Soon Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-4">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-4">
            {t('pages.analytics.comingSoon')}
          </h3>
          <p className="text-blue-100 max-w-2xl mx-auto">
            Stiamo lavorando per offrirti analisi dettagliate e report avanzati per monitorare le tue vendite e ottimizzare le tue strategie commerciali.
          </p>
        </div>
      </div>
         </DashboardLayout>
   );
} 