import { create } from 'zustand';
import api from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  isVerified: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: (() => { try { const u = localStorage.getItem('examgen_user'); return u ? JSON.parse(u) : null; } catch { return null; } })(),
  token: localStorage.getItem('examgen_token'),
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('examgen_token', data.token);
    localStorage.setItem('examgen_user', JSON.stringify(data.user));
    set({ user: data.user, token: data.token, isLoading: false });
  },

  register: async (name, email, password, role) => {
    set({ isLoading: true });
    const { data } = await api.post('/auth/register', { name, email, password, role });
    localStorage.setItem('examgen_token', data.token);
    localStorage.setItem('examgen_user', JSON.stringify(data.user));
    set({ user: data.user, token: data.token, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem('examgen_token');
    localStorage.removeItem('examgen_user');
    set({ user: null, token: null });
  },

  refreshUser: async () => {
    try {
      const { data } = await api.get('/auth/me');
      localStorage.setItem('examgen_user', JSON.stringify(data));
      set({ user: data });
    } catch { /* token expired */ }
  }
}));
