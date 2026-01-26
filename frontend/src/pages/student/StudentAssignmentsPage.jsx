import { useEffect, useState } from "react"
import axiosInstance from "../../api/axiosInstance"
import { ArrowLeft, Upload, FileText, Calendar, Clock, CheckCircle, XCircle, AlertCircle, Download, Edit2, Send } from "lucide-react"
import toast from "react-hot-toast"

export default function StudentAssignmentsPage() {
  const [view, setView] = useState("list")
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState("all")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {view === "list" && (
          <AssignmentList 
            onOpen={(a) => {
              setSelected(a)
              setView("detail")
            }}
            filter={filter}
            setFilter={setFilter}
          />
        )}

        {view === "detail" && (
          <AssignmentDetail
            assignment={selected}
            onBack={() => setView("list")}
            onSubmit={() => setView("submit")}
            onEdit={() => setView("edit")}
          />
        )}

        {view === "submit" && (
          <SubmitAssignment
            assignment={selected}
            onBack={() => setView("detail")}
            onSuccess={() => setView("list")}
          />
        )}

        {view === "edit" && (
          <EditSubmission
            assignment={selected}
            onBack={() => setView("detail")}
            onSuccess={() => setView("list")}
          />
        )}
      </div>
    </div>
  )
}


/* -------------------- LIST -------------------- */

