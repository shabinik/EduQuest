import { useEffect, useState } from "react"
import { 
  Plus, Eye, Edit2, Trash2, ArrowLeft, Calendar, Clock, 
  Users, FileText, CheckCircle, AlertCircle, Save, X 
} from "lucide-react"
import toast from "react-hot-toast"
import axiosInstance from "../../api/axiosInstance"

export default function TeacherExamManagement() {
  const [view, setView] = useState("list")
  const [exams, setExams] = useState([])
  const [selectedExam, setSelectedExam] = useState(null)
  const [selectedConcern, setSelectedConcern] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (view === "list") {
      fetchExams()
    }
  }, [view])

  const fetchExams = async () => {
    setLoading(true)
    try {
      const res = await axiosInstance.get("exam/teacher/exams/")
      setExams(res.data)
    } catch (err) {
      handleError(err, "Failed to load exams")
    } finally {
      setLoading(false)
    }
  }

  const handleError = (error, defaultMessage) => {
    if (error.response?.data) {
      const errorData = error.response.data
      if (typeof errorData === 'object') {
        Object.entries(errorData).forEach(([key, value]) => {
          const message = Array.isArray(value) ? value[0] : value
          toast.error(`${key}: ${message}`)
        })
      } else {
        toast.error(errorData || defaultMessage)
      }
    } else {
      toast.error(defaultMessage)
    }
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {view === "list" && (
          <ExamList
            exams={exams}
            loading={loading}
            onCreate={() => {
              setSelectedExam(null)
              setView("form")
            }}
            onEdit={(exam) => {
              setSelectedExam(exam)
              setView("form")
            }}
            onViewResults={(exam) => {
              setSelectedExam(exam)
              setView("results")
            }}
            onViewConcerns={() => setView("concerns")}
            onDelete={async (id) => {
              if (window.confirm("Delete this exam?")) {
                try {
                  await axiosInstance.delete(`exam/teacher/exams/${id}/`)
                  toast.success("Exam deleted")
                  fetchExams()
                } catch (err) {
                  handleError(err, "Failed to delete exam")
                }
              }
            }}
          />
        )}

        {view === "form" && (
          <ExamForm
            exam={selectedExam}
            onBack={() => setView("list")}
            onSuccess={() => {
              setView("list")
              fetchExams()
            }}
            handleError={handleError}
          />
        )}

        {view === "results" && (
          <ExamResults
            exam={selectedExam}
            onBack={() => setView("list")}
            handleError={handleError}
          />
        )}

        {view === "concerns" && (
          <ConcernList
            onBack={() => setView("list")}
            onReview={(concern) => {
              setSelectedConcern(concern)
              setView("review-concern")
            }}
            handleError={handleError}
          />
        )}

        {view === "review-concern" && (
          <ReviewConcern
            concern={selectedConcern}
            onBack={() => setView("concerns")}
            onSuccess={() => setView("concerns")}
            handleError={handleError}
          />
        )}
      </div>
    </div>
  )
}

