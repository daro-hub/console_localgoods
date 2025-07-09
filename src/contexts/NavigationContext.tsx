'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface NavigationContextType {
  goBack: () => void;
  previousPage: string | null;
  navigationStack: string[];
  isLoading: boolean;
  startLoading: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const [navigationStack, setNavigationStack] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const previousPathnameRef = useRef<string | null>(null);

  // Funzione per iniziare manualmente il caricamento
  const startLoading = () => {
    setIsLoading(true);
  };

  // Traccia le pagine visitate
  useEffect(() => {
    if (pathname) {
      const previousPathname = previousPathnameRef.current;
      
      // Se è la prima volta che viene caricato, non mostrare loading
      if (!isInitialized) {
        setIsInitialized(true);
        previousPathnameRef.current = pathname;
        
        setNavigationStack([pathname]);
        return;
      }

      // Se il pathname è cambiato, significa che c'è stata una navigazione
      if (previousPathname && previousPathname !== pathname) {
        setIsLoading(true);
      }
      
      // Aggiorna il ref
      previousPathnameRef.current = pathname;
      
      setNavigationStack(prev => {
        // Evita di aggiungere la stessa pagina consecutivamente
        if (prev.length > 0 && prev[prev.length - 1] === pathname) {
          return prev;
        }
        
        // Mantieni solo le ultime 10 pagine per evitare accumulo infinito
        const newStack = [...prev, pathname];
        return newStack.slice(-10);
      });

      // Simula un breve delay per il caricamento, poi ferma il loading
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 400); // 400ms di caricamento per dare feedback visivo

      return () => clearTimeout(timer);
    }
  }, [pathname, isInitialized]);

  // Intercepta i click sui link per mostrare il loading
  useEffect(() => {
    const handleLinkClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && link.href) {
        const url = new URL(link.href);
        const currentUrl = new URL(window.location.href);
        
        // Solo se è un link interno e non è la stessa pagina
        if (url.origin === currentUrl.origin && url.pathname !== currentUrl.pathname) {
          // Se non è un link con target="_blank" o modificatori
          if (!link.target && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
            setIsLoading(true);
          }
        }
      }
    };

    document.addEventListener('click', handleLinkClick);
    
    return () => {
      document.removeEventListener('click', handleLinkClick);
    };
  }, []);

  const goBack = () => {
    // Inizia il loading quando si naviga indietro
    setIsLoading(true);
    
    if (navigationStack.length > 1) {
      // Rimuovi la pagina corrente e vai alla precedente
      const newStack = [...navigationStack];
      newStack.pop(); // Rimuovi la pagina corrente
      const previousPage = newStack[newStack.length - 1];
      
      if (previousPage) {
        setNavigationStack(newStack);
        router.push(previousPage);
      } else {
        // Fallback se non c'è una pagina precedente
        router.push('/');
      }
    } else {
      // Fallback se non c'è storia di navigazione
      router.push('/');
    }
  };

  const previousPage = navigationStack.length > 1 ? navigationStack[navigationStack.length - 2] : null;

  const value = {
    goBack,
    previousPage,
    navigationStack,
    isLoading,
    startLoading
  };

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (context === undefined) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return context;
} 