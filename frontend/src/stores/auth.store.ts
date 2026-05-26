import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthUser {
  id: string;
  email: string;
  username: string;
}

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  setSession: (data: { user: AuthUser; accessToken: string; refreshToken: string }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      setSession: ({ user, accessToken, refreshToken }) =>
        set({ user, accessToken, refreshToken }),
      logout: () => set({ user: null, accessToken: null, refreshToken: null }),
    }),
    {
      name: 'chat-auth',
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
