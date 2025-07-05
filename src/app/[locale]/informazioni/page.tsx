import { getTranslations } from 'next-intl/server';
import { DashboardLayout } from '@/components/DashboardLayout';
import { User, Building, Mail, Phone, MapPin, Calendar, HelpCircle, FileText, MessageSquare } from 'lucide-react';

export default async function InformazioniPage({ params }: { params: Promise<{ locale: string }> }) {
  await params; // Validate params exist
  const t = await getTranslations('information');

  // Dati mock per le informazioni
  const accountInfo = {
    name: 'Marco Rossi',
    email: 'marco.rossi@example.com',
    phone: '+39 348 123 4567',
    joinDate: '15 Gennaio 2023',
    plan: 'Premium',
    status: 'Attivo'
  };

  const companyInfo = {
    name: 'Azienda Agricola Rossi',
    address: 'Via dei Campi, 123',
    city: 'Bologna, BO 40100',
    vatNumber: 'IT12345678901',
    website: 'www.agricolarossi.it',
    description: 'Produzione biologica di ortaggi e frutta di stagione'
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

        {/* Account Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('accountInfo')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Nome Completo</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {accountInfo.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {accountInfo.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Telefono</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {accountInfo.phone}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Data di Iscrizione</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {accountInfo.joinDate}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Piano</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {accountInfo.plan}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-green-600 dark:bg-green-400 rounded-full" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Stato</p>
                  <p className="font-medium text-green-600 dark:text-green-400">
                    {accountInfo.status}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Company Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('companyInfo')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Building className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Nome Azienda</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {companyInfo.name}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Indirizzo</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {companyInfo.address}
                  </p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {companyInfo.city}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Partita IVA</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {companyInfo.vatNumber}
                  </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full" />
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Sito Web</p>
                  <p className="font-medium text-blue-600 dark:text-blue-400">
                    {companyInfo.website}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Descrizione</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {companyInfo.description}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            {t('supportInfo')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <HelpCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {t('documentation')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Consulta la documentazione per utilizzare al meglio la piattaforma.
              </p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Apri Docs
              </button>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                {t('contactSupport')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Contatta il nostro team di supporto per assistenza.
              </p>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors">
                Contatta
              </button>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Feedback
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Condividi i tuoi suggerimenti per migliorare la piattaforma.
              </p>
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors">
                Invia Feedback
              </button>
            </div>
          </div>
        </div>

        {/* System Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Informazioni Sistema
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('version')}</span>
                <span className="font-medium text-gray-900 dark:text-white">v2.1.0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">{t('lastUpdate')}</span>
                <span className="font-medium text-gray-900 dark:text-white">22 Maggio 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Stato Server</span>
                <span className="font-medium text-green-600 dark:text-green-400">Operativo</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Uptime</span>
                <span className="font-medium text-gray-900 dark:text-white">99.9%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Regione</span>
                <span className="font-medium text-gray-900 dark:text-white">Europa (Milano)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Backup</span>
                <span className="font-medium text-green-600 dark:text-green-400">Attivo</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 