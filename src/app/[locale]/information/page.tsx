'use client';
import { use } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Info, Mail, Phone, MapPin, Clock, Shield, Users, Award } from 'lucide-react';

export default function InformationPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const { t } = useTranslations(locale);

  const companyInfo = [
    {
      icon: MapPin,
      title: t('pages.information.companyInfo.headquarters'),
      content: 'Via dell&apos;Agricoltura 123, 00100 Roma, Italia'
    },
    {
      icon: Mail,
      title: t('profile.fields.email'),
      content: 'info@localgoods.com'
    },
    {
      icon: Phone,
      title: t('profile.fields.phone'),
      content: '+39 06 1234 5678'
    },
    {
      icon: Clock,
      title: t('pages.information.companyInfo.supportHours'),
      content: 'Lun-Ven 9:00-18:00, Sab 9:00-13:00'
    }
  ];

  const features = [
    {
      icon: Shield,
      title: t('pages.information.features.security.title'),
      description: t('pages.information.features.security.description')
    },
    {
      icon: Users,
      title: t('pages.information.features.support.title'),
      description: t('pages.information.features.support.description')
    },
    {
      icon: Award,
      title: t('pages.information.features.quality.title'),
      description: t('pages.information.features.quality.description')
    }
  ];

  return (
    <DashboardLayout 
      locale={locale} 
      title={t('pages.information.title')}
    >
      <div className="space-y-8">
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white bg-opacity-20 rounded-full mb-4">
            <Info className="h-8 w-8 text-white" />
          </div>
                  <h1 className="text-3xl font-bold text-white mb-4">
          {t('pages.information.welcome')}
        </h1>
          <p className="text-blue-100 max-w-2xl mx-auto">
            {t('pages.information.description')}
          </p>
        </div>

        {/* Company Information */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Informazioni di Contatto</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {companyInfo.map((info) => {
              const Icon = info.icon;
              return (
                <div key={info.title} className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-lg">
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white">{info.title}</h3>
                      <p className="text-gray-400">{info.content}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Features Section */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">{t('pages.information.whyChoose')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div key={feature.title} className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg mb-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* About Section */}
        <div className="bg-gray-900 rounded-xl p-8 border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-6">{t('pages.information.aboutUs')}</h2>
          <div className="space-y-4 text-gray-300">
            <p>
              {t('pages.information.description')}
            </p>
            <p>
              {t('pages.information.founded')}
            </p>
            <p>
              {t('pages.information.features')}
            </p>
          </div>
        </div>

        {/* Version Info */}
        <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white">{t('pages.information.console')}</h3>
              <p className="text-gray-400">{t('pages.information.version')}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">{t('pages.information.copyright')}</p>
              <p className="text-sm text-gray-500">{t('pages.information.allRightsReserved')}</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 