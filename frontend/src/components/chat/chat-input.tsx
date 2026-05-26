/**
 * @file chat/chat-input.tsx
 * @description Input de mensajes con indicador de typing.
 */
'use client';

import { useState } from 'react';
import { Send } from 'lucide-react';

interface ChatInputProps {
  disabled?: boolean;
  placeholder?: string;
  onSend: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
}

export function ChatInput({
  disabled = false,
  placeholder = 'Type a message...',
  onSend,
  onTyping,
}: ChatInputProps) {
  const [draft, setDraft] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const content = draft.trim();
    if (!content) return;
    onSend(content);
    setDraft('');
    onTyping(false);
  }

  function handleChange(value: string) {
    setDraft(value);
    onTyping(value.length > 0);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 border-t border-slate-800 px-6 py-4">
      <input
        value={draft}
        onChange={(e) => handleChange(e.target.value)}
        onBlur={() => onTyping(false)}
        disabled={disabled}
        placeholder={placeholder}
        className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-indigo-500 disabled:opacity-50"
      />
      <button
        type="submit"
        disabled={disabled || !draft.trim()}
        className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 font-medium hover:bg-indigo-500 disabled:opacity-50"
      >
        <Send size={16} /> Send
      </button>
    </form>
  );
}
