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
  Check
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
        throw new Error('Errore nel recupero dei dettagli utente');
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
      showToast('Modifiche salvate con successo', 'success');
      
    } catch (error) {
      showToast('Errore durante il salvataggio', 'error');
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
              <p className="text-gray-300">Caricamento profilo utente...</p>
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
              Torna indietro
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
            <h3 className="text-lg font-semibold text-white mb-2">Utente non trovato</h3>
            <p className="text-gray-300 mb-4">L'utente richiesto non esiste o non è più disponibile.</p>
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
            <span>Torna agli utenti</span>
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                Profilo Utente
              </h1>
              <p className="text-gray-300">
                Visualizza e gestisci le informazioni dell'utente
              </p>
            </div>
            <button
              onClick={handleRefreshData}
              disabled={isRefreshing}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors"
            >
              <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span>Aggiorna</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Card Principale */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-700 p-6 h-full">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">
                  Informazioni personali
                </h2>
                <div className="flex items-center space-x-2">
                  {isSaving && (
                    <div className="flex items-center space-x-2 text-blue-400">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm">Salvando...</span>
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
                      Nome completo
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
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editableData.email}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Email"
                      />
                    ) : (
                      <p className="text-white font-medium">{user.email || 'Non specificata'}</p>
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
                      Telefono
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editableData.phone}
                        onChange={(e) => handleFieldChange('phone', e.target.value)}
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Telefono"
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
                        <option value="customer">Customer</option>
                        <option value="collaborator">Collaborator</option>
                        <option value="owner">Owner</option>
                        <option value="superadmin">Super Admin</option>
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
                      onClick={() => handleCompanyClick(company.id)}
                      className="flex items-center space-x-4 p-3 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors cursor-pointer"
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
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCompanyTypeColor(company.type)}`}>
                          {getCompanyTypeLabel(company.type)}
                        </span>
                      </div>
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