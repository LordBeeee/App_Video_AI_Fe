// import Header from '../components/Header'

// export default function MainLayout({ children }) {
//   return (
//     <>
//       <Header />

//       <main className="pt-16">
//         {children}
//       </main>
//     </>
//   )
// }

import Header from '../components/Header'
import Sidebar from '../components/Sidebar/Sidebar'

export default function MainLayout({ children }) {
  return (
    <>
      <Sidebar />
      {/* <Header /> */}
      {/* pt-16 */}
      <main className="pl-16 pt-16">
        {children}
      </main>
    </>
  )
}