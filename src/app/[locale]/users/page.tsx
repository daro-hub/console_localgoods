'use client';

import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from '@/hooks/useTranslations';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Toast } from '@/components/Toast';
import { Users, Plus, Search, Mail, Shield, Calendar, Loader2, AlertCircle, Building2, User, UserCheck, X, Trash2 } from 'lucide-react';

interface User {
  id: string;
  created_at: number;
  name: string;
  email: string;
  phone: number;
  address: string;
  role: string;
  profile: null;
}

type FilterType = 'all' | 'superadmin' | 'owner' | 'collaborator' | 'customer';

export default function UsersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const { t } = useTranslations(locale);
  const router = useRouter();

  // Stati per gli utenti
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Stati per la ricerca e filtri
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<FilterType>('all');

  // Stati per il dialog di aggiunta utente
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [addUserError, setAddUserError] = useState<string | null>(null);

  // Stati per i toast
  const [toast, setToast] = useState({
    message: '',
    type: 'success' as 'success' | 'error' | 'warning' | 'info',
    isVisible: false
  });

  // Stati per la conferma di eliminazione
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    userId: '',
    userName: ''
  });
  const [isDeletingUser, setIsDeletingUser] = useState(false);

  // Carica gli utenti dall'API
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/user', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Errore nel recupero degli utenti');
        }

        const data = await response.json();
        setUsers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Funzione per aggiungere un nuovo utente
  const handleAddUser = async () => {
    if (!newUserName.trim()) {
      setAddUserError('Il nome è obbligatorio');
      return;
    }

    try {
      setIsAddingUser(true);
      setAddUserError(null);

      const payload = {
        name: newUserName.trim(),
        email: null,
        phone: 0,
        address: "",
        role: "customer",
        profile: null
      };

      const response = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error('Errore nell\'aggiunta dell\'utente');
      }

      const newUser = await response.json();
      
      // Aggiorna la lista degli utenti aggiungendo il nuovo utente
      setUsers(prevUsers => [...prevUsers, newUser]);
      
      // Chiudi il dialog e resetta i campi
      setIsAddUserDialogOpen(false);
      setNewUserName('');
      setAddUserError(null);
      
      // Mostra notifica di successo
      showToast(`Utente "${newUserName.trim()}" creato con successo`, 'success');
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      setAddUserError(errorMessage);
      // Mostra anche notifica di errore
      showToast(`Errore nella creazione dell'utente: ${errorMessage}`, 'error');
    } finally {
      setIsAddingUser(false);
    }
  };

  // Funzione per chiudere il dialog
  const handleCloseDialog = () => {
    setIsAddUserDialogOpen(false);
    setNewUserName('');
    setAddUserError(null);
  };

  // Funzioni per i toast
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

  // Filtra gli utenti in base al termine di ricerca e al filtro selezionato
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = selectedFilter === 'all' || user.role === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-purple-900/20 border-purple-600/30 text-purple-400';
      case 'owner':
        return 'bg-blue-900/20 border-blue-600/30 text-blue-400';
      case 'collaborator':
        return 'bg-green-900/20 border-green-600/30 text-green-400';
      case 'customer':
        return 'bg-gray-800/50 border-gray-600/30 text-gray-400';
      default:
        return 'bg-gray-800/50 border-gray-600/30 text-gray-400';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <Shield className="h-3 w-3" />;
      case 'owner':
        return <Building2 className="h-3 w-3" />;
      case 'collaborator':
        return <UserCheck className="h-3 w-3" />;
      case 'customer':
        return <User className="h-3 w-3" />;
      default:
        return <Users className="h-3 w-3" />;
    }
  };

  const getRoleName = (role: string) => {
    return t(`pages.users.roles.${role}`) || role;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPhone = (phone: number) => {
    return phone.toString().replace(/(\d{3})(\d{3})(\d{4})/, '+39 $1 $2 $3');
  };

  const getFilterCardStyle = (filterType: FilterType) => {
    return selectedFilter === filterType
      ? 'bg-blue-600/20 border-blue-500/50 ring-2 ring-blue-500/30'
      : 'bg-gray-900 border-gray-800 hover:border-gray-700';
  };

  const statisticsCards = [
    {
      key: 'all' as FilterType,
      name: t('pages.users.stats.totalUsers'),
      value: users.length,
      icon: Users,
      color: 'text-blue-400',
      bgColor: 'bg-blue-600/20'
    },
    {
      key: 'superadmin' as FilterType,
      name: t('pages.users.stats.superAdmins'),
      value: users.filter(u => u.role === 'superadmin').length,
      icon: Shield,
      color: 'text-purple-400',
      bgColor: 'bg-purple-600/20'
    },
    {
      key: 'owner' as FilterType,
      name: t('pages.users.stats.owners'),
      value: users.filter(u => u.role === 'owner').length,
      icon: Building2,
      color: 'text-blue-400',
      bgColor: 'bg-blue-600/20'
    },
    {
      key: 'collaborator' as FilterType,
      name: t('pages.users.stats.collaborators'),
      value: users.filter(u => u.role === 'collaborator').length,
      icon: UserCheck,
      color: 'text-green-400',
      bgColor: 'bg-green-600/20'
    },
    {
      key: 'customer' as FilterType,
      name: t('pages.users.stats.customers'),
      value: users.filter(u => u.role === 'customer').length,
      icon: User,
      color: 'text-gray-400',
      bgColor: 'bg-gray-600/20'
    }
  ];

  // Funzione per navigare ai dettagli utente
  const handleUserClick = (userId: string) => {
    router.push(`/${locale}/users/${userId}`);
  };

  // Funzioni per l'eliminazione utente
  const handleDeleteClick = (e: React.MouseEvent, userId: string, userName: string) => {
    e.stopPropagation(); // Previene il click sulla riga
    setDeleteConfirmation({
      isOpen: true,
      userId,
      userName
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      setIsDeletingUser(true);
      
      const response = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/user/${deleteConfirmation.userId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Errore nell\'eliminazione dell\'utente');
      }

      // Rimuovi l'utente dalla lista
      setUsers(prevUsers => prevUsers.filter(user => user.id !== deleteConfirmation.userId));
      
      // Mostra notifica di successo
      showToast(`Utente "${deleteConfirmation.userName}" eliminato con successo`, 'success');
      
      // Chiudi il dialog di conferma
      setDeleteConfirmation({ isOpen: false, userId: '', userName: '' });
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Errore sconosciuto';
      showToast(`Errore nell'eliminazione dell'utente: ${errorMessage}`, 'error');
    } finally {
      setIsDeletingUser(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation({ isOpen: false, userId: '', userName: '' });
  };

  return (
    <DashboardLayout locale={locale}>
      <div className="p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {t('pages.users.title')}
              </h1>
              <p className="text-gray-300">
                {t('pages.users.description')}
              </p>
            </div>
            <button 
              type="button"
              onClick={() => setIsAddUserDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl flex items-center space-x-2 transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>{t('pages.users.addUser')}</span>
            </button>
          </div>
        </div>

        {/* Barra di ricerca */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 max-w-md">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t('pages.users.searchUsers')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>
        </div>

        {/* Statistiche filtrabili */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
          {statisticsCards.map((card) => {
            const Icon = card.icon;
            return (
              <div 
                key={card.key}
                onClick={() => setSelectedFilter(card.key)}
                className={`rounded-xl border p-6 cursor-pointer transition-all duration-200 ${getFilterCardStyle(card.key)}`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-3 ${card.bgColor} rounded-lg`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{card.value}</p>
                    <p className="text-gray-400 text-sm">{card.name}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Indicatore filtro attivo */}
        {selectedFilter !== 'all' && (
          <div className="mb-6">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-gray-400">Filtro attivo:</span>
              <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded-lg">
                {statisticsCards.find(card => card.key === selectedFilter)?.name}
              </span>
              <button
                onClick={() => setSelectedFilter('all')}
                className="text-gray-400 hover:text-white transition-colors ml-2"
              >
                ✕ Rimuovi filtro
              </button>
            </div>
          </div>
        )}

        {/* Gestione degli errori */}
        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-2">
              <div className="text-red-400">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-red-300 font-semibold">{t('common.error')}</h3>
                <p className="text-red-200">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Lista utenti */}
        {!error && (
          <>
            <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-800/50 border-b border-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {t('pages.users.table.user')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {t('pages.users.table.email')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {t('pages.users.table.phone')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {t('pages.users.table.role')}
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                        {t('pages.users.table.createdDate')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {filteredUsers.map((user) => (
                      <tr 
                        key={user.id} 
                        onClick={() => handleUserClick(user.id)}
                        className="hover:bg-gray-800/50 transition-colors cursor-pointer group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-3">
                            <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                              <Users className="h-5 w-5 text-gray-400" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-white">
                                {user.name}
                              </div>
                              <div className="text-xs text-gray-400 truncate max-w-[200px]">
                                {user.address}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2 text-gray-300">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{user.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-gray-300">{formatPhone(user.phone)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`inline-flex items-center space-x-1 text-xs font-medium rounded-full px-2 py-1 border ${getRoleColor(user.role)}`}>
                            {getRoleIcon(user.role)}
                            <span>{getRoleName(user.role)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-gray-400">
                              <Calendar className="h-4 w-4" />
                              <span className="text-sm">{formatDate(user.created_at)}</span>
                            </div>
                            {/* Pulsante eliminazione - visibile solo on hover */}
                            <button
                              onClick={(e) => handleDeleteClick(e, user.id, user.name)}
                              className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg"
                              title="Elimina utente"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Messaggio quando non ci sono risultati di ricerca/filtri */}
              {filteredUsers.length === 0 && users.length > 0 && (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {t('pages.users.noUsersFound')}
                  </h3>
                  <p className="text-gray-300">
                    {selectedFilter !== 'all' 
                      ? 'Nessun utente trovato per il filtro selezionato'
                      : t('pages.users.searchDifferentTerm')
                    }
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Dialog per aggiungere utente */}
        {isAddUserDialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={handleCloseDialog}
            />
            
            {/* Dialog */}
            <div className="relative bg-gray-900 border border-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <h3 className="text-lg font-semibold text-white">
                  {t('pages.users.addUser')}
                </h3>
                <button
                  onClick={handleCloseDialog}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                <div className="mb-4">
                  <label htmlFor="userName" className="block text-sm font-medium text-gray-300 mb-2">
                    Nome utente
                  </label>
                  <input
                    id="userName"
                    type="text"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    placeholder="Inserisci il nome dell'utente"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-gray-200 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isAddingUser}
                  />
                </div>

                {/* Errore */}
                {addUserError && (
                  <div className="mb-4 p-3 bg-red-900/20 border border-red-800 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 text-red-400" />
                      <span className="text-red-200 text-sm">{addUserError}</span>
                    </div>
                  </div>
                )}

                {/* Note */}
                <p className="text-xs text-gray-400 mb-6">
                  L'utente verrà creato con ruolo "customer" e potrà completare il profilo successivamente.
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-800">
                <button
                  onClick={handleCloseDialog}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  disabled={isAddingUser}
                >
                  Annulla
                </button>
                <button
                  onClick={handleAddUser}
                  disabled={isAddingUser || !newUserName.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  {isAddingUser && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>{isAddingUser ? 'Aggiungendo...' : 'Aggiungi'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Dialog di conferma eliminazione */}
        {deleteConfirmation.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={handleDeleteCancel}
            />
            
            {/* Dialog */}
            <div className="relative bg-gray-900 border border-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4">
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-800">
                <h3 className="text-lg font-semibold text-white">
                  Conferma eliminazione
                </h3>
                <button
                  onClick={handleDeleteCancel}
                  className="text-gray-400 hover:text-white transition-colors"
                  disabled={isDeletingUser}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6">
                <div className="flex items-start space-x-3">
                  <div className="bg-red-600/20 p-3 rounded-lg">
                    <AlertCircle className="h-6 w-6 text-red-400" />
                  </div>
                  <div>
                    <h4 className="text-white font-medium mb-2">
                      Sei sicuro di voler eliminare questo utente?
                    </h4>
                    <p className="text-gray-300 text-sm">
                      L'utente <span className="font-semibold text-white">"{deleteConfirmation.userName}"</span> verrà eliminato definitivamente. 
                      Questa azione non può essere annullata.
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-800">
                <button
                  onClick={handleDeleteCancel}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  disabled={isDeletingUser}
                >
                  Annulla
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={isDeletingUser}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:text-gray-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                >
                  {isDeletingUser && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>{isDeletingUser ? 'Eliminando...' : 'Elimina'}</span>
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