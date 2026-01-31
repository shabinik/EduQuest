// Teacher Viewing Students and marking Attendance

import { useEffect, useState } from "react"
import { Calendar, Users, CheckCircle, XCircle, Clock, ArrowLeft, Save } from "lucide-react"
import toast from "react-hot-toast"
import axiosInstance from "../../api/axiosInstance"


export default function TeacherAttendance() {
  const [view, setView] = useState("list")
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])

  useEffect(() => {
    fetchAttendanceRecords()
  }, [])

  const fetchAttendanceRecords = async () => {
    setLoading(true)
    try {
      const res = await axiosInstance.get("academics/teacher/attendance/")
      setAttendanceRecords(res.data)
    } catch (err) {
      toast.error("Failed to load attendance records")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {view === "list" ? (
          <AttendanceList 
            records={attendanceRecords}
            loading={loading}
            onMarkAttendance={() => setView("mark")}
          />
        ) : (
          <MarkAttendance
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            onBack={() => setView("list")}
            onSuccess={() => {
              setView("list")
              fetchAttendanceRecords()
            }}
          />
        )}
      </div>
    </div>
  )
}

//  Attendance List of students

function AttendanceList({ records, loading, onMarkAttendance }) {
  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance Management</h1>
          <p className="text-gray-600 mt-1">Mark and track daily attendance</p>
        </div>
        <button
          onClick={onMarkAttendance}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
        >
          <CheckCircle size={20} />
          Mark Today's Attendance
        </button>
      </div>

      {/* Records Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Attendance Records</h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : records.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No attendance records found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Class</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">Total</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">Present</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">Absent</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">Attendance %</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Marked By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {records.map(record => {
                  const percentage = ((record.present_count / record.total_students) * 100).toFixed(1)
                  return (
                    <tr key={record.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 font-semibold text-gray-800">
                        {new Date(record.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {record.class_name} - {record.division}
                      </td>
                      <td className="px-6 py-4 text-center font-semibold text-gray-800">
                        {record.total_students}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                          <CheckCircle size={14} />
                          {record.present_count}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                          <XCircle size={14} />
                          {record.absent_count}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${
                                percentage >= 75 ? 'bg-green-500' : percentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-700">{percentage}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600 text-sm">
                        {record.marked_by_name}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}


// Marking students attendance by Teacher

function MarkAttendance({ selectedDate, setSelectedDate, onBack, onSuccess }) {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const classId = 1 // This should come from teacher's assigned class

  useEffect(() => {
    fetchStudents()
  }, [selectedDate])

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const res = await axiosInstance.get(
        `academics/teacher/attendance/students/?class_id=${classId}&date=${selectedDate}`
      )
      setStudents(res.data.students)
    } catch (err) {
      toast.error("Failed to load students")
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = (studentId) => {
    setStudents(students.map(s => {
      if (s.id === studentId) {
        let newStatus = 'present'
        if (s.status === 'present') newStatus = 'absent'
        else if (s.status === 'absent') newStatus = 'leave'
        else newStatus = 'present'
        return { ...s, status: newStatus }
      }
      return s
    }))
  }

  const markAll = (status) => {
    setStudents(students.map(s => ({ ...s, status })))
  }

  const formatDateToISO = (date) => {
    const d = new Date(date)
    return d.toISOString().split("T")[0]
  }


  const handleSubmit = async () => {
    setSaving(true)
    try {
      const attendanceData = students.map(s => ({
        student_id: s.id,
        status: s.status
      }))

      await axiosInstance.post("academics/teacher/attendance/mark/", {
        school_class: classId,
        date: selectedDate,
        attendance_data: attendanceData
      })

      toast.success("Attendance marked successfully!")
      onSuccess()
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to mark attendance")
    } finally {
      setSaving(false)
    }
  }

  const stats = {
    total: students.length,
    present: students.filter(s => s.status === 'present').length,
    absent: students.filter(s => s.status === 'absent').length,
    leave: students.filter(s => s.status === 'leave').length
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-semibold mb-4 transition"
        >
          <ArrowLeft size={20} />
          Back to Records
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Mark Attendance</h1>
        <p className="text-gray-600 mt-1">Select attendance status for each student</p>
      </div>

      {/* Date and Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Select Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(formatDateToISO(e.target.value))}
              max={new Date().toISOString().split('T')[0]}
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Quick Actions</label>
            <div className="flex gap-2">
              <button
                onClick={() => markAll('present')}
                className="flex-1 bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg font-semibold transition"
              >
                Mark All Present
              </button>
              <button
                onClick={() => markAll('absent')}
                className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-semibold transition"
              >
                Mark All Absent
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Students" value={stats.total} color="blue" />
        <StatCard label="Present" value={stats.present} color="green" />
        <StatCard label="Absent" value={stats.absent} color="red" />
        <StatCard label="On Leave" value={stats.leave} color="yellow" />
      </div>

      {/* Students List */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Students</h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {students.map(student => (
              <div
                key={student.id}
                className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <span className="text-indigo-700 font-bold">
                      {student.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">{student.name}</p>
                    <p className="text-sm text-gray-500">Roll: {student.roll_number}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleStatus(student.id)}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      student.status === 'present'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <CheckCircle size={16} className="inline mr-1" />
                    Present
                  </button>
                  <button
                    onClick={() => toggleStatus(student.id)}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      student.status === 'absent'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <XCircle size={16} className="inline mr-1" />
                    Absent
                  </button>
                  <button
                    onClick={() => toggleStatus(student.id)}
                    className={`px-4 py-2 rounded-lg font-semibold transition ${
                      student.status === 'leave'
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Clock size={16} className="inline mr-1" />
                    Leave
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        onClick={handleSubmit}
        disabled={saving}
        className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition ${
          saving
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg'
        }`}
      >
        {saving ? (
          <>
            <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
            Saving...
          </>
        ) : (
          <>
            <Save size={20} />
            Save Attendance
          </>
        )}
      </button>
    </div>
  )
}

function StatCard({ label, value, color }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    yellow: 'from-yellow-500 to-yellow-600'
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br ${colors[color]} shadow-lg mb-2`}>
        <span className="text-2xl font-black text-white">{value}</span>
      </div>
      <p className="text-sm font-semibold text-gray-600">{label}</p>
    </div>
  )
}