// Exam List Component
function ExamList({ exams, loading, onCreate, onEdit, onViewResults, onViewConcerns, onDelete }) {
  const getStatusBadge = (status) => {
    const badges = {
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Scheduled' },
      ongoing: { bg: 'bg-green-100', text: 'text-green-700', label: 'Ongoing' },
      completed: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Completed' },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' }
    }
    const badge = badges[status] || badges.scheduled
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    )
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exam Management</h1>
          <p className="text-gray-600 mt-1">Create and manage exams</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onViewConcerns}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
          >
            <AlertCircle size={20} />
            View Concerns
          </button>
          <button
            onClick={onCreate}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 transition"
          >
            <Plus size={20} />
            Create Exam
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Exams</h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : exams.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No exams found. Create your first exam!
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Subject</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase">Date & Time</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">Max Marks</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">Students</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-gray-600 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {exams.map(exam => (
                  <tr key={exam.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-800">{exam.title}</div>
                      {exam.room && <div className="text-xs text-gray-500">Room: {exam.room}</div>}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{exam.subject_name}</td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-gray-800">
                        {new Date(exam.exam_date).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {exam.start_time.slice(0, 5)} - {exam.end_time.slice(0, 5)}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-gray-800">{exam.max_marks}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="text-sm font-semibold text-gray-800">{exam.total_students}</div>
                      <div className="text-xs text-gray-500">{exam.results_submitted} graded</div>
                    </td>
                    <td className="px-6 py-4 text-center">{getStatusBadge(exam.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onViewResults(exam)}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                          title="View Results"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => onEdit(exam)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => onDelete(exam.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// Exam Form Component
function ExamForm({ exam, onBack, onSuccess, handleError }) {
  const isEdit = !!exam
  const [loading, setLoading] = useState(false)
  const [subjects, setSubjects] = useState([])
  const [classes, setClasses] = useState([])
  
  const [form, setForm] = useState({
    title: exam?.title || "",
    description: exam?.description || "",
    subject: exam?.subject || "",
    classes: exam?.class_details?.map(c => c.id) || [],
    exam_date: exam?.exam_date || "",
    start_time: exam?.start_time?.slice(0, 5) || "",
    end_time: exam?.end_time?.slice(0, 5) || "",
    room: exam?.room || "",
    max_marks: exam?.max_marks || ""
  })

  useEffect(() => {
    fetchDropdowns()
  }, [])

  const fetchDropdowns = async () => {
    try {
      const [subRes, clsRes] = await Promise.all([
        axiosInstance.get("classroom/teacher/subjects/dropdown"),
        axiosInstance.get("classroom/teacher/classes/dropdown/")
      ])
      setSubjects(subRes.data)
      setClasses(clsRes.data)
    } catch (err) {
      handleError(err, "Failed to load dropdowns")
    }
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      if (isEdit) {
        await axiosInstance.put(`exam/teacher/exams/${exam.id}/`, form)
        toast.success("Exam updated successfully")
      } else {
        await axiosInstance.post("exam/teacher/exams/", form)
        toast.success("Exam created successfully")
      }
      onSuccess()
    } catch (err) {
      handleError(err, "Failed to save exam")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-semibold mb-6 transition"
      >
        <ArrowLeft size={20} />
        Back to Exams
      </button>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden max-w-3xl mx-auto">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <h2 className="text-2xl font-bold">{isEdit ? "Edit Exam" : "Create Exam"}</h2>
          <p className="text-indigo-100 text-sm">Fill in the exam details</p>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Exam Title *</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="e.g., Mid Term Examination"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Subject *</label>
              <select
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
              >
                <option value="">Select Subject</option>
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Max Marks *</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={form.max_marks}
                onChange={(e) => setForm({ ...form, max_marks: e.target.value })}
                placeholder="100"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Assign to Classes * <span className="text-xs text-gray-400">(Hold Ctrl/Cmd to select multiple)</span>
            </label>
            <select
              multiple
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none min-h-[120px]"
              value={form.classes}
              onChange={(e) => setForm({ ...form, classes: [...e.target.selectedOptions].map(o => o.value) })}
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Exam Date *</label>
              <input
                type="date"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={form.exam_date}
                onChange={(e) => setForm({ ...form, exam_date: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Start Time *</label>
              <input
                type="time"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={form.start_time}
                onChange={(e) => setForm({ ...form, start_time: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">End Time *</label>
              <input
                type="time"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={form.end_time}
                onChange={(e) => setForm({ ...form, end_time: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Room/Venue</label>
            <input
              type="text"
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={form.room}
              onChange={(e) => setForm({ ...form, room: e.target.value })}
              placeholder="e.g., Room 101"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Description</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none resize-none min-h-[100px]"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Additional instructions or information"
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition ${
              loading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg'
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <Save size={20} />
                {isEdit ? "Update Exam" : "Create Exam"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Exam Results Component
function ExamResults({ exam, onBack, handleError }) {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [grading, setGrading] = useState({})

  useEffect(() => {
    fetchResults()
  }, [])

  const fetchResults = async () => {
    setLoading(true)
    try {
      const res = await axiosInstance.get(`exam/teacher/exams/${exam.id}/results/`)
      setResults(res.data)
    } catch (err) {
      handleError(err, "Failed to load results")
    } finally {
      setLoading(false)
    }
  }

  const handleGrade = async (resultId, marks, remarks, status) => {
    setGrading({ ...grading, [resultId]: true })
    try {
      await axiosInstance.patch(`exam/teacher/results/${resultId}/grade/`, {
        marks_obtained: status === 'absent' ? null : parseFloat(marks),
        remarks,
        status
      })
      toast.success("Result graded successfully")
      fetchResults()
    } catch (err) {
      handleError(err, "Failed to grade result")
    } finally {
      setGrading({ ...grading, [resultId]: false })
    }
  }

  const stats = {
    total: results.length,
    graded: results.filter(r => r.status === 'graded').length,
    pending: results.filter(r => r.status === 'pending').length,
    absent: results.filter(r => r.status === 'absent').length
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-semibold mb-6 transition"
      >
        <ArrowLeft size={20} />
        Back to Exams
      </button>

      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{exam.title}</h2>
        <div className="flex items-center gap-6 text-sm text-gray-600">
          <span className="flex items-center gap-1">
            <Calendar size={16} />
            {new Date(exam.exam_date).toLocaleDateString()}
          </span>
          <span className="flex items-center gap-1">
            <Clock size={16} />
            {exam.start_time.slice(0, 5)} - {exam.end_time.slice(0, 5)}
          </span>
          <span className="flex items-center gap-1">
            <FileText size={16} />
            Max Marks: {exam.max_marks}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Students" value={stats.total} color="blue" />
        <StatCard label="Graded" value={stats.graded} color="green" />
        <StatCard label="Pending" value={stats.pending} color="yellow" />
        <StatCard label="Absent" value={stats.absent} color="red" />
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-800">Student Results</h3>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {results.map(result => (
              <ResultRow
                key={result.id}
                result={result}
                maxMarks={exam.max_marks}
                onGrade={handleGrade}
                grading={grading[result.id]}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function ResultRow({ result, maxMarks, onGrade, grading }) {
  const [marks, setMarks] = useState(result.marks_obtained || "")
  const [remarks, setRemarks] = useState(result.remarks || "")
  const [status, setStatus] = useState(result.status)

  const isGraded = result.status === 'graded'

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-indigo-700 font-bold text-lg">
              {result.student_name.charAt(0)}
            </span>
          </div>
          <div>
            <p className="font-semibold text-gray-800">{result.student_name}</p>
            <p className="text-sm text-gray-500">Roll: {result.student_roll}</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Marks (out of {maxMarks})</label>
            <input
              type="number"
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              disabled={isGraded || status === 'absent'}
              max={maxMarks}
              min={0}
              placeholder="Enter marks"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStatus('absent')}
              className={`px-3 py-1 rounded-lg text-sm font-semibold transition ${
                status === 'absent'
                  ? 'bg-red-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Mark Absent
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Remarks</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              disabled={isGraded}
              rows={2}
              placeholder="Optional remarks"
            />
          </div>
          {!isGraded && (
            <button
              onClick={() => onGrade(result.id, marks, remarks, status)}
              disabled={grading || (status !== 'absent' && !marks)}
              className={`w-full py-2 rounded-lg font-semibold transition ${
                grading || (status !== 'absent' && !marks)
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {grading ? 'Saving...' : 'Save Grade'}
            </button>
          )}
          {isGraded && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
              <p className="text-xs text-green-600 font-semibold">Graded</p>
              <p className="text-lg font-bold text-green-700">
                {result.marks_obtained}/{maxMarks} ({result.percentage}%)
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, color }) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600'
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

// Concern List Component
function ConcernList({ onBack, onReview, handleError }) {
  const [concerns, setConcerns] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    fetchConcerns()
  }, [])

  const fetchConcerns = async () => {
    setLoading(true)
    try {
      const res = await axiosInstance.get("exam/teacher/concerns/")
      setConcerns(res.data)
    } catch (err) {
      handleError(err, "Failed to load concerns")
    } finally {
      setLoading(false)
    }
  }

  const filtered = concerns.filter(c => {
    if (filter === "pending") return c.status === "pending"
    if (filter === "under_review") return c.status === "under_review"
    if (filter === "resolved") return c.status === "resolved"
    if (filter === "rejected") return c.status === "rejected"
    return true
  })

  const stats = {
    total: concerns.length,
    pending: concerns.filter(c => c.status === "pending").length,
    under_review: concerns.filter(c => c.status === "under_review").length,
    resolved: concerns.filter(c => c.status === "resolved").length
  }

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
      under_review: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Under Review' },
      resolved: { bg: 'bg-green-100', text: 'text-green-700', label: 'Resolved' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' }
    }
    const badge = badges[status] || badges.pending
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        {badge.label}
      </span>
    )
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-semibold mb-6 transition"
      >
        <ArrowLeft size={20} />
        Back to Exams
      </button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Student Concerns</h1>
        <p className="text-gray-600 mt-1">Review and respond to student concerns</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`${filter === "all" ? "ring-2 ring-indigo-400" : ""}`}
        >
          <StatCard label="Total" value={stats.total} color="blue" />
        </button>
        <button
          onClick={() => setFilter("pending")}
          className={`${filter === "pending" ? "ring-2 ring-indigo-400" : ""}`}
        >
          <StatCard label="Pending" value={stats.pending} color="yellow" />
        </button>
        <button
          onClick={() => setFilter("under_review")}
          className={`${filter === "under_review" ? "ring-2 ring-indigo-400" : ""}`}
        >
          <StatCard label="Under Review" value={stats.under_review} color="blue" />
        </button>
        <button
          onClick={() => setFilter("resolved")}
          className={`${filter === "resolved" ? "ring-2 ring-indigo-400" : ""}`}
        >
          <StatCard label="Resolved" value={stats.resolved} color="green" />
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Concerns</h2>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No concerns found
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filtered.map(concern => (
              <div key={concern.id} className="p-6 hover:bg-gray-50 transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900">{concern.exam_title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      by {concern.student_name} • {new Date(concern.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {getStatusBadge(concern.status)}
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Student's Concern</p>
                  <p className="text-sm text-gray-700">{concern.concern_text}</p>
                </div>

                {concern.previous_marks !== null && (
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-600 mb-1">Current Marks</p>
                    <p className="text-lg font-bold text-gray-900">{concern.previous_marks}</p>
                  </div>
                )}

                {concern.status === "pending" || concern.status === "under_review" ? (
                  <button
                    onClick={() => onReview(concern)}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-semibold transition"
                  >
                    Review Concern
                  </button>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-xs font-semibold text-blue-600 mb-2">Your Response</p>
                    <p className="text-sm text-gray-700">{concern.response}</p>
                    {concern.revised_marks !== null && concern.revised_marks !== concern.previous_marks && (
                      <div className="mt-3 pt-3 border-t border-blue-200">
                        <p className="text-xs text-blue-600 font-semibold mb-1">Marks Revised</p>
                        <p className="text-sm font-bold text-gray-900">
                          {concern.previous_marks} → {concern.revised_marks}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// Review Concern Component
function ReviewConcern({ concern, onBack, onSuccess, handleError }) {
  const [formData, setFormData] = useState({
    status: "under_review",
    response: "",
    revised_marks: concern.previous_marks || ""
  })
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!formData.response.trim()) {
      toast.error("Please provide a response")
      return
    }

    if (formData.status === "resolved" && !formData.revised_marks) {
      toast.error("Please enter revised marks for resolved concerns")
      return
    }

    setSubmitting(true)
    try {
      await axiosInstance.post(`exam/teacher/concerns/${concern.id}/review/`, formData)
      toast.success("Concern reviewed successfully")
      onSuccess()
    } catch (err) {
      handleError(err, "Failed to review concern")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 font-semibold mb-6 transition"
      >
        <ArrowLeft size={20} />
        Back to Concerns
      </button>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden max-w-3xl mx-auto">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <h2 className="text-2xl font-bold">Review Concern</h2>
          <p className="text-indigo-100 text-sm">{concern.exam_title}</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-600">Student</p>
              <p className="text-lg font-bold text-gray-900">{concern.student_name}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-600">Current Marks</p>
              <p className="text-2xl font-black text-indigo-600">{concern.previous_marks}</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-xs font-semibold text-yellow-600 mb-2">Student's Concern</p>
            <p className="text-sm text-gray-700">{concern.concern_text}</p>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Decision *</label>
            <select
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="under_review">Mark as Under Review</option>
              <option value="resolved">Resolve & Update Marks</option>
              <option value="rejected">Reject Concern</option>
            </select>
          </div>

          {formData.status === "resolved" && (
            <div>
              <label className="text-sm font-semibold text-gray-700 mb-2 block">Revised Marks *</label>
              <input
                type="number"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none"
                value={formData.revised_marks}
                onChange={(e) => setFormData({ ...formData, revised_marks: e.target.value })}
                placeholder="Enter revised marks"
              />
            </div>
          )}

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">Your Response *</label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-indigo-500 outline-none resize-none min-h-[150px]"
              value={formData.response}
              onChange={(e) => setFormData({ ...formData, response: e.target.value })}
              placeholder="Explain your decision to the student..."
            />
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition ${
              submitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg'
            }`}
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              <>
                <CheckCircle size={20} />
                Submit Review
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

