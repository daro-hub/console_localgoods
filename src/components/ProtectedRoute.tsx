'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Non mostra loading durante l'autenticazione

  // Se non è autenticato, non mostra nulla (verrà reindirizzato)
  if (!isAuthenticated) {
    return null;
  }

  // Se è autenticato, mostra il contenuto
  return <>{children}</>;
} 