'use client';

import { useNavigationLoading } from '@/hooks/useNavigationLoading';
import { useEffect, useState } from 'react';

export function NavigationLoader() {
  const isLoading = useNavigationLoading();
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isLoading) {
      setIsVisible(true);
      setProgress(0);
      
      // Animazione di progresso più realistica
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 85) {
            clearInterval(progressInterval);
            return 85; // Si ferma all'85% fino al completamento reale
          }
          // Progresso più veloce all'inizio, più lento verso la fine
          const increment = prev < 30 ? Math.random() * 25 + 10 : Math.random() * 10 + 2;
          return Math.min(prev + increment, 85);
        });
      }, 120);

      return () => clearInterval(progressInterval);
    } else {
      // Completa rapidamente al 100% quando finisce il loading
      setProgress(100);
      
      // Nasconde tutto dopo l'animazione di completamento
      const hideTimeout = setTimeout(() => {
        setProgress(0);
        setIsVisible(false);
      }, 300);

      return () => clearTimeout(hideTimeout);
    }
  }, [isLoading]);

  if (!isVisible) return null;

  return (
    <>
      {/* Barra di progresso in alto */}
      <div className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-transparent">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 shadow-lg transition-all duration-300 ease-out"
          style={{ 
            width: `${progress}%`,
            transition: progress === 100 ? 'width 0.2s ease-out' : 'width 0.4s ease-out',
            boxShadow: progress > 0 ? '0 0 10px rgba(59, 130, 246, 0.5)' : 'none'
          }}
        />
      </div>

      {/* Overlay per il tema scuro */}
      {isLoading && (
        <div className="fixed inset-0 z-[9998] bg-black/10 backdrop-blur-[1px] pointer-events-none transition-opacity duration-200">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-gray-900/95 backdrop-blur-md rounded-xl p-4 shadow-2xl border border-gray-700/50">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-500/30 border-t-blue-500"></div>
                  <div className="absolute inset-0 animate-ping rounded-full h-5 w-5 border border-blue-500/20"></div>
                </div>
                <span className="text-sm font-medium text-gray-100">Caricamento...</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pulsi luminosi agli angoli per effetto extra */}
      {isLoading && (
        <>
          <div className="fixed top-0 left-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl animate-pulse z-[9997] pointer-events-none"></div>
          <div className="fixed top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl animate-pulse z-[9997] pointer-events-none" style={{ animationDelay: '0.5s' }}></div>
          <div className="fixed bottom-0 left-0 w-20 h-20 bg-pink-500/5 rounded-full blur-xl animate-pulse z-[9997] pointer-events-none" style={{ animationDelay: '1s' }}></div>
        </>
      )}
    </>
  );
} 