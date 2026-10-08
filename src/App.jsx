import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute' 
import Home from './pages/Home/Home'
import Login from './pages/Login/Login'
import './App.css'
import Library from './pages/Library/Library'
import Employees from './pages/Employees/Employees'
import EmployeeDetail from './pages/Employees/EmployeeDetail'
import Profile from './pages/Profile/Profile'
import Project from './pages/Project/Project'
import CreateStudio from './pages/CreateStudio/CreateStudio'
import Chat from './pages/Chat/Chat'
import Wallet from './pages/Wallet/Wallet'

function App() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={ <MainLayout> <Home /> </MainLayout>}/>
        <Route path="/create-video" element={<Navigate to="/create/video" replace />} />
        <Route path="/create/:modality" element={ <MainLayout> <CreateStudio /> </MainLayout>}/>
        <Route path="/chat" element={ <MainLayout> <Chat /> </MainLayout>}/>
        <Route path="/wallet" element={ <MainLayout> <Wallet /> </MainLayout>}/>
        <Route path="/create-video-motion-control" element={<Navigate to="/create/video" replace />} />
        <Route path="/library" element={ <MainLayout> <Library /> </MainLayout>}/>
        <Route path="/profile" element={ <MainLayout> <Profile /> </MainLayout>}/>
        <Route path="/projects" element={ <MainLayout> <Project /> </MainLayout>}/>

        <Route element={<AdminRoute />}>
          <Route path="/employees" element={<MainLayout><Employees /></MainLayout>} />
          <Route path="/employees/:id" element={ <MainLayout> <EmployeeDetail /> </MainLayout>}/>
        </Route>
      </Route>

      <Route path="/login" element={<Login />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
