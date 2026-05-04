import Header from '../components/Header'

export default function MainLayout({ children }) {
  return (
    <>
      <Header />

      <main className="pt-16">
        {children}
      </main>
    </>
  )
}