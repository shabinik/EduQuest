import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import SuperAdminLogin from './pages/SuperAdminLogin'
import SuperAdminDash from './pages/SuperAdminDash'
import SuperAdminPlans from './pages/SuperAdminPlans'
import CreatePlan from './pages/CreatePlan'
import SuperAdminLayout from './pages/SuperAdminLayout'
import BuyPlan from './pages/BuyPlan'
import EditPlan from './pages/EditPlan'
import AdminLogin from './pages/AdminLogin'
import AdminSignup from './pages/AdminSignup'
import AdminLayout from './pages/AdminLayout'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<SuperAdminLogin/>} />
        <Route path='/superadmin' element={<SuperAdminLayout/>}>
            <Route index element={<SuperAdminDash/>} />
            <Route path='plans' element={<SuperAdminPlans/>}/>
            <Route path='plans/create' element={<CreatePlan/>}/>
            <Route path='plans/edit/:id' element={<EditPlan/>} />
        </Route>

        <Route path='/admin/signup' element={<AdminSignup/>} />
        <Route path='/admin/login' element={<AdminLogin/>} />
        <Route path='/admin' element={<AdminLayout/>}>
          <Route index element={<AdminDashboard/>} />
          <Route path='plans' element={<BuyPlan/>} />      
        </Route>
        
        <Route path = "*" element={<Navigate to="/login"/>} />
      </Routes>
    </BrowserRouter>

  )
}

export default App
