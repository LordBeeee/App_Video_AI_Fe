import { useState } from 'react'
import Sidebar from '../components/Sidebar/Sidebar'

export default function MainLayout({ children }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <>
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed((current) => !current)}
      />
      <main
        className={`h-screen overflow-y-auto bg-background pl-20 text-on-background scrollbar-hide transition-[padding] duration-300 ease-in-out ${
          isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'
        }`}
      >
        {children}
      </main>
    </>
  )
}
