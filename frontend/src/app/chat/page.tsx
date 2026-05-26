/**
 * @file chat/page.tsx
 * @description Página principal del chat refactorizada con React Query.
 * Toda la lógica de estado del servidor está abstraída en custom hooks.
 */
'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { type Room } from '../../lib/api';
import { useAuthStore } from '../../stores/auth.store';
import { useChatSocket } from '../../hooks/use-chat-socket';
import { useMyRooms, usePublicRooms, useCreateRoom, useJoinRoom, useLeaveRoom } from '../../hooks/use-rooms';
import { useMessages } from '../../hooks/use-messages';
import { useCreateInvite } from '../../hooks/use-invites';
import { useHydration } from '../../hooks/use-hydration';
import { useToast } from '../../components/toast';
import { ConfirmDialog } from '../../components/dialog';
import { CreateRoomDialog } from '../../components/create-room-dialog';
import { ChatSidebar } from '../../components/chat/chat-sidebar';
import { ChatHeader } from '../../components/chat/chat-header';
import { ChatInput } from '../../components/chat/chat-input';
import { EmptyState } from '../../components/chat/empty-state';
import { MessageList } from '../../components/message-list';
import { LoadingScreen } from '../../components/ui/loading-screen';

export default function ChatPage() {
  const router = useRouter();
  const hydrated = useHydration();
  const toast = useToast();
  const { user, accessToken, logout } = useAuthStore();
  const [activeRoom, setActiveRoom] = useState<Room | null>(null);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());
  const [view, setView] = useState<'my-rooms' | 'join-room'>('my-rooms');
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Estados para diálogos
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [leaveRoomId, setLeaveRoomId] = useState<string | null>(null);

  // React Query hooks
  const { data: myRooms = [], isLoading: loadingMyRooms } = useMyRooms();
  const { data: publicRooms = [], isLoading: loadingPublicRooms } = usePublicRooms();
  const { data: messages = [] } = useMessages(activeRoom?.id ?? null);
  const createRoomMutation = useCreateRoom();
  const joinRoomMutation = useJoinRoom();
  const leaveRoomMutation = useLeaveRoom();
  const createInviteMutation = useCreateInvite();

  // Redirect si no hay token (solo después de hidratar)
  useEffect(() => {
    if (hydrated && !accessToken) {
      router.replace('/login');
    }
  }, [hydrated, accessToken, router]);

  // Auto-seleccionar primer room si no hay ninguno activo
  useEffect(() => {
    if (!activeRoom && myRooms.length > 0) {
      setActiveRoom(myRooms[0]);
    }
  }, [myRooms, activeRoom]);

  // Auto-scroll al recibir mensajes
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // Handler de typing para WebSocket
  const handleTyping = useCallback(
    (payload: { username: string; isTyping: boolean }) => {
      setTypingUsers((prev) => {
        const next = new Set(prev);
        if (payload.isTyping) next.add(payload.username);
        else next.delete(payload.username);
        return next;
      });
    },
    [],
  );

  const { connected, send, setTyping } = useChatSocket({
    token: accessToken,
    roomId: activeRoom?.id ?? null,
    onTyping: handleTyping,
  });

  const typingLabel = useMemo(() => {
    const names = [...typingUsers].filter((n) => n !== user?.username);
    if (names.length === 0) return '';
    if (names.length === 1) return `${names[0]} is typing...`;
    return `${names.join(', ')} are typing...`;
  }, [typingUsers, user]);

  async function handleCreateRoom(name: string, isPrivate: boolean) {
    try {
      const newRoom = await createRoomMutation.mutateAsync({ name, isPrivate });
      setActiveRoom(newRoom);
      setView('my-rooms');
      toast.success(`Room "${name}" created successfully!`);
    } catch (err) {
      toast.error('Failed to create room');
    }
  }

  async function handleJoinRoom(roomId: string) {
    try {
      const room = await joinRoomMutation.mutateAsync(roomId);
      setActiveRoom(room);
      setView('my-rooms');
      toast.success(`Joined "${room.name}"!`);
    } catch (err) {
      toast.error('Failed to join room');
    }
  }

  async function confirmLeaveRoom() {
    if (!leaveRoomId) return;
    try {
      await leaveRoomMutation.mutateAsync(leaveRoomId);
      if (activeRoom?.id === leaveRoomId) {
        setActiveRoom(myRooms[0] || null);
      }
      toast.success('Left the room');
    } catch (err) {
      toast.error('Failed to leave room');
    } finally {
      setLeaveRoomId(null);
    }
  }

  function handleLogout() {
    logout();
    router.replace('/login');
  }

  async function handleInvite() {
    if (!activeRoom) return;
    try {
      await createInviteMutation.mutateAsync(activeRoom.id);
      toast.success('Invite link copied to clipboard!');
    } catch (err) {
      toast.error('Failed to create invite');
    }
  }

  // Mostrar loading mientras hidrata el store
  if (!hydrated) {
    return <LoadingScreen />;
  }

  if (!user) return null;

  return (
    <main className="flex h-screen">
      <ChatSidebar
        user={user}
        rooms={myRooms}
        publicRooms={publicRooms}
        activeRoomId={activeRoom?.id}
        view={view}
        connected={connected}
        onViewChange={setView}
        onCreateRoom={() => setShowCreateDialog(true)}
        onSelectRoom={setActiveRoom}
        onLeaveRoom={(roomId) => setLeaveRoomId(roomId)}
        onJoinRoom={handleJoinRoom}
        onLogout={handleLogout}
      />

      <section className="flex flex-1 flex-col">
        <ChatHeader
          room={activeRoom}
          onInvite={handleInvite}
          onLeave={() => activeRoom && setLeaveRoomId(activeRoom.id)}
        />

        {activeRoom ? (
          <>
            <MessageList ref={scrollRef} messages={messages} currentUserId={user.id} />
            <div className="h-5 px-6 text-xs text-slate-400">{typingLabel}</div>
          </>
        ) : (
          <EmptyState
            hasRooms={myRooms.length > 0}
            onCreateRoom={() => setShowCreateDialog(true)}
            onBrowseRooms={() => setView('join-room')}
          />
        )}

        <ChatInput
          disabled={!activeRoom}
          placeholder={activeRoom ? 'Type a message...' : 'Select a room first'}
          onSend={send}
          onTyping={setTyping}
        />
      </section>

      {/* Diálogos */}
      <CreateRoomDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreate={handleCreateRoom}
      />

      <ConfirmDialog
        open={!!leaveRoomId}
        onClose={() => setLeaveRoomId(null)}
        onConfirm={confirmLeaveRoom}
        title="Leave Room"
        message="Are you sure you want to leave this room? You can rejoin later if it's public or you have an invite link."
        confirmText="Leave"
        cancelText="Cancel"
        variant="danger"
      />
    </main>
  );
}
