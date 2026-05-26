/**
 * @file chat/chat-sidebar.tsx
 * @description Sidebar del chat con lista de rooms y controles.
 */
'use client';

import { LogOut, Plus } from 'lucide-react';
import { RoomList } from '../room-list';
import type { Room } from '../../lib/api';

interface ChatSidebarProps {
  user: { username: string };
  rooms: Room[];
  publicRooms: Room[];
  activeRoomId?: string | null;
  view: 'my-rooms' | 'join-room';
  connected: boolean;
  onViewChange: (view: 'my-rooms' | 'join-room') => void;
  onCreateRoom: () => void;
  onSelectRoom: (room: Room) => void;
  onLeaveRoom: (roomId: string) => void;
  onJoinRoom: (roomId: string) => void;
  onLogout: () => void;
}

export function ChatSidebar({
  user,
  rooms,
  publicRooms,
  activeRoomId,
  view,
  connected,
  onViewChange,
  onCreateRoom,
  onSelectRoom,
  onLeaveRoom,
  onJoinRoom,
  onLogout,
}: ChatSidebarProps) {
  return (
    <aside className="flex w-64 flex-col border-r border-slate-800 bg-slate-900">
      {/* User Header */}
      <div className="flex items-center justify-between border-b border-slate-800 p-4">
        <div>
          <p className="text-sm text-slate-400">Signed in as</p>
          <p className="font-medium">{user.username}</p>
        </div>
        <button onClick={onLogout} className="text-slate-400 hover:text-red-400">
          <LogOut size={18} />
        </button>
      </div>

      {/* View Tabs */}
      <div className="flex border-b border-slate-800">
        <button
          onClick={() => onViewChange('my-rooms')}
          className={`flex-1 px-4 py-2 text-xs font-medium ${
            view === 'my-rooms'
              ? 'border-b-2 border-indigo-500 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          My Rooms
        </button>
        <button
          onClick={() => onViewChange('join-room')}
          className={`flex-1 px-4 py-2 text-xs font-medium ${
            view === 'join-room'
              ? 'border-b-2 border-indigo-500 text-white'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Join a Room
        </button>
      </div>

      {/* Section Header */}
      <div className="flex items-center justify-between p-3">
        <span className="text-xs uppercase tracking-wide text-slate-500">
          {view === 'my-rooms' ? 'Your Rooms' : 'Top Rooms'}
        </span>
        {view === 'my-rooms' && (
          <button
            onClick={onCreateRoom}
            className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-white"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto">
        {view === 'my-rooms' ? (
          <RoomList
            rooms={rooms}
            activeRoomId={activeRoomId}
            onSelectRoom={onSelectRoom}
            onLeaveRoom={onLeaveRoom}
            emptyMessage="No rooms. Create one or join a public room."
          />
        ) : (
          <RoomList
            rooms={publicRooms}
            onJoinRoom={onJoinRoom}
            emptyMessage="No public rooms available."
          />
        )}
      </div>

      {/* Connection Status */}
      <div className="border-t border-slate-800 p-3 text-xs">
        <span className={connected ? 'text-emerald-400' : 'text-slate-500'}>
          {connected ? '● Connected' : '○ Disconnected'}
        </span>
      </div>
    </aside>
  );
}
