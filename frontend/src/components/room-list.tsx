/**
 * @file room-list.tsx
 * @description Componente para renderizar la lista de rooms (propios o públicos).
 */
'use client';

import { Users, Lock, Globe } from 'lucide-react';
import type { Room } from '../lib/api';

interface RoomListProps {
  rooms: Room[];
  activeRoomId?: string | null;
  onSelectRoom?: (room: Room) => void;
  onLeaveRoom?: (roomId: string) => void;
  onJoinRoom?: (roomId: string) => void;
  emptyMessage?: string;
}

export function RoomList({
  rooms,
  activeRoomId,
  onSelectRoom,
  onLeaveRoom,
  onJoinRoom,
  emptyMessage = 'No rooms available.',
}: RoomListProps) {
  if (rooms.length === 0) {
    return <p className="px-4 py-2 text-sm text-slate-500">{emptyMessage}</p>;
  }

  return (
    <>
      {rooms.map((r) => (
        <div
          key={r.id}
          className={`group flex items-center justify-between px-4 py-2 ${
            activeRoomId === r.id ? 'bg-indigo-600' : 'hover:bg-slate-800'
          }`}
        >
          <button
            onClick={() => onSelectRoom?.(r)}
            className="flex flex-1 items-center gap-2 text-left text-sm"
          >
            {r.isPrivate ? (
              <Lock size={14} className="text-amber-400" />
            ) : (
              <Globe size={14} className="text-emerald-400" />
            )}
            <span className="truncate">{r.name}</span>
            {r._count && (
              <span className="ml-auto text-xs text-slate-400">
                <Users size={12} className="inline" /> {r._count.members}
              </span>
            )}
          </button>

          {onLeaveRoom && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLeaveRoom(r.id);
              }}
              className="ml-2 hidden text-xs text-red-400 hover:text-red-300 group-hover:block"
            >
              Leave
            </button>
          )}

          {onJoinRoom && (
            <button
              onClick={() => onJoinRoom(r.id)}
              className="ml-2 rounded bg-indigo-600 px-2 py-1 text-xs hover:bg-indigo-700"
            >
              Join
            </button>
          )}
        </div>
      ))}
    </>
  );
}
