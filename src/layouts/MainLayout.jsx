import Header from '../components/Header'
import Sidebar from '../components/Sidebar/Sidebar'

export default function MainLayout({ children }) {
  return (
    <>
      <Sidebar />
      {/* <Header /> */}
      {/* pt-16 */}
      <main className="h-screen overflow-y-auto pl-20 scrollbar-hide lg:pl-64">
        {children}
      </main>
    </>
  )
}
