'use client';

import { use, useEffect, useState } from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { DashboardLayout } from '@/components/DashboardLayout';
import { 
  ShoppingCart, 
  Building2, 
  ChevronDown, 
  ChevronUp, 
  Package,
  User,
  MapPin,
  Calendar,
  Info,
  Loader2,
  Clock,
  Truck,
  CheckCircle,
  Wheat,
  Hammer,
  Beef,
  CheckSquare,
  Square
} from 'lucide-react';

interface Order {
  id: number;
  created_at: number;
  user_id: string;
  address: string;
  amount: number;
  uom: 'unit' | 'g' | 'kg' | 'ml' | 'l';
  product_id: number;
  product_name: string;
  category: string;
  cover: string | {
    access: string;
    path: string;
    name: string;
    type: string;
    size: number;
    mime: string;
    meta: {
      width: number;
      height: number;
    };
    url: string;
  } | null;
  informations: string;
  arrival_start: string;
  arrival_end: string;
  state: 'processing' | 'delivering' | 'arrived';
}

interface Company {
  id: number;
  name: string;
  description: string;
  Location: string;
  type: string;
  created_at: number;
  cover: string | null;
  gallery: string[];
}

export default function OrdersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = use(params);
  const { t } = useTranslations(locale);

  // Stati per le aziende
  const [companies, setCompanies] = useState<Company[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [loadingCompanies, setLoadingCompanies] = useState(false);
  const [companiesError, setCompaniesError] = useState<string | null>(null);
  
  // Stati per gli ordini
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  
  // Stati per l'espansione degli ordini
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());
  
  // Stato per il filtro degli ordini
  const [selectedStateFilter, setSelectedStateFilter] = useState<string | null>(null);
  
  // Stati per il popup di conferma
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [selectedOrderForUpdate, setSelectedOrderForUpdate] = useState<Order | null>(null);
  const [updatingOrder, setUpdatingOrder] = useState(false);

  // Carica l'ultima azienda visitata dal localStorage o se l'utente ha una sola azienda
  useEffect(() => {
    const lastCompanyId = localStorage.getItem('lastVisitedCompanyId');
    if (lastCompanyId) {
      setSelectedCompanyId(parseInt(lastCompanyId));
    }
  }, []);

  // Controlla se l'utente ha una sola azienda e la seleziona automaticamente
  useEffect(() => {
    if (companies.length === 1 && !selectedCompanyId) {
      const singleCompany = companies[0];
      setSelectedCompanyId(singleCompany.id);
      localStorage.setItem('lastVisitedCompanyId', singleCompany.id.toString());
    }
  }, [companies, selectedCompanyId]);

  // Ottieni il ruolo dell'utente corrente
  const currentUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
  const isSuperAdmin = currentUser.role === 'superadmin';

  // Carica la lista delle aziende se non c'è una selezionata
  useEffect(() => {
    const fetchCompanies = async () => {
      if (selectedCompanyId) return; // Se c'è già un'azienda selezionata, non caricare la lista
      
      try {
        setLoadingCompanies(true);
        setCompaniesError(null);
        
        let response;
        let apiUrl;
        
        if (isSuperAdmin) {
          // Per superadmin, usa l'API companies per ottenere tutte le aziende
          apiUrl = new URL('https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/companies');
          apiUrl.searchParams.append('lang', locale === 'it' ? 'it' : 'en');
          

          
          response = await fetch(apiUrl.toString(), {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          });
        } else {
          // Per utenti non superadmin, usa l'API user_company per ottenere le loro aziende
          apiUrl = new URL('https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/user_company');
          apiUrl.searchParams.append('user_id', currentUser.id || '');
          apiUrl.searchParams.append('lang', locale === 'it' ? 'it' : 'en');
          

          
          response = await fetch(apiUrl.toString(), {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            }
          });
        }



        if (!response.ok) {
          const errorText = await response.text();
          
          // Se non è superadmin e l'API dà errore, probabilmente non ha aziende
          if (!isSuperAdmin) {
            setCompanies([]);
            return; // Non lanciare errore, mostra lista vuota
          }
          
          throw new Error('Errore nel recupero delle aziende');
        }

        const data = await response.json();
        setCompanies(data);
      } catch (err) {
        setCompaniesError(err instanceof Error ? err.message : 'Errore sconosciuto');
      } finally {
        setLoadingCompanies(false);
      }
    };

    fetchCompanies();
  }, [selectedCompanyId, locale, isSuperAdmin, currentUser.id]);



  // Carica gli ordini quando c'è un'azienda selezionata
  useEffect(() => {
    const fetchOrders = async () => {
      if (!selectedCompanyId) return;
      
      try {
        setLoadingOrders(true);
        setOrdersError(null);
        
        const url = new URL('https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/order');
        url.searchParams.append('company_id', selectedCompanyId.toString());
        url.searchParams.append('lang', locale === 'it' ? 'it' : 'en');
        
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Errore nel recupero degli ordini');
        }

        const ordersData = await response.json();
        setOrders(ordersData || []);
      } catch (err) {
        setOrdersError(err instanceof Error ? err.message : 'Errore sconosciuto');
      } finally {
        setLoadingOrders(false);
      }
    };

    fetchOrders();
  }, [selectedCompanyId, locale]);

  const selectedCompany = companies.find(c => c.id === selectedCompanyId);

  const handleCompanySelect = (companyId: number) => {
    setSelectedCompanyId(companyId);
    localStorage.setItem('lastVisitedCompanyId', companyId.toString());
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };



  const getCompanyTypeIcon = (type: string) => {
    switch (type) {
      case 'agriculture':
        return <Wheat className="h-3 w-3 text-green-400" />;
      case 'artisanal':
        return <Hammer className="h-3 w-3 text-orange-400" />;
      case 'livestock':
        return <Beef className="h-3 w-3 text-red-400" />;
      default:
        return <Building2 className="h-3 w-3 text-gray-400" />;
    }
  };

  const getCompanyTypeStyles = (type: string) => {
    switch (type) {
      case 'agriculture':
        return 'bg-green-900/20 border-green-600/30 text-green-400';
      case 'artisanal':
        return 'bg-orange-900/20 border-orange-600/30 text-orange-400';
      case 'livestock':
        return 'bg-red-900/20 border-red-600/30 text-red-400';
      default:
        return 'bg-gray-800/50 border-gray-600/30 text-gray-400';
    }
  };

  const getOrderStateIcon = (state: string) => {
    switch (state) {
      case 'processing':
        return <Package className="h-4 w-4 text-yellow-400" />;
      case 'delivering':
        return <Truck className="h-4 w-4 text-blue-400" />;
      case 'arrived':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      default:
        return <Package className="h-4 w-4 text-gray-400" />;
    }
  };

  const getOrderStateStyles = (state: string) => {
    switch (state) {
      case 'processing':
        return 'bg-yellow-900/20 border-yellow-600/30 text-yellow-400';
      case 'delivering':
        return 'bg-blue-900/20 border-blue-600/30 text-blue-400';
      case 'arrived':
        return 'bg-green-900/20 border-green-600/30 text-green-400';
      default:
        return 'bg-gray-800/50 border-gray-600/30 text-gray-400';
    }
  };

  const getOrderStateName = (state: string) => {
    switch (state) {
      case 'processing':
        return t('pages.orders.states.processing');
      case 'delivering':
        return t('pages.orders.states.delivering');
      case 'arrived':
        return t('pages.orders.states.arrived');
      default:
        return t('pages.orders.states.unknown');
    }
  };

  const formatUOM = (uom: string) => {
    switch (uom) {
      case 'unit':
        return t('units.unit');
      case 'g':
        return t('units.g');
      case 'kg':
        return t('units.kg');
      case 'ml':
        return t('units.ml');
      case 'l':
        return t('units.l');
      default:
        return uom;
    }
  };



  const toggleOrderExpansion = (orderId: number) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const handleStateFilterClick = (state: string) => {
    if (selectedStateFilter === state) {
      setSelectedStateFilter(null); // Deseleziona se già selezionato
    } else {
      setSelectedStateFilter(state); // Seleziona il nuovo stato
    }
  };

  const handleCheckboxClick = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation(); // Previene l'espansione dell'ordine
    setSelectedOrderForUpdate(order);
    setShowConfirmPopup(true);
  };

  const handleConfirmUpdate = async () => {
    if (!selectedOrderForUpdate) return;
    
    // Determina il nuovo stato in base allo stato attuale
    const currentState = selectedOrderForUpdate.state;
    const newState = (currentState === 'delivering' || currentState === 'arrived') ? 'processing' : 'delivering';
    
    try {
      setUpdatingOrder(true);
      
      const response = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/order/${selectedOrderForUpdate.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          order_id: selectedOrderForUpdate.id,
          user_id: selectedOrderForUpdate.user_id,
          address: selectedOrderForUpdate.address,
          amount: selectedOrderForUpdate.amount,
          product_id: selectedOrderForUpdate.product_id,
          informations: selectedOrderForUpdate.informations,
          arrival_start: selectedOrderForUpdate.arrival_start,
          arrival_end: selectedOrderForUpdate.arrival_end,
          state: newState
        })
      });

      if (!response.ok) {
        throw new Error('Errore nell\'aggiornamento dell\'ordine');
      }

      // Aggiorna l'ordine nella lista locale
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === selectedOrderForUpdate.id 
            ? { ...order, state: newState as 'processing' | 'delivering' | 'arrived' }
            : order
        )
      );

      setShowConfirmPopup(false);
      setSelectedOrderForUpdate(null);
    } catch (err) {
      console.error('Errore nell\'aggiornamento dell\'ordine:', err);
      alert('Errore nell\'aggiornamento dell\'ordine');
    } finally {
      setUpdatingOrder(false);
    }
  };

  const handleCancelUpdate = () => {
    setShowConfirmPopup(false);
    setSelectedOrderForUpdate(null);
  };

  // Statistiche ordini
  const orderStats = {
    total: orders.length,
    processing: orders.filter(o => o.state === 'processing').length,
    delivering: orders.filter(o => o.state === 'delivering').length,
    arrived: orders.filter(o => o.state === 'arrived').length
  };

  // Ordini filtrati in base al filtro selezionato
  const filteredOrders = selectedStateFilter 
    ? orders.filter(order => order.state === selectedStateFilter)
    : orders;

  // Ordina gli ordini: processing in alto, delivering in mezzo, arrived in fondo
  const sortedOrders = [
    ...filteredOrders.filter(order => order.state === 'processing'),
    ...filteredOrders.filter(order => order.state === 'delivering'),
    ...filteredOrders.filter(order => order.state === 'arrived')
  ];

  // Raggruppa gli ordini per cliente (solo per stato 'processing')
  const groupedOrders = sortedOrders.reduce((groups, order) => {
    if (order.state === 'processing') {
      const userId = order.user_id;
      if (!groups[userId]) {
        groups[userId] = [];
      }
      groups[userId].push(order);
    } else {
      // Ordini singoli per altri stati
      if (!groups['single']) {
        groups['single'] = [];
      }
      groups['single'].push(order);
    }
    return groups;
  }, {} as Record<string, Order[]>);

  // Converti i gruppi in array per il rendering
  const ordersToRender = Object.entries(groupedOrders).map(([userId, orders]) => ({
    userId,
    orders,
    isGroup: userId !== 'single' && orders.length > 1
  }));

  return (
    <DashboardLayout locale={locale}>
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {t('navigation.orders')}
          </h1>
                        <p className="text-gray-300">
                Gestisci gli ordini e monitora l&apos;impacchettamento
              </p>
        </div>

        {/* Selettore azienda se non c'è una selezionata */}
        {!selectedCompanyId && (
          <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
              <Building2 className="h-5 w-5" />
              <span>{t('pages.orders.selectCompany')}</span>
            </h2>

            {companiesError && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-4">
                <p className="text-red-200">{companiesError}</p>
              </div>
            )}

            {!companiesError && companies.length > 0 && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {companies.map((company) => (
                  <div 
                    key={company.id} 
                    className="group relative bg-gray-900 rounded-xl shadow-sm border border-gray-800 hover:border-gray-700 transition-colors overflow-hidden aspect-square flex flex-col cursor-pointer"
                    onClick={() => handleCompanySelect(company.id)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCompanySelect(company.id);
                      }
                    }}
                  >
                    {/* Immagine dell'azienda - 3/4 dell'altezza */}
                    <div className="flex-1 relative bg-gray-800">
                      {company.cover ? (
                        <img 
                          src={company.cover} 
                          alt={company.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Building2 className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                    </div>
                    
                    {/* Informazioni azienda - 1/4 dell'altezza */}
                    <div className="p-4 flex flex-col justify-center min-h-0">
                      <h3 className="text-lg font-semibold text-white truncate mb-1">
                        {company.name}
                      </h3>
                      {company.type && (
                        <div className={`inline-flex items-center space-x-1 text-xs font-medium rounded-full px-2 py-1 border self-start ${getCompanyTypeStyles(company.type)}`}>
                          {getCompanyTypeIcon(company.type)}
                          <span className="capitalize">{company.type}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!companiesError && companies.length === 0 && (
              <div className="text-center py-8">
                <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  {isSuperAdmin ? t('pages.companies.noCompanies') : t('pages.companies.noUserCompaniesMessage')}
                </h3>
                <p className="text-gray-300 mb-6">
                  {isSuperAdmin ? t('pages.companies.noCompaniesMessage') : t('pages.companies.contactAdmin')}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Header con azienda selezionata */}
        {selectedCompanyId && (
          <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-6 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Building2 className="h-6 w-6 text-blue-400" />
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    {selectedCompany ? selectedCompany.name : `Azienda #${selectedCompanyId}`}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {t('pages.orders.companyOrders')}
                  </p>
                </div>
              </div>
              {companies.length > 1 && (
                <button
                  onClick={() => {
                    setSelectedCompanyId(null);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  {t('pages.orders.changeCompany')}
                </button>
              )}
            </div>
          </div>
        )}

                {/* Statistiche ordini */}
        {selectedCompanyId && orders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <div 
              className={`bg-gray-900 rounded-xl p-6 border transition-colors cursor-pointer ${
                selectedStateFilter === null 
                  ? 'border-blue-500 bg-blue-900/20' 
                  : 'border-gray-800 hover:border-gray-700'
              }`}
              onClick={() => setSelectedStateFilter(null)}
            >
              <div className="flex items-center space-x-4">
                <ShoppingCart className="h-8 w-8 text-blue-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{orderStats.total}</p>
                  <p className="text-gray-400">{t('pages.orders.totalOrders')}</p>
                </div>
              </div>
            </div>
            <div 
              className={`bg-gray-900 rounded-xl p-6 border transition-colors cursor-pointer ${
                selectedStateFilter === 'processing' 
                  ? 'border-yellow-500 bg-yellow-900/20' 
                  : 'border-gray-800 hover:border-gray-700'
              }`}
              onClick={() => handleStateFilterClick('processing')}
            >
              <div className="flex items-center space-x-4">
                <Package className="h-8 w-8 text-yellow-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{orderStats.processing}</p>
                  <p className="text-gray-400">{t('pages.orders.processing')}</p>
                </div>
          </div>
        </div>
            <div 
              className={`bg-gray-900 rounded-xl p-6 border transition-colors cursor-pointer ${
                selectedStateFilter === 'delivering' 
                  ? 'border-blue-500 bg-blue-900/20' 
                  : 'border-gray-800 hover:border-gray-700'
              }`}
              onClick={() => handleStateFilterClick('delivering')}
            >
              <div className="flex items-center space-x-4">
                <Truck className="h-8 w-8 text-blue-400" />
              <div>
                  <p className="text-2xl font-bold text-white">{orderStats.delivering}</p>
                  <p className="text-gray-400">{t('pages.orders.delivering')}</p>
                </div>
              </div>
            </div>
            <div 
              className={`bg-gray-900 rounded-xl p-6 border transition-colors cursor-pointer ${
                selectedStateFilter === 'arrived' 
                  ? 'border-green-500 bg-green-900/20' 
                  : 'border-gray-800 hover:border-gray-700'
              }`}
              onClick={() => handleStateFilterClick('arrived')}
            >
              <div className="flex items-center space-x-4">
                <CheckCircle className="h-8 w-8 text-green-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{orderStats.arrived}</p>
                  <p className="text-gray-400">{t('pages.orders.arrived')}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Lista ordini */}
        {selectedCompanyId && (
          <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                <ShoppingCart className="h-5 w-5" />
                <span>
                  {selectedStateFilter 
                    ? `${t('pages.orders.title')} ${getOrderStateName(selectedStateFilter).toLowerCase()}` 
                    : t('pages.orders.allOrders')
                  }
                </span>
              </h2>
              {selectedStateFilter && (
                <button
                  onClick={() => setSelectedStateFilter(null)}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  {t('pages.orders.showAll')}
                </button>
              )}
            </div>

            {loadingOrders && (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 text-blue-400 mx-auto mb-2 animate-spin" />
                <p className="text-gray-400">Caricamento ordini...</p>
              </div>
            )}

            {ordersError && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-4">
                <p className="text-red-200">{ordersError}</p>
              </div>
            )}

            {!ordersError && ordersToRender.length === 0 && !loadingOrders && (
              <div className="text-center py-8">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-400 mb-4">
                  {selectedStateFilter 
                    ? `Nessun ordine ${getOrderStateName(selectedStateFilter).toLowerCase()} trovato`
                    : 'Nessun ordine trovato per questa azienda'
                  }
                </p>
              </div>
            )}

            {!ordersError && ordersToRender.length > 0 && (
              <div className="space-y-4">
                {ordersToRender.map(({ userId, orders, isGroup }) => {
                  if (isGroup) {
                    // Rendering gruppo di ordini
                    return (
                      <div
                        key={userId}
                        className="bg-blue-900/20 rounded-lg border border-blue-600/30 overflow-hidden"
                      >
                        {/* Header del gruppo */}
                        <div className="bg-blue-900/40 px-4 py-2 border-b border-blue-600/30">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-blue-400" />
                            <span className="text-blue-300 font-medium text-sm">
                              Cliente: {userId}
                            </span>
                            <span className="text-blue-400 text-xs">
                              ({orders.length} ordini)
                            </span>
                          </div>
                        </div>
                        
                        {/* Lista ordini del gruppo */}
                        <div className="space-y-2 p-2">
                          {orders.map((order) => {
                            const isExpanded = expandedOrders.has(order.id);
                            return (
                              <div
                                key={order.id}
                                className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
                              >
                                {/* Header dell'ordine - sempre visibile */}
                                <div
                                  className="p-4 cursor-pointer hover:bg-gray-700 transition-colors group relative"
                                  onClick={() => toggleOrderExpansion(order.id)}
                                >
                                  {/* Checkbox che appare on hover */}
                                  {/* Checkbox sempre visibile */}
                                  <div 
                                    className="absolute left-6 top-1/2 transform -translate-y-1/2 transition-opacity z-10"
                                    onClick={(e) => handleCheckboxClick(order, e)}
                                  >
                                    {order.state === 'delivering' || order.state === 'arrived' ? (
                                      <CheckSquare className="h-8 w-8 text-green-400 cursor-pointer" />
                                    ) : (
                                      <Square className="h-8 w-8 text-gray-400 cursor-pointer hover:text-green-400" />
                                    )}
                                  </div>
                                                              <div className="flex items-center justify-between">
                              {/* Tutte le colonne raggruppate a sinistra */}
                              <div className="flex items-center space-x-4">
                                {/* Cover del prodotto - più grande e sovrapposto */}
                                <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-700 text-left relative ml-12">
                                  {(typeof order.cover === 'string' && order.cover) || (typeof order.cover === 'object' && order.cover?.url) ? (
                                    <img 
                                      src={typeof order.cover === 'string' ? order.cover : order.cover.url} 
                                      alt={order.product_name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Package className="h-8 w-8 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                
                                {/* Nome del prodotto - larghezza più stretta */}
                                <div className="w-56 flex-shrink-0 text-left">
                                  <p className="text-white font-medium truncate text-left">{order.product_name}</p>
                                </div>
                                
                                {/* Quantità e UOM - 120px fissa */}
                                <div className="w-30 text-white font-semibold flex-shrink-0 text-left">
                                  {order.amount} {formatUOM(order.uom)}
                                </div>
                                
                                {/* Data di creazione - 180px fissa */}
                                <div className="w-45 text-sm text-gray-400 flex items-center space-x-1 flex-shrink-0 text-left">
                                  <Calendar className="h-4 w-4" />
                                  <span className="text-left">{formatDate(order.created_at)}</span>
                                </div>
                              </div>
                                    
                                    {/* Stato ordine - a destra */}
                                    <div className="flex items-center space-x-3 ml-4 justify-end">
                                      <div className={`inline-flex items-center space-x-2 text-sm font-medium rounded-full px-3 py-1 border ${getOrderStateStyles(order.state)}`}>
                                        {getOrderStateIcon(order.state)}
                                        <span className="truncate">{getOrderStateName(order.state)}</span>
                                      </div>
                                      
                                      {/* Freccia di espansione */}
                                      <div className="text-gray-400">
                                        {isExpanded ? (
                                          <ChevronUp className="h-5 w-5" />
                                        ) : (
                                          <ChevronDown className="h-5 w-5" />
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Dettagli espansi */}
                                {isExpanded && (
                                  <div className="border-t border-gray-700 bg-gray-800">
                                    <div className="p-6 grid md:grid-cols-2 gap-6">
                                      {/* Sezione 1: Prodotto e Informazioni */}
                                      <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-white mb-3">
                                          {t('pages.orders.sections.productInfo')}
                                        </h3>
                                        
                                        <div className="space-y-3">
                                          {/* Nome prodotto */}
                                          <div className="flex items-start space-x-3">
                                            <Package className="h-5 w-5 text-blue-400 mt-0.5" />
                                            <div>
                                              <p className="text-sm text-gray-400">{t('pages.orders.fields.productName')}</p>
                                              <p className="text-white font-medium">{order.product_name}</p>
                                            </div>
                                          </div>
                                          
                                          {/* Categoria */}
                                          {order.category && (
                                            <div className="flex items-start space-x-3">
                                              <Wheat className="h-5 w-5 text-green-400 mt-0.5" />
                                              <div>
                                                <p className="text-sm text-gray-400">Categoria</p>
                                                <p className="text-white">{order.category}</p>
                                              </div>
                                            </div>
                                          )}
                                          
                                          {/* Informazioni aggiuntive */}
                                          <div className="flex items-start space-x-3">
                                            <Info className="h-5 w-5 text-yellow-400 mt-0.5" />
                                            <div>
                                              <p className="text-sm text-gray-400">Informazioni Aggiuntive</p>
                                              <p className="text-white">{order.informations}</p>
                                            </div>
                                          </div>
                                          
                                          {/* Quantità */}
                                          <div className="flex items-start space-x-3">
                                            <ShoppingCart className="h-5 w-5 text-purple-400 mt-0.5" />
                                            <div>
                                              <p className="text-sm text-gray-400">Quantità Ordinata</p>
                                              <p className="text-lg font-semibold text-white">{order.amount} {formatUOM(order.uom)}</p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* Sezione 2: Cliente e Consegna */}
                                      <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-white mb-3">
                                          Cliente e Consegna
                                        </h3>
                                        
                                        <div className="space-y-3">
                                          {/* Cliente */}
                                          <div className="flex items-start space-x-3">
                                            <User className="h-5 w-5 text-orange-400 mt-0.5" />
                                            <div>
                                              <p className="text-sm text-gray-400">Cliente</p>
                                              <p className="text-white font-mono text-sm">{order.user_id}</p>
                                            </div>
                                          </div>
                                          
                                          {/* Data ordine */}
                                          <div className="flex items-start space-x-3">
                                            <Calendar className="h-5 w-5 text-red-400 mt-0.5" />
                                            <div>
                                              <p className="text-sm text-gray-400">Data Ordine</p>
                                              <p className="text-white">{formatDate(order.created_at)}</p>
                                            </div>
                                          </div>
                                          
                                          {/* Indirizzo */}
                                          <div className="flex items-start space-x-3">
                                            <MapPin className="h-5 w-5 text-green-400 mt-0.5" />
                                            <div>
                                              <p className="text-sm text-gray-400">Indirizzo di Consegna</p>
                                              <p className="text-white">{order.address}</p>
                                            </div>
                                          </div>
                                          
                                          {/* Finestra di consegna */}
                                          <div className="flex items-start space-x-3">
                                            <Clock className="h-5 w-5 text-blue-400 mt-0.5" />
                                            <div>
                                              <p className="text-sm text-gray-400">Finestra di Consegna</p>
                                              <p className="text-white">
                                                Dal {new Date(order.arrival_start).toLocaleDateString(locale)} 
                                                al {new Date(order.arrival_end).toLocaleDateString(locale)}
                                              </p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  } else {
                    // Rendering ordini singoli
                    return orders.map((order) => {
                      const isExpanded = expandedOrders.has(order.id);
                      return (
                        <div
                          key={order.id}
                          className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden"
                        >
                          {/* Header dell'ordine - sempre visibile */}
                          <div
                            className="p-4 cursor-pointer hover:bg-gray-700 transition-colors group relative"
                            onClick={() => toggleOrderExpansion(order.id)}
                          >
                            {/* Checkbox che appare on hover */}
                            {/* Checkbox sempre visibile */}
                            <div 
                              className="absolute left-6 top-1/2 transform -translate-y-1/2 transition-opacity z-10"
                              onClick={(e) => handleCheckboxClick(order, e)}
                            >
                              {order.state === 'delivering' || order.state === 'arrived' ? (
                                <CheckSquare className="h-8 w-8 text-green-400 cursor-pointer" />
                              ) : (
                                <Square className="h-8 w-8 text-gray-400 cursor-pointer hover:text-green-400" />
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              {/* Tutte le colonne raggruppate a sinistra */}
                              <div className="flex items-center space-x-4">
                                {/* Cover del prodotto - più grande e spostato a destra */}
                                <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-700 text-left relative ml-12">
                                  {(typeof order.cover === 'string' && order.cover) || (typeof order.cover === 'object' && order.cover?.url) ? (
                                    <img 
                                      src={typeof order.cover === 'string' ? order.cover : order.cover.url} 
                                      alt={order.product_name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Package className="h-8 w-8 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                
                                {/* Nome del prodotto - larghezza più stretta */}
                                <div className="w-56 flex-shrink-0 text-left">
                                  <p className="text-white font-medium truncate text-left">{order.product_name}</p>
                                </div>
                                
                                {/* Quantità e UOM - 120px fissa */}
                                <div className="w-30 text-white font-semibold flex-shrink-0 text-left">
                                  {order.amount} {formatUOM(order.uom)}
                                </div>
                                
                                {/* Data di creazione - 180px fissa */}
                                <div className="w-45 text-sm text-gray-400 flex items-center space-x-1 flex-shrink-0 text-left">
                                  <Calendar className="h-4 w-4" />
                                  <span className="text-left">{formatDate(order.created_at)}</span>
                                </div>
                              </div>
                              
                              {/* Stato ordine - a destra */}
                              <div className="flex items-center space-x-3 ml-4 justify-end">
                                <div className={`inline-flex items-center space-x-2 text-sm font-medium rounded-full px-3 py-1 border ${getOrderStateStyles(order.state)}`}>
                                  {getOrderStateIcon(order.state)}
                                  <span className="truncate">{getOrderStateName(order.state)}</span>
                                </div>
                                
                                {/* Freccia di espansione */}
                                <div className="text-gray-400">
                                  {isExpanded ? (
                                    <ChevronUp className="h-5 w-5" />
                                  ) : (
                                    <ChevronDown className="h-5 w-5" />
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Dettagli espansi */}
                          {isExpanded && (
                            <div className="border-t border-gray-700 bg-gray-800">
                              <div className="p-6 grid md:grid-cols-2 gap-6">
                                {/* Sezione 1: Prodotto e Informazioni */}
                                <div className="space-y-4">
                                  <h3 className="text-lg font-semibold text-white mb-3">
                                    Prodotto e Informazioni
                                  </h3>
                                  
                                  <div className="space-y-3">
                                    {/* Nome prodotto */}
                                    <div className="flex items-start space-x-3">
                                      <Package className="h-5 w-5 text-blue-400 mt-0.5" />
                                      <div>
                                        <p className="text-sm text-gray-400">Nome Prodotto</p>
                                        <p className="text-white font-medium">{order.product_name}</p>
                                      </div>
                                    </div>
                                    
                                    {/* Categoria */}
                                    {order.category && (
                                      <div className="flex items-start space-x-3">
                                        <Wheat className="h-5 w-5 text-green-400 mt-0.5" />
                                        <div>
                                          <p className="text-sm text-gray-400">Categoria</p>
                                          <p className="text-white">{order.category}</p>
                                        </div>
                                      </div>
                                    )}
                                    
                                    {/* Informazioni aggiuntive */}
                                    <div className="flex items-start space-x-3">
                                      <Info className="h-5 w-5 text-yellow-400 mt-0.5" />
                                      <div>
                                        <p className="text-sm text-gray-400">Informazioni Aggiuntive</p>
                                        <p className="text-white">{order.informations}</p>
                                      </div>
                                    </div>
                                    
                                    {/* Quantità */}
                                    <div className="flex items-start space-x-3">
                                      <ShoppingCart className="h-5 w-5 text-purple-400 mt-0.5" />
                                      <div>
                                        <p className="text-sm text-gray-400">Quantità Ordinata</p>
                                        <p className="text-lg font-semibold text-white">{order.amount} {formatUOM(order.uom)}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Sezione 2: Cliente e Consegna */}
                                <div className="space-y-4">
                                  <h3 className="text-lg font-semibold text-white mb-3">
                                    Cliente e Consegna
                                  </h3>
                                  
                                  <div className="space-y-3">
                                    {/* Cliente */}
                                    <div className="flex items-start space-x-3">
                                      <User className="h-5 w-5 text-orange-400 mt-0.5" />
                                      <div>
                                        <p className="text-sm text-gray-400">Cliente</p>
                                        <p className="text-white font-mono text-sm">{order.user_id}</p>
                                      </div>
                                    </div>
                                    
                                    {/* Data ordine */}
                                    <div className="flex items-start space-x-3">
                                      <Calendar className="h-5 w-5 text-red-400 mt-0.5" />
                                      <div>
                                        <p className="text-sm text-gray-400">Data Ordine</p>
                                        <p className="text-white">{formatDate(order.created_at)}</p>
                                      </div>
                                    </div>
                                    
                                    {/* Indirizzo */}
                                    <div className="flex items-start space-x-3">
                                      <MapPin className="h-5 w-5 text-green-400 mt-0.5" />
                                      <div>
                                        <p className="text-sm text-gray-400">Indirizzo di Consegna</p>
                                        <p className="text-white">{order.address}</p>
                                      </div>
                                    </div>
                                    
                                    {/* Finestra di consegna */}
                                    <div className="flex items-start space-x-3">
                                      <Clock className="h-5 w-5 text-blue-400 mt-0.5" />
                                      <div>
                                        <p className="text-sm text-gray-400">Finestra di Consegna</p>
                                        <p className="text-white">
                                          Dal {new Date(order.arrival_start).toLocaleDateString(locale)} 
                                          al {new Date(order.arrival_end).toLocaleDateString(locale)}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    });
                  }
                })}
              </div>
            )}
        </div>
        )}

        {/* Popup di conferma */}
        {showConfirmPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-gray-900 rounded-xl p-6 max-w-md w-full mx-4 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">
                {selectedOrderForUpdate?.state === 'processing' 
                  ? t('pages.orders.confirmUpdate.title') 
                  : t('pages.orders.confirmUpdate.titleReverse')
                }
              </h3>
              <p className="text-gray-300 mb-6">
                {selectedOrderForUpdate?.state === 'processing' 
                  ? t('pages.orders.confirmUpdate.message')
                  : t('pages.orders.confirmUpdate.messageReverse')
                }
                <br />
                <span className="text-sm text-gray-400">
                  {t('pages.orders.confirmUpdate.product')} {selectedOrderForUpdate?.product_name}
                </span>
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleCancelUpdate}
                  disabled={updatingOrder}
                  className="flex-1 px-4 py-2 text-gray-300 border border-gray-600 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                  {t('pages.orders.confirmUpdate.cancel')}
                </button>
                <button
                  onClick={handleConfirmUpdate}
                  disabled={updatingOrder}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {updatingOrder ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      {t('pages.orders.confirmUpdate.updating')}
                    </>
                  ) : (
                    t('pages.orders.confirmUpdate.confirm')
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
} 