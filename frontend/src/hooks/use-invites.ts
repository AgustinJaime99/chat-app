/**
 * @file use-invites.ts
 * @description Hook para gestionar invitaciones de rooms.
 */
'use client';

import { useMutation } from '@tanstack/react-query';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/auth.store';

/**
 * Hook para crear un link de invitación.
 * Copia automáticamente al portapapeles tras generarlo.
 */
export function useCreateInvite() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useMutation({
    mutationFn: (roomId: string) => api.createInvite(accessToken!, roomId),
    onSuccess: async ({ inviteUrl }) => {
      await navigator.clipboard.writeText(inviteUrl);
    },
  });
}

/**
 * Hook para aceptar una invitación.
 */
export function useAcceptInvite() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useMutation({
    mutationFn: (token: string) => api.acceptInvite(accessToken!, token),
  });
}
