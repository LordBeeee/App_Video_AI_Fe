import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home/Home'
import Login from './pages/Login/Login'
import './App.css'
import CreateVideo from './pages/CreateVideo/CreateVideo'
import CreateVideoFlow from './pages/CreateVideoFlow/CreateVideoFlow'


function App() {
  return (
    <Routes>
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={ <MainLayout> <Home /> </MainLayout>}/>
        <Route path="/create-video" element={ <MainLayout> <CreateVideo /> </MainLayout>}/>
        <Route path="/create-video-flow" element={ <MainLayout> <CreateVideoFlow /> </MainLayout>}/>
      </Route>

      <Route path="/login" element={<Login />} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App