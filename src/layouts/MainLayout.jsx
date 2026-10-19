import { useEffect, useRef } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar/Sidebar'
import SpendingBubble from '../components/Spending/SpendingBubble'
import ThemePicker from '../components/Theme/ThemePicker'
import { useSidebarStore } from '../store/sidebar.store'

export default function MainLayout({ children }) {
  const expanded = useSidebarStore((s) => s.locked || s.hover || s.menu)
  const { pathname } = useLocation()
  const mainRef = useRef(null)

  useEffect(() => {
    mainRef.current?.scrollTo(0, 0)
  }, [pathname])

  return (
    <>
      <Sidebar />
      <main
        ref={mainRef}
        className={`h-screen overflow-y-auto bg-background pl-20 text-on-background scrollbar-hide transition-[padding] duration-300 ease-in-out ${
          expanded ? 'lg:pl-64' : 'lg:pl-20'
        }`}
      >
        {children ?? <Outlet />}
      </main>
      <SpendingBubble />
      <ThemePicker />
    </>
  )
}
