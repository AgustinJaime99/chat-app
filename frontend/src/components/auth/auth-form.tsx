/**
 * @file auth/auth-form.tsx
 * @description Componente de formulario de autenticación reutilizable.
 */
'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

interface AuthFormProps {
  mode: 'login' | 'register';
  onSubmit: (data: AuthFormData) => Promise<void>;
  onToggleMode: () => void;
}

export interface AuthFormData {
  identifier?: string;
  email?: string;
  username: string;
  password: string;
}

export function AuthForm({ mode, onSubmit, onToggleMode }: AuthFormProps) {
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSubmit({
        identifier: mode === 'login' ? identifier : undefined,
        email: mode === 'register' ? email : undefined,
        username: mode === 'register' ? username : identifier,
        password,
      });
    } catch (err) {
      setError((err as Error).message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-sm space-y-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl backdrop-blur"
    >
      <h1 className="text-2xl font-semibold">
        {mode === 'login' ? 'Sign in' : 'Create account'}
      </h1>

      {mode === 'register' && (
        <input
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-indigo-500"
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      )}

      <input
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-indigo-500"
        placeholder={mode === 'register' ? 'Username' : 'Email or username'}
        value={mode === 'register' ? username : identifier}
        onChange={(e) =>
          mode === 'register' ? setUsername(e.target.value) : setIdentifier(e.target.value)
        }
        required
      />

      <input
        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 outline-none focus:border-indigo-500"
        placeholder="Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        minLength={8}
      />

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 py-2 font-medium hover:bg-indigo-500 disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            {mode === 'login' ? 'Signing in...' : 'Creating account...'}
          </>
        ) : (
          <>{mode === 'login' ? 'Sign in' : 'Register'}</>
        )}
      </button>

      <button
        type="button"
        className="w-full text-sm text-slate-400 hover:text-slate-200"
        onClick={onToggleMode}
      >
        {mode === 'login'
          ? "Don't have an account? Register"
          : 'Already have an account? Sign in'}
      </button>
    </form>
  );
}
