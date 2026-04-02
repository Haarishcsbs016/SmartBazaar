import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

const normalizeEmail = (email) => email.trim().toLowerCase();

export const useAuthStore = create(
  persist(
    (set, get) => ({
      currentUser: null,
      accounts: [],
      login: (email, password) => {
        const account = get().accounts.find(
          (item) => item.email === normalizeEmail(email) && item.password === password
        );

        if (!account) {
          throw new Error('Invalid email or password');
        }

        set({ currentUser: { name: account.name, email: account.email } });
        return account;
      },
      signup: (name, email, password) => {
        const normalizedEmail = normalizeEmail(email);

        if (get().accounts.some((item) => item.email === normalizedEmail)) {
          throw new Error('An account already exists for this email');
        }

        const account = {
          id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
          name: name.trim(),
          email: normalizedEmail,
          password,
        };

        set((state) => ({
          accounts: [...state.accounts, account],
          currentUser: { name: account.name, email: account.email },
        }));

        return account;
      },
      logout: () => set({ currentUser: null }),
    }),
    {
      name: 'market-sphere-auth',
      storage: createJSONStorage(() => localStorage),
    }
  )
);