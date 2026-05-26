/**
 * @file invite/invite-card.tsx
 * @description Card de invitación con información del room.
 */
'use client';

import { Lock, Users, Loader2 } from 'lucide-react';
import type { Room } from '../../lib/api';

interface InviteCardProps {
  room: Room;
  accepting: boolean;
  onAccept: () => void;
  onCancel: () => void;
}

export function InviteCard({ room, accepting, onAccept, onCancel }: InviteCardProps) {
  return (
    <div className="w-full max-w-md rounded-xl border border-slate-800 bg-slate-900 p-8">
      <div className="mb-6 flex justify-center">
        <div className="rounded-full bg-indigo-500/10 p-4">
          <Lock size={48} className="text-indigo-400" />
        </div>
      </div>

      <h1 className="mb-2 text-center text-2xl font-bold">You've been invited!</h1>
      <p className="mb-6 text-center text-slate-400">
        Join the private room <span className="font-semibold text-white">#{room.name}</span>
      </p>

      {room._count && (
        <div className="mb-6 flex items-center justify-center gap-2 text-sm text-slate-400">
          <Users size={16} />
          <span>{room._count.members} members</span>
        </div>
      )}

      <div className="space-y-3">
        <button
          onClick={onAccept}
          disabled={accepting}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 font-semibold hover:bg-indigo-700 disabled:opacity-50"
        >
          {accepting ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              Joining...
            </>
          ) : (
            'Join Room'
          )}
        </button>
        <button
          onClick={onCancel}
          disabled={accepting}
          className="w-full rounded-lg border border-slate-700 px-4 py-3 font-medium hover:bg-slate-800 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
