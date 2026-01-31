import { useEffect, useState } from "react"
import { Calendar, TrendingUp, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import axiosInstance from "../../api/axiosInstance"
import toast from "react-hot-toast"


export default function StudentAttendance() {
  const [view, setView] = useState("current")
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [summary, setSummary] = useState(null)
  const [dailyAttendance, setDailyAttendance] = useState([])
  const [monthlyReports, setMonthlyReports] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (view === "current") {
      fetchCurrentMonthAttendance()
    } else {
      fetchMonthlyReports()
    }
  }, [view, currentMonth, currentYear])

  const fetchCurrentMonthAttendance = async () => {
    setLoading(true)
    try {
      const res = await axiosInstance.get(
        `academics/student/attendance/?month=${currentMonth}&year=${currentYear}`
      )
      setSummary(res.data.summary)
      setDailyAttendance(res.data.daily_attendance)
    } catch (err) {
      toast.error("Failed to load attendance data")
    } finally {
      setLoading(false)
    }
  }

  const fetchMonthlyReports = async () => {
    setLoading(true)
    try {
      const res = await axiosInstance.get("academics/student/attendance/monthly/")
      setMonthlyReports(res.data)
    } catch (err) {
      toast.error("Failed to load monthly reports")
    } finally {
      setLoading(false)
    }
  }

  const goToPreviousMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12)
      setCurrentYear(currentYear - 1)
    } else {
      setCurrentMonth(currentMonth - 1)
    }
  }

  const goToNextMonth = () => {
    const now = new Date()
    const currentDate = new Date(currentYear, currentMonth - 1)
    const maxDate = new Date(now.getFullYear(), now.getMonth())
    
    if (currentDate >= maxDate) return // Don't go beyond current month

    if (currentMonth === 12) {
      setCurrentMonth(1)
      setCurrentYear(currentYear + 1)
    } else {
      setCurrentMonth(currentMonth + 1)
    }
  }

  const monthName = new Date(currentYear, currentMonth - 1).toLocaleDateString('en-US', { 
    month: 'long', 
    year: 'numeric' 
  })

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Attendance</h1>
          <p className="text-gray-600 mt-1">Track your attendance record</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white p-1 rounded-lg border border-gray-200 w-fit">
          <button
            onClick={() => setView("current")}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              view === "current"
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Current Month
          </button>
          <button
            onClick={() => setView("reports")}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              view === "reports"
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Reports
          </button>
        </div>

        {view === "current" ? (
          <CurrentMonthView
            loading={loading}
            summary={summary}
            dailyAttendance={dailyAttendance}
            monthName={monthName}
            onPrevious={goToPreviousMonth}
            onNext={goToNextMonth}
            canGoNext={currentYear < new Date().getFullYear() || 
                       (currentYear === new Date().getFullYear() && currentMonth < new Date().getMonth() + 1)}
          />
        ) : (
          <MonthlyReportsView loading={loading} reports={monthlyReports} />
        )}
      </div>
    </div>
  )
}

// Current Months Summary 

