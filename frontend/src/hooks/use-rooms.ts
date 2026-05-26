/**
 * @file use-rooms.ts
 * @description Custom hooks para gestionar rooms con React Query.
 * Abstrae la lógica de fetching, caching y mutaciones de rooms.
 */
'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api, type Room } from '../lib/api';
import { useAuthStore } from '../stores/auth.store';

/**
 * Hook para obtener los rooms del usuario autenticado.
 * Usa React Query para caching automático y revalidación.
 */
export function useMyRooms() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ['rooms', 'my'],
    queryFn: () => api.rooms(accessToken!),
    enabled: !!accessToken,
    staleTime: 30_000, // 30s antes de considerar stale
    refetchOnWindowFocus: true,
  });
}

/**
 * Hook para obtener los top rooms públicos disponibles.
 */
export function usePublicRooms() {
  const accessToken = useAuthStore((s) => s.accessToken);

  return useQuery({
    queryKey: ['rooms', 'public'],
    queryFn: () => api.publicRooms(accessToken!),
    enabled: !!accessToken,
    staleTime: 60_000, // 1min
  });
}

/**
 * Hook para crear un nuevo room.
 * Invalida automáticamente la cache de "my rooms" tras crear.
 */
export function useCreateRoom() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ name, isPrivate }: { name: string; isPrivate: boolean }) =>
      api.createRoom(accessToken!, name, isPrivate),
    onSuccess: (newRoom) => {
      // Actualización optimista: agregar el room a la cache local
      queryClient.setQueryData<Room[]>(['rooms', 'my'], (old = []) => [newRoom, ...old]);
    },
  });
}

/**
 * Hook para unirse a un room público.
 */
export function useJoinRoom() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomId: string) => api.joinRoom(accessToken!, roomId),
    onSuccess: (joinedRoom) => {
      // Agregar a "my rooms"
      queryClient.setQueryData<Room[]>(['rooms', 'my'], (old = []) => [joinedRoom, ...old]);
      // Quitar de "public rooms"
      queryClient.setQueryData<Room[]>(['rooms', 'public'], (old = []) =>
        old.filter((r) => r.id !== joinedRoom.id),
      );
    },
  });
}

/**
 * Hook para abandonar un room.
 */
export function useLeaveRoom() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roomId: string) => api.leaveRoom(accessToken!, roomId),
    onSuccess: (_, roomId) => {
      // Remover de "my rooms"
      queryClient.setQueryData<Room[]>(['rooms', 'my'], (old = []) =>
        old.filter((r) => r.id !== roomId),
      );
      // Invalidar mensajes del room
      queryClient.invalidateQueries({ queryKey: ['messages', roomId] });
    },
  });
}
