import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '../store/auth.store'

export default function AdminRoute() {
  const user = useAuthStore((state) => state.user)

  // roleName = 'admin' đến từ login response
  if (user?.roleName !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}