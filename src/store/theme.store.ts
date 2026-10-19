import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemeLayer = 'primary' | 'secondary' | 'accent' | 'soft' | 'ink' | 'surface'
export type ThemeColors = Record<ThemeLayer, string>

export const LAYERS: { key: ThemeLayer; label: string; hint: string; cssVar: string }[] = [
  { key: 'primary', label: 'Primary', hint: 'Nút chính, viền nhấn, biểu đồ', cssVar: '--t-primary' },
  { key: 'secondary', label: 'Secondary', hint: 'Chữ nhấn, liên kết, trạng thái hover', cssVar: '--t-secondary' },
  { key: 'accent', label: 'Accent', hint: 'Số liệu nổi bật, huy hiệu', cssVar: '--t-accent' },
  { key: 'soft', label: 'Soft', hint: 'Chữ phụ trên nền tối, viền nhạt', cssVar: '--t-soft' },
  { key: 'ink', label: 'Ink', hint: 'Các mảng tối: thanh bên, bảng điều khiển', cssVar: '--t-ink' },
  { key: 'surface', label: 'Surface', hint: 'Nền trang và mảng sáng', cssVar: '--t-bg' },
]

export const DEFAULT_COLORS: ThemeColors = {
  primary: '#d4621a',
  secondary: '#a84a0f',
  accent: '#f4ae52',
  soft: '#f4ae52',
  ink: '#2a1a0e',
  surface: '#fef3e2',
}

export const PRESETS: { name: string; colors: ThemeColors }[] = [
  { name: 'Cam', colors: DEFAULT_COLORS },
  { name: 'Biển', colors: { primary: '#2f80ed', secondary: '#1d4ed8', accent: '#38bdf8', soft: '#93c5fd', ink: '#111c2e', surface: '#f1f4f8' } },
  { name: 'Tím', colors: { primary: '#8b5cf6', secondary: '#6d28d9', accent: '#f0abfc', soft: '#c4b5fd', ink: '#1e1730', surface: '#f4f2f8' } },
  { name: 'Rừng', colors: { primary: '#22a559', secondary: '#15803d', accent: '#bef264', soft: '#86efac', ink: '#12241a', surface: '#f1f5f2' } },
  { name: 'Hồng', colors: { primary: '#ec4899', secondary: '#be185d', accent: '#fbbf24', soft: '#f9a8d4', ink: '#2a1420', surface: '#f8f2f5' } },
]

type ThemeState = {
  colors: ThemeColors
  open: boolean
  setOpen: (open: boolean) => void
  setColor: (layer: ThemeLayer, value: string) => void
  setAll: (colors: ThemeColors) => void
  reset: () => void
}

export function applyTheme(colors: ThemeColors) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  LAYERS.forEach(({ key, cssVar }) => {
    if (colors[key].toLowerCase() === DEFAULT_COLORS[key]) root.style.removeProperty(cssVar)
    else root.style.setProperty(cssVar, colors[key])
  })
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      colors: DEFAULT_COLORS,
      open: false,
      setOpen: (open) => set({ open }),
      setColor: (layer, value) => set((s) => ({ colors: { ...s.colors, [layer]: value.toLowerCase() } })),
      setAll: (colors) => set({ colors: { ...colors } }),
      reset: () => set({ colors: DEFAULT_COLORS }),
    }),
    {
      name: 'theme-layers',
      partialize: (s) => ({ colors: s.colors }),
      merge: (saved, current) => ({
        ...current,
        colors: { ...DEFAULT_COLORS, ...((saved as Partial<ThemeState> | undefined)?.colors || {}) },
      }),
    },
  ),
)

applyTheme(useThemeStore.getState().colors)
useThemeStore.subscribe((s) => applyTheme(s.colors))
