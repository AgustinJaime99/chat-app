/**
 * @file chat/empty-state.tsx
 * @description Estado vacío cuando no hay room seleccionado.
 */
'use client';

import { Users, Plus, Globe } from 'lucide-react';

interface EmptyStateProps {
  hasRooms: boolean;
  onCreateRoom: () => void;
  onBrowseRooms: () => void;
}

export function EmptyState({ hasRooms, onCreateRoom, onBrowseRooms }: EmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="rounded-full bg-slate-800 p-6">
        <Users size={48} className="text-slate-500" />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-slate-300">No room selected</h3>
        <p className="mt-2 text-sm text-slate-500">
          {hasRooms
            ? 'Select a room from the sidebar to view messages'
            : 'Create a new room or join a public one to start chatting'}
        </p>
      </div>
      {!hasRooms && (
        <div className="flex gap-3">
          <button
            onClick={onCreateRoom}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-700"
          >
            <Plus size={16} />
            Create Room
          </button>
          <button
            onClick={onBrowseRooms}
            className="flex items-center gap-2 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-800"
          >
            <Globe size={16} />
            Browse Public Rooms
          </button>
        </div>
      )}
    </div>
  );
}
