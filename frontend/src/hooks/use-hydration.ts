/**
 * @file use-hydration.ts
 * @description Hook para manejar la hidratación de Zustand con persist en SSR.
 * Previene el mismatch entre servidor y cliente.
 */
'use client';

import { useEffect, useState } from 'react';

/**
 * Hook que retorna true solo después de que el componente se haya montado en el cliente.
 * Útil para prevenir errores de hidratación con stores persistidos.
 */
export function useHydration() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  return hydrated;
}
