import { useEffect, useState } from "react"
import axiosInstance from "../../api/axiosInstance"
import toast from "react-hot-toast"
import { Plus, Eye, ArrowLeft } from "lucide-react"

/* -------------------- MAIN PAGE -------------------- */

export default function TeacherAssignmentsPage() {
  const [view, setView] = useState("list") 
  const [selectedAssignment, setSelectedAssignment] = useState(null)

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {view === "list" && (
        <AssignmentList
          onCreate={() => setView("create")}
          onView={(a) => {
            setSelectedAssignment(a)
            setView("submissions")
          }}
        />
      )}

      {view === "create" && (
        <CreateAssignment onBack={() => setView("list")} />
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

/* -------------------- LIST -------------------- */

function AssignmentList({ onCreate, onView }) {
  const [assignments, setAssignments] = useState([])

  useEffect(() => {
    axiosInstance.get("assignment/teacher/assignments/")
      .then(res => setAssignments(res.data))
  }, [])

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-black">📚 Assignments</h1>
        <button
          onClick={onCreate}
          className="bg-indigo-600 text-white px-5 py-3 rounded-lg flex gap-2 font-bold"
        >
          <Plus size={18}/> Create Assignment
        </button>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 text-xs font-bold uppercase text-gray-500">
            <tr>
              <th className="p-4">Title</th>
              <th className="p-4">Due</th>
              <th className="p-4">Submissions</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {assignments.map(a => (
              <tr key={a.id}>
                <td className="p-4 font-bold">{a.title}</td>
                <td className="p-4">{a.due_date}</td>
                <td className="p-4">{a.submission_count}</td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => onView(a)}
                    className="text-indigo-600 font-bold flex gap-1 items-center ml-auto"
                  >
                    <Eye size={14}/> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

/* -------------------- CREATE -------------------- */

function CreateAssignment({ onBack }) {
  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "",
    classes: [],
    due_date: "",
    total_marks: "",
  })
  const [subjects, setSubjects] = useState([])
  const [classes, setClasses] = useState([])
  const [file, setFile] = useState(null)

  useEffect(() => {
    axiosInstance.get("classroom/teacher/subjects/dropdown").then(r => setSubjects(r.data))
    axiosInstance.get("classroom/teacher/classes/dropdown/").then(r => setClasses(r.data))
  }, [])

  const submit = async () => {
    const payload = {
      ...form,
      classes: form.classes.map(Number),
      total_marks: Number(form.total_marks),
    }

    await axiosInstance.post(
      "assignment/teacher/assignments/",
      payload
    )

    toast.success("Assignment created")
    onBack()
  }


  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <button onClick={onBack} className="flex items-center gap-2 mb-4 text-gray-500">
        <ArrowLeft size={16}/> Back
      </button>

      <h2 className="text-2xl font-black mb-4">📝 New Assignment</h2>

      <input className="input" placeholder="Title"
        onChange={e => setForm({...form, title: e.target.value})} />

      <textarea className="input mt-3" placeholder="Description"
        onChange={e => setForm({...form, description: e.target.value})} />

      <select className="input mt-3"
        onChange={e => setForm({...form, subject: e.target.value})}>
        <option value="">Select Subject</option>
        {subjects.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>

      <select multiple className="input mt-3"
        onChange={e => setForm({...form,
          classes: [...e.target.selectedOptions].map(o => o.value)
        })}>
        {classes.map(c => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>

      <input type="date" className="input mt-3"
        onChange={e => setForm({...form, due_date: `${e.target.value}T23:59:00`})} />

      <input type="number" className="input mt-3"
        placeholder="Total Marks"
        onChange={e => setForm({...form, total_marks: e.target.value})} />

      <input type="file" className="mt-4"
        onChange={e => setFile(e.target.files[0])} />

      <button onClick={submit}
        className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-bold">
        Create Assignment
      </button>
    </div>
  )
}

/* -------------------- SUBMISSIONS -------------------- */

function AssignmentSubmissions({ assignment, onBack }) {
  const [subs, setSubs] = useState([])

  useEffect(() => {
    axiosInstance
      .get("assignment/teacher/submissions/?assignment=" + assignment.id)
      .then(res => setSubs(res.data))
  }, [])

  const grade = async (id, marks, feedback) => {
    await axiosInstance.patch(`assignment/teacher/submissions/${id}/grade/`, {
      marks_obtained: marks,
      feedback,
      status: "graded"
    })
    toast.success("Graded")
  }

  return (
    <>
      <button onClick={onBack} className="flex items-center gap-2 mb-4 text-gray-500">
        <ArrowLeft size={16}/> Back
      </button>

      <h2 className="text-2xl font-black mb-4">{assignment.title}</h2>

      <div className="space-y-4">
        {subs.map(s => (
          <div key={s.id} className="bg-white p-4 rounded-lg border">
            <p className="font-bold">{s.student_name}</p>

            <a href={s.attachment} target="_blank"
              className="text-indigo-600 text-sm">View File</a>

            <input
              type="number"
              placeholder="Marks"
              className="input mt-2"
              onChange={e => s.marks = e.target.value}
            />

            <textarea
              className="input mt-2"
              placeholder="Feedback"
              onChange={e => s.feedback = e.target.value}
            />

            <button
              onClick={() => grade(s.id, s.marks, s.feedback)}
              className="mt-3 bg-green-600 text-white px-4 py-2 rounded"
            >
              Save
            </button>
          </div>
        ))}
      </div>
    </>
  )
}
