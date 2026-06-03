// import { Navigate, Outlet, useLocation } from 'react-router-dom'
// import { useAuthStore } from '../store/auth.store'

// export default function ProtectedRoute() {
//   const location = useLocation()
//   const hydrated = useAuthStore((state) => state.hydrated)
//   const accessToken = useAuthStore((state) => state.accessToken)

//   if (!hydrated) {
//     return null
//   }

//   if (!accessToken) {
//     return <Navigate to="/login" replace state={{ from: location }} />
//   }

//   return <Outlet />
// }
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'

export default function ProtectedRoute() {
  const location = useLocation()
  const { user, hydrated } = useAuthStore()

  if (!hydrated) return null

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  return <Outlet />
}