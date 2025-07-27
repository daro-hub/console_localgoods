'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useNavigation } from '@/contexts/NavigationContext';
import { useTranslations } from '@/hooks/useTranslations';
import { useDebounce } from '@/hooks/useDebounce';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Toast } from '@/components/Toast';
import { 
  Users, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Building2, 
  User, 
  UserCheck, 
  ArrowLeft, 
  Loader2, 
  AlertCircle,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Wheat,
  Beef,
  Hammer,
  Edit,
  Check,
  Plus,
  Search,
  X,
  Unlink
} from 'lucide-react';

interface UserDetail {
  id: string;
  created_at: number;
  name: string;
  email: string;
  phone: number;
  address: string;
  role: string;
  profile: null;
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

interface AvailableCompany {
  id: number;
  created_at: number;
  Location: string;
  type: string;
  name: string;
  description: string;
  cover: string | null;
  gallery: string[];
}

export default function UserDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const { locale, id } = use(params);
  const { t } = useTranslations(locale);
  const router = useRouter();
  const { goBack } = useNavigation();

  // Stati per l'utente
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Stati per l'editing
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [hasUserInteracted, setHasUserInteracted] = useState(false);

  // Stati per i campi editabili
  const [editableData, setEditableData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    role: ''
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

  // Stati per le aziende
  const [companies, setCompanies] = useState<UserCompany[]>([]);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [isCompaniesExpanded, setIsCompaniesExpanded] = useState(false);
  
  // Stati per il modal di aggiunta azienda
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [availableCompanies, setAvailableCompanies] = useState<AvailableCompany[]>([]);
  const [loadingAvailableCompanies, setLoadingAvailableCompanies] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<AvailableCompany | null>(null);
  const [addingCompany, setAddingCompany] = useState(false);
  
  // Stati per la rimozione azienda
  const [removingCompany, setRemovingCompany] = useState<number | null>(null);

  // Carica i dettagli dell'utente dall'API
  const fetchUser = async () => {
    try {
      setError(null);
      
      const response = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/user/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(t('common.errors.fetchUserDetails'));
      }

      const data = await response.json();
      setUser(data);
      
      // Aggiorna i dati editabili quando l'utente viene caricato
      setEditableData({
        name: data.name || '',
        email: data.email || '',
        phone: data.phone ? data.phone.toString() : '',
        address: data.address || '',
        role: data.role || ''
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  // Carica le aziende dell'utente
  const fetchUserCompanies = async () => {
    if (!id) return;
    
    try {
      setLoadingCompanies(true);
      
      const params = new URLSearchParams({
        user_id: id,
        lang: locale
      });

      const response = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/user_company?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(t('common.errors.fetchCompanies'));
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

  // Carica le aziende disponibili
  const fetchAvailableCompanies = async () => {
    try {
      setLoadingAvailableCompanies(true);
      
      // Nella pagina utente, mostra sempre tutte le aziende disponibili
      const params = new URLSearchParams({
        lang: locale
      });

      const response = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/companies?${params}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(t('common.errors.fetchAvailableCompanies'));
      }

      const data = await response.json();
      setAvailableCompanies(data || []);
    } catch (err) {
      console.error('Errore nel caricamento delle aziende disponibili:', err);
      setAvailableCompanies([]);
    } finally {
      setLoadingAvailableCompanies(false);
    }
  };

  // Aggiunge un'azienda all'utente
  const addCompanyToUser = async (companyId: number) => {
    if (!id) return false;
    
    try {
      setAddingCompany(true);
      
      const response = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/user_company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: id,
          company_id: companyId
        })
      });

      if (!response.ok) {
        throw new Error('Errore nell\'aggiunta dell\'azienda');
      }

      return true;
    } catch (err) {
      console.error('Errore nell\'aggiunta dell\'azienda:', err);
      return false;
    } finally {
      setAddingCompany(false);
    }
  };

  // Rimuove un'azienda dall'utente
  const removeCompanyFromUser = async (companyId: number) => {
    if (!id) return false;
    
    try {
      setRemovingCompany(companyId);
      
      const response = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/user_company/${companyId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_id: companyId,
          user_id: id
        })
      });

      if (!response.ok) {
        throw new Error(t('common.errors.removeCompanyError'));
      }

