'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/auth.store';

export default function Home() {
  const router = useRouter();
  const accessToken = useAuthStore((s) => s.accessToken);

  useEffect(() => {
    router.replace(accessToken ? '/chat' : '/login');
  }, [accessToken, router]);

  return (
    <main className="flex h-screen items-center justify-center">
      <p className="text-slate-400">Loading...</p>
    </main>
  );
}
