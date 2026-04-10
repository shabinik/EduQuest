// TeacherAttendance.jsx  —  complete updated file with Leave Requests tab
import { useEffect, useState } from "react"
import { Calendar, Users, CheckCircle, XCircle, Clock, ArrowLeft, Save, Eye, Edit2, ChevronDown, ChevronUp } from "lucide-react"
import toast from "react-hot-toast"
import axiosInstance from "../../api/axiosInstance"

const LV = {
  pending:  { label: "Pending",  color: "#D97706", bg: "#FEF3C7", border: "#FDE68A" },
  approved: { label: "Approved", color: "#059669", bg: "#D1FAE5", border: "#6EE7B7" },
  rejected: { label: "Rejected", color: "#DC2626", bg: "#FEE2E2", border: "#FCA5A5" },
}

export default function TeacherAttendance() {
  const [view, setView]                 = useState("list")
  const [attendanceRecords, setAttendanceRecords] = useState([])
  const [loading, setLoading]           = useState(false)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [selectedRecord, setSelectedRecord] = useState(null)

  // Leave state
  const [leaveRequests, setLeaveRequests] = useState([])
  const [leaveLoading, setLeaveLoading]   = useState(false)
  const [leaveFilter, setLeaveFilter]     = useState("pending")

  useEffect(() => { fetchAttendanceRecords() }, [])

  useEffect(() => {
    if (view === "leave") fetchLeaveRequests()
  }, [view, leaveFilter])

  const fetchAttendanceRecords = async () => {
    setLoading(true)
    try {
      const res = await axiosInstance.get("academics/teacher/attendance/")
      setAttendanceRecords(res.data)
    } catch { toast.error("Failed to load attendance records") }
    finally { setLoading(false) }
  }

  const fetchLeaveRequests = async () => {
    setLeaveLoading(true)
    try {
      const params = leaveFilter !== "all" ? `?status=${leaveFilter}` : ""
      const res = await axiosInstance.get(`academics/teacher/leave/${params}`)
      setLeaveRequests(res.data)
    } catch { toast.error("Failed to load leave requests") }
    finally { setLeaveLoading(false) }
  }

  const handleLeaveReview = async (id, decision, remark) => {
    if (!remark.trim()) { toast.error("Please enter a remark"); return false }
    try {
      await axiosInstance.post(`academics/teacher/leave/${id}/review/`, {
        status: decision, teacher_remark: remark,
      })
      toast.success(`Leave request ${decision}`)
      fetchLeaveRequests()
      return true
    } catch (err) {
      toast.error(err.response?.data?.teacher_remark?.[0] || "Failed to submit review")
      return false
    }
  }

  const pendingLeaveCount = leaveRequests.filter(r => r.status === "pending").length

  const TAB = (active) => ({
    padding: "8px 18px", borderRadius: 10, fontWeight: 700, fontSize: 13,
    cursor: "pointer", border: "none", transition: "all 0.15s",
    background: active ? "#0D9488" : "transparent",
    color: active ? "#fff" : "#475569",
  })

  return (
    <div style={{ padding: 24, background: "#F8FAFC", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>

        {/* Show tab bar only on list/leave views */}
        {(view === "list" || view === "leave") && (
          <>
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0F172A", margin: 0 }}>Attendance Management</h1>
              <p style={{ color: "#64748B", marginTop: 4, fontSize: 14 }}>Mark, track attendance and manage student leave requests</p>
            </div>

            <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "#fff", padding: 6, borderRadius: 14, border: "1px solid #E2E8F0", width: "fit-content" }}>
              <button style={TAB(view === "list")} onClick={() => setView("list")}>Attendance Records</button>
              <button
                style={{ ...TAB(view === "leave"), display: "flex", alignItems: "center", gap: 6 }}
                onClick={() => setView("leave")}
              >
                Leave Requests
                {pendingLeaveCount > 0 && view !== "leave" && (
                  <span style={{ background: "#FEF3C7", color: "#D97706", fontSize: 11, fontWeight: 800, padding: "1px 7px", borderRadius: 20 }}>
                    {pendingLeaveCount}
                  </span>
                )}
              </button>
            </div>
          </>
        )}

        {view === "list" && (
          <AttendanceList
            records={attendanceRecords} loading={loading}
            onMarkAttendance={() => { setSelectedRecord(null); setView("mark") }}
            onViewRecord={(r) => { setSelectedRecord(r); setView("view") }}
          />
        )}
        {view === "view" && (
          <ViewAttendance
            record={selectedRecord} onBack={() => setView("list")}
            onEdit={() => { setSelectedDate(selectedRecord.date); setView("mark") }}
          />
        )}
        {view === "mark" && (
          <MarkAttendance
            selectedDate={selectedDate} setSelectedDate={setSelectedDate}
            editingRecord={selectedRecord} onBack={() => setView("list")}
            onSuccess={() => { setView("list"); setSelectedRecord(null); fetchAttendanceRecords() }}
          />
        )}
        {view === "leave" && (
          <LeavePanel
            loading={leaveLoading} requests={leaveRequests}
            filter={leaveFilter} setFilter={setLeaveFilter}
            onReview={handleLeaveReview}
          />
        )}
      </div>
    </div>
  )
}

