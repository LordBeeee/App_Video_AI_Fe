import { useAuthStore } from '../../store/auth.store'
import AdminHome from './AdminHome'
import UserHome from './UserHome'

export default function Home() {
  const isAdmin = useAuthStore((s) => s.user?.roleName === 'admin')
  return isAdmin ? <AdminHome /> : <UserHome />
}
