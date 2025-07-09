'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';

interface NavigationContextType {
  goBack: () => void;
  previousPage: string | null;
  navigationStack: string[];
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

interface NavigationProviderProps {
  children: ReactNode;
}

export function NavigationProvider({ children }: NavigationProviderProps) {
  const [navigationStack, setNavigationStack] = useState<string[]>([]);
  const pathname = usePathname();
  const router = useRouter();

  // Traccia le pagine visitate
  useEffect(() => {
    if (pathname) {
      setNavigationStack(prev => {
        // Evita di aggiungere la stessa pagina consecutivamente
        if (prev.length > 0 && prev[prev.length - 1] === pathname) {
          return prev;
        }
        
        // Mantieni solo le ultime 10 pagine per evitare accumulo infinito
        const newStack = [...prev, pathname];
        return newStack.slice(-10);
      });
    }
  }, [pathname]);

  const goBack = () => {
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
    navigationStack
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