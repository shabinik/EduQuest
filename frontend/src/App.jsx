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
import TeacherList from './pages/TeacherList'
import LoginLanding from './pages/LoginLanding'
import TeacherLayout from './pages/TeacherLayout'
import TeacherDashboard from './pages/TeacherDashboard'
import TeacherProfile from './pages/TeacherProfile'
import TeacherChangePassword from './pages/TeacherChangePassword'
import TeacherLogin from './pages/TeacherLogin'
import StudentList from './pages/StudentList'
import StudentLogin from './pages/StudentLogin'
import StudentLayout from './pages/StudentLayout'
import StudentDashboard from './pages/StudentDashboard'
import StudentProfile from './pages/StudentProfile'
import StudentChangePassword from './pages/StudentChangePassword'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginLanding />} />

        <Route path="/superadmin/login" element={<SuperAdminLogin/>} />
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
          <Route path='teachers' element={<TeacherList/>} />
          <Route path="students" element={<StudentList/>} /> 
        </Route>
        
        <Route path="/teacher/login" element={<TeacherLogin />} />
        <Route path='/teacher' element={<TeacherLayout />}>
          <Route index element = {<TeacherDashboard/>} />
          <Route path='profile' element={<TeacherProfile/>}/>
          <Route path='change-password' element={<TeacherChangePassword />}/>
        </Route>

        <Route path='/student/login' element={<StudentLogin />} />
        <Route path='/student' element={<StudentLayout />}>
          <Route index element={<StudentDashboard/>} />
          <Route path='profile' element={<StudentProfile />} />
          <Route path='change-password' element={<StudentChangePassword />}/>
        </Route>

        <Route path = "*" element={<Navigate to="/login"/>} />
      </Routes>
    </BrowserRouter>

  )
}

export default App
