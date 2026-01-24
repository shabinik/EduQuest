import { useEffect, useState } from "react"
import axiosInstance from "../../api/axiosInstance"
import { ArrowLeft, Upload } from "lucide-react"

export default function StudentAssignmentsPage() {
  const [view, setView] = useState("list")
  const [selected, setSelected] = useState(null)

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {view === "list" && (
        <AssignmentList onOpen={(a) => {
          setSelected(a)
          setView("submit")
        }} />
      )}

      {view === "submit" && (
        <SubmitAssignment
          assignment={selected}
          onBack={() => setView("list")}
        />
      )}
    </div>
  )
}

/* -------------------- LIST -------------------- */

function AssignmentList({ onOpen }) {
  const [assignments, setAssignments] = useState([])

  useEffect(() => {
    axiosInstance.get("assignments/student/")
      .then(res => setAssignments(res.data))
  }, [])

  return (
    <>
      <h1 className="text-3xl font-black mb-6">📘 My Assignments</h1>

      <div className="grid gap-4">
        {assignments.map(a => (
          <div key={a.id} className="bg-white p-6 rounded-xl border">
            <h3 className="font-black text-lg">{a.title}</h3>
            <p className="text-gray-500">{a.subject} • {a.teacher}</p>
            <p className="text-sm mt-1">Due: {a.due_date}</p>

            {a.marks !== null && (
              <p className="mt-2 font-bold text-green-600">
                Marks: {a.marks}/{a.total_marks}
              </p>
            )}

            <button
              onClick={() => onOpen(a)}
              className="mt-4 bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold"
            >
              View / Submit
            </button>
          </div>
        ))}
      </div>
    </>
  )
}

/* -------------------- SUBMIT -------------------- */

function SubmitAssignment({ assignment, onBack }) {
  const [file, setFile] = useState(null)
  const [desc, setDesc] = useState("")

  const submit = async () => {
    const fd = new FormData()
    fd.append("assignment", assignment.id)
    fd.append("attachment", file)
    fd.append("description", desc)

    await axiosInstance.post("assignments/student/submit/", fd)
    onBack()
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <button onClick={onBack} className="flex items-center gap-2 mb-4 text-gray-500">
        <ArrowLeft size={16}/> Back
      </button>

      <h2 className="text-2xl font-black mb-4">{assignment.title}</h2>

      <textarea
        className="input"
        placeholder="Notes (optional)"
        onChange={e => setDesc(e.target.value)}
      />

      <input
        type="file"
        className="mt-4"
        onChange={e => setFile(e.target.files[0])}
      />

      <button
        onClick={submit}
        className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-lg font-bold"
      >
        <Upload size={18} className="inline mr-2"/> Submit Assignment
      </button>
    </div>
  )
}
