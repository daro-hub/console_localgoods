'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function useNavigationLoading() {
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const startLoading = () => {
      // Piccolo delay per evitare flash su navigazioni molto veloci
      timeoutId = setTimeout(() => {
        setIsLoading(true);
      }, 150);
    };

    const stopLoading = () => {
      clearTimeout(timeoutId);
      setIsLoading(false);
    };

    // Intercetta clic sui link Next.js
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href]') as HTMLAnchorElement;
      
      if (link && link.href && !link.target) {
        const url = new URL(link.href);
        const currentUrl = new URL(window.location.href);
        
        // Solo per link interni che cambiano percorso
        if (
          url.origin === currentUrl.origin && 
          url.pathname !== currentUrl.pathname &&
          !link.href.startsWith('mailto:') &&
          !link.href.startsWith('tel:') &&
          !link.href.startsWith('#') &&
          !link.download
        ) {
          startLoading();
        }
      }
    };

    // Intercetta navigazioni programmatiche (router.push, router.replace, etc.)
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;

    window.history.pushState = function(data: any, title: string, url?: string | URL | null) {
      if (url && url !== window.location.pathname + window.location.search) {
        startLoading();
      }
      return originalPushState.call(this, data, title, url);
    };

    window.history.replaceState = function(data: any, title: string, url?: string | URL | null) {
      if (url && url !== window.location.pathname + window.location.search) {
        startLoading();
      }
      return originalReplaceState.call(this, data, title, url);
    };

    // Aggiungi listener
    document.addEventListener('click', handleLinkClick);

    // Cleanup quando il pathname cambia (navigazione completata)
    const handlePathnameChange = () => {
      stopLoading();
    };

    // Simula il completamento della navigazione
    handlePathnameChange();

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('click', handleLinkClick);
      
      // Ripristina i metodi originali
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, [pathname]);

  return isLoading;
} 