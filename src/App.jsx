import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute' 
import Home from './pages/Home/Home'
import Login from './pages/Login/Login'
import './App.css'
import CreateVideo from './pages/CreateVideo/CreateVideo'
import CreateVideoFlow from './pages/CreateVideoFlow/CreateVideoFlow'
import CreateVideoMotionControl from './pages/CreateVideoMotionControl/CreateVideoMotionControl'
import Library from './pages/Library/Library'
import Employees from './pages/Employees/Employees'
import EmployeeDetail from './pages/Employees/EmployeeDetail'
import Profile from './pages/Profile/Profile'
import Project from './pages/Project/Project'

function App() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={ <MainLayout> <Home /> </MainLayout>}/>
        <Route path="/create-video" element={ <MainLayout> <CreateVideo /> </MainLayout>}/>
        {/* <Route path="/create-video-flow" element={ <MainLayout> <CreateVideoFlow /> </MainLayout>}/> */}
        <Route path="/create-video-motion-control" element={ <MainLayout> <CreateVideoMotionControl /> </MainLayout>}/>
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