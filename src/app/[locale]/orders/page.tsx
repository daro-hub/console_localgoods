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
  Beef
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
  cover: string | null;
  informations: string;
  arrival_start: string;
  arrival_end: string;
  state: 'sent' | 'processing' | 'delivering' | 'arrived';
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
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
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

  // Carica l'ultima azienda visitata dal localStorage
  useEffect(() => {
    const lastCompanyId = localStorage.getItem('lastVisitedCompanyId');
    if (lastCompanyId) {
      setSelectedCompanyId(parseInt(lastCompanyId));
    }
  }, []);

  // Carica la lista delle aziende se non c'è una selezionata
  useEffect(() => {
    const fetchCompanies = async () => {
      if (selectedCompanyId) return; // Se c'è già un'azienda selezionata, non caricare la lista
      
      try {
        setLoadingCompanies(true);
        setCompaniesError(null);
        
        const url = new URL('https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/companies');
        url.searchParams.append('lang', locale === 'it' ? 'it' : 'en');
        
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
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
  }, [selectedCompanyId, locale]);

  // Carica i dettagli dell'azienda selezionata
  useEffect(() => {
    const fetchSelectedCompany = async () => {
      if (!selectedCompanyId) {
        setSelectedCompany(null);
        return;
      }
      
      try {
        const url = new URL(`https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/company/${selectedCompanyId}`);
        url.searchParams.append('lang', locale === 'it' ? 'it' : 'en');
        
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const companyData = await response.json();
          setSelectedCompany(companyData);
        }
      } catch (err) {
        console.error('Errore nel recupero dei dettagli azienda:', err);
      }
    };

    fetchSelectedCompany();
  }, [selectedCompanyId, locale]);

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
      case 'sent':
        return <Clock className="h-4 w-4 text-orange-400" />;
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
      case 'sent':
        return 'bg-orange-900/20 border-orange-600/30 text-orange-400';
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
      case 'sent':
        return 'In attesa';
      case 'processing':
        return 'In elaborazione';
      case 'delivering':
        return 'In consegna';
      case 'arrived':
        return 'Arrivato';
      default:
        return state;
    }
  };

  const formatUOM = (uom: string) => {
    switch (uom) {
      case 'unit':
        return 'unità';
      case 'g':
        return 'g';
      case 'kg':
        return 'kg';
      case 'ml':
        return 'ml';
      case 'l':
        return 'l';
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

  // Statistiche ordini
  const orderStats = {
    total: orders.length,
    sent: orders.filter(o => o.state === 'sent').length,
    processing: orders.filter(o => o.state === 'processing').length,
    delivering: orders.filter(o => o.state === 'delivering').length,
    arrived: orders.filter(o => o.state === 'arrived').length
  };

  // Ordini filtrati in base al filtro selezionato
  const filteredOrders = selectedStateFilter 
    ? orders.filter(order => order.state === selectedStateFilter)
    : orders;

  // Raggruppa gli ordini per cliente (solo per stati 'sent' e 'processing')
  const groupedOrders = filteredOrders.reduce((groups, order) => {
    if (order.state === 'sent' || order.state === 'processing') {
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

        {/* Selezione azienda */}
        {!selectedCompanyId && (
          <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-6 mb-8">
            <div className="text-center mb-6">
              <Building2 className="h-12 w-12 text-blue-400 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">
                Seleziona un&apos;azienda
              </h2>
              <p className="text-gray-400">
                Scegli un&apos;azienda per visualizzare i suoi ordini
              </p>
            </div>

            {loadingCompanies && (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 text-blue-400 mx-auto mb-2 animate-spin" />
                <p className="text-gray-400">Caricamento aziende...</p>
              </div>
            )}

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
                <p className="text-gray-400">Nessuna azienda trovata</p>
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
                    Ordini dell&apos;azienda
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedCompanyId(null);
                  localStorage.removeItem('lastVisitedCompanyId');
                }}
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cambia azienda
              </button>
            </div>
          </div>
        )}

        {/* Statistiche ordini */}
        {selectedCompanyId && orders.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-6 mb-8">
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
                  <p className="text-gray-400">Ordini totali</p>
                </div>
              </div>
            </div>
            <div 
              className={`bg-gray-900 rounded-xl p-6 border transition-colors cursor-pointer ${
                selectedStateFilter === 'sent' 
                  ? 'border-orange-500 bg-orange-900/20' 
                  : 'border-gray-800 hover:border-gray-700'
              }`}
              onClick={() => handleStateFilterClick('sent')}
            >
              <div className="flex items-center space-x-4">
                <Clock className="h-8 w-8 text-orange-400" />
                <div>
                  <p className="text-2xl font-bold text-white">{orderStats.sent}</p>
                  <p className="text-gray-400">In attesa</p>
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
                  <p className="text-gray-400">In elaborazione</p>
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
                  <p className="text-gray-400">In consegna</p>
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
                  <p className="text-gray-400">Arrivati</p>
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
                    ? `Ordini ${getOrderStateName(selectedStateFilter).toLowerCase()}` 
                    : 'Tutti gli ordini'
                  }
                </span>
              </h2>
              {selectedStateFilter && (
                <button
                  onClick={() => setSelectedStateFilter(null)}
                  className="text-sm text-gray-400 hover:text-white transition-colors"
                >
                  Mostra tutti
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
                                  className="p-4 cursor-pointer hover:bg-gray-700 transition-colors"
                                  onClick={() => toggleOrderExpansion(order.id)}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4 flex-1">
                                      {/* Cover del prodotto */}
                                      <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-700">
                                        {order.cover ? (
                                          <img 
                                            src={order.cover} 
                                            alt={order.product_name}
                                            className="w-full h-full object-cover"
                                          />
                                        ) : (
                                          <div className="w-full h-full flex items-center justify-center">
                                            <Package className="h-6 w-6 text-gray-400" />
                                          </div>
                                        )}
                                      </div>
                                      
                                      {/* Nome del prodotto */}
                                      <div className="flex-1 min-w-0">
                                        <p className="text-white font-medium truncate">{order.product_name}</p>
                                      </div>
                                      
                                      {/* Quantità e UOM */}
                                      <div className="text-white font-semibold flex-shrink-0">
                                        {order.amount} {formatUOM(order.uom)}
                                      </div>
                                      
                                      {/* Data di creazione */}
                                      <div className="text-sm text-gray-400 flex items-center space-x-1 flex-shrink-0">
                                        <Calendar className="h-4 w-4" />
                                        <span>{formatDate(order.created_at)}</span>
                                      </div>
                                    </div>
                                    
                                    {/* Stato ordine - a destra */}
                                    <div className="flex items-center space-x-3 ml-4">
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
                                      {/* Immagine prodotto e informazioni cliente */}
                                      <div className="space-y-4">
                                        {/* Immagine prodotto */}
                                        {order.cover && (
                                          <div className="mb-4">
                                            <img 
                                              src={order.cover} 
                                              alt={order.product_name}
                                              className="w-full h-32 object-cover rounded-lg"
                                            />
                                          </div>
                                        )}
                                        <h3 className="text-lg font-semibold text-white mb-3">Dettagli ordine</h3>
                                        
                                        <div className="space-y-3">
                                          <div className="flex items-start space-x-3">
                                            <User className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                              <p className="text-sm text-gray-400">Cliente</p>
                                              <p className="text-white font-mono text-sm">{order.user_id}</p>
                                            </div>
                                          </div>
                                          
                                          <div className="flex items-start space-x-3">
                                            <Package className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                              <p className="text-sm text-gray-400">Prodotto</p>
                                              <p className="text-white">{order.product_name}</p>
                                              {order.category && (
                                                <p className="text-sm text-gray-400">Categoria: {order.category}</p>
                                              )}
                                            </div>
                                          </div>
                                          
                                          <div className="flex items-start space-x-3">
                                            <Info className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                              <p className="text-sm text-gray-400">Informazioni aggiuntive</p>
                                              <p className="text-white">{order.informations}</p>
                                            </div>
                                          </div>
                                          
                                          <div className="flex items-start space-x-3">
                                            <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                              <p className="text-sm text-gray-400">Data ordine</p>
                                              <p className="text-white">{formatDate(order.created_at)}</p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* Indirizzo di consegna */}
                                      <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-white mb-3">Consegna</h3>
                                        
                                        <div className="space-y-3">
                                          <div className="flex items-start space-x-3">
                                            <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                              <p className="text-sm text-gray-400">Indirizzo</p>
                                              <p className="text-white">{order.address}</p>
                                            </div>
                                          </div>
                                          
                                          <div className="flex items-start space-x-3">
                                            <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                              <p className="text-sm text-gray-400">Finestra di consegna</p>
                                              <p className="text-white">
                                                Dal {new Date(order.arrival_start).toLocaleDateString(locale)} 
                                                al {new Date(order.arrival_end).toLocaleDateString(locale)}
                                              </p>
                                            </div>
                                          </div>
                                          
                                          <div className="flex items-start space-x-3">
                                            <Package className="h-5 w-5 text-gray-400 mt-0.5" />
                                            <div>
                                              <p className="text-sm text-gray-400">Quantità ordinata</p>
                                              <p className="text-lg font-semibold text-white">{order.amount} {formatUOM(order.uom)}</p>
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
                            className="p-4 cursor-pointer hover:bg-gray-700 transition-colors"
                            onClick={() => toggleOrderExpansion(order.id)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4 flex-1">
                                {/* Cover del prodotto */}
                                <div className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-gray-700">
                                  {order.cover ? (
                                    <img 
                                      src={order.cover} 
                                      alt={order.product_name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                      <Package className="h-6 w-6 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                
                                {/* Nome del prodotto */}
                                <div className="flex-1 min-w-0">
                                  <p className="text-white font-medium truncate">{order.product_name}</p>
                                </div>
                                
                                {/* Quantità e UOM */}
                                <div className="text-white font-semibold flex-shrink-0">
                                  {order.amount} {formatUOM(order.uom)}
                                </div>
                                
                                {/* Data di creazione */}
                                <div className="text-sm text-gray-400 flex items-center space-x-1 flex-shrink-0">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatDate(order.created_at)}</span>
                                </div>
                              </div>
                              
                              {/* Stato ordine - a destra */}
                              <div className="flex items-center space-x-3 ml-4">
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
                                {/* Immagine prodotto e informazioni cliente */}
                                <div className="space-y-4">
                                  {/* Immagine prodotto */}
                                  {order.cover && (
                                    <div className="mb-4">
                                      <img 
                                        src={order.cover} 
                                        alt={order.product_name}
                                        className="w-full h-32 object-cover rounded-lg"
                                      />
                                    </div>
                                  )}
                                  <h3 className="text-lg font-semibold text-white mb-3">Dettagli ordine</h3>
                                  
                                  <div className="space-y-3">
                                    <div className="flex items-start space-x-3">
                                      <User className="h-5 w-5 text-gray-400 mt-0.5" />
                                      <div>
                                        <p className="text-sm text-gray-400">Cliente</p>
                                        <p className="text-white font-mono text-sm">{order.user_id}</p>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-start space-x-3">
                                      <Package className="h-5 w-5 text-gray-400 mt-0.5" />
                                      <div>
                                        <p className="text-sm text-gray-400">Prodotto</p>
                                        <p className="text-white">{order.product_name}</p>
                                        {order.category && (
                                          <p className="text-sm text-gray-400">Categoria: {order.category}</p>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-start space-x-3">
                                      <Info className="h-5 w-5 text-gray-400 mt-0.5" />
                                      <div>
                                        <p className="text-sm text-gray-400">Informazioni aggiuntive</p>
                                        <p className="text-white">{order.informations}</p>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-start space-x-3">
                                      <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                                      <div>
                                        <p className="text-sm text-gray-400">Data ordine</p>
                                        <p className="text-white">{formatDate(order.created_at)}</p>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Indirizzo di consegna */}
                                <div className="space-y-4">
                                  <h3 className="text-lg font-semibold text-white mb-3">Consegna</h3>
                                  
                                  <div className="space-y-3">
                                    <div className="flex items-start space-x-3">
                                      <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                                      <div>
                                        <p className="text-sm text-gray-400">Indirizzo</p>
                                        <p className="text-white">{order.address}</p>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-start space-x-3">
                                      <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                                      <div>
                                        <p className="text-sm text-gray-400">Finestra di consegna</p>
                                        <p className="text-white">
                                          Dal {new Date(order.arrival_start).toLocaleDateString(locale)} 
                                          al {new Date(order.arrival_end).toLocaleDateString(locale)}
                                        </p>
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-start space-x-3">
                                      <Package className="h-5 w-5 text-gray-400 mt-0.5" />
                                      <div>
                                        <p className="text-sm text-gray-400">Quantità ordinata</p>
                                        <p className="text-lg font-semibold text-white">{order.amount} {formatUOM(order.uom)}</p>
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
      </div>
    </DashboardLayout>
  );
}