function CurrentMonthView({ loading, summary, dailyAttendance, monthName, onPrevious, onNext, canGoNext }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading attendance data...</p>
        </div>
      </div>
    )
  }

  if (!summary) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
        <Calendar size={48} className="mx-auto text-gray-300 mb-4" />
        <p className="text-gray-500 text-lg">No attendance data for this month</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Month Navigation */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 flex items-center justify-between">
        <button
          onClick={onPrevious}
          className="p-2 hover:bg-gray-100 rounded-lg transition"
        >
          <ChevronLeft size={24} className="text-gray-600" />
        </button>
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar size={20} className="text-indigo-600" />
          {monthName}
        </h2>
        <button
          onClick={onNext}
          disabled={!canGoNext}
          className={`p-2 rounded-lg transition ${
            canGoNext ? 'hover:bg-gray-100' : 'opacity-30 cursor-not-allowed'
          }`}
        >
          <ChevronRight size={24} className="text-gray-600" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Days"
          value={summary.total_days}
          color="blue"
          icon={Calendar}
        />
        <SummaryCard
          label="Present"
          value={summary.present_days}
          color="green"
          icon={CheckCircle}
        />
        <SummaryCard
          label="Absent"
          value={summary.absent_days}
          color="red"
          icon={XCircle}
        />
        <SummaryCard
          label="Attendance %"
          value={`${summary.attendance_percentage}%`}
          color="purple"
          icon={TrendingUp}
        />
      </div>

      {/* Attendance Percentage Bar */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-gray-800">Overall Attendance</h3>
          <span className="text-2xl font-black text-gray-900">
            {summary.attendance_percentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className={`h-4 rounded-full transition-all ${
              summary.attendance_percentage >= 75
                ? 'bg-gradient-to-r from-green-500 to-green-600'
                : summary.attendance_percentage >= 50
                ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                : 'bg-gradient-to-r from-red-500 to-red-600'
            }`}
            style={{ width: `${summary.attendance_percentage}%` }}
          ></div>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {summary.attendance_percentage >= 75
            ? '✓ Great attendance! Keep it up!'
            : summary.attendance_percentage >= 50
            ? '⚠ Your attendance needs improvement'
            : '⚠ Low attendance - please improve'}
        </p>
      </div>

      {/* Daily Attendance Calendar */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="font-bold text-gray-800">Daily Attendance Record</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {dailyAttendance.map((record, index) => (
              <AttendanceDay key={index} record={record} />
            ))}
          </div>
          {dailyAttendance.length === 0 && (
            <p className="text-center py-8 text-gray-400">
              No attendance records for this month
            </p>
          )}
        </div>
      </div>
    </div>
  )
}


// Monthly Reports

function MonthlyReportsView({ loading, reports }) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800">Monthly Attendance Reports</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Month</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">Total Days</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">Present</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">Absent</th>
              <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">Attendance %</th>
              <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {reports.map(report => {
              const monthName = new Date(report.year, report.month - 1).toLocaleDateString('en-US', {
                month: 'long',
                year: 'numeric'
              })
              
              return (
                <tr key={report.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-semibold text-gray-800">{monthName}</td>
                  <td className="px-6 py-4 text-center text-gray-600">{report.total_days}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                      {report.present_days}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                      {report.absent_days}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            report.attendance_percentage >= 75
                              ? 'bg-green-500'
                              : report.attendance_percentage >= 50
                              ? 'bg-yellow-500'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${report.attendance_percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-semibold text-gray-700 min-w-[45px]">
                        {report.attendance_percentage}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {report.attendance_percentage >= 75 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                        <CheckCircle size={12} />
                        Good
                      </span>
                    ) : report.attendance_percentage >= 50 ? (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                        <Clock size={12} />
                        Average
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                        <XCircle size={12} />
                        Low
                      </span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {reports.length === 0 && (
          <div className="p-12 text-center text-gray-400">
            No monthly reports available
          </div>
        )}
      </div>
    </div>
  )
}

function SummaryCard({ label, value, color, icon: Icon }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600'
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${colors[color]} flex items-center justify-center`}>
          <Icon className="text-white" size={20} />
        </div>
        <span className="text-2xl font-black text-gray-900">{value}</span>
      </div>
      <p className="text-sm font-semibold text-gray-600">{label}</p>
    </div>
  )
}


function AttendanceDay({ record }) {
  const date = new Date(record.date)
  const day = date.getDate()
  
  const statusConfig = {
    present: {
      bg: 'bg-green-50 border-green-200',
      icon: CheckCircle,
      iconColor: 'text-green-600',
      label: 'Present',
      labelColor: 'text-green-700'
    },
    absent: {
      bg: 'bg-red-50 border-red-200',
      icon: XCircle,
      iconColor: 'text-red-600',
      label: 'Absent',
      labelColor: 'text-red-700'
    },
    leave: {
      bg: 'bg-yellow-50 border-yellow-200',
      icon: Clock,
      iconColor: 'text-yellow-600',
      label: 'Leave',
      labelColor: 'text-yellow-700'
    }
  }

  const config = statusConfig[record.status] || statusConfig.present
  const Icon = config.icon

  return (
    <div className={`${config.bg} border rounded-lg p-4 transition hover:shadow-md`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-2xl font-black text-gray-900">{day}</div>
        <Icon className={config.iconColor} size={20} />
      </div>
      <div className="text-xs font-semibold text-gray-600 mb-1">
        {record.day_of_week}
      </div>
      <div className={`text-xs font-bold ${config.labelColor}`}>
        {config.label}
      </div>
    </div>
  )
}