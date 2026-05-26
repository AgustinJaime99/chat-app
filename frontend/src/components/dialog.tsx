/**
 * @file dialog.tsx
 * @description Componente de diálogo/modal reutilizable.
 */
'use client';

import { ReactNode } from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Dialog({ open, onClose, title, children }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white"
          >
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'primary',
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} title={title}>
      <p className="mb-6 text-sm text-slate-300">{message}</p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium hover:bg-slate-800"
        >
          {cancelText}
        </button>
        <button
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium ${
            variant === 'danger'
              ? 'bg-red-600 hover:bg-red-700'
              : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          {confirmText}
        </button>
      </div>
    </Dialog>
  );
}
