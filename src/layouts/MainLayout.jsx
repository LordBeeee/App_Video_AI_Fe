import Header from '../components/Header'
import Sidebar from '../components/Sidebar/Sidebar'

export default function MainLayout({ children }) {
  return (
    <>
      <Sidebar />
      {/* <Header /> */}
      {/* pt-16 */}
      <main className="pl-16 h-screen overflow-y-auto scrollbar-hide">
        {children}
      </main>
    </>
  )
}