'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { useAuth } from '@/contexts/AuthContext';
import { useDebounce } from '@/hooks/useDebounce';
import { Toast } from './Toast';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Calendar,
  RefreshCw,
  Edit,
  Check,
  X,
  LogOut,
  Key,
  Loader2,
  Building2,
  Wheat,
  Beef,
  Hammer,
  ChevronDown,
  ChevronUp,
  Lock
} from 'lucide-react';

interface ProfilePageProps {
  locale: string;
}

interface UserCompany {
  id: number;
  created_at: number;
  Location: string;
  type: string;
  name: string;
  description: string;
  cover: string | null;
  gallery: string[];
}

export function ProfilePage({ locale }: ProfilePageProps) {
  const { t } = useTranslations(locale);
  const { user, refreshUserData, logout } = useAuth();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompaniesExpanded, setIsCompaniesExpanded] = useState(false);

  // Stati per le aziende
  const [companies, setCompanies] = useState<UserCompany[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  
  // Stati per i campi editabili
  const [editableData, setEditableData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    password: user?.password || ''
  });

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

  // Debounce dei valori per l'autosave
  const debouncedData = useDebounce(editableData, 1000);

  // Carica le aziende dell'utente
  const fetchUserCompanies = async () => {
    if (!user?.id) return;
    
    try {
      setLoadingCompanies(true);
      
      const params = new URLSearchParams({
        user_id: user.id,
        lang: locale
      });

      const response = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/user_company?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Errore nel recupero delle aziende');
      }

      const data = await response.json();
      setCompanies(data || []);
    } catch (err) {
      console.error('Errore nel caricamento delle aziende:', err);
      setCompanies([]);
    } finally {
      setLoadingCompanies(false);
    }
  };

  // Aggiorna i dati editabili quando l'utente cambia
  useEffect(() => {
    if (user) {
      setEditableData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        password: user.password || ''
      });
      // Carica le aziende quando l'utente è disponibile
      fetchUserCompanies();
    }
  }, [user, locale]);

  // Autosave quando i dati con debounce cambiano
  useEffect(() => {
    if (isEditing && user && debouncedData && !isSaving) {
      // Controlla se ci sono state modifiche rispetto ai dati originali
      const hasChanges = 
        debouncedData.name !== user.name ||
        debouncedData.email !== user.email ||
        debouncedData.phone !== user.phone ||
        debouncedData.address !== user.address ||
        debouncedData.password !== user.password;
      
      if (hasChanges) {
        saveUserData(debouncedData);
      }
    }
  }, [debouncedData, isEditing]);

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

  const saveUserData = async (data: typeof editableData) => {
    if (!user) return;

    setIsSaving(true);
    
    const payload = {
      user_id: user.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      password: data.password,
      role: user.role
    };
    
    const token = localStorage.getItem('auth_token');
    const apiUrl = `https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/user/${user.id}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(`API Error: ${response.status} - ${responseText}`);
      }

      // Aggiorna i dati utente nel context
      await refreshUserData();
      showToast(t('profile.saved'), 'success');
      
    } catch (error) {
      showToast(t('profile.saveError'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (field: keyof typeof editableData, value: string) => {
    setEditableData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([refreshUserData(), fetchUserCompanies()]);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLogout = () => {
    if (confirm(t('profile.confirmLogout'))) {
      logout();
    }
  };

  const handleChangePassword = () => {
    // Per ora mostra solo un messaggio
    alert(t('profile.changePasswordComingSoon'));
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-purple-100 text-purple-800';
      case 'admin':
        return 'bg-blue-100 text-blue-800';
      case 'manager':
        return 'bg-green-100 text-green-800';
      case 'user':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'superadmin':
        return t('profile.roles.superadmin');
      case 'admin':
        return t('profile.roles.admin');
      case 'manager':
        return t('profile.roles.manager');
      case 'user':
        return t('profile.roles.user');
      default:
        return role;
    }
  };

  const getCompanyTypeIcon = (type: string) => {
    switch (type) {
      case 'agriculture':
        return <Wheat className="h-6 w-6 text-green-600" />;
      case 'livestock':
        return <Beef className="h-6 w-6 text-red-600" />;
      case 'artisanal':
        return <Hammer className="h-6 w-6 text-orange-600" />;
      default:
        return <Building2 className="h-6 w-6 text-gray-600" />;
    }
  };

  const getCompanyTypeLabel = (type: string) => {
    switch (type) {
      case 'agriculture':
        return 'Agricoltura';
      case 'livestock':
        return 'Allevamento';
      case 'artisanal':
        return 'Artigianato';
      default:
        return type;
    }
  };

  const getCompanyTypeColor = (type: string) => {
    switch (type) {
      case 'agriculture':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'livestock':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'artisanal':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {t('profile.title')}
            </h1>
            <p className="text-gray-300">
              {t('profile.description')}
            </p>
          </div>
          <button
            onClick={handleRefreshData}
            disabled={isRefreshing}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors"
          >
            <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>{t('profile.refresh')}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Card Principale */}
        <div className="lg:col-span-2">
          <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-700 p-6 h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white">
                {t('profile.personalInfo')}
              </h2>
              <div className="flex items-center space-x-2">
                {isSaving && (
                  <div className="flex items-center space-x-2 text-blue-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">{t('profile.saving')}</span>
                  </div>
                )}
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
                >
                  {isEditing ? (
                    <Check className="h-5 w-5 text-green-400" />
                  ) : (
                    <Edit className="h-5 w-5 text-gray-400" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Nome */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <User className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('profile.fields.name')}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editableData.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t('profile.fields.name')}
                    />
                  ) : (
                    <p className="text-white font-medium">{user.name}</p>
                  )}
                </div>
              </div>

              {/* Email */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Mail className="h-6 w-6 text-green-600" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('profile.fields.email')}
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={editableData.email}
                      onChange={(e) => handleFieldChange('email', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t('profile.fields.email')}
                    />
                  ) : (
                    <p className="text-white font-medium">{user.email}</p>
                  )}
                </div>
              </div>

              {/* Telefono */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Phone className="h-6 w-6 text-orange-600" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('profile.fields.phone')}
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editableData.phone}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t('profile.fields.phone')}
                    />
                  ) : (
                    <p className="text-white font-medium">{user.phone || t('profile.notProvided')}</p>
                  )}
                </div>
              </div>

              {/* Indirizzo */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <MapPin className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('profile.fields.address')}
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editableData.address}
                      onChange={(e) => handleFieldChange('address', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder={t('profile.fields.address')}
                      rows={2}
                    />
                  ) : (
                    <p className="text-white font-medium">{user.address || t('profile.notProvided')}</p>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <Lock className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    {t('profile.fields.password')}
                  </label>
                  {isEditing ? (
                    <input
                      type="password"
                      value={editableData.password}
                      onChange={(e) => handleFieldChange('password', e.target.value)}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder={t('profile.fields.password')}
                    />
                  ) : (
                    <p className="text-white font-medium">••••••••</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Colonna Destra - Account Info + Companies */}
        <div className="flex flex-col h-full space-y-6">
          {/* Account Info */}
          <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-700 p-6 flex-shrink-0">
            <h3 className="text-lg font-semibold text-white mb-4">
              {t('profile.accountInfo')}
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Shield className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-300">{t('profile.fields.role')}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                    {getRoleLabel(user.role)}
                  </span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-300">{t('profile.fields.memberSince')}</p>
                  <p className="text-sm font-medium text-white">
                    {formatDate(user.created_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Companies */}
          <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-700 p-6 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                {t('profile.companies')}
              </h3>
              {companies.length > 1 && (
                <button
                  onClick={() => setIsCompaniesExpanded(!isCompaniesExpanded)}
                  className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors text-sm"
                >
                  <span>
                    {isCompaniesExpanded ? t('navigation.collapse') : t('navigation.expand')}
                  </span>
                  {isCompaniesExpanded ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
              )}
            </div>
            
            <div className={`space-y-3 flex-1 ${isCompaniesExpanded && companies.length > 4 ? 'overflow-y-auto' : ''}`}>
              {loadingCompanies ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                </div>
              ) : companies.length === 0 ? (
                <div className="text-center py-8">
                  <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 text-sm">
                    Nessuna azienda associata
                  </p>
                </div>
              ) : (
                (isCompaniesExpanded ? companies : companies.slice(0, 1)).map((company) => (
                  <div
                    key={company.id}
                    className="flex items-center space-x-4 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    {/* Logo/Icona azienda */}
                    <div className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      {company.cover ? (
                        <img 
                          src={company.cover} 
                          alt={company.name}
                          className="w-8 h-8 rounded object-cover"
                        />
                      ) : (
                        getCompanyTypeIcon(company.type)
                      )}
                    </div>
                    
                    {/* Informazioni azienda */}
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {company.name}
                      </p>
                      <p className="text-gray-400 text-xs truncate">
                        {company.Location}
                      </p>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCompanyTypeColor(company.type)}`}>
                        {getCompanyTypeLabel(company.type)}
                      </span>
                    </div>
                  </div>
                ))
              )}

              {!isCompaniesExpanded && companies.length > 1 && (
                <div className="text-center py-2">
                  <p className="text-gray-400 text-sm">
                    +{companies.length - 1} {companies.length === 2 ? t('profile.companiesMore.single') : t('profile.companiesMore.plural')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Azioni Account */}
      <div className="mt-8">
        <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-700 p-6">
          <h3 className="text-lg font-semibold text-white mb-6">
            {t('profile.accountActions')}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Cambio Password */}
            <button
              onClick={handleChangePassword}
              className="flex items-center justify-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors space-x-3"
            >
              <Key className="h-5 w-5" />
              <span className="font-medium">{t('profile.changePassword')}</span>
            </button>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors space-x-3"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">{t('profile.logoutAccount')}</span>
            </button>
          </div>

          <div className="mt-4 p-4 bg-gray-800 rounded-lg">
            <p className="text-sm text-gray-400 text-center">
              {t('profile.securityNote')}
            </p>
          </div>
        </div>
      </div>

      {/* Toast Notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
} 