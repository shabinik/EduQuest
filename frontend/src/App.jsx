import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import SuperAdminLogin from './pages/SuperAdminLogin'
import SuperAdminDash from './pages/SuperAdminDash'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<SuperAdminLogin/>} />
        <Route path="/superadmindash" element={<SuperAdminDash/>} />
        <Route path = "*" element={<Navigate to="/login"/>} />
      </Routes>
    </BrowserRouter>

  )
}

export default App
