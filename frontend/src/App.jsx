import './App.css'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import SuperAdminLogin from './pages/superadmin/SuperAdminLogin'
import SuperAdminDash from './pages/superadmin/SuperAdminDash'
import SuperAdminPlans from './pages/superadmin/SuperAdminPlans'
import CreatePlan from './pages/superadmin/CreatePlan'
import SuperAdminLayout from './pages/superadmin/SuperAdminLayout'
import BuyPlan from './pages/admin/BuyPlan'
import EditPlan from './pages/superadmin/EditPlan'
import AdminLogin from './pages/admin/AdminLogin'
import AdminSignup from './pages/admin/AdminSignup'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import TeacherList from './pages/admin/TeacherList'
import LoginLanding from './pages/LoginLanding'
import TeacherLayout from './pages/teacher/TeacherLayout'
import TeacherDashboard from './pages/teacher/TeacherDashboard'
import TeacherProfile from './pages/teacher/TeacherProfile'
import TeacherChangePassword from './pages/teacher/TeacherChangePassword'
import TeacherLogin from './pages/teacher/TeacherLogin'
import StudentList from './pages/admin/StudentList'
import StudentLogin from './pages/student/StudentLogin'
import StudentLayout from './pages/student/StudentLayout'
import StudentDashboard from './pages/student/StudentDashboard'
import StudentProfile from './pages/student/StudentProfile'
import StudentChangePassword from './pages/student/StudentChangePassword'
import AdminProfile from './pages/admin/AdminProfile'
import AdminStudentDetail from './pages/admin/AdminStudentDetail'
import SuperAdminSchools from './pages/superadmin/SuperAdminSchools'
import RequireActiveSubscription from './guards/RequireActiveSubscription'
import SuperAdminBilling from './pages/superadmin/SuperAdminBilling'
import ForgotPassword from './pages/ForgotPassword'
import AdminChangePassword from './pages/admin/AdminChangePassword'
import ClassList from './pages/admin/ClassList'
import ClassDetail from './pages/admin/ClassDetail'
import TeacherClassView from './pages/teacher/TeacherClassView'
import AdminAnnouncementList from './pages/admin/AdminAnnouncementList'
import AdminTimeTable from './pages/admin/AdminTimeTable'
import StudentTimeTable from './pages/student/StudentTimeTable'
import TeacherTimeTable from './pages/teacher/TeacherTimeTable'
import TeacherAssignmentsPage from './pages/teacher/TeacherAssignmentsPage'
import StudentAssignmentsPage from './pages/student/StudentAssignmentsPage'
import TeacherAttendance from './pages/teacher/TeacherAttendance'
import StudentAttendance from './pages/student/StudentsAttendance'
import TeacherExamManagement from './pages/teacher/TeacherExamManagement'
import StudentExamPage from './pages/student/StudentExamPage'
import AdminFeeManagement from './pages/admin/AdminFeeManagement'
import StudentFeeManagement from './pages/student/StudentFeeManagement'


function App() {
  return (
    <BrowserRouter>
    
    {/* TOASTER */}
      <Toaster 
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3000,
            style: {
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              fontSize: '14px',
            },
          success: {
            style: {
              background: '#10b981',
              color: '#fff',
            },
          },
          error: {
            style: {
              background: '#ef4444',
              color: '#fff',
            },
          },
        }}
      />


    {/* ROUTES */}
      <Routes>
        <Route path="/" element={<LoginLanding />} />

        <Route path="/superadmin/login" element={<SuperAdminLogin/>} />
        <Route path='/superadmin' element={<SuperAdminLayout/>}>
            <Route index element={<SuperAdminDash/>} />
            <Route path='plans' element={<SuperAdminPlans/>}/>
            <Route path='plans/create' element={<CreatePlan/>}/>
            <Route path='plans/edit/:id' element={<EditPlan/>} />
            <Route path='schools' element={<SuperAdminSchools/>} />
            <Route path= 'billing' element={<SuperAdminBilling/>} />
        </Route>

        <Route path='/admin/signup' element={<AdminSignup/>} />
        <Route path='/admin/login' element={<AdminLogin/>} />
        <Route path='/admin' element={<AdminLayout/>}>
          <Route index element={<RequireActiveSubscription><AdminDashboard/></RequireActiveSubscription>} />
          <Route path='plans' element={<BuyPlan/>} /> 
          <Route path='teachers' element={<RequireActiveSubscription><TeacherList/></RequireActiveSubscription>} />
          <Route path="students" element={<RequireActiveSubscription><StudentList/></RequireActiveSubscription>} />
          <Route path="students/:id" element={<RequireActiveSubscription><AdminStudentDetail/></RequireActiveSubscription>}/>
          <Route path="profile" element={<AdminProfile />} /> 
          <Route path='change-password' element = {<AdminChangePassword />} />
          <Route path='classes' element={<RequireActiveSubscription><ClassList/></RequireActiveSubscription>} />
          <Route path='announcements' element={<RequireActiveSubscription><AdminAnnouncementList/></RequireActiveSubscription>} />
          <Route path='classes/:id' element={<RequireActiveSubscription><ClassDetail/></RequireActiveSubscription>} />
          <Route path='timetable' element={<RequireActiveSubscription><AdminTimeTable/></RequireActiveSubscription>} />
          <Route path='fee-management' element={<RequireActiveSubscription><AdminFeeManagement/></RequireActiveSubscription>} />
        </Route>
        
        <Route path="/teacher/login" element={<TeacherLogin />} />
        <Route path='/teacher' element={<TeacherLayout />}>
          <Route index element = {<RequireActiveSubscription><TeacherDashboard/></RequireActiveSubscription>} />
          <Route path='profile' element={<TeacherProfile/>}/>
          <Route path='change-password' element={<TeacherChangePassword />}/>
          <Route path='class' element={<RequireActiveSubscription><TeacherClassView /></RequireActiveSubscription>} />
          <Route path='timetable' element={<RequireActiveSubscription><TeacherTimeTable /></RequireActiveSubscription>} />
          <Route path='assignment' element={<RequireActiveSubscription><TeacherAssignmentsPage /></RequireActiveSubscription>} />
          <Route path='attendance' element={<RequireActiveSubscription><TeacherAttendance /></RequireActiveSubscription>} />
          <Route path='exam' element={<RequireActiveSubscription><TeacherExamManagement /></RequireActiveSubscription>} />
        </Route>

        <Route path='/student/login' element={<StudentLogin />} />
        <Route path='/student' element={<StudentLayout />}>
          <Route index element={<RequireActiveSubscription><StudentDashboard/></RequireActiveSubscription>} />
          <Route path='profile' element={<StudentProfile />} />
          <Route path='change-password' element={<StudentChangePassword />}/>
          <Route path='timetable' element={<RequireActiveSubscription><StudentTimeTable /></RequireActiveSubscription>} />
          <Route path='assignment' element={<RequireActiveSubscription><StudentAssignmentsPage /></RequireActiveSubscription>} />
          <Route path='attendance' element={<RequireActiveSubscription><StudentAttendance /></RequireActiveSubscription>} />
          <Route path='exam' element={<RequireActiveSubscription><StudentExamPage /></RequireActiveSubscription>} />
          <Route path='fee-management' element={<RequireActiveSubscription><StudentFeeManagement /></RequireActiveSubscription>} />
        </Route>

        <Route path='/forgot-password' element={<ForgotPassword/>} />

        <Route path = "*" element={<Navigate to="/login"/>} />
      </Routes>
    </BrowserRouter>

  )
}

export default App