// ── Leave Panel ───────────────────────────────────────────────────────────────
function LeavePanel({ loading, requests, filter, setFilter, onReview }) {
  const pending  = requests.filter(r => r.status === "pending")
  const reviewed = requests.filter(r => r.status !== "pending")

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ fontWeight: 700, fontSize: 18, color: "#0F172A", margin: 0 }}>Student Leave Requests</h2>
        <div style={{ display: "flex", gap: 6 }}>
          {["pending", "approved", "rejected", "all"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: "6px 14px", borderRadius: 8, border: "none",
                fontWeight: 700, fontSize: 12, cursor: "pointer", textTransform: "capitalize",
                background: filter === f ? "#0D9488" : "#F1F5F9",
                color: filter === f ? "#fff" : "#475569",
              }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60 }}>
          <div style={{ width: 32, height: 32, borderRadius: "50%", border: "3px solid #0D9488", borderTopColor: "transparent", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
        </div>
      ) : requests.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", padding: "48px 24px", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>✅</div>
          <p style={{ color: "#94A3B8", fontWeight: 600 }}>
            {filter === "pending" ? "No pending leave requests" : "No requests found"}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filter === "all" && pending.length > 0 && (
            <p style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.1em", margin: "4px 0" }}>
              Awaiting Review ({pending.length})
            </p>
          )}
          {(filter === "all" ? pending : []).map(r => (
            <TeacherLeaveCard key={r.id} request={r} onReview={onReview} />
          ))}

          {filter === "all" && reviewed.length > 0 && (
            <p style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.1em", margin: "8px 0 4px" }}>
              Reviewed ({reviewed.length})
            </p>
          )}
          {(filter === "all" ? reviewed : requests).map(r => (
            <TeacherLeaveCard key={r.id} request={r} onReview={onReview} />
          ))}
        </div>
      )}
    </div>
  )
}

