'use client';

import { use, useEffect, useState } from 'react';
import { useNavigation } from '@/contexts/NavigationContext';
import { useTranslations } from '@/hooks/useTranslations';
import { useDebounce } from '@/hooks/useDebounce';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Toast } from '@/components/Toast';
import { Building2, MapPin, Loader2, ArrowLeft, Globe, Calendar, Wheat, Beef, Hammer, Image as ImageIcon, X, Plus, Sparkles, Trash2, ShoppingCart, Package, Users, Unlink, UserPlus, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Translation {
  id: number;
  name: string;
  description: string;
  language_id: number;
  language_code: string;
  language_name: string;
}

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  uom: string;
  cover: string | null;
  gallery: any[];
  company_id: number;
  created_at: number;
  category: string;
}

interface Company {
  id: number;
  created_at: number;
  Location: string;
  type: string;
  name: string;
  description: string;
  cover: any;
  gallery: any[];
  translations: Translation[];
}

interface EditableCompany {
  name: string;
  description: string;
  Location: string;
  type: string;
}

interface User {
  id: string;
  created_at: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  profile: string | null;
}

export default function CompanyDetailsPage({ 
  params 
}: { 
  params: Promise<{ locale: string; id: string }> 
}) {
  const { locale, id } = use(params);
  const { t } = useTranslations(locale);
  const { goBack } = useNavigation();
  const router = useRouter();
  const [company, setCompany] = useState<Company | null>(null);
  
  // Stati per le aziende dell'utente
  const [userCompanies, setUserCompanies] = useState<any[]>([]);
  const [loadingUserCompanies, setLoadingUserCompanies] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Stati per i campi editabili
  const [editableFields, setEditableFields] = useState<EditableCompany>({
    name: '',
    description: '',
    Location: '',
    type: ''
  });
  
  // Stati per il dialog di modifica traduzione
  const [isTranslationDialogOpen, setIsTranslationDialogOpen] = useState(false);
  const [selectedTranslation, setSelectedTranslation] = useState<Translation | null>(null);
  const [translationFields, setTranslationFields] = useState({
    name: '',
    description: ''
  });
  const [isTranslationSaving, setIsTranslationSaving] = useState(false);
  
  // Stati per il dialog di aggiunta traduzione
  const [isAddTranslationDialogOpen, setIsAddTranslationDialogOpen] = useState(false);
  const [availableLanguages, setAvailableLanguages] = useState<any[]>([]);
  const [selectedLanguageId, setSelectedLanguageId] = useState<number | null>(null);
  const [isAddingTranslation, setIsAddingTranslation] = useState(false);
  const [loadingLanguages, setLoadingLanguages] = useState(false);
  
  // Stati per il dialog di eliminazione traduzione
  const [isDeleteTranslationDialogOpen, setIsDeleteTranslationDialogOpen] = useState(false);
  const [translationToDelete, setTranslationToDelete] = useState<Translation | null>(null);
  const [isDeletingTranslation, setIsDeletingTranslation] = useState(false);
  
  // Stati per i prodotti
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productsError, setProductsError] = useState<string | null>(null);
  
  // Stati per gli utenti
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [usersError, setUsersError] = useState<string | null>(null);
  
  // Stati per il dialog di scollegamento utente
  const [isUnlinkUserDialogOpen, setIsUnlinkUserDialogOpen] = useState(false);
  const [userToUnlink, setUserToUnlink] = useState<User | null>(null);
  const [isUnlinkingUser, setIsUnlinkingUser] = useState(false);
  
  // Stati per il dialog di collegamento utente
  const [isLinkUserDialogOpen, setIsLinkUserDialogOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loadingAvailableUsers, setLoadingAvailableUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isLinkingUser, setIsLinkingUser] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  
  // Stati per il dialog di aggiunta utente tramite email (per utenti non superadmin)
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailToAdd, setEmailToAdd] = useState('');
  const [isAddingByEmail, setIsAddingByEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  
  // Ottieni il ruolo dell'utente corrente
  const currentUser = JSON.parse(localStorage.getItem('auth_user') || '{}');
  const isSuperAdmin = currentUser.role === 'superadmin';

  // Carica le aziende dell'utente per determinare se mostrare il pulsante "Cambia azienda"
  useEffect(() => {
    const fetchUserCompanies = async () => {
      try {
        setLoadingUserCompanies(true);
        
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

        if (response.ok) {
          const data = await response.json();
          setUserCompanies(data || []);
        }
      } catch (err) {
        console.error('Errore nel caricamento delle aziende utente:', err);
      } finally {
        setLoadingUserCompanies(false);
      }
    };

    fetchUserCompanies();
  }, [locale, isSuperAdmin, currentUser.id]);
  
  // Stati per il dialog di aggiunta prodotto
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [newProductName, setNewProductName] = useState('');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  
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
  
  // Debounce per l'autosave
  const debouncedFields = useDebounce(editableFields, 1000);
  const debouncedTranslationFields = useDebounce(translationFields, 1000);

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        setLoading(true);
        const url = new URL('https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/company');
        url.searchParams.append('company_id', id);
        url.searchParams.append('lang', locale === 'it' ? 'it' : 'en');
        
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Errore nel recupero dei dettagli azienda');
        }

        const data = await response.json();
        if (data && data.length > 0) {
          const companyData = data[0];
          setCompany(companyData);
          setEditableFields({
            name: companyData.name || '',
            description: companyData.description || '',
            Location: companyData.Location || '',
            type: companyData.type || ''
          });
          
          // Salva l'ID dell'azienda visitata nel localStorage
          localStorage.setItem('lastVisitedCompanyId', id);
        } else {
          throw new Error('Azienda non trovata');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Errore sconosciuto');
      } finally {
        setLoading(false);
      }
    };

    fetchCompany();
  }, [id, locale]);

  // Fetch prodotti quando l'azienda viene caricata
  useEffect(() => {
    const fetchProducts = async () => {
      if (!company) return;
      
      try {
        setProductsLoading(true);
        setProductsError(null);
        
        const url = new URL('https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/product');
        url.searchParams.append('company_id', company.id.toString());
        url.searchParams.append('lang', locale);
        
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Errore nel recupero dei prodotti');
        }

        const productsData = await response.json();
        setProducts(productsData || []);
      } catch (err) {
        setProductsError(err instanceof Error ? err.message : 'Errore sconosciuto');
      } finally {
        setProductsLoading(false);
      }
    };

    fetchProducts();
  }, [company]);

  // Fetch utenti quando l'azienda viene caricata (solo per superadmin)
  useEffect(() => {
    const fetchUsers = async () => {
      if (!company || !isSuperAdmin) return;
      
      try {
        setUsersLoading(true);
        setUsersError(null);
        
        const url = new URL('https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/company_user');
        url.searchParams.append('company_id', company.id.toString());
        
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Errore nel recupero degli utenti');
        }

        const usersData = await response.json();
        setUsers(usersData || []);
      } catch (err) {
        setUsersError(err instanceof Error ? err.message : 'Errore sconosciuto');
      } finally {
        setUsersLoading(false);
      }
    };

    fetchUsers();
  }, [company, isSuperAdmin]);

  // Salvataggio automatico
  useEffect(() => {
    if (company && !isSaving) {
      const hasChanges = (
        editableFields.name !== company.name ||
        editableFields.description !== company.description ||
        editableFields.Location !== company.Location ||
        editableFields.type !== company.type
      );

      if (hasChanges) {
        saveChanges();
      }
    }
  }, [debouncedFields]);

  // Salvataggio automatico per le traduzioni
  useEffect(() => {
    if (selectedTranslation && !isTranslationSaving && isTranslationDialogOpen) {
      const hasChanges = (
        translationFields.name !== selectedTranslation.name ||
        translationFields.description !== selectedTranslation.description
      );

      if (hasChanges && translationFields.name.trim() && translationFields.description.trim()) {
        saveTranslationChanges();
      }
    }
  }, [debouncedTranslationFields]);

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

  const saveChanges = async () => {
    if (!company || isSaving) return;

    try {
      setIsSaving(true);
      
      // Trova la traduzione corrispondente alla lingua attuale
      const currentTranslation = company.translations?.find(
        translation => translation.language_code === locale
      );
      
      
      
      const payload = {
        company_id: company.id,
        name: editableFields.name,
        description: editableFields.description,
        lang: locale,
        translation_id: currentTranslation?.id || 0,
        type: editableFields.type,
        location: editableFields.Location,
        cover: null,
        gallery: []
      };
      
      

      const response = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/company/${company.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Errore nel salvataggio: ${response.status} - ${errorText}`);
      }

      // Aggiorna i dati locali
      setCompany(prev => prev ? {
        ...prev,
        name: editableFields.name,
        description: editableFields.description,
        Location: editableFields.Location,
        type: editableFields.type
      } : null);

      showToast(t('pages.companyDetail.messages.changesSavedSuccess'), 'success');
      
    } catch (error) {
      showToast(t('pages.companyDetail.messages.saveChangesError'), 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (field: keyof EditableCompany, value: string) => {
    setEditableFields(prev => ({ ...prev, [field]: value }));
  };

  const handleTranslationClick = (translation: Translation) => {
    setSelectedTranslation(translation);
    setTranslationFields({
      name: translation.name,
      description: translation.description
    });
    setIsTranslationDialogOpen(true);
  };

  const handleCloseTranslationDialog = () => {
    setIsTranslationDialogOpen(false);
    setSelectedTranslation(null);
    setTranslationFields({ name: '', description: '' });
  };

  const handleTranslationFieldChange = (field: 'name' | 'description', value: string) => {
    setTranslationFields(prev => ({ ...prev, [field]: value }));
  };

  const saveTranslationChanges = async () => {
    if (!company || !selectedTranslation || isTranslationSaving) return;

    try {
      setIsTranslationSaving(true);
      
      const payload = {
        company_id: company.id,
        name: translationFields.name,
        description: translationFields.description,
        lang: selectedTranslation.language_code,
        translation_id: selectedTranslation.id,
        type: company.type,
        location: company.Location,
        cover: null,
        gallery: []
      };

      

      const response = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/company/${company.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Errore nel salvataggio traduzione: ${response.status} - ${errorText}`);
      }

      // Aggiorna la traduzione nel company state
      setCompany(prev => prev ? {
        ...prev,
        translations: prev.translations.map(t => 
          t.id === selectedTranslation.id 
            ? { ...t, name: translationFields.name, description: translationFields.description }
            : t
        )
      } : null);

      // Se sto modificando la traduzione della lingua attuale, aggiorna anche i campi principali
      if (selectedTranslation.language_code === locale) {
        setEditableFields(prev => ({
          ...prev,
          name: translationFields.name,
          description: translationFields.description
        }));
        
        // Aggiorna anche il company state con i nuovi valori principali
        setCompany(prev => prev ? {
          ...prev,
          name: translationFields.name,
          description: translationFields.description
        } : null);
      }

      // Aggiorna anche la traduzione selezionata
      setSelectedTranslation(prev => prev ? {
        ...prev,
        name: translationFields.name,
        description: translationFields.description
      } : null);

      showToast(t('pages.companyDetail.messages.translationSavedSuccess'), 'success');
      
    } catch (error) {
      console.error('Errore nel salvataggio traduzione:', error);
      showToast(t('pages.companyDetail.messages.translationSaveError'), 'error');
    } finally {
      setIsTranslationSaving(false);
    }
  };

  const handleAddTranslationClick = async () => {
    setLoadingLanguages(true);
    try {
      const response = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/language', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Errore nel caricamento delle lingue');
      }

      const languages = await response.json();
      
      // Filtra le lingue già presenti nelle traduzioni
      const existingLanguageCodes = company?.translations?.map(t => t.language_code) || [];
      const filteredLanguages = languages.filter((lang: any) => 
        !existingLanguageCodes.includes(lang.language_code)
      );
      
      setAvailableLanguages(filteredLanguages);
      setIsAddTranslationDialogOpen(true);
      
    } catch (error) {
      console.error('Errore nel caricamento delle lingue:', error);
      showToast(t('pages.companyDetail.messages.languagesLoadError'), 'error');
    } finally {
      setLoadingLanguages(false);
    }
  };

  const handleCloseAddTranslationDialog = () => {
    setIsAddTranslationDialogOpen(false);
    setSelectedLanguageId(null);
    setAvailableLanguages([]);
  };

  const createTranslation = async () => {
    if (!selectedLanguageId || !company || isAddingTranslation) return;

    try {
      setIsAddingTranslation(true);
      
      const payload = {
        name: "",
        description: "",
        language_id: selectedLanguageId,
        company_id: company.id
      };

      

      const response = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/company_translation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Errore nella creazione traduzione: ${response.status} - ${errorText}`);
      }

              const newTranslation = await response.json();
      
      // Trova la lingua selezionata per ottenere le informazioni complete
      const selectedLanguage = availableLanguages.find(lang => lang.id === selectedLanguageId);
      
      // Crea l'oggetto traduzione completo
      const translationToAdd: Translation = {
        id: newTranslation.id,
        name: "",
        description: "",
        language_id: selectedLanguageId,
        language_code: selectedLanguage?.language_code || "",
        language_name: selectedLanguage?.language_name || ""
      };

      // Aggiunge la nuova traduzione alla lista
      setCompany(prev => prev ? {
        ...prev,
        translations: [...prev.translations, translationToAdd]
      } : null);
      
      // Chiudi il dialog
      handleCloseAddTranslationDialog();
      
      showToast(t('pages.companyDetail.messages.translationCreatedSuccess'), 'success');
      
    } catch (error) {
      console.error('Errore nella creazione traduzione:', error);
      showToast(t('pages.companyDetail.messages.translationCreateError'), 'error');
    } finally {
      setIsAddingTranslation(false);
    }
  };

  const handleDeleteTranslationClick = (e: React.MouseEvent, translation: Translation) => {
    e.stopPropagation();
    setTranslationToDelete(translation);
    setIsDeleteTranslationDialogOpen(true);
  };

  const handleCloseDeleteTranslationDialog = () => {
    setIsDeleteTranslationDialogOpen(false);
    setTranslationToDelete(null);
  };

  const deleteTranslation = async () => {
    if (!translationToDelete || isDeletingTranslation) return;

    try {
      setIsDeletingTranslation(true);
      
      const response = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/company_translation/${translationToDelete.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Errore nell\'eliminazione della traduzione');
      }

      // Rimuovi la traduzione dalla lista
      setCompany(prevCompany => {
        if (!prevCompany) return prevCompany;
        
        return {
          ...prevCompany,
          translations: prevCompany.translations.filter(t => t.id !== translationToDelete.id)
        };
      });
      
      // Chiudi il dialog
      setIsDeleteTranslationDialogOpen(false);
      setTranslationToDelete(null);
      
      showToast(t('pages.companyDetail.messages.translationDeletedSuccess'), 'success');
      
    } catch (error) {
      console.error('Errore nell\'eliminazione della traduzione:', error);
      showToast(t('pages.companyDetail.messages.translationDeleteError'), 'error');
    } finally {
      setIsDeletingTranslation(false);
    }
  };

  // Funzioni per la gestione dei prodotti
  const handleAddProductClick = () => {
    setIsAddProductDialogOpen(true);
    setNewProductName('');
    setProductsError(null);
  };

  const handleCloseProductDialog = () => {
    setIsAddProductDialogOpen(false);
    setNewProductName('');
  };

  const handleUnlinkUserClick = (e: React.MouseEvent, user: User) => {
    e.preventDefault();
    e.stopPropagation();
    setUserToUnlink(user);
    setIsUnlinkUserDialogOpen(true);
  };

  const handleCloseUnlinkUserDialog = () => {
    setIsUnlinkUserDialogOpen(false);
    setUserToUnlink(null);
  };

  const unlinkUser = async () => {
    if (!userToUnlink || !company || isUnlinkingUser) return;
    
    try {
      setIsUnlinkingUser(true);
      const response = await fetch(`https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/user_company/${userToUnlink.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company_id: company.id,
          user_id: userToUnlink.id
        })
      });

      if (!response.ok) {
        throw new Error('Errore nello scollegamento dell\'utente');
      }

      // Rimuovi l'utente dalla lista
      setUsers(prevUsers => 
        prevUsers.filter(user => user.id !== userToUnlink.id)
      );
      
      // Chiudi il dialog
      setIsUnlinkUserDialogOpen(false);
      setUserToUnlink(null);
      
      // Mostra messaggio di successo
      showToast(t('pages.companyDetail.messages.userUnlinkedSuccess'), 'success');
      
    } catch (err) {
      setUsersError(err instanceof Error ? err.message : t('common.unknownError'));
      showToast(t('pages.companyDetail.messages.userUnlinkError'), 'error');
    } finally {
      setIsUnlinkingUser(false);
    }
  };

  const handleLinkUserClick = async () => {
    // Se è superadmin, usa il modal esistente con lista utenti
    if (isSuperAdmin) {
      try {
        setLoadingAvailableUsers(true);
        setIsLinkUserDialogOpen(true);
        
        const response = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/user', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error('Errore nel recupero degli utenti disponibili');
        }

        const allUsers = await response.json();
        
        // Filtra gli utenti già collegati all'azienda
        const currentUserIds = users.map(u => u.id);
        const availableUsersFiltered = allUsers.filter((user: User) => 
          !currentUserIds.includes(user.id)
        );
        
        setAvailableUsers(availableUsersFiltered);
        setFilteredUsers(availableUsersFiltered);
        
      } catch (err) {
        setUsersError(err instanceof Error ? err.message : t('common.unknownError'));
        showToast(t('pages.companyDetail.messages.usersLoadError'), 'error');
      } finally {
        setLoadingAvailableUsers(false);
      }
    } else {
      // Se non è superadmin, apri il modal per inserire email
      setIsEmailDialogOpen(true);
      setEmailToAdd('');
      setEmailError(null);
    }
  };

  const handleCloseLinkUserDialog = () => {
    setIsLinkUserDialogOpen(false);
    setAvailableUsers([]);
    setFilteredUsers([]);
    setSelectedUserId(null);
    setUserSearchQuery('');
  };

  const handleCloseEmailDialog = () => {
    setIsEmailDialogOpen(false);
    setEmailToAdd('');
    setEmailError(null);
  };

  const handleAddUserByEmail = async () => {
    if (!emailToAdd.trim() || !company || isAddingByEmail) return;
    
    try {
      setIsAddingByEmail(true);
      setEmailError(null);
      
      // Prima cerca l'utente tramite email
      const response = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/user', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error('Errore nel recupero degli utenti');
      }

      const allUsers = await response.json();
      
      // Cerca l'utente con l'email specificata
      const userToAdd = allUsers.find((user: User) => 
        user.email && user.email.toLowerCase() === emailToAdd.trim().toLowerCase()
      );
      
      if (!userToAdd) {
        setEmailError(t('pages.companyDetail.addCollaborator.noUserFound'));
        return;
      }
      
      // Verifica che l'utente non sia già collegato all'azienda
      const isAlreadyLinked = users.some(user => user.id === userToAdd.id);
      if (isAlreadyLinked) {
        setEmailError(t('pages.companyDetail.messages.userAlreadyLinked'));
        return;
      }
      
      // Collega l'utente all'azienda usando l'API esistente
      const linkResponse = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/user_company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userToAdd.id,
          company_id: company.id
        })
      });

      if (!linkResponse.ok) {
        throw new Error('Errore nel collegamento dell\'utente');
      }

      // Aggiungi l'utente alla lista degli utenti collegati
      setUsers(prevUsers => [userToAdd, ...prevUsers]);
      
      // Chiudi il dialog
      handleCloseEmailDialog();
      
      // Mostra messaggio di successo
      showToast(t('pages.companyDetail.messages.userLinkedByNameSuccess', userToAdd.name), 'success');
      
    } catch (err) {
      setEmailError(err instanceof Error ? err.message : t('common.unknownError'));
    } finally {
      setIsAddingByEmail(false);
    }
  };

  const handleUserSearch = (query: string) => {
    setUserSearchQuery(query);
    if (query.trim() === '') {
      setFilteredUsers(availableUsers);
    } else {
      const filtered = availableUsers.filter(user => 
        user.name.toLowerCase().includes(query.toLowerCase()) ||
        user.email?.toLowerCase().includes(query.toLowerCase()) ||
        user.role.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredUsers(filtered);
    }
  };

  const linkUser = async () => {
    if (!selectedUserId || !company || isLinkingUser) return;
    
    try {
      setIsLinkingUser(true);
      const response = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/user_company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: selectedUserId,
          company_id: company.id
        })
      });

      if (!response.ok) {
        throw new Error('Errore nel collegamento dell\'utente');
      }

      // Trova l'utente selezionato e aggiungilo alla lista degli utenti collegati
      const selectedUser = availableUsers.find(user => user.id === selectedUserId);
      if (selectedUser) {
        setUsers(prevUsers => [selectedUser, ...prevUsers]);
      }
      
      // Chiudi il dialog
      handleCloseLinkUserDialog();
      
      // Mostra messaggio di successo
      showToast(t('pages.companyDetail.messages.userLinkedSuccess'), 'success');
      
    } catch (err) {
      setUsersError(err instanceof Error ? err.message : t('common.unknownError'));
      showToast(t('pages.companyDetail.messages.userLinkError'), 'error');
    } finally {
      setIsLinkingUser(false);
    }
  };

  const getCurrentLanguageId = (): number => {
    // Cerca l'ID lingua dalle traduzioni esistenti
    const currentTranslation = company?.translations?.find(
      translation => translation.language_code === locale
    );
    
    if (currentTranslation) {
      return currentTranslation.language_id;
    }
    
    // Fallback mapping statico se non trovato nelle traduzioni
    const languageMap: { [key: string]: number } = {
      'it': 1,
      'en': 2,
      'fr': 3,
      'es': 4
    };
    
    return languageMap[locale] || 1;
  };

  const createProduct = async () => {
    if (!newProductName || !newProductName.trim() || !company || isAddingProduct) return;
    
    try {
      setIsAddingProduct(true);
      setProductsError(null);
      
      const payload = {
        name: newProductName ? newProductName.trim() : "",
        description: "",
        lang: locale,
        cover: null,
        gallery: [],
        price: 0,
        uom: "",
        company_id: company.id
      };

      

      const response = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Errore nella creazione del prodotto: ${response.status} - ${errorText}`);
      }

              const newProduct = await response.json();
      
      // Mappa il prodotto per assicurarsi che abbia tutti i campi necessari
      const mappedProduct: Product = {
        id: newProduct.id,
        name: (newProduct.name && newProduct.name.trim()) || (newProductName ? newProductName.trim() : ""),
        description: newProduct.description || "",
        price: newProduct.price || 0,
        uom: newProduct.uom || "",
        cover: newProduct.cover || null,
        gallery: newProduct.gallery || [],
        company_id: company.id,
        created_at: newProduct.created_at || Date.now(),
        category: newProduct.category || ""
      };
      
      // Aggiungi il nuovo prodotto alla lista
      setProducts(prevProducts => [mappedProduct, ...prevProducts]);
      
      // Chiudi il dialog
      handleCloseProductDialog();
      
      showToast(t('pages.companyDetail.messages.productCreatedSuccess'), 'success');
      
    } catch (err) {
      setProductsError(err instanceof Error ? err.message : t('common.unknownError'));
      showToast(t('pages.companyDetail.messages.productCreateError'), 'error');
    } finally {
      setIsAddingProduct(false);
    }
  };

  const getImageUrl = (image: any): string | null => {
    if (!image) return null;
    
    if (typeof image === 'string') {
      return image;
    }
    
    if (typeof image === 'object' && image.url) {
      return image.url;
    }
    
    return null;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('it-IT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getCompanyTypeIcon = (type: string) => {
    switch (type) {
      case 'agriculture':
        return <Wheat className="h-4 w-4 text-green-800" />;
      case 'artisanal':
        return <Hammer className="h-4 w-4 text-orange-800" />;
      case 'livestock':
        return <Beef className="h-4 w-4 text-red-800" />;
      default:
        return <Building2 className="h-4 w-4 text-gray-800" />;
    }
  };

  const getCompanyTypeStyles = (type: string) => {
    switch (type) {
      case 'agriculture':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'artisanal':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'livestock':
        return 'bg-red-100 border-red-300 text-red-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  const getCompanyTypeTextColor = (type: string) => {
    switch (type) {
      case 'agriculture':
        return 'text-green-800';
      case 'artisanal':
        return 'text-orange-800';
      case 'livestock':
        return 'text-red-800';
      default:
        return 'text-gray-800';
    }
  };

  const getProductCategoryStyles = (category: string) => {
    switch (category.toLowerCase()) {
      case 'fruit':
      case 'frutta':
        return 'bg-red-900/20 border-red-600/30 text-red-400';
      case 'vegetable':
      case 'verdura':
        return 'bg-green-900/20 border-green-600/30 text-green-400';
      case 'dairy':
      case 'latticini':
        return 'bg-blue-900/20 border-blue-600/30 text-blue-400';
      case 'meat':
      case 'carne':
        return 'bg-red-900/20 border-red-600/30 text-red-400';
      case 'grain':
      case 'cereali':
        return 'bg-yellow-900/20 border-yellow-600/30 text-yellow-400';
      case 'beverage':
      case 'bevande':
        return 'bg-purple-900/20 border-purple-600/30 text-purple-400';
      case 'bakery':
      case 'panetteria':
        return 'bg-orange-900/20 border-orange-600/30 text-orange-400';
      default:
        return 'bg-gray-800/50 border-gray-600/30 text-gray-400';
    }
  };

  const getRoleStyles = (role: string) => {
    switch (role.toLowerCase()) {
      case 'superadmin':
        return 'bg-purple-900/20 border-purple-600/30 text-purple-400';
      case 'admin':
        return 'bg-blue-900/20 border-blue-600/30 text-blue-400';
      case 'manager':
        return 'bg-green-900/20 border-green-600/30 text-green-400';
      case 'user':
        return 'bg-gray-900/20 border-gray-600/30 text-gray-400';
      default:
        return 'bg-gray-800/50 border-gray-600/30 text-gray-400';
    }
  };


  if (error) {
    return (
      <DashboardLayout locale={locale}>
        <div className="p-8">
          <div className="mb-6">
            <button
              onClick={() => goBack()}
              className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t('pages.companyDetail.back')}</span>
            </button>
          </div>
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-6">
            <div className="flex items-center space-x-3">
              <div className="text-red-400">
                <Building2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-red-300 font-semibold text-lg">Errore</h3>
                <p className="text-red-200">{error}</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!company) {
    return null;
  }

  return (
    <DashboardLayout locale={locale}>
      <div className="p-8">
        {/* Header con breadcrumb */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => goBack()}
              className="inline-flex items-center space-x-2 text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>{t('pages.companyDetail.back')}</span>
            </button>
            
            <div className="flex items-center space-x-4">
              {/* Indicatore di salvataggio */}
              {isSaving && (
                <div className="flex items-center space-x-2 text-sm text-blue-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t('pages.companyDetail.saving')}</span>
                </div>
              )}
              
              {/* Pulsante Cambia azienda - mostrato solo se l'utente ha più di una azienda */}
              {userCompanies.length > 1 && (
                <button
                  onClick={() => {
                    localStorage.removeItem('lastVisitedCompanyId');
                    router.push(`/${locale}/companies`);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  {t('pages.companyDetail.changeCompany')}
                </button>
              )}
            </div>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <div className="flex items-start space-x-6">
              {/* Cover Image */}
              <div className="relative">
                {company.cover && getImageUrl(company.cover) ? (
                  <div className="relative">
                    <img
                      src={getImageUrl(company.cover)!}
                      alt="Cover azienda"
                      className="w-32 h-32 object-cover rounded-xl"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden w-32 h-32 bg-gray-700 rounded-xl flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-gray-700 rounded-xl flex items-center justify-center">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>

              {/* Company Info */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-lg font-mono text-gray-400 bg-gray-800 px-3 py-1 rounded-lg">
                    {t('common.id')}: {company.id}
                  </span>
                  <input
                    type="text"
                    value={editableFields.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    className="text-3xl font-bold text-white bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 flex-1"
                    placeholder={t('pages.companyDetail.fields.companyName')}
                  />
                </div>
                <div className="mt-2 mb-3 flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={editableFields.Location}
                    onChange={(e) => handleFieldChange('Location', e.target.value)}
                    className="text-lg text-gray-300 bg-transparent border-none outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 flex-1"
                    placeholder={t('pages.companyDetail.fields.location')}
                  />
                </div>
                <div className="relative inline-block group">
                  <select
                    value={editableFields.type}
                    onChange={(e) => handleFieldChange('type', e.target.value)}
                    className={`appearance-none text-sm font-medium rounded-full pl-4 pr-12 py-1 border transition-colors hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${getCompanyTypeStyles(editableFields.type)}`}
                  >
                    <option value="agriculture" className="bg-white text-gray-900">
                      {t('pages.companyDetail.companyTypes.agriculture')}
                    </option>
                    <option value="artisanal" className="bg-white text-gray-900">
                      {t('pages.companyDetail.companyTypes.artisanal')}
                    </option>
                    <option value="livestock" className="bg-white text-gray-900">
                      {t('pages.companyDetail.companyTypes.livestock')}
                    </option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <div className="flex items-center space-x-1">
                      {getCompanyTypeIcon(editableFields.type)}
                      <svg className={`h-4 w-4 ${getCompanyTypeTextColor(editableFields.type)} transition-colors`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Informazioni principali */}
          <div className="space-y-6">
            {/* Descrizione */}
            <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-6">
              <h2 className="text-xl font-semibold text-white mb-4">
                {t('pages.companyDetail.fields.description')}
              </h2>
              <textarea
                value={editableFields.description}
                onChange={(e) => handleFieldChange('description', e.target.value)}
                className="w-full h-32 text-gray-300 bg-gray-800 border border-gray-700 rounded-lg p-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                placeholder={t('pages.companyDetail.fields.descriptionPlaceholder')}
              />
            </div>

            {/* Galleria */}
            <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-6">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center space-x-2">
                <ImageIcon className="h-5 w-5" />
                <span>{t('pages.companyDetail.gallery.title')}</span>
              </h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {/* Immagini esistenti */}
                {company.gallery && company.gallery.length > 0 ? (
                  company.gallery
                    .filter(image => getImageUrl(image))
                    .map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={getImageUrl(image)!}
                        alt={`Galleria ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="hidden w-full h-24 bg-gray-700 rounded-lg flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-gray-400">
                    <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>{t('pages.companyDetail.gallery.noImages')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Traduzioni */}
            <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>{t('pages.companyDetail.translations.title')}</span>
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={handleAddTranslationClick}
                    disabled={false}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    title={t('pages.companyDetail.translations.addManually')}
                  >
                    <Plus className="h-4 w-4" />
                    <span>{t('pages.companyDetail.translations.add')}</span>
                  </button>
                  <button
                    type="button"
                    className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm"
                    title={t('pages.companyDetail.translations.addWithAI')}
                  >
                    <Sparkles className="h-4 w-4" />
                    <span>{t('pages.companyDetail.translations.addWithAI')}</span>
                  </button>
                </div>
              </div>
              
              {company.translations && company.translations.length > 0 ? (
                <div className="space-y-4">
                  {company.translations.map((translation, index) => (
                    <div 
                      key={index} 
                      className="bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-gray-600 hover:bg-gray-800/80 cursor-pointer transition-all duration-200 group"
                      onClick={() => handleTranslationClick(translation)}
                      title={t('pages.companyDetail.translations.clickToEdit')}
                    >
                      <div className="flex items-start justify-between">
                        {/* Header con ID e Lingua */}
                        <div className="flex items-center space-x-4">
                          <span className="text-gray-500 text-xs font-mono bg-gray-900 px-2 py-1 rounded">
                            {t('common.id')}: {translation.id}
                          </span>
                          <div className="flex items-center space-x-2">
                            <img 
                              src={`https://flagcdn.com/w40/${translation.language_code === 'en' ? 'us' : translation.language_code}.png`} 
                              alt={`Bandiera ${translation.language_name}`}
                              className="w-6 h-4 object-cover rounded-sm"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                            <span className="text-xl hidden">
                              {translation.language_code === 'it' ? '🇮🇹' : 
                               translation.language_code === 'en' ? '🇺🇸' : 
                               translation.language_code === 'fr' ? '🇫🇷' : 
                               translation.language_code === 'es' ? '🇪🇸' : '🌐'}
                            </span>
                            <span className="text-white font-medium">{translation.language_name}</span>
                            <span className="text-gray-400 text-sm">({translation.language_code})</span>
                          </div>
                        </div>
                        
                        {/* Icone di modifica ed eliminazione */}
                        <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Globe className="h-4 w-4 text-gray-400" />
                          <button
                            onClick={(e) => handleDeleteTranslationClick(e, translation)}
                            className="bg-red-600/60 hover:bg-red-600/80 text-white p-1.5 rounded-lg transition-colors shadow-lg"
                            title={t('pages.companyDetail.translations.deleteTranslation')}
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                      
                      {/* Contenuto */}
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Nome */}
                        <div>
                          <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{t('pages.companyDetail.translationFields.name')}</h4>
                          {translation.name && translation.name.trim() ? (
                            <p className="text-gray-200 text-sm">{translation.name}</p>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <X className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-500 text-sm italic">{t('pages.companyDetail.translationFields.notCompiled')}</span>
                            </div>
                          )}
                        </div>
                        
                        {/* Descrizione */}
                        <div>
                          <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{t('pages.companyDetail.translationFields.description')}</h4>
                          {translation.description && translation.description.trim() ? (
                            <p className="text-gray-200 text-sm line-clamp-2">{translation.description}</p>
                          ) : (
                            <div className="flex items-center space-x-2">
                              <X className="h-4 w-4 text-gray-500" />
                              <span className="text-gray-500 text-sm italic">{t('pages.companyDetail.translationFields.notCompiledDesc')}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">{t('pages.companyDetail.noTranslations')}</p>
              )}
            </div>

            {/* Prodotti */}
            <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                  <Package className="h-5 w-5" />
                  <span>{t('pages.companyDetail.products.title')}</span>
                </h2>
                <button
                  type="button"
                  onClick={handleAddProductClick}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm"
                  title={t('pages.companyDetail.products.addNewProduct')}
                >
                  <Plus className="h-4 w-4" />
                  <span>{t('pages.companyDetail.products.addProduct')}</span>
                </button>
              </div>
              


              {productsError && (
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="text-red-400">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-red-300 font-semibold">Errore</h3>
                      <p className="text-red-200">{productsError}</p>
                    </div>
                  </div>
                </div>
              )}

              {!productsError && products.length === 0 && (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400 mb-4">{t('pages.companyDetail.products.noProducts')}</p>
                  <button
                    type="button"
                    onClick={handleAddProductClick}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors mx-auto"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{t('pages.companyDetail.products.addFirstProduct')}</span>
                  </button>
                </div>
              )}

              {!productsError && products.length > 0 && (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => (
                    <div
                      key={product.id}
                      className="group relative bg-gray-900 rounded-xl shadow-sm border border-gray-800 hover:border-gray-700 transition-colors overflow-hidden aspect-square flex flex-col"
                    >
                      {/* Immagine del prodotto - 3/4 dell'altezza */}
                      <div className="flex-1 relative bg-gray-800">
                        {product.cover ? (
                          <img 
                            src={product.cover} 
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-12 w-12 text-gray-400" />
                          </div>
                        )}
                        
                        {/* ID del prodotto in alto a sinistra */}
                        <div className="absolute top-2 left-2 z-10">
                          <span className="bg-gray-900/90 text-gray-300 text-xs px-2 py-1 rounded font-mono backdrop-blur-sm">
                            {t('common.id')}: {product.id}
                          </span>
                        </div>
                        
                        {/* Prezzo in overlay se presente */}
                        {product.price > 0 && (
                          <div className="absolute top-2 right-2 z-10">
                            <span className="bg-green-600/90 text-white text-xs px-2 py-1 rounded-full font-medium backdrop-blur-sm">
                              €{product.price.toFixed(2)}
                              {product.uom && typeof product.uom === 'string' && product.uom.trim() && ` per ${product.uom}`}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Informazioni prodotto - 1/4 dell'altezza */}
                      <div className="p-4 flex flex-col justify-center min-h-0">
                        <h3 className="text-lg font-semibold text-white truncate mb-1">
                          {(product.name && product.name.trim()) || t('pages.companyDetail.products.productNumber', product.id)}
                        </h3>
                        
                        {/* Categoria prodotto */}
                        {product.category && typeof product.category === 'string' && product.category.trim() && (
                          <div className={`inline-flex items-center text-xs font-medium rounded-full px-2 py-1 border self-start ${getProductCategoryStyles(product.category)}`}>
                            <span>{product.category}</span>
                          </div>
                        )}
                      </div>

                      {/* Overlay per il link */}
                      <Link 
                        href={`/${locale}/products/${product.id}`}
                        className="absolute inset-0 z-20"
                        title={t('pages.companyDetail.products.viewProductDetails', (product.name && product.name.trim()) || t('pages.companyDetail.products.productNumber', product.id))}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Utenti - visibile solo ai superadmin */}
            {isSuperAdmin && (
              <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>{t('pages.companyDetail.users.title')}</span>
                  </h2>
                  <div className="flex items-center space-x-3">
                    {usersLoading && (
                      <div className="flex items-center space-x-2 text-sm text-blue-400">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{t('pages.companyDetail.users.loading')}</span>
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={handleLinkUserClick}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors text-sm"
                      title={t('pages.companyDetail.users.linkNewCollaborator')}
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>{t('pages.companyDetail.users.linkCollaborator')}</span>
                    </button>
                  </div>
                </div>

                {usersError && (
                  <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <div className="text-red-400">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-red-300 font-semibold">Errore</h3>
                        <p className="text-red-200">{usersError}</p>
                      </div>
                    </div>
                  </div>
                )}

                {!usersError && users.length === 0 && !usersLoading && (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-400">{t('pages.companyDetail.users.noUsers')}</p>
                  </div>
                )}

                {!usersError && users.length > 0 && (
                  <div className="space-y-4">
                    {users.map((user) => (
                      <div
                        key={user.id}
                        className="group relative bg-gray-800 border border-gray-700 rounded-xl p-4 hover:border-gray-600 hover:bg-gray-800/80 transition-all duration-200 cursor-pointer"
                      >
                        <div className="flex items-start justify-between">
                          {/* Header con ID e Nome */}
                          <div className="flex items-center space-x-4">
                            <span className="text-gray-500 text-xs font-mono bg-gray-900 px-2 py-1 rounded">
                              #{user.id.substring(0, 8)}...
                            </span>
                            <div className="flex items-center space-x-2">
                              <span className="text-white font-medium">{user.name}</span>
                              <div className={`inline-flex items-center text-xs font-medium rounded-full px-2 py-1 border ${getRoleStyles(user.role)}`}>
                                <span className="capitalize">{user.role}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Data di creazione e pulsante scollegamento */}
                          <div className="flex items-center space-x-3">
                            <div className="text-xs text-gray-400">
                              {formatDate(user.created_at)}
                            </div>
                            
                            {/* Pulsante di scollegamento - visibile solo al hover */}
                            <button
                              onClick={(e) => handleUnlinkUserClick(e, user)}
                              className="opacity-0 group-hover:opacity-100 bg-red-600/60 hover:bg-red-600/80 text-white p-2 rounded-lg transition-all duration-200 shadow-lg z-20 relative"
                              title={t('pages.companyDetail.users.unlinkUser')}
                            >
                              <Unlink className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Contenuto */}
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {/* Email */}
                          <div>
                            <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{t('common.email')}</h4>
                            <p className="text-gray-200 text-sm">{user.email}</p>
                          </div>
                          
                          {/* Telefono */}
                          <div>
                            <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{t('common.phone')}</h4>
                            <p className="text-gray-200 text-sm">{user.phone || t('common.notSpecified')}</p>
                          </div>
                          
                          {/* Indirizzo */}
                          <div>
                            <h4 className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">{t('common.address')}</h4>
                            <p className="text-gray-200 text-sm">{user.address || t('common.notSpecified')}</p>
                          </div>
                        </div>
                        
                        {/* Overlay per il link */}
                        <Link 
                          href={`/${locale}/users/${user.id}`}
                          className="absolute inset-0 z-10"
                          title={t('pages.companyDetail.users.viewUserDetails', user.name)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Dettagli tecnici */}
            <div className="bg-gray-900 rounded-xl shadow-sm border border-gray-800 p-6">
              <h2 className="text-xl font-semibold text-white mb-6">
                {t('pages.companyDetail.sections.technicalDetails')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Data di creazione */}
                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-indigo-400 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-gray-400">{t('pages.companyDetail.fields.createdAt')}</p>
                    <p className="text-white">{formatDate(company.created_at)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog di modifica traduzione */}
      {isTranslationDialogOpen && selectedTranslation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-2xl">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <Globe className="h-6 w-6 text-blue-400" />
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    Modifica Traduzione
                  </h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <img 
                      src={`https://flagcdn.com/w40/${selectedTranslation.language_code === 'en' ? 'us' : selectedTranslation.language_code}.png`} 
                      alt={`Bandiera ${selectedTranslation.language_name}`}
                      className="w-5 h-3 object-cover rounded-sm"
                    />
                    <span className="text-sm text-gray-400">{selectedTranslation.language_name}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {isTranslationSaving && (
                  <div className="flex items-center space-x-2 text-sm text-blue-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t('pages.companyDetail.saving')}</span>
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleCloseTranslationDialog}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div>
                <label htmlFor="translation-name" className="block text-sm font-medium text-white mb-2">
                  Nome (in {selectedTranslation.language_name})
                </label>
                <input
                  id="translation-name"
                  type="text"
                  value={translationFields.name}
                  onChange={(e) => handleTranslationFieldChange('name', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder={`Nome dell'azienda in ${selectedTranslation.language_name}...`}
                />
              </div>
              
              <div>
                <label htmlFor="translation-description" className="block text-sm font-medium text-white mb-2">
                  Descrizione (in {selectedTranslation.language_name})
                </label>
                <textarea
                  id="translation-description"
                  value={translationFields.description}
                  onChange={(e) => handleTranslationFieldChange('description', e.target.value)}
                  className="w-full h-32 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder={`Descrizione dell'azienda in ${selectedTranslation.language_name}...`}
                />
              </div>
              
              <div className="text-sm text-gray-400">
                💡 Le modifiche vengono salvate automaticamente mentre scrivi
              </div>
            </div>
          </div>
                 </div>
       )}

      {/* Dialog di aggiunta traduzione */}
      {isAddTranslationDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <Globe className="h-6 w-6 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">
                  {t('pages.companyDetail.translations.addManually')}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleCloseAddTranslationDialog}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6">
              <div className="mb-6">
                <label htmlFor="language-select" className="block text-sm font-medium text-white mb-3">
                  {t('pages.companyDetail.translations.selectLanguage')}
                </label>
                {loadingLanguages ? (
                  <div className="text-center py-8 text-gray-400">
                    <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                    <p>{t('common.loading')}</p>
                  </div>
                ) : availableLanguages.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Globe className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>{t('pages.companyDetail.translations.allLanguagesUsed')}</p>
                  </div>
                ) : (
                  <select
                    id="language-select"
                    value={selectedLanguageId || ''}
                    onChange={e => setSelectedLanguageId(Number(e.target.value))}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="" disabled>{t('pages.companyDetail.translations.selectLanguage')}</option>
                    {availableLanguages.map(lang => (
                      <option key={lang.id} value={lang.id}>{lang.language_name}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseAddTranslationDialog}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  disabled={isAddingTranslation}
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="button"
                  onClick={createTranslation}
                  disabled={!selectedLanguageId || isAddingTranslation}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingTranslation ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t('pages.companyDetail.translations.creating')}</span>
                    </>
                  ) : (
                    <span>{t('pages.companyDetail.translations.add')}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dialog di eliminazione traduzione */}
      {isDeleteTranslationDialogOpen && translationToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <Trash2 className="h-6 w-6 text-red-400" />
                <h2 className="text-xl font-semibold text-white">
                  Elimina Traduzione
                </h2>
              </div>
              <button
                type="button"
                onClick={handleCloseDeleteTranslationDialog}
                className="text-gray-400 hover:text-white transition-colors"
                disabled={isDeletingTranslation}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <div className="flex items-center space-x-3 mb-4">
                  <img 
                    src={`https://flagcdn.com/w40/${translationToDelete.language_code === 'en' ? 'us' : translationToDelete.language_code}.png`} 
                    alt={`Bandiera ${translationToDelete.language_name}`}
                    className="w-6 h-4 object-cover rounded-sm"
                  />
                  <span className="text-white font-medium">{translationToDelete.language_name}</span>
                </div>
                <p className="text-gray-300 mb-4">
                  {t('pages.companyDetail.dialogs.deleteTranslation.message')}
                </p>
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                  <h4 className="text-red-300 font-medium mb-2">{t('pages.companyDetail.dialogs.deleteTranslation.contentToDelete')}</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-red-400">{t('pages.companyDetail.dialogs.deleteTranslation.name')}</span> 
                      <span className="text-red-200 ml-2">
                        {translationToDelete.name || t('pages.companyDetail.translationFields.notCompiled')}
                      </span>
                    </div>
                    <div>
                      <span className="text-red-400">{t('pages.companyDetail.dialogs.deleteTranslation.description')}</span> 
                      <span className="text-red-200 ml-2">
                        {translationToDelete.description || t('pages.companyDetail.translationFields.notCompiledDesc')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseDeleteTranslationDialog}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  disabled={isDeletingTranslation}
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={deleteTranslation}
                  disabled={isDeletingTranslation}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeletingTranslation ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t('pages.companyDetail.dialogs.deleteTranslation.deleting')}</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      <span>Elimina</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dialog di aggiunta prodotto */}
      {isAddProductDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <Package className="h-6 w-6 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">
                  {t('pages.companyDetail.dialogs.addProduct.title')}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleCloseProductDialog}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <label htmlFor="product-name" className="block text-sm font-medium text-white mb-2">
                  {t('pages.companyDetail.dialogs.addProduct.productName')}
                </label>
                <input
                  id="product-name"
                  type="text"
                  value={newProductName}
                  onChange={(e) => setNewProductName(e.target.value)}
                  placeholder={t('pages.companyDetail.dialogs.addProduct.enterProductName')}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isAddingProduct}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newProductName.trim()) {
                      createProduct();
                    }
                  }}
                />
              </div>

              {productsError && (
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 mb-4">
                  <p className="text-red-200 text-sm">{productsError}</p>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseProductDialog}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  disabled={isAddingProduct}
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={createProduct}
                  disabled={!newProductName.trim() || isAddingProduct}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingProduct ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Creazione...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      <span>Aggiungi</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Dialog di scollegamento utente */}
      {isUnlinkUserDialogOpen && userToUnlink && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <Unlink className="h-6 w-6 text-red-400" />
                <h2 className="text-xl font-semibold text-white">
                  Scollega Utente
                </h2>
              </div>
              <button
                type="button"
                onClick={handleCloseUnlinkUserDialog}
                className="text-gray-400 hover:text-white transition-colors"
                disabled={isUnlinkingUser}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
                         <div className="p-6">
               <div className="mb-6">
                 <div className="mb-4">
                   <div className="flex items-center space-x-3 mb-2">
                     <span className="text-white font-medium text-lg">{userToUnlink.name}</span>
                     <div className={`inline-flex items-center text-xs font-medium rounded-full px-2 py-1 border ${getRoleStyles(userToUnlink.role)}`}>
                       <span className="capitalize">{userToUnlink.role}</span>
                     </div>
                   </div>
                   <p className="text-gray-400 text-sm">{userToUnlink.email}</p>
                 </div>
                 <p className="text-gray-300 mb-4">
                   {t('pages.companyDetail.dialogs.unlinkUserMessage')}
                 </p>
                 <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
                   <p className="text-red-200 text-sm">
                     <strong>Attenzione:</strong> {t('pages.companyDetail.dialogs.unlinkUserWarning')}
                   </p>
                 </div>
               </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseUnlinkUserDialog}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  disabled={isUnlinkingUser}
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={unlinkUser}
                  disabled={isUnlinkingUser}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUnlinkingUser ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t('pages.companyDetail.dialogs.unlinking')}</span>
                    </>
                  ) : (
                    <>
                      <Unlink className="h-4 w-4" />
                      <span>{t('pages.companyDetail.dialogs.unlink')}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

             {/* Dialog di collegamento utente */}
       {isLinkUserDialogOpen && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <UserPlus className="h-6 w-6 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">
                  {t('pages.companyDetail.dialogs.linkUserTitle')}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleCloseLinkUserDialog}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
                         </div>
             
             <div className="flex-1 overflow-y-auto p-6">
               <div className="mb-6">
                 <label htmlFor="user-search" className="block text-sm font-medium text-white mb-2">
                   {t('pages.companyDetail.dialogs.searchUserLabel')}
                 </label>
                 <div className="relative">
                   <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                   <input
                     id="user-search"
                     type="text"
                     value={userSearchQuery}
                     onChange={(e) => handleUserSearch(e.target.value)}
                     placeholder={t('pages.companyDetail.dialogs.searchUserPlaceholder')}
                     className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   />
                 </div>
               </div>

              {loadingAvailableUsers && (
                <div className="text-center py-8">
                  <Loader2 className="h-12 w-12 text-blue-400 mx-auto mb-2 animate-spin" />
                  <p className="text-gray-400">{t('pages.companyDetail.dialogs.loadingUsers')}</p>
                </div>
              )}

                             {!loadingAvailableUsers && availableUsers.length === 0 && !userSearchQuery.trim() && (
                 <div className="text-center py-8 text-gray-400">
                   <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                   <p>{t('pages.companyDetail.dialogs.allUsersConnected')}</p>
                 </div>
               )}

               {!loadingAvailableUsers && filteredUsers.length === 0 && userSearchQuery.trim() && (
                 <div className="text-center py-8 text-gray-400">
                   <Search className="h-12 w-12 mx-auto mb-2 opacity-50" />
                   <p>{t('pages.companyDetail.dialogs.noUsersFound')}</p>
                 </div>
               )}

                              {!loadingAvailableUsers && filteredUsers.length > 0 && (
                 <div className="space-y-2">
                   {filteredUsers.map((user) => (
                     <label
                       key={user.id}
                       className={`block cursor-pointer rounded-xl p-4 transition-all duration-200 ${
                         selectedUserId === user.id
                           ? 'bg-blue-900/30 border-blue-500 ring-2 ring-blue-500/20'
                           : 'bg-gray-800 border border-gray-700 hover:border-gray-600 hover:bg-gray-800/80'
                       }`}
                     >
                       <input
                         type="radio"
                         name="selectedUser"
                         value={user.id}
                         checked={selectedUserId === user.id}
                         onChange={() => setSelectedUserId(user.id)}
                         className="sr-only"
                       />
                       <div className="flex items-center justify-between">
                         <div className="flex items-center space-x-3">
                           <span className="text-gray-500 text-xs font-mono bg-gray-900 px-2 py-1 rounded">
                             #{user.id.substring(0, 8)}...
                           </span>
                           <div>
                             <div className="flex items-center space-x-2">
                               <span className="text-white font-medium">{user.name}</span>
                               <div className={`inline-flex items-center text-xs font-medium rounded-full px-2 py-1 border ${getRoleStyles(user.role)}`}>
                                 <span className="capitalize">{user.role}</span>
                               </div>
                             </div>
                             <p className="text-gray-400 text-sm mt-1">
                               {user.email || t('common.notSpecified')}
                             </p>
                             {user.phone && user.phone !== '0' && user.phone.trim() !== '' && (
                               <p className="text-gray-400 text-xs">{t('common.phone')}: {user.phone}</p>
                             )}
                             {user.address && user.address.trim() && (
                               <p className="text-gray-400 text-xs">{t('common.address')}: {user.address}</p>
                             )}
                           </div>
                         </div>
                         {selectedUserId === user.id && (
                           <div className="text-blue-400">
                             <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                               <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                             </svg>
                           </div>
                         )}
                       </div>
                     </label>
                   ))}
                 </div>
               )}

               {selectedUserId && (
                 <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
                   <p className="text-blue-200 text-sm">
                     ✓ {t('pages.companyDetail.dialogs.userSelected')}
                   </p>
                 </div>
               )}
             </div>

             {/* Footer con pulsanti */}
             {(availableUsers.length > 0 || selectedUserId) && (
               <div className="border-t border-gray-800 p-6">
                 <div className="flex justify-end space-x-3">
                   <button
                     type="button"
                     onClick={handleCloseLinkUserDialog}
                     className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                     disabled={isLinkingUser}
                   >
                     {t('common.cancel')}
                   </button>
                   <button
                     type="button"
                     onClick={linkUser}
                     disabled={!selectedUserId || isLinkingUser}
                     className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     {isLinkingUser ? (
                       <>
                         <Loader2 className="h-4 w-4 animate-spin" />
                         <span>Collegamento...</span>
                       </>
                     ) : (
                       <>
                         <UserPlus className="h-4 w-4" />
                         <span>Collega</span>
                       </>
                     )}
                   </button>
                 </div>
               </div>
             )}
           </div>
         </div>
       )}

      {/* Dialog per aggiungere utente tramite email (per utenti non superadmin) */}
      {isEmailDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-xl border border-gray-800 w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <div className="flex items-center space-x-3">
                <UserPlus className="h-6 w-6 text-blue-400" />
                <h2 className="text-xl font-semibold text-white">
                  Aggiungi Collaboratore
                </h2>
              </div>
              <button
                type="button"
                onClick={handleCloseEmailDialog}
                className="text-gray-400 hover:text-white transition-colors"
                disabled={isAddingByEmail}
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6">
                <label htmlFor="user-email" className="block text-sm font-medium text-white mb-2">
                  Email dell&apos;utente
                </label>
                <input
                  id="user-email"
                  type="email"
                  value={emailToAdd}
                  onChange={(e) => setEmailToAdd(e.target.value)}
                  placeholder="Inserisci l'email dell'utente da aggiungere"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isAddingByEmail}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && emailToAdd.trim()) {
                      handleAddUserByEmail();
                    }
                  }}
                />
                <p className="text-sm text-gray-400 mt-2">
                  Inserisci l&apos;email dell&apos;utente che vuoi aggiungere come collaboratore.
                </p>
              </div>

              {emailError && (
                <div className="bg-red-900/20 border border-red-800 rounded-lg p-3 mb-4">
                  <p className="text-red-200 text-sm">{emailError}</p>
                </div>
              )}
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseEmailDialog}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  disabled={isAddingByEmail}
                >
                  Annulla
                </button>
                <button
                  type="button"
                  onClick={handleAddUserByEmail}
                  disabled={!emailToAdd.trim() || isAddingByEmail}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center space-x-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAddingByEmail ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Aggiunta...</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-4 w-4" />
                      <span>Aggiungi</span>
                    </>
                  )}
                </button>
              </div>
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
    </DashboardLayout>
  );
} 