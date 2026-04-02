// StudentAttendance.jsx  —  complete updated file with Leave Requests tab
import { useEffect, useState } from "react"
import { Calendar, TrendingUp, CheckCircle, XCircle, Clock, ChevronLeft, ChevronRight, Plus, X } from "lucide-react"
import axiosInstance from "../../api/axiosInstance"
import toast from "react-hot-toast"

// ── Leave request status meta ─────────────────────────────────────────────────
const LV = {
  pending:  { label: "Pending",  color: "#D97706", bg: "#FEF3C7", border: "#FDE68A" },
  approved: { label: "Approved", color: "#059669", bg: "#D1FAE5", border: "#6EE7B7" },
  rejected: { label: "Rejected", color: "#DC2626", bg: "#FEE2E2", border: "#FCA5A5" },
}

export default function StudentAttendance() {
  const [view, setView]             = useState("current")
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [currentYear, setCurrentYear]   = useState(new Date().getFullYear())
  const [summary, setSummary]       = useState(null)
  const [dailyAttendance, setDailyAttendance] = useState([])
  const [monthlyReports, setMonthlyReports]   = useState([])
  const [loading, setLoading]       = useState(true)

  // Leave state
  const [leaveRequests, setLeaveRequests] = useState([])
  const [leaveLoading, setLeaveLoading]   = useState(false)
  const [showLeaveForm, setShowLeaveForm] = useState(false)
  const [leaveForm, setLeaveForm] = useState({ from_date: "", to_date: "", reason: "" })
  const [leaveSubmitting, setLeaveSubmitting] = useState(false)

  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    if (view === "current") fetchCurrentMonthAttendance()
    else if (view === "reports") fetchMonthlyReports()
    else if (view === "leave") fetchLeaveRequests()
  }, [view, currentMonth, currentYear])

  const fetchCurrentMonthAttendance = async () => {
    setLoading(true)
    try {
      const res = await axiosInstance.get(`academics/student/attendance/?month=${currentMonth}&year=${currentYear}`)
      setSummary(res.data.summary)
      setDailyAttendance(res.data.daily_attendance)
    } catch { toast.error("Failed to load attendance data") }
    finally { setLoading(false) }
  }

  const fetchMonthlyReports = async () => {
    setLoading(true)
    try {
      const res = await axiosInstance.get("academics/student/attendance/monthly/")
      setMonthlyReports(res.data)
    } catch { toast.error("Failed to load monthly reports") }
    finally { setLoading(false) }
  }

  const fetchLeaveRequests = async () => {
    setLeaveLoading(true)
    try {
      const res = await axiosInstance.get("academics/student/leave/")
      setLeaveRequests(res.data)
    } catch { toast.error("Failed to load leave requests") }
    finally { setLeaveLoading(false) }
  }

  const handleLeaveSubmit = async (e) => {
    e.preventDefault()
    if (!leaveForm.from_date || !leaveForm.to_date || !leaveForm.reason.trim()) {
      toast.error("Please fill all fields"); return
    }
    setLeaveSubmitting(true)
    try {
      await axiosInstance.post("academics/student/leave/", leaveForm)
      toast.success("Leave request submitted!")
      setShowLeaveForm(false)
      setLeaveForm({ from_date: "", to_date: "", reason: "" })
      fetchLeaveRequests()
    } catch (err) {
      toast.error(err.response?.data?.non_field_errors?.[0] || "Failed to submit request")
    } finally { setLeaveSubmitting(false) }
  }

  const handleLeaveCancel = async (id) => {
    if (!window.confirm("Cancel this leave request?")) return
    try {
      await axiosInstance.delete(`academics/student/leave/${id}/`)
      toast.success("Request cancelled")
      fetchLeaveRequests()
    } catch { toast.error("Could not cancel — may already be reviewed") }
  }

  const goToPreviousMonth = () => {
    if (currentMonth === 1) { setCurrentMonth(12); setCurrentYear(y => y - 1) }
    else setCurrentMonth(m => m - 1)
  }
  const goToNextMonth = () => {
    const now = new Date()
    const cur = new Date(currentYear, currentMonth - 1)
    const max = new Date(now.getFullYear(), now.getMonth())
    if (cur >= max) return
    if (currentMonth === 12) { setCurrentMonth(1); setCurrentYear(y => y + 1) }
    else setCurrentMonth(m => m + 1)
  }
  const canGoNext = currentYear < new Date().getFullYear() ||
    (currentYear === new Date().getFullYear() && currentMonth < new Date().getMonth() + 1)

  const monthName = new Date(currentYear, currentMonth - 1)
    .toLocaleDateString("en-US", { month: "long", year: "numeric" })

  const pendingLeaveCount = leaveRequests.filter(r => r.status === "pending").length

  const TAB_STYLE = (active) => ({
    padding: "8px 18px",
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 13,
    cursor: "pointer",
    border: "none",
    transition: "all 0.15s",
    background: active ? "#6366F1" : "transparent",
    color: active ? "#fff" : "#475569",
  })

  return (
    <div style={{ padding: 24, background: "#F8FAFC", minHeight: "100vh" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>

        {/* Page header */}
        <div style={{ marginBottom: 20 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0F172A", margin: 0 }}>My Attendance</h1>
          <p style={{ color: "#64748B", marginTop: 4, fontSize: 14 }}>Track your attendance and manage leave requests</p>
        </div>

        {/* Tab bar */}
        <div style={{
          display: "flex", gap: 4, marginBottom: 24,
          background: "#fff", padding: 6, borderRadius: 14,
          border: "1px solid #E2E8F0", width: "fit-content"
        }}>
          <button style={TAB_STYLE(view === "current")}   onClick={() => setView("current")}>Current Month</button>
          <button style={TAB_STYLE(view === "reports")}   onClick={() => setView("reports")}>All Reports</button>
          <button
            style={{ ...TAB_STYLE(view === "leave"), display: "flex", alignItems: "center", gap: 6 }}
            onClick={() => setView("leave")}
          >
            Leave Requests
            {pendingLeaveCount > 0 && view !== "leave" && (
              <span style={{
                background: "#FEF3C7", color: "#D97706",
                fontSize: 11, fontWeight: 800,
                padding: "1px 7px", borderRadius: 20,
              }}>
                {pendingLeaveCount}
              </span>
            )}
          </button>
        </div>

        {/* Views */}
        {view === "current" && (
          <CurrentMonthView
            loading={loading} summary={summary} dailyAttendance={dailyAttendance}
            monthName={monthName} onPrevious={goToPreviousMonth} onNext={goToNextMonth} canGoNext={canGoNext}
          />
        )}
        {view === "reports" && <MonthlyReportsView loading={loading} reports={monthlyReports} />}
        {view === "leave" && (
          <LeaveView
            loading={leaveLoading}
            requests={leaveRequests}
            showForm={showLeaveForm}
            setShowForm={setShowLeaveForm}
            form={leaveForm}
            setForm={setLeaveForm}
            submitting={leaveSubmitting}
            onSubmit={handleLeaveSubmit}
            onCancel={handleLeaveCancel}
            today={today}
          />
        )}
      </div>
    </div>
  )
}

// ── Leave View ────────────────────────────────────────────────────────────────
function LeaveView({ loading, requests, showForm, setShowForm, form, setForm, submitting, onSubmit, onCancel, today }) {
  const pending  = requests.filter(r => r.status === "pending")
  const reviewed = requests.filter(r => r.status !== "pending")

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, alignItems: "start" }}>

      {/* Left: request list */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <h2 style={{ fontWeight: 700, fontSize: 16, color: "#0F172A", margin: 0 }}>Your Leave Requests</h2>
          <button
            onClick={() => setShowForm(v => !v)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 10, border: "none",
              background: showForm ? "#EF4444" : "#E11D48", color: "#fff",
              fontWeight: 700, fontSize: 13, cursor: "pointer",
            }}
          >
            {showForm ? <><X size={14} /> Close</> : <><Plus size={14} /> New Request</>}
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div style={{
              width: 32, height: 32, borderRadius: "50%", border: "3px solid #E11D48",
              borderTopColor: "transparent", animation: "spin 0.7s linear infinite", margin: "0 auto",
            }} />
          </div>
        ) : requests.length === 0 ? (
          <div style={{
            background: "#fff", borderRadius: 16, border: "1px solid #F1F5F9",
            padding: "48px 24px", textAlign: "center",
          }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📋</div>
            <p style={{ color: "#94A3B8", fontWeight: 600 }}>No leave requests yet</p>
            <p style={{ color: "#CBD5E1", fontSize: 13, marginTop: 4 }}>Click "New Request" to submit one</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {pending.length > 0 && (
              <>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.1em", margin: "4px 0" }}>
                  Awaiting Review ({pending.length})
                </p>
                {pending.map(r => <LeaveCard key={r.id} request={r} onCancel={onCancel} canCancel />)}
              </>
            )}
            {reviewed.length > 0 && (
              <>
                <p style={{ fontSize: 11, fontWeight: 700, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.1em", margin: "4px 0" }}>
                  Reviewed ({reviewed.length})
                </p>
                {reviewed.map(r => <LeaveCard key={r.id} request={r} />)}
              </>
            )}
          </div>
        )}
      </div>

      {/* Right: form or info panel */}
      <div>
        {showForm ? (
          <div style={{
            background: "#FFF1F2", border: "1px solid #FECDD3",
            borderRadius: 20, padding: 20,
            position: "sticky", top: 20,
          }}>
            <h3 style={{ fontWeight: 800, fontSize: 14, color: "#E11D48", marginTop: 0, marginBottom: 16 }}>
              📝 New Leave Request
            </h3>
            <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>
                    From Date
                  </label>
                  <input type="date" min={today} value={form.from_date}
                    onChange={e => setForm(f => ({ ...f, from_date: e.target.value }))}
                    style={{ width: "100%", border: "1px solid #FECDD3", borderRadius: 8, padding: "7px 10px", fontSize: 13, background: "#fff", boxSizing: "border-box" }}
                    required />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>
                    To Date
                  </label>
                  <input type="date" min={form.from_date || today} value={form.to_date}
                    onChange={e => setForm(f => ({ ...f, to_date: e.target.value }))}
                    style={{ width: "100%", border: "1px solid #FECDD3", borderRadius: 8, padding: "7px 10px", fontSize: 13, background: "#fff", boxSizing: "border-box" }}
                    required />
                </div>
              </div>
              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: "#475569", display: "block", marginBottom: 4 }}>
                  Reason
                </label>
                <textarea rows={4} placeholder="Explain why you need leave…"
                  value={form.reason}
                  onChange={e => setForm(f => ({ ...f, reason: e.target.value }))}
                  style={{ width: "100%", border: "1px solid #FECDD3", borderRadius: 8, padding: "8px 10px", fontSize: 13, background: "#fff", resize: "none", boxSizing: "border-box" }}
                  required />
              </div>
              <button type="submit" disabled={submitting}
                style={{
                  background: "#E11D48", color: "#fff", border: "none",
                  borderRadius: 10, padding: "10px", fontWeight: 800, fontSize: 14,
                  cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.6 : 1,
                }}>
                {submitting ? "Submitting…" : "Submit Request"}
              </button>
            </form>
          </div>
        ) : (
          <div style={{
            background: "#fff", border: "1px solid #E2E8F0",
            borderRadius: 20, padding: 20,
            position: "sticky", top: 20,
          }}>
            <h3 style={{ fontWeight: 800, fontSize: 14, color: "#0F172A", marginTop: 0, marginBottom: 12 }}>
              📌 How Leave Requests Work
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                { step: "1", text: `Click "New Request" and fill in your dates and reason.` },
                { step: "2", text: "Your class teacher will review and either approve or reject it." },
                { step: "3", text: "You'll see the decision and teacher's remark right here." },
                { step: "4", text: "Approved leaves are recorded in your attendance." },
              ].map(s => (
                <div key={s.step} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  <span style={{
                    width: 22, height: 22, borderRadius: "50%", background: "#E11D48",
                    color: "#fff", fontSize: 11, fontWeight: 800,
                    display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                  }}>{s.step}</span>
                  <p style={{ fontSize: 13, color: "#475569", margin: 0, lineHeight: 1.5 }}>{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function LeaveCard({ request: r, onCancel, canCancel }) {
  const [open, setOpen] = useState(false)
  const meta = LV[r.status]

  return (
    <div style={{
      background: "#fff", border: `1px solid ${meta.border}`,
      borderRadius: 14, overflow: "hidden",
      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 12,
          padding: "12px 16px", background: "transparent", border: "none",
          cursor: "pointer", textAlign: "left",
        }}
      >
        <div style={{
          width: 36, height: 36, borderRadius: 10, background: meta.bg,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          {r.status === "approved" && <CheckCircle size={18} color={meta.color} />}
          {r.status === "rejected" && <XCircle size={18} color={meta.color} />}
          {r.status === "pending"  && <Clock size={18} color={meta.color} />}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 13, color: "#0F172A" }}>
              {r.from_date === r.to_date ? r.from_date : `${r.from_date} → ${r.to_date}`}
            </span>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 20,
              background: meta.bg, color: meta.color,
            }}>
              {r.days_count}d
            </span>
          </div>
          <p style={{ fontSize: 12, color: "#64748B", margin: 0, marginTop: 2,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 300 }}>
            {r.reason}
          </p>
        </div>
        <span style={{ fontSize: 11, fontWeight: 700, color: meta.color, flexShrink: 0 }}>
          {meta.label}
        </span>
      </button>

      {open && (
        <div style={{ padding: "12px 16px 14px", borderTop: `1px solid ${meta.border}` }}>
          <p style={{ fontSize: 13, color: "#334155", margin: 0, marginBottom: 8 }}>{r.reason}</p>

          {r.status !== "pending" && r.teacher_remark && (
            <div style={{ background: meta.bg, borderRadius: 10, padding: "10px 12px", marginBottom: 8 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: meta.color, margin: 0, marginBottom: 4 }}>
                Teacher's Remark
              </p>
              <p style={{ fontSize: 13, color: "#334155", margin: 0 }}>{r.teacher_remark}</p>
              {r.reviewed_by_name && (
                <p style={{ fontSize: 11, color: "#94A3B8", margin: 0, marginTop: 4 }}>
                  — {r.reviewed_by_name}
                </p>
              )}
            </div>
          )}

          {canCancel && r.status === "pending" && (
            <button
              onClick={() => onCancel(r.id)}
              style={{
                fontSize: 12, fontWeight: 700, color: "#DC2626",
                border: "1px solid #FCA5A5", background: "transparent",
                padding: "5px 12px", borderRadius: 8, cursor: "pointer",
              }}
            >
              Cancel Request
            </button>
          )}
        </div>
      )}
    </div>
  )
}

// ── Keep existing components below (unchanged) ─────────────────────────────
function CurrentMonthView({ loading, summary, dailyAttendance, monthName, onPrevious, onNext, canGoNext }) {
  if (loading) return (
    <div style={{ textAlign: "center", padding: 60 }}>
      <div style={{
        width: 32, height: 32, borderRadius: "50%",
        border: "4px solid #6366F1", borderTopColor: "transparent",
        animation: "spin 0.7s linear infinite", display: "inline-block", marginBottom: 12,
      }} />
      <p style={{ color: "#64748B" }}>Loading attendance data...</p>
    </div>
  )

  if (!summary) return (
    <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #E2E8F0", padding: "48px 24px", textAlign: "center" }}>
      <Calendar size={48} color="#CBD5E1" style={{ margin: "0 auto 12px" }} />
      <p style={{ color: "#94A3B8", fontSize: 16 }}>No attendance data for this month</p>
    </div>
  )

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Month nav */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={onPrevious} style={{ background: "none", border: "none", cursor: "pointer", padding: 6 }}>
          <ChevronLeft size={24} color="#475569" />
        </button>
        <h2 style={{ fontWeight: 800, fontSize: 18, color: "#0F172A", display: "flex", alignItems: "center", gap: 8 }}>
          <Calendar size={20} color="#6366F1" /> {monthName}
        </h2>
        <button onClick={onNext} disabled={!canGoNext} style={{ background: "none", border: "none", cursor: canGoNext ? "pointer" : "not-allowed", padding: 6, opacity: canGoNext ? 1 : 0.3 }}>
          <ChevronRight size={24} color="#475569" />
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          { label: "Total Days",   value: summary.total_days,            color: "#3B82F6", bg: "#DBEAFE" },
          { label: "Present",      value: summary.present_days,          color: "#059669", bg: "#D1FAE5" },
          { label: "Absent",       value: summary.absent_days,           color: "#DC2626", bg: "#FEE2E2" },
          { label: "Attendance %", value: `${summary.attendance_percentage}%`, color: "#7C3AED", bg: "#EDE9FE" },
        ].map((c, i) => (
          <div key={i} style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", padding: "16px 18px" }}>
            <p style={{ fontSize: 13, color: "#64748B", fontWeight: 600, margin: 0 }}>{c.label}</p>
            <p style={{ fontSize: 28, fontWeight: 900, color: c.color, margin: "4px 0 0" }}>{c.value}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", padding: "20px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
          <span style={{ fontWeight: 700, color: "#0F172A" }}>Overall Attendance</span>
          <span style={{ fontWeight: 900, fontSize: 22, color: "#0F172A" }}>{summary.attendance_percentage}%</span>
        </div>
        <div style={{ height: 14, background: "#E2E8F0", borderRadius: 99, overflow: "hidden" }}>
          <div style={{
            height: "100%", borderRadius: 99,
            width: `${summary.attendance_percentage}%`,
            background: summary.attendance_percentage >= 75 ? "linear-gradient(90deg,#059669,#10B981)"
              : summary.attendance_percentage >= 50 ? "linear-gradient(90deg,#D97706,#F59E0B)"
              : "linear-gradient(90deg,#DC2626,#EF4444)",
            transition: "width 0.6s ease",
          }} />
        </div>
        <p style={{ fontSize: 12, color: "#64748B", marginTop: 8 }}>
          {summary.attendance_percentage >= 75 ? "✓ Great attendance! Keep it up!"
            : summary.attendance_percentage >= 50 ? "⚠ Your attendance needs improvement"
            : "⚠ Low attendance - please improve urgently"}
        </p>
      </div>

      {/* Daily records */}
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
        <div style={{ padding: "16px 24px", borderBottom: "1px solid #F1F5F9" }}>
          <h3 style={{ fontWeight: 700, color: "#0F172A", margin: 0 }}>Daily Attendance Record</h3>
        </div>
        <div style={{ padding: 20, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", gap: 10 }}>
          {dailyAttendance.map((record, i) => <AttendanceDay key={i} record={record} />)}
          {dailyAttendance.length === 0 && <p style={{ color: "#94A3B8", textAlign: "center", gridColumn: "1/-1", padding: 24 }}>No records this month</p>}
        </div>
      </div>
    </div>
  )
}

function MonthlyReportsView({ loading, reports }) {
  if (loading) return (
    <div style={{ textAlign: "center", padding: 60 }}>
      <div style={{ width: 32, height: 32, borderRadius: "50%", border: "4px solid #6366F1", borderTopColor: "transparent", animation: "spin 0.7s linear infinite", display: "inline-block" }} />
    </div>
  )
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid #E2E8F0", overflow: "hidden" }}>
      <div style={{ padding: "16px 24px", borderBottom: "1px solid #F1F5F9" }}>
        <h2 style={{ fontWeight: 700, color: "#0F172A", margin: 0 }}>Monthly Attendance Reports</h2>
      </div>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#F8FAFC" }}>
              {["Month","Total Days","Present","Absent","Attendance %","Status"].map(h => (
                <th key={h} style={{ padding: "10px 20px", textAlign: h === "Month" ? "left" : "center", fontSize: 11, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {reports.map(r => {
              const mName = new Date(r.year, r.month - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })
              const pct = r.attendance_percentage
              return (
                <tr key={r.id} style={{ borderTop: "1px solid #F1F5F9" }}>
                  <td style={{ padding: "12px 20px", fontWeight: 600, color: "#0F172A" }}>{mName}</td>
                  <td style={{ padding: "12px 20px", textAlign: "center", color: "#475569" }}>{r.total_days}</td>
                  <td style={{ padding: "12px 20px", textAlign: "center" }}>
                    <span style={{ background: "#D1FAE5", color: "#059669", borderRadius: 99, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>{r.present_days}</span>
                  </td>
                  <td style={{ padding: "12px 20px", textAlign: "center" }}>
                    <span style={{ background: "#FEE2E2", color: "#DC2626", borderRadius: 99, padding: "2px 10px", fontSize: 12, fontWeight: 700 }}>{r.absent_days}</span>
                  </td>
                  <td style={{ padding: "12px 20px", textAlign: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                      <div style={{ width: 80, height: 6, background: "#E2E8F0", borderRadius: 99, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: pct >= 75 ? "#059669" : pct >= 50 ? "#D97706" : "#DC2626", borderRadius: 99 }} />
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#334155", minWidth: 42 }}>{pct}%</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 20px", textAlign: "center" }}>
                    <span style={{
                      fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99,
                      background: pct >= 75 ? "#D1FAE5" : pct >= 50 ? "#FEF3C7" : "#FEE2E2",
                      color: pct >= 75 ? "#059669" : pct >= 50 ? "#D97706" : "#DC2626",
                    }}>
                      {pct >= 75 ? "✓ Good" : pct >= 50 ? "⚠ Average" : "✗ Low"}
                    </span>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {reports.length === 0 && <p style={{ textAlign: "center", padding: 40, color: "#94A3B8" }}>No monthly reports available</p>}
      </div>
    </div>
  )
}

function AttendanceDay({ record }) {
  const date = new Date(record.date)
  const cfg = {
    present: { bg: "#F0FDF4", border: "#BBF7D0", icon: <CheckCircle size={18} color="#059669" />, label: "Present", lColor: "#059669" },
    absent:  { bg: "#FFF1F2", border: "#FECDD3", icon: <XCircle   size={18} color="#DC2626" />, label: "Absent",  lColor: "#DC2626" },
    leave:   { bg: "#FFFBEB", border: "#FDE68A", icon: <Clock      size={18} color="#D97706" />, label: "Leave",   lColor: "#D97706" },
  }[record.status] || { bg: "#F8FAFC", border: "#E2E8F0", icon: null, label: "—", lColor: "#94A3B8" }

  return (
    <div style={{ background: cfg.bg, border: `1px solid ${cfg.border}`, borderRadius: 12, padding: "12px 14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontSize: 22, fontWeight: 900, color: "#0F172A" }}>{date.getDate()}</span>
        {cfg.icon}
      </div>
      <p style={{ fontSize: 11, color: "#64748B", fontWeight: 600, margin: 0 }}>{record.day_of_week}</p>
      <p style={{ fontSize: 11, fontWeight: 800, color: cfg.lColor, margin: "2px 0 0" }}>{cfg.label}</p>
    </div>
  )
}