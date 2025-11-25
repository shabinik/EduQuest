import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import SuperAdminLogin from './pages/SuperAdminLogin'
import SuperAdminDash from './pages/SuperAdminDash'
import SuperAdminPlans from './pages/SuperAdminPlans'
import CreatePlan from './pages/CreatePlan'
import SuperAdminLayout from './pages/SuperAdminLayout'
import EditPlan from './pages/EditPlan'

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
        <Route path = "*" element={<Navigate to="/login"/>} />
      </Routes>
    </BrowserRouter>

  )
}

export default App
