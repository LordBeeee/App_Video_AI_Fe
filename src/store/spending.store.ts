import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type SpendingState = {
  open: boolean
  budget: number
  pos: { right: number; bottom: number }
  setPos: (pos: { right: number; bottom: number }) => void
  setOpen: (open: boolean) => void
  setBudget: (budget: number) => void
}

export const useSpendingStore = create<SpendingState>()(
  persist(
    (set) => ({
      open: false,
      budget: 0,
      pos: { right: 20, bottom: 20 },
      setPos: (pos) => set({ pos }),
      setOpen: (open) => set({ open }),
      setBudget: (budget) => set({ budget: Math.max(0, Math.round(budget) || 0) }),
    }),
    { name: 'spending-bubble' },
  ),
)
