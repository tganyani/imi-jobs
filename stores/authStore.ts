// stores/useAuthStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  email: string | null
  userId: string | null
  isLoggedIn: boolean
  role:string|null
  login: (email: string, userId: string,role:string) => void
  logout: () => void,
  setRole:(role:string)=>void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      email: null,
      userId: null,
      isLoggedIn: false,
      role:null,
      login: (email, userId,role) =>
        set({ email, userId, isLoggedIn: true,role }),
      logout: () =>
        set({ email: null, userId: null, isLoggedIn: false }),
      setRole:(role)=>set({role})
    }),
    {
      name: 'auth-storage', // localStorage key
    }
  )
)
