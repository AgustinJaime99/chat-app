/**
 * @file ui/loading-screen.tsx
 * @description Pantalla de loading reutilizable.
 */
'use client';

import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export function LoadingScreen({ message = 'Loading...' }: LoadingScreenProps) {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="flex items-center gap-3 text-slate-400">
        <Loader2 size={24} className="animate-spin" />
        <span>{message}</span>
      </div>
    </div>
  );
}