function TeacherLeaveCard({ request: r, onReview }) {
  const [open, setOpen]     = useState(r.status === "pending")
  const [remark, setRemark] = useState("")
  const [saving, setSaving] = useState(false)
  const meta = LV[r.status]

  const submit = async (decision) => {
    setSaving(true)
    const ok = await onReview(r.id, decision, remark)
    if (!ok) setSaving(false)
  }

  return (
    <div style={{ background: "#fff", border: `1px solid ${meta.border}`, borderRadius: 16, overflow: "hidden" }}>
      {/* Header */}
      <button
        onClick={() => setOpen(v => !v)}
        style={{ width: "100%", display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", background: "transparent", border: "none", cursor: "pointer", textAlign: "left" }}
      >
        {/* Student avatar */}
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "#0D9488", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 16, flexShrink: 0 }}>
          {r.student_name?.charAt(0)?.toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: "#0F172A" }}>{r.student_name}</span>
            <span style={{ fontSize: 12, color: "#94A3B8" }}>Roll #{r.roll_number} · {r.class_name}</span>
            <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 99, background: meta.bg, color: meta.color }}>
              {meta.label}
            </span>
          </div>
          <p style={{ fontSize: 12, color: "#64748B", margin: "3px 0 0" }}>
            {r.from_date === r.to_date ? r.from_date : `${r.from_date} → ${r.to_date}`} · {r.days_count} day{r.days_count > 1 ? "s" : ""}
          </p>
        </div>
        <div style={{ color: "#94A3B8", flexShrink: 0 }}>
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </div>
      </button>

      {/* Body */}
      {open && (
        <div style={{ padding: "14px 18px 18px", borderTop: `1px solid ${meta.border}` }}>
          <div style={{ marginBottom: 12 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", marginBottom: 4 }}>Student's Reason</p>
            <p style={{ fontSize: 14, color: "#334155", lineHeight: 1.6 }}>{r.reason}</p>
          </div>

          {r.status !== "pending" ? (
            <div style={{ background: meta.bg, borderRadius: 12, padding: "12px 14px" }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: meta.color, marginBottom: 4 }}>Your Remark</p>
              <p style={{ fontSize: 13, color: "#334155" }}>{r.teacher_remark}</p>
              <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 6 }}>
                {r.reviewed_at ? `Reviewed on ${new Date(r.reviewed_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}` : ""}
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>
                  Your Remark <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Write your remark for the student (required)…"
                  value={remark}
                  onChange={e => setRemark(e.target.value)}
                  style={{ width: "100%", border: "1px solid #E2E8F0", borderRadius: 10, padding: "10px 12px", fontSize: 13, background: "#F8FAFC", resize: "none", outline: "none", boxSizing: "border-box" }}
                />
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => submit("approved")}
                  disabled={saving}
                  style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    padding: "10px", borderRadius: 12, border: "none",
                    background: saving ? "#E2E8F0" : "#059669", color: saving ? "#94A3B8" : "#fff",
                    fontWeight: 800, fontSize: 14, cursor: saving ? "not-allowed" : "pointer",
                  }}
                >
                  <CheckCircle size={17} /> {saving ? "Saving…" : "Approve"}
                </button>
                <button
                  onClick={() => submit("rejected")}
                  disabled={saving}
                  style={{
                    flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                    padding: "10px", borderRadius: 12, border: "none",
                    background: saving ? "#E2E8F0" : "#DC2626", color: saving ? "#94A3B8" : "#fff",
                    fontWeight: 800, fontSize: 14, cursor: saving ? "not-allowed" : "pointer",
                  }}
                >
                  <XCircle size={17} /> {saving ? "Saving…" : "Reject"}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Existing components (unchanged except style-kept) ─────────────────────────
