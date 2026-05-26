/**
 * @file use-messages.ts
 * @description Hook para gestionar mensajes de un room con React Query.
 */
'use client';

import { useQuery } from '@tanstack/react-query';
import { api, type Message } from '../lib/api';
import { useAuthStore } from '../stores/auth.store';

/**
 * Hook para obtener el historial de mensajes de un room.
 * Se sincroniza automáticamente con WebSocket vía `useChatSocket`.
 */
export function useMessages(roomId: string | null) {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ['messages', roomId],
    queryFn: () => api.messages(accessToken!, roomId!),
    enabled: !!accessToken && !!roomId,
    staleTime: Infinity, // Los mensajes no cambian en el servidor (solo vía WS)
    refetchOnWindowFocus: false,
  });
}
