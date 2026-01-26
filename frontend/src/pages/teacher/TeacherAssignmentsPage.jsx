import { useEffect, useState } from "react"
import axiosInstance from "../../api/axiosInstance"
import toast from "react-hot-toast"
import { Plus, Eye, ArrowLeft, Edit2, Trash2, FileText, Calendar, Download, CheckCircle, Clock, AlertCircle, User } from "lucide-react"

export default function TeacherAssignmentsPage() {
  const [view, setView] = useState("list")
  const [selectedAssignment, setSelectedAssignment] = useState(null)

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {view === "list" && (
        <AssignmentList
          onCreate={() => { setSelectedAssignment(null); setView("form"); }}
          onEdit={(a) => { setSelectedAssignment(a); setView("form"); }}
          onView={(a) => { setSelectedAssignment(a); setView("submissions"); }}
        />
      )}

      {view === "form" && (
        <AssignmentForm 
          assignment={selectedAssignment} 
          onBack={() => setView("list")} 
        />
      )}

      {view === "submissions" && (
        <AssignmentSubmissions
          assignment={selectedAssignment}
          onBack={() => setView("list")}
        />
      )}
    </div>
  )
}

/* -------------------- LIST VIEW -------------------- */

function AssignmentList({ onCreate, onView, onEdit }) {
  const [assignments, setAssignments] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchAssignments = () => {
    setLoading(true)
    axiosInstance.get("assignment/teacher/assignments/").then(res => {
      setAssignments(res.data)
      setLoading(false)
    })
  }

  useEffect(() => { fetchAssignments() }, [])

  const deleteAssignment = async (id) => {
    if (!window.confirm("Are you sure you want to delete this assignment?")) return
    try {
      await axiosInstance.delete(`assignment/teacher/assignments/${id}/`)
      toast.success("Assignment deleted")
      fetchAssignments()
    } catch (err) { toast.error("Delete failed") }
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
              <FileText className="text-white" size={20} />
            </div>
            Assignments
          </h1>
          <p className="text-slate-500 text-sm ml-13">Manage and grade your classroom tasks</p>
        </div>
        <button 
          onClick={onCreate} 
          className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl flex gap-2 items-center font-bold transition-all shadow-lg shadow-indigo-200 hover:shadow-xl"
        >
          <Plus size={18} /> New Assignment
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : assignments.length === 0 ? (
        <div className="bg-white rounded-2xl p-20 text-center border-2 border-dashed border-slate-200">
          <FileText size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 text-lg font-semibold">No assignments yet</p>
          <p className="text-slate-400 text-sm">Create your first assignment to get started</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {assignments.map(a => (
            <div key={a.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl hover:border-indigo-200 transition-all group">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg">
                    <FileText size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800 text-xl mb-2 group-hover:text-indigo-600 transition-colors">
                      {a.title}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-indigo-500"/>
                        Due: {new Date(a.due_date).toLocaleDateString()} at {new Date(a.due_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </span>
                      <span className="flex items-center gap-1.5 font-semibold text-indigo-600">
                        <Eye size={14}/> {a.submission_count} Submissions
                      </span>
                      <span className="flex items-center gap-1.5 font-semibold text-green-600">
                        <CheckCircle size={14}/> {a.total_marks} Marks
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={() => onView(a)} 
                    className="p-2.5 hover:bg-indigo-50 text-indigo-600 rounded-lg transition-all hover:shadow-md border border-transparent hover:border-indigo-200" 
                    title="View Submissions"
                  >
                    <Eye size={20}/>
                  </button>
                  <button 
                    onClick={() => onEdit(a)} 
                    className="p-2.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-all hover:shadow-md border border-transparent hover:border-blue-200" 
                    title="Edit"
                  >
                    <Edit2 size={20}/>
                  </button>
                  <button 
                    onClick={() => deleteAssignment(a.id)} 
                    className="p-2.5 hover:bg-red-50 text-red-600 rounded-lg transition-all hover:shadow-md border border-transparent hover:border-red-200" 
                    title="Delete"
                  >
                    <Trash2 size={20}/>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* -------------------- CREATE/EDIT FORM -------------------- */

function AssignmentForm({ assignment, onBack }) {
  const isEdit = !!assignment
  const [form, setForm] = useState({
    title: assignment?.title || "",
    description: assignment?.description || "",
    subject: assignment?.subject?.id || assignment?.subject || "",
    classes: assignment?.classes?.map(c => c.id || c) || [],
    due_date: assignment?.due_date ? assignment.due_date.substring(0, 16) : "",
    total_marks: assignment?.total_marks || "",
  })

  const [subjects, setSubjects] = useState([])
  const [classes, setClasses] = useState([])
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    axiosInstance.get("classroom/teacher/subjects/dropdown").then(r => setSubjects(r.data))
    axiosInstance.get("classroom/teacher/classes/dropdown/").then(r => setClasses(r.data))
  }, [])

  const submit = async () => {
    if (!form.title || !form.subject || !form.due_date || !form.total_marks || form.classes.length === 0) {
      toast.error("Please fill in all required fields")
      return
    }

    setLoading(true)
    const data = new FormData()
    data.append("title", form.title)
    data.append("description", form.description)
    data.append("subject", form.subject)
    data.append("due_date", form.due_date)
    data.append("total_marks", form.total_marks)
    form.classes.forEach(id => data.append("classes[]", id))
    if (file) data.append("attachment", file)

    try {
      if (isEdit) {
        await axiosInstance.patch(`assignment/teacher/assignments/${assignment.id}/`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success("Assignment updated successfully")
      } else {
        await axiosInstance.post("assignment/teacher/assignments/", data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        })
        toast.success("Assignment published")
      }
      onBack()
    } catch (err) {
      console.error("Error details:", err.response?.data)
      const errorMsg = err.response?.data ? Object.values(err.response.data).flat()[0] : "Error saving assignment"
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-3xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black">{isEdit ? "Edit Assignment" : "New Assignment"}</h2>
          <p className="text-indigo-100 text-sm">Fill in the details to set a task for your students</p>
        </div>
        <button onClick={onBack} className="text-white/80 hover:text-white transition-colors p-2 hover:bg-white/20 rounded-lg">
          <ArrowLeft size={24}/>
        </button>
      </div>

      <div className="p-8 space-y-6">
        <div>
          <label className="text-sm font-bold text-slate-700 mb-2 block">Assignment Title *</label>
          <input 
            className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" 
            value={form.title} 
            onChange={e => setForm({...form, title: e.target.value})} 
            placeholder="e.g., Final Term Research Paper" 
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm font-bold text-slate-700 mb-2 block">Subject *</label>
            <select 
              className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" 
              value={form.subject} 
              onChange={e => setForm({...form, subject: e.target.value})}
            >
              <option value="">Select Subject</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-bold text-slate-700 mb-2 block">Total Marks *</label>
            <input 
              type="number" 
              className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" 
              value={form.total_marks} 
              onChange={e => setForm({...form, total_marks: e.target.value})} 
              placeholder="100"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-bold text-slate-700 mb-2 block">Due Date & Time *</label>
          <input 
            type="datetime-local" 
            className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" 
            value={form.due_date} 
            onChange={e => setForm({...form, due_date: e.target.value})} 
          />
        </div>

        <div>
          <label className="text-sm font-bold text-slate-700 mb-2 block flex items-center gap-2">
            Assign to Classes * 
            <span className="text-xs font-normal text-slate-400">(Hold Ctrl/Cmd to select multiple)</span>
          </label>
          <select 
            multiple 
            className="w-full p-3 bg-slate-50 border-2 border-slate-200 rounded-xl outline-none min-h-[140px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            value={form.classes}
            onChange={e => setForm({...form, classes: [...e.target.selectedOptions].map(o => o.value)})}
          >
            {classes.map(c => (
              <option key={c.id} value={c.id} className="p-3 my-1 rounded hover:bg-indigo-50">
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-sm font-bold text-slate-700 mb-2 block">Instructions</label>
          <textarea 
            className="w-full p-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl min-h-[140px] outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none" 
            value={form.description} 
            onChange={e => setForm({...form, description: e.target.value})} 
            placeholder="Provide detailed instructions for the assignment..."
          />
        </div>

        <div className="p-6 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 hover:border-indigo-300 transition-colors">
          <label className="text-sm font-bold text-slate-700 block mb-3 flex items-center gap-2">
            <FileText size={18} className="text-indigo-600" />
            Reference Attachment (Optional)
          </label>
          <input 
            type="file" 
            className="block w-full text-sm text-slate-600 file:mr-4 file:py-2.5 file:px-5 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer transition-all" 
            onChange={e => setFile(e.target.files[0])} 
          />
          {file && (
            <p className="mt-2 text-xs text-green-600 font-semibold flex items-center gap-1">
              <CheckCircle size={14} /> {file.name}
            </p>
          )}
        </div>

        <button 
          onClick={submit} 
          disabled={loading}
          className={`w-full py-4 rounded-xl font-black text-lg flex items-center justify-center gap-3 transition-all ${
            loading
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg shadow-indigo-200 hover:shadow-xl active:scale-[0.98]'
          }`}
        >
          {loading ? (
            <>
              <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
              {isEdit ? "Updating..." : "Publishing..."}
            </>
          ) : (
            <>
              {isEdit ? "Update Assignment" : "Publish Assignment"}
            </>
          )}
        </button>
      </div>
    </div>
  )
}

/* -------------------- SUBMISSIONS GRADING VIEW -------------------- */

function AssignmentSubmissions({ assignment, onBack }) {
  const [subs, setSubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    setLoading(true)
    axiosInstance.get(`assignment/teacher/submissions/?assignment=${assignment.id}`)
      .then(res => {
        setSubs(res.data)
        setLoading(false)
      })
  }, [assignment.id])

  const filtered = subs.filter(s => {
    if (filter === "pending") return s.status !== "graded"
    if (filter === "graded") return s.status === "graded"
    if (filter === "late") return s.is_late
    return true
  })

  const stats = {
    total: subs.length,
    graded: subs.filter(s => s.status === "graded").length,
    pending: subs.filter(s => s.status !== "graded").length,
    late: subs.filter(s => s.is_late).length
  }

  return (
    <div className="animate-in fade-in duration-500">
      <button 
        onClick={onBack} 
        className="flex items-center gap-2 mb-6 text-slate-600 hover:text-slate-900 transition-colors font-semibold bg-white px-4 py-2 rounded-lg border border-slate-200 hover:border-slate-300"
      >
        <ArrowLeft size={18}/> Back to Assignments
      </button>

      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-6">
        <h2 className="text-3xl font-black text-slate-900 mb-2">{assignment.title}</h2>
        <p className="text-slate-600">Review and grade student submissions</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          label="Total" 
          value={stats.total} 
          color="blue" 
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />
        <StatCard 
          label="Pending" 
          value={stats.pending} 
          color="orange" 
          active={filter === "pending"}
          onClick={() => setFilter("pending")}
        />
        <StatCard 
          label="Graded" 
          value={stats.graded} 
          color="green" 
          active={filter === "graded"}
          onClick={() => setFilter("graded")}
        />
        <StatCard 
          label="Late" 
          value={stats.late} 
          color="red" 
          active={filter === "late"}
          onClick={() => setFilter("late")}
        />
      </div>

      {loading ? (
        <div className="text-center py-20 bg-white rounded-2xl">
          <div className="inline-block w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border-2 border-dashed rounded-2xl p-20 text-center">
          <FileText size={48} className="mx-auto text-slate-300 mb-4" />
          <p className="text-slate-500 font-semibold text-lg">No submissions found</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {filtered.map(s => (
            <SubmissionCard key={s.id} submission={s} assignment={assignment} onUpdate={() => {
              axiosInstance.get(`assignment/teacher/submissions/?assignment=${assignment.id}`)
                .then(res => setSubs(res.data))
            }} />
          ))}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value, color, active, onClick }) {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    orange: "from-orange-500 to-orange-600",
    green: "from-green-500 to-green-600",
    red: "from-red-500 to-red-600"
  }

  return (
    <button
      onClick={onClick}
      className={`bg-white rounded-xl p-4 transition-all ${
        active 
          ? 'border-2 border-indigo-400 shadow-lg scale-105' 
          : 'border-2 border-slate-200 hover:border-slate-300'
      }`}
    >
      <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} shadow-lg mb-2`}>
        <span className="text-2xl font-black text-white">{value}</span>
      </div>
      <p className="text-sm font-bold text-slate-600">{label}</p>
    </button>
  )
}

function SubmissionCard({ submission, assignment, onUpdate }) {
  const [marks, setMarks] = useState(submission.marks_obtained || "")
  const [feedback, setFeedback] = useState(submission.feedback || "")
  const [grading, setGrading] = useState(false)

  const grade = async () => {
    if (!marks || marks === "") {
      toast.error("Please enter marks")
      return
    }

    if (Number(marks) > assignment.total_marks) {
      toast.error(`Marks cannot exceed ${assignment.total_marks}`)
      return
    }

    if (Number(marks) < 0) {
      toast.error("Marks cannot be negative")
      return
    }

    setGrading(true)
    try {
      await axiosInstance.patch(`assignment/teacher/submissions/${submission.id}/grade/`, {
        marks_obtained: Number(marks),
        feedback: feedback
      })
      toast.success(`Graded ${submission.student_name}`)
      onUpdate()
    } catch (err) {
      toast.error(err.response?.data ? Object.values(err.response.data).flat()[0] : "Grading failed")
    } finally {
      setGrading(false)
    }
  }

  const isGraded = submission.status === "graded"

  return (
    <div className="bg-white rounded-2xl border-2 border-slate-200 overflow-hidden hover:shadow-xl transition-all">
      {/* Student Header */}
      <div className={`p-5 border-b-2 ${submission.is_late ? 'bg-orange-50 border-orange-200' : 'bg-slate-50 border-slate-200'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg">
              {submission.student_name.charAt(0)}
            </div>
            <div>
              <h4 className="font-black text-lg text-slate-900">{submission.student_name}</h4>
              <p className="text-sm text-slate-600 flex items-center gap-2">
                <User size={14} />
                Roll: {submission.student_roll_number}
              </p>
            </div>
          </div>
          <div className="text-right">
            <StatusBadge status={submission.status} isLate={submission.is_late} />
            <p className="text-xs text-slate-500 mt-1 flex items-center justify-end gap-1">
              <Clock size={12} />
              {new Date(submission.submitted_at).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left: Submission Details */}
          <div className="space-y-4">
            <div>
              <h5 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                <FileText size={16} className="text-indigo-600" />
                Student's Notes
              </h5>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 min-h-[100px]">
                <p className="text-slate-700 leading-relaxed">
                  {submission.description || <span className="text-slate-400 italic">No description provided</span>}
                </p>
              </div>
            </div>

            {submission.attachment && (
              <div>
                <h5 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <Download size={16} className="text-indigo-600" />
                  Submitted File
                </h5>
                <a 
                  href={submission.attachment} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="flex items-center gap-3 bg-indigo-50 border-2 border-indigo-200 hover:border-indigo-300 hover:bg-indigo-100 p-4 rounded-xl transition-all group"
                >
                  <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
                    <FileText className="text-white" size={24} />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-indigo-900 group-hover:text-indigo-700">View Submission</p>
                    <p className="text-xs text-indigo-600">Click to open file</p>
                  </div>
                  <Download size={20} className="text-indigo-600" />
                </a>
              </div>
            )}
          </div>

          {/* Right: Grading Panel */}
          <div className={`rounded-xl p-5 ${isGraded ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200' : 'bg-gradient-to-br from-slate-50 to-blue-50 border-2 border-slate-200'}`}>
            <h5 className="text-sm font-bold text-slate-700 mb-4 flex items-center gap-2">
              <CheckCircle size={16} className={isGraded ? "text-green-600" : "text-slate-600"} />
              {isGraded ? "Grading Complete" : "Grade Submission"}
            </h5>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">
                  Marks (Out of {assignment.total_marks})
                </label>
                <input 
                  type="number" 
                  className="w-full p-3 border-2 border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all font-bold text-lg"
                  value={marks}
                  onChange={e => setMarks(e.target.value)}
                  disabled={isGraded}
                  placeholder="Enter marks"
                  max={assignment.total_marks}
                  min={0}
                />
                {marks && (
                  <p className="text-xs text-slate-500 mt-1 font-semibold">
                    Percentage: {((Number(marks) / assignment.total_marks) * 100).toFixed(1)}%
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-bold text-slate-600 uppercase mb-2 block">
                  Feedback / Comments
                </label>
                <textarea 
                  className="w-full p-3 border-2 border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all resize-none min-h-[100px]"
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  disabled={isGraded}
                  placeholder="Provide feedback to the student..."
                />
              </div>

              {isGraded ? (
                <div className="bg-white rounded-lg p-4 border-2 border-green-300">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-green-700">Final Grade</span>
                    <span className="text-2xl font-black text-green-600">
                      {submission.marks_obtained}/{assignment.total_marks}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-green-600">Graded on</span>
                    <span className="text-xs font-semibold text-green-700">
                      {new Date(submission.graded_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={grade}
                  disabled={grading}
                  className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${
                    grading
                      ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg hover:shadow-xl active:scale-[0.98]'
                  }`}
                >
                  {grading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Grading...
                    </>
                  ) : (
                    <>
                      <CheckCircle size={18} />
                      Save Grade
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status, isLate }) {
  if (status === "graded") {
    return (
      <div className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
        <CheckCircle size={14} />
        Graded
      </div>
    )
  }
  
  if (isLate) {
    return (
      <div className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
        <AlertCircle size={14} />
        Late Submission
      </div>
    )
  }

  return (
    <div className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold">
      <Clock size={14} />
      Pending Review
    </div>
  )
}