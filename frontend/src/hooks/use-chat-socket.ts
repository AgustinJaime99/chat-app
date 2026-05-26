/**
 * @file use-chat-socket.ts
 * @description Hook mejorado para WebSocket con sincronización a React Query.
 */
'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { io, Socket } from 'socket.io-client';
import type { Message } from '../lib/api';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:3001';

interface UseChatSocketOptions {
  token: string | null;
  roomId: string | null;
  onTyping?: (payload: { username: string; isTyping: boolean }) => void;
}

/**
 * Hook que gestiona la conexión WebSocket y sincroniza mensajes con React Query.
 * Los mensajes nuevos se agregan automáticamente a la cache de React Query.
 */
export function useChatSocket({ token, roomId, onTyping }: UseChatSocketOptions) {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const queryClient = useQueryClient();

  // Handler de mensajes que actualiza la cache de React Query
  const handleMessage = useCallback(
    (msg: Message) => {
      queryClient.setQueryData<Message[]>(['messages', roomId], (old = []) => [...old, msg]);
    },
    [queryClient, roomId],
  );

  useEffect(() => {
    if (!token) return;
    const socket = io(`${WS_URL}/chat`, {
      auth: { token },
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('message:new', handleMessage);
    if (onTyping) socket.on('typing', onTyping);

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token, handleMessage, onTyping]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !roomId) return;
    socket.emit('room:join', { roomId });
    return () => {
      socket.emit('room:leave', { roomId });
    };
  }, [roomId]);

  const send = useCallback(
    (content: string) => {
      if (!socketRef.current || !roomId) return;
      socketRef.current.emit('message:send', { roomId, content });
    },
    [roomId],
  );

  const setTyping = useCallback(
    (isTyping: boolean) => {
      if (!socketRef.current || !roomId) return;
      socketRef.current.emit('typing', { roomId, isTyping });
    },
    [roomId],
  );

  return { connected, send, setTyping };
}
