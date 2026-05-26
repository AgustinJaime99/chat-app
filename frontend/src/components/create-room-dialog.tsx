/**
 * @file create-room-dialog.tsx
 * @description Diálogo para crear un nuevo room.
 */
'use client';

import { useState } from 'react';
import { Dialog } from './dialog';
import { Lock, Globe } from 'lucide-react';

interface CreateRoomDialogProps {
  open: boolean;
  onClose: () => void;
  onCreate: (name: string, isPrivate: boolean) => void;
}

export function CreateRoomDialog({ open, onClose, onCreate }: CreateRoomDialogProps) {
  const [name, setName] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onCreate(name.trim(), isPrivate);
      setName('');
      setIsPrivate(false);
      onClose();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} title="Create New Room">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Room Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., General Chat"
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-indigo-500"
            autoFocus
            required
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-slate-300">
            Privacy
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setIsPrivate(false)}
              className={`flex flex-1 items-center gap-2 rounded-lg border px-4 py-3 transition-colors ${
                !isPrivate
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                  : 'border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              <Globe size={20} />
              <div className="text-left">
                <div className="text-sm font-medium">Public</div>
                <div className="text-xs opacity-70">Anyone can join</div>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setIsPrivate(true)}
              className={`flex flex-1 items-center gap-2 rounded-lg border px-4 py-3 transition-colors ${
                isPrivate
                  ? 'border-amber-500 bg-amber-500/10 text-amber-400'
                  : 'border-slate-700 text-slate-400 hover:border-slate-600'
              }`}
            >
              <Lock size={20} />
              <div className="text-left">
                <div className="text-sm font-medium">Private</div>
                <div className="text-xs opacity-70">Invite only</div>
              </div>
            </button>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium hover:bg-indigo-700"
          >
            Create Room
          </button>
        </div>
      </form>
    </Dialog>
  );
}
