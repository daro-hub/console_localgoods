'use client';
import { use } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { DashboardLayout } from '@/components/DashboardLayout';
import { BarChart3, Clock, Zap } from 'lucide-react';

export default function AnalyticsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const { t } = useTranslations(locale);

  return (
    <DashboardLayout 
      locale={locale} 
      title={t('pages.analytics.title')}
    >
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-2xl mx-auto">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full mb-6">
            <BarChart3 className="h-10 w-10 text-white" />
          </div>
          
          {/* Title */}
          <h2 className="text-3xl font-bold text-white mb-4">
            {t('pages.analytics.pageTitle')}
          </h2>
          
          {/* Subtitle */}
          <p className="text-xl text-gray-300 mb-6">
            {t('pages.analytics.availableInFuture')}
          </p>
          
          {/* Description */}
          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            {t('pages.analytics.description')}
          </p>
          
          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg mb-4">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">{t('pages.analytics.features.advancedCharts.title')}</h3>
              <p className="text-gray-400 text-sm">
                {t('pages.analytics.features.advancedCharts.description')}
              </p>
            </div>
            
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-600 rounded-lg mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">{t('pages.analytics.features.realTimeMetrics.title')}</h3>
              <p className="text-gray-400 text-sm">
                {t('pages.analytics.features.realTimeMetrics.description')}
              </p>
            </div>
            
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-600 rounded-lg mb-4">
                <Clock className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-white font-semibold mb-2">{t('pages.analytics.features.customReports.title')}</h3>
              <p className="text-gray-400 text-sm">
                {t('pages.analytics.features.customReports.description')}
              </p>
            </div>
          </div>
          
          {/* Coming Soon Badge */}
          <div className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-medium">
            <Clock className="h-4 w-4 mr-2" />
            {t('pages.analytics.comingSoonBadge')}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 