/**
 * @file invite/[token]/page.tsx
 * @description Página para aceptar invitaciones a rooms privados.
 */
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api, type Room } from '../../../lib/api';
import { useAuthStore } from '../../../stores/auth.store';
import { useHydration } from '../../../hooks/use-hydration';
import { useToast } from '../../../components/toast';
import { LoadingScreen } from '../../../components/ui/loading-screen';
import { InviteCard } from '../../../components/invite/invite-card';
import { InviteError } from '../../../components/invite/invite-error';

export default function InvitePage() {
  const router = useRouter();
  const params = useParams();
  const token = params.token as string;
  const hydrated = useHydration();
  const toast = useToast();
  const { accessToken } = useAuthStore();
  const [room, setRoom] = useState<Room | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (!hydrated) return;

    if (!accessToken) {
      // Guardar el token de invitación para después del login
      sessionStorage.setItem('pending-invite', token);
      router.replace('/login');
      return;
    }

    api
      .getInvite(accessToken, token)
      .then((res) => {
        setRoom(res.room);
        setLoading(false);
      })
      .catch(() => {
        setError('Invalid or expired invite');
        setLoading(false);
      });
  }, [hydrated, accessToken, token, router]);

  async function handleAccept() {
    if (!accessToken) return;
    setAccepting(true);
    try {
      await api.acceptInvite(accessToken, token);
      sessionStorage.removeItem('pending-invite');
      toast.success(`Joined "${room?.name}"!`);
      router.push('/chat');
    } catch {
      toast.error('Failed to join room');
      setAccepting(false);
    }
  }

  if (!hydrated || loading) {
    return <LoadingScreen message="Loading invite..." />;
  }

  if (error || !room) {
    return (
      <div className="flex h-screen items-center justify-center">
        <InviteError message={error || 'Invite not found'} onGoToChat={() => router.push('/chat')} />
      </div>
    );
  }

  return (
    <div className="flex h-screen items-center justify-center">
      <InviteCard
        room={room}
        accepting={accepting}
        onAccept={handleAccept}
        onCancel={() => router.push('/chat')}
      />
    </div>
  );
}