function AttendanceList({ records, loading, onMarkAttendance, onViewRecord }) {
  return (
    <div>
      <div style={{ marginBottom: 20, display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={onMarkAttendance}
          style={{ background: "#0D9488", color: "#fff", border: "none", padding: "10px 20px", borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}
        >
          <CheckCircle size={18} /> Mark Today's Attendance
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #F1F5F9" }}>
          <h2 style={{ fontWeight: 700, color: "#0F172A", margin: 0 }}>Attendance Records</h2>
        </div>
        {loading ? (
          <div style={{ textAlign: "center", padding: 48 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid #0D9488", borderTopColor: "transparent", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
          </div>
        ) : records.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#94A3B8" }}>No attendance records found</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#F8FAFC" }}>
                  {["Date","Class","Total","Present","Absent","Att. %","Action"].map(h => (
                    <th key={h} style={{ padding: "10px 16px", textAlign: h === "Date" || h === "Class" ? "left" : "center", fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map(r => {
                  const pct = r.total_students > 0 ? ((r.present_count / r.total_students) * 100).toFixed(1) : 0
                  return (
                    <tr key={r.id} style={{ borderTop: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "12px 16px", fontWeight: 600, color: "#0F172A" }}>
                        {new Date(r.date).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                      </td>
                      <td style={{ padding: "12px 16px", color: "#475569" }}>{r.class_name} - {r.division}</td>
                      <td style={{ padding: "12px 16px", textAlign: "center", fontWeight: 600 }}>{r.total_students}</td>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <span style={{ background: "#D1FAE5", color: "#059669", borderRadius: 99, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>{r.present_count}</span>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <span style={{ background: "#FEE2E2", color: "#DC2626", borderRadius: 99, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>{r.absent_count}</span>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
                          <div style={{ width: 60, height: 6, background: "#E2E8F0", borderRadius: 99, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${pct}%`, background: pct >= 75 ? "#059669" : pct >= 50 ? "#D97706" : "#DC2626", borderRadius: 99 }} />
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 700, color: "#334155" }}>{pct}%</span>
                        </div>
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center" }}>
                        <button onClick={() => onViewRecord(r)} style={{ color: "#0D9488", fontWeight: 700, fontSize: 13, background: "none", border: "none", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 4 }}>
                          <Eye size={15} /> View
                        </button>
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

function ViewAttendance({ record, onBack, onEdit }) {
  const pct = record.total_students > 0 ? ((record.present_count / record.total_students) * 100).toFixed(1) : 0
  return (
    <div>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, color: "#475569", fontWeight: 700, background: "none", border: "none", cursor: "pointer", marginBottom: 16, fontSize: 14 }}>
        <ArrowLeft size={18} /> Back to Records
      </button>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", margin: 0 }}>Attendance Details</h1>
          <p style={{ color: "#64748B", marginTop: 4 }}>
            {record.class_name} - {record.division} · {new Date(record.date).toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <button onClick={onEdit} style={{ background: "#6366F1", color: "#fff", border: "none", padding: "10px 18px", borderRadius: 10, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <Edit2 size={16} /> Edit Attendance
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 }}>
        {[
          { label: "Total", value: record.total_students, color: "#3B82F6", bg: "#DBEAFE" },
          { label: "Present", value: record.present_count, color: "#059669", bg: "#D1FAE5" },
          { label: "Absent", value: record.absent_count, color: "#DC2626", bg: "#FEE2E2" },
          { label: "Att. %", value: `${pct}%`, color: "#7C3AED", bg: "#EDE9FE" },
        ].map((c, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", padding: "16px 18px" }}>
            <p style={{ fontSize: 12, color: "#64748B", fontWeight: 600, margin: 0 }}>{c.label}</p>
            <p style={{ fontSize: 26, fontWeight: 900, color: c.color, margin: "4px 0 0" }}>{c.value}</p>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #F1F5F9" }}>
          <h3 style={{ fontWeight: 700, color: "#0F172A", margin: 0 }}>Student Attendance List</h3>
        </div>
        {record.student_attendances?.map((att, i) => (
          <div key={i} style={{ padding: "14px 20px", borderTop: i > 0 ? "1px solid #F1F5F9" : "none", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#CCFBF1", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#0D9488" }}>
                {att.student_name?.charAt(0)}
              </div>
              <div>
                <p style={{ fontWeight: 600, color: "#0F172A", margin: 0 }}>{att.student_name}</p>
                <p style={{ fontSize: 12, color: "#94A3B8", margin: 0 }}>Roll: {att.student_roll}</p>
              </div>
            </div>
            <span style={{
              fontSize: 12, fontWeight: 700, padding: "4px 12px", borderRadius: 99,
              background: att.status === "present" ? "#D1FAE5" : att.status === "absent" ? "#FEE2E2" : "#FEF3C7",
              color: att.status === "present" ? "#059669" : att.status === "absent" ? "#DC2626" : "#D97706",
            }}>
              {att.status === "present" ? "✓ Present" : att.status === "absent" ? "✗ Absent" : "⏸ Leave"}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function MarkAttendance({ selectedDate, setSelectedDate, editingRecord, onBack, onSuccess }) {
  const [students, setStudents] = useState([])
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const classId = 1  // replace with teacher's actual class id

  useEffect(() => { fetchStudents() }, [selectedDate])

  const fetchStudents = async () => {
    setLoading(true)
    try {
      const res = await axiosInstance.get(`academics/teacher/attendance/students/?class_id=${classId}&date=${selectedDate}`)
      setStudents(res.data.students)
    } catch { toast.error("Failed to load students") }
    finally { setLoading(false) }
  }

  const setStatus = (id, s) => setStudents(prev => prev.map(st => st.id === id ? { ...st, status: s } : st))
  const markAll = (s) => setStudents(prev => prev.map(st => ({ ...st, status: s })))

  const handleSubmit = async () => {
    setSaving(true)
    try {
      await axiosInstance.post("academics/teacher/attendance/mark/", {
        school_class: classId,
        date: selectedDate,
        attendance_data: students.map(s => ({ student_id: s.id, status: s.status })),
      })
      toast.success(editingRecord ? "Attendance updated!" : "Attendance marked!")
      onSuccess()
    } catch (err) { toast.error(err.response?.data?.error || "Failed to mark attendance") }
    finally { setSaving(false) }
  }

  const stats = { total: students.length, present: students.filter(s => s.status === "present").length, absent: students.filter(s => s.status === "absent").length, leave: students.filter(s => s.status === "leave").length }

  return (
    <div>
      <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 6, color: "#475569", fontWeight: 700, background: "none", border: "none", cursor: "pointer", marginBottom: 16, fontSize: 14 }}>
        <ArrowLeft size={18} /> Back to Records
      </button>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", marginBottom: 20 }}>
        {editingRecord ? "Edit Attendance" : "Mark Attendance"}
      </h1>

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", padding: 20, marginBottom: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>Select Date</label>
          <input type="date" value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            disabled={!!editingRecord}
            style={{ width: "100%", border: "1px solid #E2E8F0", borderRadius: 8, padding: "8px 12px", fontSize: 13, background: editingRecord ? "#F8FAFC" : "#fff", boxSizing: "border-box" }}
          />
        </div>
        <div>
          <label style={{ fontSize: 12, fontWeight: 700, color: "#475569", display: "block", marginBottom: 6 }}>Quick Actions</label>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => markAll("present")} style={{ flex: 1, background: "#D1FAE5", color: "#059669", border: "none", borderRadius: 8, padding: "8px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>All Present</button>
            <button onClick={() => markAll("absent")} style={{ flex: 1, background: "#FEE2E2", color: "#DC2626", border: "none", borderRadius: 8, padding: "8px", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>All Absent</button>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
        {[["Total", stats.total, "#3B82F6"],["Present", stats.present, "#059669"],["Absent", stats.absent, "#DC2626"],["Leave", stats.leave, "#D97706"]].map(([l,v,c]) => (
          <div key={l} style={{ background: "#fff", borderRadius: 12, border: "1px solid #E2E8F0", padding: "14px 16px" }}>
            <p style={{ fontSize: 22, fontWeight: 900, color: c, margin: 0 }}>{v}</p>
            <p style={{ fontSize: 12, color: "#64748B", fontWeight: 600, margin: "2px 0 0" }}>{l}</p>
          </div>
        ))}
      </div>

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden", marginBottom: 16 }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #F1F5F9" }}>
          <h3 style={{ fontWeight: 700, color: "#0F172A", margin: 0 }}>Students</h3>
        </div>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{ width: 28, height: 28, borderRadius: "50%", border: "3px solid #0D9488", borderTopColor: "transparent", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
          </div>
        ) : students.map(s => (
          <div key={s.id} style={{ padding: "12px 20px", borderTop: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#CCFBF1", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#0D9488" }}>
                {s.name?.charAt(0)}
              </div>
              <div>
                <p style={{ fontWeight: 600, color: "#0F172A", margin: 0 }}>{s.name}</p>
                <p style={{ fontSize: 12, color: "#94A3B8", margin: 0 }}>Roll: {s.roll_number}</p>
              </div>
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {[["present","✓ Present","#059669","#D1FAE5"],["absent","✗ Absent","#DC2626","#FEE2E2"],["leave","⏸ Leave","#D97706","#FEF3C7"]].map(([status, label, active, activeBg]) => (
                <button key={status} onClick={() => setStatus(s.id, status)}
                  style={{
                    padding: "6px 12px", borderRadius: 8, border: "none",
                    fontWeight: 700, fontSize: 12, cursor: "pointer",
                    background: s.status === status ? active : "#F1F5F9",
                    color: s.status === status ? "#fff" : "#475569",
                  }}>
                  {label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={handleSubmit} disabled={saving}
        style={{
          width: "100%", padding: 14, borderRadius: 12, border: "none",
          background: saving ? "#E2E8F0" : "#0D9488", color: saving ? "#94A3B8" : "#fff",
          fontWeight: 800, fontSize: 16, cursor: saving ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        }}
      >
        <Save size={20} /> {saving ? "Saving…" : editingRecord ? "Update Attendance" : "Save Attendance"}
      </button>
    </div>
  )
}