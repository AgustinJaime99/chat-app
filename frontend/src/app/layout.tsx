import './globals.css';
import type { Metadata } from 'next';
import { QueryProvider } from '../providers/query-provider';
import { ToastProvider } from '../components/toast';

export const metadata: Metadata = {
  title: 'Realtime Chat',
  description: 'Next.js + NestJS WebSocket chat',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen">
        <QueryProvider>
          <ToastProvider>{children}</ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
