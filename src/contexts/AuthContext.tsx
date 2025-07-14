'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  created_at: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: string;
  password: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  fetchUserData: () => Promise<void>;
  refreshUserData: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Controlla se c'è un token salvato all'avvio
  useEffect(() => {
    const initializeAuth = async () => {
      const savedToken = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('auth_user');
      
      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        
        // Ricarica i dati utente per assicurarsi che siano aggiornati
        try {
          const userData = await fetchUserDataWithToken(savedToken);
          setUser(userData);
          localStorage.setItem('auth_user', JSON.stringify(userData));
        } catch (error) {
          console.warn('Impossibile aggiornare i dati utente dal server, usando i dati salvati localmente:', error);
          // Verifica se il token è ancora valido
          if (error instanceof Error && error.message.includes('401')) {
            // Token scaduto, effettua logout
    
            setUser(null);
            setToken(null);
            localStorage.removeItem('auth_token');
            localStorage.removeItem('auth_user');
            router.push('/login');
            return;
          }
          // Se fallisce per altri motivi, mantieni i dati salvati
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Funzione per ottenere i dati utente con un token specifico
  const fetchUserDataWithToken = async (authToken: string): Promise<User> => {
    try {
      const response = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/auth/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorMessage = response.status === 401 ? '401 Unauthorized' : `HTTP Error ${response.status}`;
        throw new Error(`Failed to fetch user data: ${errorMessage}`);
      }

      const userData = await response.json();
      return userData;
    } catch (error) {
      if (error instanceof Error) {
        // Rilancia l'errore con informazioni aggiuntive
        throw new Error(`Network error: ${error.message}`);
      }
      throw new Error('Unknown error occurred while fetching user data');
    }
  };

  // Funzione per ottenere i dati utente con il token corrente
  const fetchUserData = async (): Promise<void> => {
    if (!token) {
      throw new Error('No token available');
    }

    try {
      const userData = await fetchUserDataWithToken(token);
      setUser(userData);
      localStorage.setItem('auth_user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  };

  // Funzione per ricaricare i dati utente (per la pagina profilo)
  const refreshUserData = async (): Promise<boolean> => {
    if (!token) {
      return false;
    }

    try {
      await fetchUserData();
      return true;
    } catch (error) {
      console.error('Error refreshing user data:', error);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      const response = await fetch('https://x8ki-letl-twmt.n7.xano.io/api:vf0i92wT/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      
      // Assumo che l'API restituisca un token
      if (data.authToken) {
        setToken(data.authToken);
        localStorage.setItem('auth_token', data.authToken);
        
        // Ottieni i dati utente completi incluso il ruolo
        try {
          const userData = await fetchUserDataWithToken(data.authToken);
          setUser(userData);
          localStorage.setItem('auth_user', JSON.stringify(userData));
          return true;
        } catch (userError) {
          console.error('Error fetching user data after login:', userError);
          // Fallback: crea un oggetto utente di base
          const fallbackUser = {
            id: data.user?.id || data.id || email,
            created_at: Date.now(),
            name: data.user?.name || email.split('@')[0],
            email: email,
            phone: '',
            address: '',
            password: '',
            role: 'user'
          };
          setUser(fallbackUser);
          localStorage.setItem('auth_user', JSON.stringify(fallbackUser));
          return true;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    router.push('/login');
  };

  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        logout,
        isAuthenticated,
        fetchUserData,
        refreshUserData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 