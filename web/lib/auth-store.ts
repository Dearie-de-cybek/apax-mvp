'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import type { PublicUser } from '@/src/types/auth'

interface AuthState {
  token: string | null
  user: PublicUser | null
  hydrated: boolean
  setSession: (token: string, user: PublicUser) => void
  clearSession: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      hydrated: false,
      setSession: (token, user) => set({ token, user }),
      clearSession: () => set({ token: null, user: null }),
    }),
    {
      name: 'apax-session',
      storage: createJSONStorage(() => localStorage),
      partialize: ({ token, user }) => ({ token, user }),
      onRehydrateStorage: () => () => {
        useAuthStore.setState({ hydrated: true })
      },
    },
  ),
)
