/**
 * @file message-list.tsx
 * @description Componente para renderizar la lista de mensajes del chat.
 */
'use client';

import { forwardRef } from 'react';
import type { Message } from '../lib/api';

interface MessageListProps {
  messages: Message[];
  currentUserId: string;
}

export const MessageList = forwardRef<HTMLDivElement, MessageListProps>(
  ({ messages, currentUserId }, ref) => {
    return (
      <div ref={ref} className="flex-1 space-y-3 overflow-y-auto px-6 py-4">
        {messages.map((m) => {
          const own = m.userId === currentUserId;
          return (
            <div key={m.id} className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-md rounded-2xl px-4 py-2 ${
                  own ? 'bg-indigo-600' : 'bg-slate-800'
                }`}
              >
                {!own && (
                  <p className="mb-1 text-xs font-medium text-indigo-300">
                    {m.username ?? m.userId.slice(0, 6)}
                  </p>
                )}
                <p className="whitespace-pre-wrap text-sm">{m.content}</p>
                <p className="mt-1 text-right text-[10px] text-slate-300/70">
                  {new Date(m.createdAt).toLocaleTimeString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    );
  },
);

MessageList.displayName = 'MessageList';
