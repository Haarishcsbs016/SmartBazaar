import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { authAPI } from './apiService';

export const useAuthStore = create(
  persist(
    (set) => ({
      currentUser: null,
      token: null,
      loadingAuth: false,
      authChecked: false,
      login: async (email, password) => {
        set({ loadingAuth: true });
        try {
          const response = await authAPI.login({ email: email.trim().toLowerCase(), password });
          set({
            currentUser: response.user,
            token: response.token,
            loadingAuth: false,
            authChecked: true,
          });
          return response.user;
        } catch (error) {
          set({ loadingAuth: false });
          throw error;
        }
      },
      signup: async (name, email, password) => {
        set({ loadingAuth: true });
        try {
          const response = await authAPI.register({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
          });

          set({
            currentUser: response.user,
            token: response.token,
            loadingAuth: false,
            authChecked: true,
          });

          return response.user;
        } catch (error) {
          set({ loadingAuth: false });
          throw error;
        }
      },
      restoreSession: async () => {
        const token = useAuthStore.getState().token;
        if (!token) {
          set({ authChecked: true });
          return;
        }

        try {
          const response = await authAPI.me(token);
          set({ currentUser: response.data, authChecked: true });
        } catch {
          set({ currentUser: null, token: null, authChecked: true });
        }
      },
      logout: () => set({ currentUser: null, token: null, authChecked: true }),
    }),
    {
      name: 'market-sphere-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
);