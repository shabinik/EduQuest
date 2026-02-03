import { useEffect, useState } from "react"
import { 
  Calendar, Clock, FileText, AlertCircle, CheckCircle, 
  MessageCircle, X, Send, ArrowLeft 
} from "lucide-react"
import toast from "react-hot-toast"
import axiosInstance from "../../api/axiosInstance"

export default function StudentExamPage() {
  const [view, setView] = useState("exams")
  const [exams, setExams] = useState([])
  const [results, setResults] = useState([])
  const [concerns, setConcerns] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedResult, setSelectedResult] = useState(null)

  useEffect(() => {
    if (view === "exams") {
      fetchExams()
    } else if (view === "results") {
      fetchResults()
    } else if (view === "concerns") {
      fetchConcerns()
    }
  }, [view])

  const fetchExams = async () => {
    setLoading(true)
    try {
      const res = await axiosInstance.get("exam/student/exams/")
      setExams(res.data)
    } catch (err) {
      handleError(err, "Failed to load exams")
    } finally {
      setLoading(false)
    }
  }

  const fetchResults = async () => {
    setLoading(true)
    try {
      const res = await axiosInstance.get("exam/student/results/")
      setResults(res.data)
    } catch (err) {
      handleError(err, "Failed to load results")
    } finally {
      setLoading(false)
    }
  }

  const fetchConcerns = async () => {
    setLoading(true)
    try {
      const res = await axiosInstance.get("exam/student/concerns/")
      setConcerns(res.data)
    } catch (err) {
      handleError(err, "Failed to load concerns")
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
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Exams & Results</h1>
          <p className="text-gray-600 mt-1">View your exams and results</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 bg-white p-1 rounded-lg border border-gray-200 w-fit">
          <button
            onClick={() => setView("exams")}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              view === "exams"
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Upcoming Exams
          </button>
          <button
            onClick={() => setView("results")}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              view === "results"
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            My Results
          </button>
          <button
            onClick={() => setView("concerns")}
            className={`px-6 py-2 rounded-lg font-semibold transition ${
              view === "concerns"
                ? 'bg-indigo-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Concerns
          </button>
        </div>

        {view === "exams" && (
          <ExamList exams={exams} loading={loading} />
        )}

        {view === "results" && (
          <ResultList 
            results={results} 
            loading={loading} 
            onRaiseConcern={(result) => {
              setSelectedResult(result)
              setView("raise-concern")
            }}
          />
        )}

        {view === "concerns" && (
          <ConcernList concerns={concerns} loading={loading} />
        )}

        {view === "raise-concern" && (
          <RaiseConcern
            result={selectedResult}
            onBack={() => setView("results")}
            onSuccess={() => {
              setView("concerns")
              fetchConcerns()
            }}
            handleError={handleError}
          />
        )}
      </div>
    </div>
  )
}

// Exam List Component
function ExamList({ exams, loading }) {
  const getStatusBadge = (status) => {
    const badges = {
      scheduled: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Scheduled', icon: Calendar },
      ongoing: { bg: 'bg-green-100', text: 'text-green-700', label: 'Ongoing', icon: AlertCircle },
      completed: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Completed', icon: CheckCircle },
      cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled', icon: X }
    }
    const badge = badges[status] || badges.scheduled
    const Icon = badge.icon
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}>
        <Icon size={14} />
        {badge.label}
      </span>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800">Upcoming Exams</h2>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : exams.length === 0 ? (
        <div className="p-12 text-center text-gray-400">
          No exams scheduled
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {exams.map(exam => (
            <div key={exam.id} className="p-6 hover:bg-gray-50 transition">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{exam.title}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1 font-semibold">
                      <FileText size={16} className="text-indigo-600" />
                      {exam.subject_name}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={16} />
                      {new Date(exam.exam_date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={16} />
                      {exam.start_time.slice(0, 5)} - {exam.end_time.slice(0, 5)}
                    </span>
                  </div>
                  {exam.room && (
                    <p className="text-sm text-gray-500 mt-2">Venue: {exam.room}</p>
                  )}
                </div>
                {getStatusBadge(exam.status)}
              </div>

              {exam.description && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                  <p className="text-sm text-gray-700">{exam.description}</p>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-600">
                  Max Marks: <span className="text-indigo-600 text-lg">{exam.max_marks}</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Result List Component
function ResultList({ results, loading, onRaiseConcern }) {
  const getGradeBadge = (grade) => {
    const badges = {
      'A+': 'bg-green-500',
      'A': 'bg-green-400',
      'B': 'bg-blue-400',
      'C': 'bg-yellow-400',
      'D': 'bg-orange-400',
      'F': 'bg-red-500'
    }
    return badges[grade] || 'bg-gray-400'
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800">My Results</h2>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : results.length === 0 ? (
        <div className="p-12 text-center text-gray-400">
          No results available
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {results.map(result => (
            <div key={result.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{result.exam_title}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(result.created_at).toLocaleDateString()}
                  </p>
                </div>
                {result.status === 'graded' && result.grade && (
                  <div className={`w-16 h-16 ${getGradeBadge(result.grade)} rounded-full flex items-center justify-center`}>
                    <span className="text-white font-black text-2xl">{result.grade}</span>
                  </div>
                )}
              </div>

              {result.status === 'pending' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-700 font-semibold flex items-center gap-2">
                    <AlertCircle size={16} />
                    Grading pending
                  </p>
                </div>
              )}

              {result.status === 'absent' && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-700 font-semibold flex items-center gap-2">
                    <X size={16} />
                    Marked as absent
                  </p>
                </div>
              )}

              {result.status === 'graded' && (
                <>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-xs text-gray-500 font-semibold mb-1">Marks Obtained</p>
                      <p className="text-2xl font-black text-gray-900">
                        {result.marks_obtained}
                        <span className="text-sm text-gray-500">/{result.max_marks}</span>
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-xs text-gray-500 font-semibold mb-1">Percentage</p>
                      <p className="text-2xl font-black text-indigo-600">{result.percentage}%</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-xs text-gray-500 font-semibold mb-1">Grade</p>
                      <p className="text-2xl font-black text-gray-900">{result.grade}</p>
                    </div>
                  </div>

                  {result.remarks && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                      <p className="text-xs font-semibold text-blue-600 mb-1">Teacher's Remarks</p>
                      <p className="text-sm text-gray-700">{result.remarks}</p>
                    </div>
                  )}

                  {!result.has_concern && (
                    <button
                      onClick={() => onRaiseConcern(result)}
                      className="w-full bg-orange-100 hover:bg-orange-200 text-orange-700 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 transition"
                    >
                      <MessageCircle size={18} />
                      Raise Concern
                    </button>
                  )}

                  {result.has_concern && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
                      <p className="text-sm text-orange-700 font-semibold">
                        Concern raised - Check Concerns tab
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Concern List Component
function ConcernList({ concerns, loading }) {
  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending Review' },
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
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-bold text-gray-800">My Concerns</h2>
      </div>

      {loading ? (
        <div className="p-12 text-center">
          <div className="inline-block w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : concerns.length === 0 ? (
        <div className="p-12 text-center text-gray-400">
          No concerns raised
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {concerns.map(concern => (
            <div key={concern.id} className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{concern.exam_title}</h3>
                  <p className="text-sm text-gray-500">
                    Raised on {new Date(concern.created_at).toLocaleDateString()}
                  </p>
                </div>
                {getStatusBadge(concern.status)}
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-xs font-semibold text-gray-600 mb-2">Your Concern</p>
                <p className="text-sm text-gray-700">{concern.concern_text}</p>
              </div>

              {concern.response && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <p className="text-xs font-semibold text-blue-600 mb-2">
                    Teacher's Response {concern.reviewed_by_name && `by ${concern.reviewed_by_name}`}
                  </p>
                  <p className="text-sm text-gray-700">{concern.response}</p>
                </div>
              )}

              {concern.revised_marks !== null && concern.revised_marks !== concern.previous_marks && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-xs font-semibold text-green-600 mb-2">Marks Revised</p>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Previous</p>
                      <p className="text-lg font-bold text-gray-700">{concern.previous_marks}</p>
                    </div>
                    <span className="text-gray-400">→</span>
                    <div>
                      <p className="text-xs text-gray-500">Revised</p>
                      <p className="text-lg font-bold text-green-600">{concern.revised_marks}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// Raise Concern Component
function RaiseConcern({ result, onBack, onSuccess, handleError }) {
  const [concernText, setConcernText] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!concernText.trim()) {
      toast.error("Please enter your concern")
      return
    }

    setSubmitting(true)
    try {
      await axiosInstance.post("exam/student/concerns/raise/", {
        result: result.id,
        concern_text: concernText
      })
      toast.success("Concern raised successfully")
      onSuccess()
    } catch (err) {
      handleError(err, "Failed to raise concern")
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
        Back to Results
      </button>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden max-w-2xl mx-auto">
        <div className="bg-gradient-to-r from-orange-500 to-red-500 p-6 text-white">
          <h2 className="text-2xl font-bold">Raise Concern</h2>
          <p className="text-orange-100 text-sm">About {result.exam_title}</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-2">Your Result</p>
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-gray-500">Marks</p>
                <p className="text-xl font-bold text-gray-900">
                  {result.marks_obtained}/{result.max_marks}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Percentage</p>
                <p className="text-xl font-bold text-indigo-600">{result.percentage}%</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Grade</p>
                <p className="text-xl font-bold text-gray-900">{result.grade}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700 mb-2 block">
              Describe your concern *
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 outline-none resize-none min-h-[150px]"
              value={concernText}
              onChange={(e) => setConcernText(e.target.value)}
              placeholder="Explain why you believe your marks should be reviewed..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Be specific and polite in describing your concern
            </p>
          </div>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`w-full py-4 rounded-lg font-bold text-lg flex items-center justify-center gap-2 transition ${
              submitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg'
            }`}
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send size={20} />
                Raise Concern
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}