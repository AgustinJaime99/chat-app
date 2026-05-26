/**
 * @file login/page.tsx
 * @description Página de autenticación (login/register).
 */
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/auth.store';
import { AuthForm, type AuthFormData } from '../../components/auth/auth-form';

export default function LoginPage() {
  const router = useRouter();
  const setSession = useAuthStore((s) => s.setSession);
  const [mode, setMode] = useState<'login' | 'register'>('login');

  async function handleSubmit(data: AuthFormData) {
    if (mode === 'register') {
      await api.register({
        email: data.email!,
        username: data.username,
        password: data.password,
      });
    }

    const response = await api.login({
      identifier: data.identifier || data.username,
      password: data.password,
    });

    setSession(response);

    // Verificar si hay una invitación pendiente
    const pendingInvite = sessionStorage.getItem('pending-invite');
    if (pendingInvite) {
      router.push(`/invite/${pendingInvite}`);
    } else {
      router.push('/chat');
    }
  }

  function toggleMode() {
    setMode((prev) => (prev === 'login' ? 'register' : 'login'));
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <AuthForm mode={mode} onSubmit={handleSubmit} onToggleMode={toggleMode} />
    </main>
  );
}
