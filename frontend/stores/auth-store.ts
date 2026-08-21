import { create } from 'zustand';
import { User, AuthTokens } from '../types';
import { apiClient } from '../lib/api-client';

export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthStore {
  user: User | null;
  tokens: AuthTokens | null;
  status: AuthStatus;
  isAuthenticated: boolean;
  setAuth: (user: User, tokens: AuthTokens) => void;
  updateUser: (updates: Partial<User>) => void;
  checkSession: () => Promise<boolean>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  tokens: null,
  status: 'idle',
  isAuthenticated: false,
  setAuth: (user, tokens) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_access_token', tokens.accessToken);
      localStorage.setItem('auth_refresh_token', tokens.refreshToken);
      localStorage.setItem('auth_user', JSON.stringify(user));
    }
    set({ user, tokens, isAuthenticated: true, status: 'authenticated' });
  },
  updateUser: (updates) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...updates } : null,
    })),
  checkSession: async () => {
    set({ status: 'loading' });
    try {
      if (typeof window === 'undefined') {
        set({ status: 'unauthenticated', isAuthenticated: false });
        return false;
      }

      const token = localStorage.getItem('auth_access_token');
      if (!token) {
        set({ user: null, tokens: null, isAuthenticated: false, status: 'unauthenticated' });
        return false;
      }

      const res = await apiClient.get('/auth/me');
      const data = res.data?.data || res.data;

      if (data?.user) {
        set({
          user: data.user,
          isAuthenticated: true,
          status: 'authenticated',
        });
        localStorage.setItem('auth_user', JSON.stringify(data.user));
        return true;
      }
      set({ status: 'unauthenticated', isAuthenticated: false });
      return false;
    } catch {
      set({ user: null, tokens: null, isAuthenticated: false, status: 'unauthenticated' });
      return false;
    }
  },
  logout: async () => {
    try {
      const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('auth_refresh_token') : undefined;
      await apiClient.post('/auth/logout', { refreshToken });
    } catch {
      // Ignore network errors during logout
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_access_token');
        localStorage.removeItem('auth_refresh_token');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('active_org_id');
        localStorage.removeItem('active_workspace_id');
      }
      set({ user: null, tokens: null, isAuthenticated: false, status: 'unauthenticated' });
    }
  },
}));
