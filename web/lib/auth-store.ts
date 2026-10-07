'use client'

import { useEffect } from 'react'
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
      skipHydration: true,
    },
  ),
)

// Reads the stored session after mount so server and first client render match
export function useSessionReady() {
  const hydrated = useAuthStore((s) => s.hydrated)

  useEffect(() => {
    const markReady = () => {
      useAuthStore.setState({ hydrated: true })
    }
    if (useAuthStore.persist.hasHydrated()) {
      markReady()
      return
    }

    const unsubscribe = useAuthStore.persist.onFinishHydration(markReady)
    useAuthStore.persist.rehydrate()
    return unsubscribe
  }, [])

  return hydrated
}
