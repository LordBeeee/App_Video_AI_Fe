import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type SidebarState = {
  locked: boolean
  hover: boolean
  menu: boolean
  toggleLock: () => void
  setHover: (hover: boolean) => void
  setMenu: (menu: boolean) => void
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      locked: false,
      hover: false,
      menu: false,
      toggleLock: () => set((s) => ({ locked: !s.locked })),
      setHover: (hover) => set({ hover }),
      setMenu: (menu) => set({ menu }),
    }),
    { name: 'sidebar-locked', partialize: (s) => ({ locked: s.locked }) },
  ),
)