function AssignmentList({ onOpen, filter, setFilter }) {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    axiosInstance.get("assignment/student/assignments/")
      .then(res => {
        setAssignments(res.data)
        setLoading(false)
      })
  }, [])

  const filtered = assignments.filter(a => {
    if (filter === "pending") return !a.student_submission
    if (filter === "submitted") return a.student_submission && a.student_submission.status !== "graded"
    if (filter === "graded") return a.student_submission && a.student_submission.status === "graded"
    return true
  })

  const stats = {
    total: assignments.length,
    pending: assignments.filter(a => !a.student_submission).length,
    submitted: assignments.filter(a => a.student_submission && a.student_submission.status !== "graded").length,
    graded: assignments.filter(a => a.student_submission && a.student_submission.status === "graded").length
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-slate-800 mb-2 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
            <FileText className="text-white" size={24} />
          </div>
          My Assignments
        </h1>
        <p className="text-slate-600 ml-15">Track and submit your coursework</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total" value={stats.total} color="blue" onClick={() => setFilter("all")} active={filter === "all"} />
        <StatCard label="Pending" value={stats.pending} color="orange" onClick={() => setFilter("pending")} active={filter === "pending"} />
        <StatCard label="Submitted" value={stats.submitted} color="purple" onClick={() => setFilter("submitted")} active={filter === "submitted"} />
        <StatCard label="Graded" value={stats.graded} color="green" onClick={() => setFilter("graded")} active={filter === "graded"} />
      </div>

      {/* Assignments List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <FileText size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 text-lg">No assignments found</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(a => (
            <AssignmentCard key={a.id} assignment={a} onClick={() => onOpen(a)} />
          ))}
        </div>
      )}
    </div>
  )
}






function StatCard({ label, value, color, onClick, active }) {
  const colors = {
    blue: "from-blue-500 to-blue-600 shadow-blue-200",
    orange: "from-orange-500 to-orange-600 shadow-orange-200",
    purple: "from-purple-500 to-purple-600 shadow-purple-200",
    green: "from-green-500 to-green-600 shadow-green-200"
  }

  return (
    <button
      onClick={onClick}
      className={`bg-white rounded-2xl p-4 border-2 transition-all ${
        active ? 'border-indigo-400 shadow-lg scale-105' : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} shadow-lg mb-2`}>
        <span className="text-2xl font-black text-white">{value}</span>
      </div>
      <p className="text-sm font-bold text-slate-600">{label}</p>
    </button>
  )
}

function AssignmentCard({ assignment, onClick }) {
  const submission = assignment.student_submission
  const isOverdue = assignment.is_overdue && !submission
  const dueDate = new Date(assignment.due_date)
  const now = new Date()
  const hoursLeft = Math.max(0, (dueDate - now) / (1000 * 60 * 60))

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl p-6 border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all cursor-pointer group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-xl font-black text-slate-800 group-hover:text-indigo-600 transition-colors">
              {assignment.title}
            </h3>
            {isOverdue && <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">OVERDUE</span>}
          </div>
          <div className="flex items-center gap-4 text-sm text-slate-600">
            <span className="font-semibold">{assignment.subject_name}</span>
            <span>•</span>
            <span>{assignment.teacher_name}</span>
          </div>
        </div>
        <StatusBadge submission={submission} isOverdue={isOverdue} />
      </div>

      <div className="flex items-center gap-6 text-sm mb-4">
        <div className="flex items-center gap-2 text-slate-600">
          <Calendar size={16} className="text-indigo-500" />
          <span>Due: {dueDate.toLocaleDateString()} at {dueDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
        </div>
        {!submission && !isOverdue && hoursLeft < 48 && (
          <div className="flex items-center gap-2 text-orange-600 font-semibold">
            <Clock size={16} />
            <span>{Math.floor(hoursLeft)}h left</span>
          </div>
        )}
      </div>

      {submission && submission.status === "graded" && (
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-green-700">Your Score</span>
            <div className="text-right">
              <div className="text-2xl font-black text-green-600">
                {submission.marks_obtained}/{assignment.total_marks}
              </div>
              <div className="text-xs text-green-600 font-semibold">{submission.percentage}%</div>
            </div>
          </div>
        </div>
      )}

      {submission && submission.status !== "graded" && (
        <div className="bg-blue-50 rounded-xl p-3 border border-blue-200">
          <p className="text-sm text-blue-700 font-semibold">
            Submitted on {new Date(submission.submitted_at).toLocaleDateString()}
            {submission.is_late && <span className="ml-2 text-orange-600">(Late)</span>}
          </p>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ submission, isOverdue }) {
  if (!submission) {
    return isOverdue ? (
      <div className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
        <XCircle size={14} />
        Overdue
      </div>
    ) : (
      <div className="flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
        <AlertCircle size={14} />
        Pending
      </div>
    )
  }

  if (submission.status === "graded") {
    return (
      <div className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
        <CheckCircle size={14} />
        Graded
      </div>
    )
  }

  return (
    <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
      <CheckCircle size={14} />
      Submitted
    </div>
  )
}


/* -------------------- DETAIL VIEW -------------------- */

function AssignmentDetail({ assignment, onBack, onSubmit, onEdit }) {
  const submission = assignment.student_submission
  const canEdit = submission && submission.status !== "graded" && submission.status !== "late"

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-800 font-semibold mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Back to Assignments
      </button>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-3xl font-black mb-2">{assignment.title}</h1>
              <div className="flex items-center gap-4 text-indigo-100">
                <span className="font-semibold">{assignment.subject_name}</span>
                <span>•</span>
                <span>{assignment.teacher_name}</span>
              </div>
            </div>
            <StatusBadge submission={submission} isOverdue={assignment.is_overdue && !submission} />
          </div>

          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span>Due: {new Date(assignment.due_date).toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <FileText size={18} />
              <span>Total Marks: {assignment.total_marks}</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Description */}
          {assignment.description && (
            <div>
              <h3 className="text-lg font-black text-slate-800 mb-3 flex items-center gap-2">
                <FileText size={20} className="text-indigo-600" />
                Assignment Instructions
              </h3>
              <div className="bg-slate-50 rounded-xl p-5 border border-slate-200">
                <p className="text-slate-700 whitespace-pre-wrap leading-relaxed">{assignment.description}</p>
              </div>
            </div>
          )}

          {/* Teacher's Attachment */}
          {assignment.attachment && (
            <div>
              <h3 className="text-lg font-black text-slate-800 mb-3">Reference Materials</h3>
              <a
                href={assignment.attachment}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl p-4 hover:bg-blue-100 transition-colors group"
              >
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Download className="text-white" size={24} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-blue-900 group-hover:text-blue-700">Download Assignment File</p>
                  <p className="text-xs text-blue-600">Click to view or download</p>
                </div>
              </a>
            </div>
          )}

          {/* Submission Status */}
          {submission ? (
            <div>
              <h3 className="text-lg font-black text-slate-800 mb-3">Your Submission</h3>
              
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-6 border border-slate-200 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-600 font-semibold">Submitted On</p>
                    <p className="text-lg font-black text-slate-800">
                      {new Date(submission.submitted_at).toLocaleString()}
                    </p>
                  </div>
                  {submission.is_late && (
                    <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-bold">
                      Late Submission
                    </span>
                  )}
                </div>

                {submission.description && (
                  <div>
                    <p className="text-sm font-bold text-slate-700 mb-2">Your Notes</p>
                    <p className="text-slate-600 bg-white rounded-lg p-3 border border-slate-200">
                      {submission.description}
                    </p>
                  </div>
                )}

                {submission.attachment && (
                  <a
                    href={submission.attachment}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-4 hover:border-indigo-300 hover:shadow-md transition-all"
                  >
                    <div className="w-10 h-10 bg-indigo-500 rounded-lg flex items-center justify-center">
                      <FileText className="text-white" size={20} />
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-800">Your Submission File</p>
                      <p className="text-xs text-slate-500">Click to view</p>
                    </div>
                    <Download size={20} className="text-indigo-600" />
                  </a>
                )}

                {submission.status === "graded" && (
                  <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white mt-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-green-100 text-sm font-semibold mb-1">Final Grade</p>
                        <div className="flex items-baseline gap-2">
                          <span className="text-4xl font-black">{submission.marks_obtained}</span>
                          <span className="text-2xl font-bold text-green-100">/ {assignment.total_marks}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-5xl font-black">{submission.percentage}%</div>
                        <p className="text-green-100 text-sm font-semibold">Percentage</p>
                      </div>
                    </div>
                    
                    {submission.feedback && (
                      <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                        <p className="text-sm font-bold mb-2 text-green-100">Teacher's Feedback</p>
                        <p className="text-white leading-relaxed">{submission.feedback}</p>
                      </div>
                    )}
                  </div>
                )}

                {canEdit && (
                  <button
                    onClick={onEdit}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <Edit2 size={18} />
                    Edit Submission
                  </button>
                )}
              </div>
            </div>
          ) : (
            <button
              onClick={onSubmit}
              disabled={assignment.is_overdue}
              className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all ${
                assignment.is_overdue
                  ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200 hover:shadow-xl active:scale-[0.98]'
              }`}
            >
              <Upload size={20} />
              {assignment.is_overdue ? 'Submission Closed (Overdue)' : 'Submit Assignment'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

/* -------------------- SUBMIT FORM -------------------- */

function SubmitAssignment({ assignment, onBack, onSuccess }) {
  const [file, setFile] = useState(null)
  const [desc, setDesc] = useState("")
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const submit = async () => {
    if (!file) {
      toast.error("Please upload a file")
      return
    }

    setLoading(true)
    const fd = new FormData()
    fd.append("assignment", assignment.id)
    fd.append("attachment", file)
    fd.append("description", desc)

    try {
      await axiosInstance.post("assignment/student/submit/", fd, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      toast.success("Assignment submitted successfully!")
      onSuccess()
    } catch (err) {
      toast.error(err.response?.data ? Object.values(err.response.data).flat()[0] : "Submission failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-800 font-semibold mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden max-w-3xl mx-auto">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
          <h2 className="text-2xl font-black mb-1">Submit Assignment</h2>
          <p className="text-indigo-100">{assignment.title}</p>
        </div>

        <div className="p-8 space-y-6">
          <div>
            <label className="text-sm font-bold text-slate-700 mb-2 block">
              Notes / Comments (Optional)
            </label>
            <textarea
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl min-h-[120px] outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
              placeholder="Add any notes or comments about your submission..."
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 mb-3 block flex items-center gap-2">
              <Upload size={18} className="text-indigo-600" />
              Upload Your Work <span className="text-red-500">*</span>
            </label>
            
            <div
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                dragActive
                  ? 'border-indigo-500 bg-indigo-50'
                  : file
                  ? 'border-green-300 bg-green-50'
                  : 'border-slate-300 bg-slate-50 hover:border-indigo-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="file-upload"
                className="hidden"
                onChange={e => setFile(e.target.files[0])}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
              />
              
              {file ? (
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-green-500 rounded-2xl mx-auto flex items-center justify-center">
                    <CheckCircle className="text-white" size={32} />
                  </div>
                  <div>
                    <p className="font-bold text-green-700 text-lg">{file.name}</p>
                    <p className="text-sm text-green-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-sm text-red-600 hover:text-red-700 font-semibold"
                  >
                    Remove File
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-indigo-100 rounded-2xl mx-auto flex items-center justify-center">
                    <Upload className="text-indigo-600" size={32} />
                  </div>
                  <div>
                    <label
                      htmlFor="file-upload"
                      className="text-indigo-600 font-bold hover:text-indigo-700 cursor-pointer"
                    >
                      Click to upload
                    </label>
                    <span className="text-slate-600"> or drag and drop</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    PDF, DOC, DOCX, JPG, PNG, ZIP (Max 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={submit}
            disabled={loading || !file}
            className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all ${
              loading || !file
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200 hover:shadow-xl active:scale-[0.98]'
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                Submitting...
              </>
            ) : (
              <>
                <Send size={20} />
                Submit Assignment
              </>
            )}
          </button>

          <p className="text-center text-sm text-slate-500">
            Make sure you've reviewed your work before submitting
          </p>
        </div>
      </div>
    </div>
  )
}

/* -------------------- EDIT SUBMISSION -------------------- */

function EditSubmission({ assignment, onBack, onSuccess }) {
  const submission = assignment.student_submission
  const [file, setFile] = useState(null)
  const [desc, setDesc] = useState(submission.description || "")
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  const submit = async () => {
    setLoading(true)
    const fd = new FormData()
    fd.append("description", desc)
    if (file) fd.append("attachment", file)

    try {
      await axiosInstance.patch(`assignment/student/submissions/${submission.id}/`, fd, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      toast.success("Submission updated successfully!")
      onSuccess()
    } catch (err) {
      toast.error(err.response?.data ? Object.values(err.response.data).flat()[0] : "Update failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-600 hover:text-slate-800 font-semibold mb-6 transition-colors"
      >
        <ArrowLeft size={20} />
        Back
      </button>

      <div className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden max-w-3xl mx-auto">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <h2 className="text-2xl font-black mb-1">Edit Submission</h2>
          <p className="text-purple-100">{assignment.title}</p>
        </div>

        <div className="p-8 space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-700 font-semibold">
              ℹ️ You can edit your submission until it's graded by your teacher
            </p>
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 mb-2 block">
              Notes / Comments
            </label>
            <textarea
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl min-h-[120px] outline-none focus:ring-2 focus:ring-purple-500 transition-all resize-none"
              placeholder="Add any notes or comments..."
              value={desc}
              onChange={e => setDesc(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-bold text-slate-700 mb-3 block">
              Current File
            </label>
            {submission.attachment && (
              <a
                href={submission.attachment}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4 hover:border-purple-300 transition-colors mb-4"
              >
                <div className="w-10 h-10 bg-slate-600 rounded-lg flex items-center justify-center">
                  <FileText className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800">Current Submission</p>
                  <p className="text-xs text-slate-500">Click to view</p>
                </div>
                <Download size={18} className="text-slate-600" />
              </a>
            )}

            <label className="text-sm font-bold text-slate-700 mb-3 block flex items-center gap-2">
              <Upload size={18} className="text-purple-600" />
              Replace with New File (Optional)
            </label>
            
            <div
              className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${
                dragActive
                  ? 'border-purple-500 bg-purple-50'
                  : file
                  ? 'border-green-300 bg-green-50'
                  : 'border-slate-300 bg-slate-50 hover:border-purple-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="file-upload-edit"
                className="hidden"
                onChange={e => setFile(e.target.files[0])}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.zip"
              />
              
              {file ? (
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-green-500 rounded-2xl mx-auto flex items-center justify-center">
                    <CheckCircle className="text-white" size={32} />
                  </div>
                  <div>
                    <p className="font-bold text-green-700 text-lg">{file.name}</p>
                    <p className="text-sm text-green-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <button
                    onClick={() => setFile(null)}
                    className="text-sm text-red-600 hover:text-red-700 font-semibold"
                  >
                    Remove File
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl mx-auto flex items-center justify-center">
                    <Upload className="text-purple-600" size={32} />
                  </div>
                  <div>
                    <label
                      htmlFor="file-upload-edit"
                      className="text-purple-600 font-bold hover:text-purple-700 cursor-pointer"
                    >
                      Click to upload
                    </label>
                    <span className="text-slate-600"> or drag and drop</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    PDF, DOC, DOCX, JPG, PNG, ZIP (Max 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={submit}
            disabled={loading}
            className={`w-full py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all ${
              loading
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-200 hover:shadow-xl active:scale-[0.98]'
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                Updating...
              </>
            ) : (
              <>
                <Edit2 size={20} />
                Update Submission
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}