      return true;
    } catch (err) {
      console.error('Errore nella rimozione dell\'azienda:', err);
      return false;
    } finally {
      setRemovingCompany(null);
    }
  };

  useEffect(() => {
    if (id) {
      setLoading(true);
      fetchUser();
      fetchUserCompanies();
    }
  }, [id, locale]);

  // Autosave quando i dati con debounce cambiano
  useEffect(() => {
    if (isEditing && user && debouncedData && !isSaving && hasUserInteracted) {
      // Normalizza i valori per il confronto
      const normalizeValue = (value: any) => {
        if (value === null || value === undefined) return '';
        return value.toString();
      };
      
      const currentName = normalizeValue(user.name);
      const currentEmail = normalizeValue(user.email);
      const currentPhone = normalizeValue(user.phone);
      const currentAddress = normalizeValue(user.address);
      const currentRole = normalizeValue(user.role);
      
      const editableName = normalizeValue(debouncedData.name);
      const editableEmail = normalizeValue(debouncedData.email);
      const editablePhone = normalizeValue(debouncedData.phone);
      const editableAddress = normalizeValue(debouncedData.address);
      const editableRole = normalizeValue(debouncedData.role);
      
      // Controlla se ci sono state modifiche rispetto ai dati originali
      const hasChanges = 
        editableName !== currentName ||
        editableEmail !== currentEmail ||
        editablePhone !== currentPhone ||
        editableAddress !== currentAddress ||
        editableRole !== currentRole;
      
      if (hasChanges) {
        saveUserData(debouncedData);
      }
    }
  }, [debouncedData, isEditing, user?.id, hasUserInteracted]);

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchUser(), fetchUserCompanies()]);
  };

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
      email: data.email || null,
      phone: data.phone ? parseInt(data.phone) : 0,
      address: data.address,
      role: data.role,
      profile: null
    };

    try {
      const response = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/user/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(`API Error: ${response.status} - ${responseText}`);
      }

      // Aggiorna i dati dell'utente
      await fetchUser();
      showToast(t('common.notifications.changesSavedSuccess'), 'success');
      
    } catch (error) {
      showToast(t('common.notifications.saveChangesError'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (field: keyof typeof editableData, value: string) => {
    setHasUserInteracted(true); // Marca che l'utente ha interagito
    setEditableData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Funzione per navigare alla pagina azienda
  const handleCompanyClick = (companyId: number) => {
    router.push(`/${locale}/companies/${companyId}`);
  };

  // Gestisce l'apertura del modal per aggiungere azienda
  const handleOpenAddCompanyModal = async () => {
    setShowAddCompanyModal(true);
    setSearchTerm('');
    setSelectedCompany(null);
    await fetchAvailableCompanies();
  };

  // Gestisce la chiusura del modal
  const handleCloseAddCompanyModal = () => {
    setShowAddCompanyModal(false);
    setSearchTerm('');
    setSelectedCompany(null);
  };

  // Gestisce la selezione di un'azienda
  const handleSelectCompany = (company: AvailableCompany) => {
    setSelectedCompany(company);
  };

  // Gestisce la conferma dell'aggiunta dell'azienda
  const handleConfirmAddCompany = async () => {
    if (!selectedCompany) return;

    const success = await addCompanyToUser(selectedCompany.id);
    
    if (success) {
      showToast(t('common.notifications.companyLinkedSuccess'), 'success');
      handleCloseAddCompanyModal();
      // Ricarica le aziende dell'utente
      await fetchUserCompanies();
    } else {
      showToast(t('common.errors.linkCompanyError'), 'error');
    }
  };

  // Filtra le aziende disponibili in base alla ricerca e esclude quelle già collegate
  const filteredAvailableCompanies = availableCompanies.filter(company => {
    // Controlla se l'azienda è già nella lista dell'utente
    const isAlreadyLinked = companies.some(userCompany => userCompany.id === company.id);
    
    // Se è già collegata, escludila
    if (isAlreadyLinked) {
      return false;
    }
    
    // Altrimenti, applica il filtro di ricerca
    return company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           company.Location.toLowerCase().includes(searchTerm.toLowerCase()) ||
           company.description.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // Gestisce la rimozione di un'azienda con conferma
  const handleRemoveCompany = async (company: UserCompany) => {
          const confirmed = confirm(t('pages.users.userDetail.confirmUnlinkCompany', company.name, user?.name));
    
    if (confirmed) {
      const success = await removeCompanyFromUser(company.id);
      
      if (success) {
        showToast(t('common.notifications.companyUnlinkedSuccess', company.name), 'success');
        // Ricarica le aziende dell'utente
        await fetchUserCompanies();
      } else {
        showToast(t('common.errors.unlinkCompanyError'), 'error');
      }
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'owner':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'collaborator':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'customer':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <Shield className="h-5 w-5 text-purple-600" />;
      case 'owner':
        return <Building2 className="h-5 w-5 text-blue-600" />;
      case 'collaborator':
        return <UserCheck className="h-5 w-5 text-green-600" />;
      case 'customer':
        return <User className="h-5 w-5 text-gray-600" />;
      default:
        return <Users className="h-5 w-5 text-gray-600" />;
    }
  };

  const getRoleName = (role: string) => {
    return t(`pages.users.roles.${role}`) || role;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatPhone = (phone: number) => {
    return phone.toString().replace(/(\d{3})(\d{3})(\d{4})/, '+39 $1 $2 $3');
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

  if (loading) {
    return (
      <DashboardLayout locale={locale}>
        <div className="p-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-4" />
              <p className="text-gray-300">{t('common.loadingUserProfile')}</p>
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
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-6 w-6 text-red-400" />
              <div>
                <h3 className="text-red-300 font-semibold">Errore</h3>
                <p className="text-red-200">{error}</p>
              </div>
            </div>
            <button
              onClick={() => goBack()}
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              {t('pages.users.userDetail.goBack')}
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return (
      <DashboardLayout locale={locale}>
        <div className="p-8">
          <div className="text-center py-8">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">{t('pages.users.userDetail.userNotFound')}</h3>
            <p className="text-gray-300 mb-4">{t('pages.users.userDetail.userNotFoundDescription')}</p>
            <button
              onClick={() => goBack()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Torna indietro
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout locale={locale}>
      <div className="p-8">
        {/* Header con navigazione */}
        <div className="mb-8">
          <button
            onClick={() => goBack()}
            className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>{t('pages.users.userDetail.back')}</span>
          </button>
          
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {t('pages.users.userDetail.title')}
            </h1>
            <p className="text-gray-300">
              {t('pages.users.userDetail.description')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card Principale */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-700 p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  {t('pages.users.userDetail.personalInfo')}
                </h2>
                <div className="flex items-center space-x-2">
                  {isSaving && (
                    <div className="flex items-center space-x-2 text-blue-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">{t('pages.users.userDetail.saving')}</span>
                    </div>
                  )}
                  <button
                    onClick={() => {
                      setIsEditing(!isEditing);
                      if (!isEditing) {
                        setHasUserInteracted(false); // Reset del flag quando si entra in modalità editing
                      }
                    }}
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
                      {t('pages.users.userDetail.fullName')}
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editableData.name}
                        onChange={(e) => handleFieldChange('name', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Nome completo"
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
                      {t('pages.users.table.email')}
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editableData.email}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('pages.users.table.email')}
                      />
                    ) : (
                                              <p className="text-white font-medium">{user.email || t('common.notSpecified')}</p>
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
                      {t('pages.users.table.phone')}
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editableData.phone}
                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder={t('pages.users.table.phone')}
                      />
                    ) : (
                      <p className="text-white font-medium">{user.phone ? formatPhone(user.phone) : 'Non specificato'}</p>
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
                      Indirizzo
                    </label>
                    {isEditing ? (
                      <textarea
                        value={editableData.address}
                        onChange={(e) => handleFieldChange('address', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                        placeholder="Indirizzo"
                        rows={2}
                      />
                    ) : (
                      <p className="text-white font-medium">{user.address || 'Non specificato'}</p>
                    )}
                  </div>
                </div>

                {/* Ruolo */}
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                    <Shield className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Ruolo
                    </label>
                    {isEditing ? (
                      <select
                        value={editableData.role}
                        onChange={(e) => handleFieldChange('role', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 0.5rem center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '1.5em 1.5em'
                        }}
                      >
                        <option value="customer">{t('pages.users.roles.customer')}</option>
                        <option value="collaborator">{t('pages.users.roles.collaborator')}</option>
                        <option value="owner">{t('pages.users.roles.owner')}</option>
                        <option value="superadmin">{t('pages.users.roles.superadmin')}</option>
                      </select>
                    ) : (
                      <div className={`inline-flex items-center space-x-2 text-sm font-medium rounded-full px-3 py-1 border ${getRoleColor(user.role)}`}>
                        {getRoleIcon(user.role)}
                        <span>{getRoleName(user.role)}</span>
                      </div>
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
                Informazioni account
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                    {getRoleIcon(user.role)}
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Ruolo</p>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                      {getRoleName(user.role)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-300">Membro dal</p>
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
                  Aziende
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleOpenAddCompanyModal}
                    className="flex items-center justify-center w-8 h-8 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    title={t('pages.companyDetail.addCompany')}
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  {companies.length > 1 && (
                    <button
                      onClick={() => setIsCompaniesExpanded(!isCompaniesExpanded)}
                      className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors text-sm"
                    >
                      <span>
                        {isCompaniesExpanded ? 'Comprimi' : 'Espandi'}
                      </span>
                      {isCompaniesExpanded ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
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
                      {t('profile.noCompaniesAssociated')}
                    </p>
                  </div>
                ) : (
                  (isCompaniesExpanded ? companies : companies.slice(0, 1)).map((company) => (
                    <div
                      key={company.id}
                      className="group flex items-center space-x-4 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors relative"
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
                      <div 
                        className="flex-1 min-w-0 cursor-pointer"
                        onClick={() => handleCompanyClick(company.id)}
                      >
                        <p className="text-white font-medium truncate">
                          {company.name}
                        </p>
                        <p className="text-gray-400 text-xs truncate">
                          {company.Location}
                        </p>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCompanyTypeColor(company.type)}`}>
                          {getCompanyTypeLabel(company.type)}
                        </span>
                      </div>

                      {/* Pulsante rimozione (visibile solo in hover) */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveCompany(company);
                        }}
                        disabled={removingCompany === company.id}
                        className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        title={`Scollega ${company.name}`}
                      >
                        {removingCompany === company.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Unlink className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  ))
                )}

                {!isCompaniesExpanded && companies.length > 1 && (
                  <div className="text-center py-2">
                    <p className="text-gray-400 text-sm">
                      +{companies.length - 1} {companies.length === 2 ? 'altra azienda' : 'altre aziende'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal per aggiungere azienda */}
        {showAddCompanyModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-2xl max-h-[80vh] flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-700">
                <h3 className="text-xl font-semibold text-white">
                  {t('pages.companyDetail.addCompanyToUser', user.name)}
                </h3>
                <button
                  onClick={handleCloseAddCompanyModal}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5 text-gray-400" />
                </button>
              </div>

              {/* Search */}
              <div className="p-6 border-b border-gray-700">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder={t('pages.users.userDetail.searchCompanies')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Companies List */}
              <div className="flex-1 overflow-y-auto p-6">
                {loadingAvailableCompanies ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
                    <span className="ml-3 text-gray-400">{t('common.loadingCompanies')}</span>
                  </div>
                ) : filteredAvailableCompanies.length === 0 ? (
                  <div className="text-center py-12">
                    <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-400">
                      {searchTerm ? t('pages.users.userDetail.noCompanyFound') : t('pages.users.userDetail.noCompanyAvailable')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredAvailableCompanies.map((company) => (
                      <div
                        key={company.id}
                        onClick={() => handleSelectCompany(company)}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedCompany?.id === company.id
                            ? 'border-blue-500 bg-blue-500/10'
                            : 'border-gray-700 bg-gray-800 hover:border-gray-600 hover:bg-gray-750'
                        }`}
                      >
                        <div className="flex items-center space-x-4">
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
                            <p className="text-white font-medium">
                              {company.name}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {company.Location}
                            </p>
                            <p className="text-gray-500 text-xs truncate">
                              {company.description}
                            </p>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCompanyTypeColor(company.type)}`}>
                              {getCompanyTypeLabel(company.type)}
                            </span>
                          </div>

                          {/* Checkbox di selezione */}
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            selectedCompany?.id === company.id
                              ? 'border-blue-500 bg-blue-500'
                              : 'border-gray-600'
                          }`}>
                            {selectedCompany?.id === company.id && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-700 flex items-center justify-end space-x-3">
                <button
                  onClick={handleCloseAddCompanyModal}
                  className="px-6 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Annulla
                </button>
                <button
                  onClick={handleConfirmAddCompany}
                  disabled={!selectedCompany || addingCompany}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
                >
                  {addingCompany ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t('pages.users.userDetail.linking')}</span>
                    </>
                  ) : (
                    <span>{t('pages.users.userDetail.linkCompany')}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

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