/**
 * @file invite/invite-error.tsx
 * @description Estado de error para invitaciones inválidas.
 */
'use client';

import { XCircle } from 'lucide-react';

interface InviteErrorProps {
  message: string;
  onGoToChat: () => void;
}

export function InviteError({ message, onGoToChat }: InviteErrorProps) {
  return (
    <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-8 text-center">
      <div className="mb-4 flex justify-center">
        <div className="rounded-full bg-red-500/10 p-4">
          <XCircle size={48} className="text-red-400" />
        </div>
      </div>
      <h1 className="mb-2 text-2xl font-bold text-red-400">{message}</h1>
      <p className="mb-6 text-sm text-slate-400">
        This invite link may be invalid or expired.
      </p>
      <button
        onClick={onGoToChat}
        className="w-full rounded-lg bg-slate-800 px-4 py-3 font-medium hover:bg-slate-700"
      >
        Go to Chat
      </button>
    </div>
  );
}
