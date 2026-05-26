/**
 * @file chat/chat-header.tsx
 * @description Header del chat con información del room activo.
 */
'use client';

import { Link2, Users, Lock, Globe } from 'lucide-react';
import type { Room } from '../../lib/api';

interface ChatHeaderProps {
  room: Room | null;
  onInvite?: () => void;
  onLeave?: () => void;
}

export function ChatHeader({ room, onInvite, onLeave }: ChatHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold">
            {room ? `# ${room.name}` : 'Select a room'}
          </h2>
          {room && (
            <>
              {room.isPrivate ? (
                <Lock size={16} className="text-amber-400" />
              ) : (
                <Globe size={16} className="text-emerald-400" />
              )}
              {room._count && (
                <span className="text-sm text-slate-400">
                  <Users size={14} className="inline" /> {room._count.members}
                </span>
              )}
            </>
          )}
        </div>
        {room && (
          <p className="text-xs text-slate-500">
            {room.isPrivate ? 'Private room - Invite only' : 'Public room'}
          </p>
        )}
      </div>
      {room && (
        <div className="flex gap-2">
          <button
            onClick={onInvite}
            className="flex items-center gap-2 rounded bg-indigo-600 px-3 py-1.5 text-sm hover:bg-indigo-700"
          >
            <Link2 size={16} />
            Invite
          </button>
          <button
            onClick={onLeave}
            className="flex items-center gap-2 rounded border border-red-600 px-3 py-1.5 text-sm text-red-400 hover:bg-red-600 hover:text-white"
          >
            Leave
          </button>
        </div>
      )}
    </header>
  );
}
