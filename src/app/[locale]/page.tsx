'use client';
import { use } from 'react';
import Link from 'next/link';
import { useTranslations } from '@/hooks/useTranslations';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Package, BarChart3, Info, ChevronRight, TrendingUp, Users, ShoppingBag } from 'lucide-react';

export default function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const { t } = useTranslations(locale);

  const features = [
    {
      icon: Package,
      title: t('pages.home.features.products.title'),
      description: t('pages.home.features.products.description'),
      href: `/${locale}/products`,
      gradient: 'from-blue-500 to-blue-600'
    },
    {
      icon: BarChart3,
      title: t('pages.home.features.analytics.title'),
      description: t('pages.home.features.analytics.description'),
      href: `/${locale}/analytics`,
      gradient: 'from-green-500 to-green-600'
    },
    {
      icon: Info,
      title: t('pages.home.features.information.title'),
      description: t('pages.home.features.information.description'),
      href: `/${locale}/information`,
      gradient: 'from-purple-500 to-purple-600'
    }
  ];

  const stats = [
    {
      name: 'Prodotti Gestiti',
      value: '250+',
      icon: ShoppingBag,
      color: 'text-blue-400'
    },
    {
      name: 'Vendite Monitorate',
      value: '1.2K+',
      icon: TrendingUp,
      color: 'text-green-400'
    },
    {
      name: 'Produttori Attivi',
      value: '150+',
      icon: Users,
      color: 'text-purple-400'
    }
  ];

  return (
    <DashboardLayout 
      locale={locale} 
      title={t('pages.home.title')}
    >
      <div className="space-y-12">
        {/* Hero Section */}
        <div className="text-center py-12 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-gray-800">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              {t('pages.home.title')}
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              {t('pages.home.description')}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href={`/${locale}/products`}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Package className="h-5 w-5 mr-2" />
                Inizia Ora
              </Link>
              <Link
                href={`/${locale}/analytics`}
                className="inline-flex items-center px-6 py-3 bg-gray-800 text-gray-200 font-medium rounded-lg hover:bg-gray-700 transition-all duration-200 border border-gray-700"
              >
                <BarChart3 className="h-5 w-5 mr-2" />
                Visualizza Report
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.name} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center">
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                  <div className="ml-4">
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-gray-400">{stat.name}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Features Grid */}
        <div>
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            {t('pages.home.features.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.href}
                  href={feature.href}
                  className="group relative bg-gray-900 rounded-xl p-8 hover:bg-gray-800 transition-all duration-300 border border-gray-800 hover:border-gray-700 hover:shadow-xl"
                >
                  <div className="flex flex-col items-center text-center">
                    <div className={`inline-flex p-4 rounded-xl bg-gradient-to-r ${feature.gradient} mb-6`}>
                      <Icon className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-blue-400 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-gray-400 mb-6 leading-relaxed">
                      {feature.description}
                    </p>
                    <span className="inline-flex items-center text-blue-400 font-medium group-hover:text-blue-300 transition-colors">
                      Scopri di più
                      <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Pronto per iniziare?
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Unisciti a centinaia di produttori agricoli che stanno già utilizzando LocalGoods per gestire i loro prodotti e monitorare le vendite.
          </p>
          <Link
            href={`/${locale}/products`}
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            <Package className="h-5 w-5 mr-2" />
            Aggiungi il tuo primo prodotto
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
} 