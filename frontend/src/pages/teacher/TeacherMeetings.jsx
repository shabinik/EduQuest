import React, { useEffect, useState } from "react"
import axiosInstance from "../../api/axiosInstance"
import toast from "react-hot-toast"
import MeetingRoom from "../../components/MeetingRoom"
import {
  MeetingCard,
  MeetingFormModal,
  ConfirmDeleteDialog,
} from "../../components/MeetingShared"

export default function TeacherMeetings() {
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)
  const [classOptions, setClassOptions] = useState([])
  const [loadingClasses, setLoadingClasses] = useState(true)

  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [activeMeeting, setActiveMeeting] = useState(null)

  // Active tab: "class" shows class meetings, "staff" shows admin staff meetings
  const [activeTab, setActiveTab] = useState("class")

  const user = JSON.parse(sessionStorage.getItem("user") || "{}")

  useEffect(() => {
    fetchMeetings()
    fetchMyClasses()
  }, [])

  async function fetchMeetings() {
    setLoading(true)
    try {
      const res = await axiosInstance.get("chatvideo/meet/")
      setMeetings(res.data)
    } catch {
      toast.error("Failed to load meetings.")
    } finally {
      setLoading(false)
    }
  }

  // Fetch the list of classes this teacher teaches
  // This hits your TeacherClassDropDownView endpoint
  async function fetchMyClasses() {
    try {
      const res = await axiosInstance.get("classroom/teacher/classes/dropdown/")
      setClassOptions(res.data) // [{ id, label }]
    } catch {
      toast.error("Failed to load your classes.")
    } finally {
      setLoadingClasses(false)
    }
  }

  function handleSaved(savedMeeting) {
    setMeetings(prev => {
      const exists = prev.find(m => m.id === savedMeeting.id)
      if (exists) return prev.map(m => m.id === savedMeeting.id ? savedMeeting : m)
      return [savedMeeting, ...prev]
    })
    setShowCreate(false)
    setEditTarget(null)
    toast.success(savedMeeting.id ? "Meeting updated!" : "Meeting created!")
  }

  async function handleStart(meeting) {
    try {
      await axiosInstance.post(`chatvideo/meet/start/${meeting.id}/`)
      setMeetings(prev =>
        prev.map(m => m.id === meeting.id ? { ...m, status: "live" } : m)
      )
      toast.success("Meeting is now live!")
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to start meeting.")
    }
  }

  async function handleEnd(meeting) {
    try {
      await axiosInstance.post(`chatvideo/meet/end/${meeting.id}/`)
      setMeetings(prev =>
        prev.map(m => m.id === meeting.id ? { ...m, status: "ended" } : m)
      )
      if (activeMeeting?.id === meeting.id) setActiveMeeting(null)
      toast.success("Meeting ended.")
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to end meeting.")
    }
  }

  async function handleJoin(meeting) {
    try {
      const res = await axiosInstance.post(`chatvideo/meet/join/${meeting.id}/`)
      setActiveMeeting({ ...meeting, jitsi_url: res.data.jitsi_url })
    } catch (err) {
      toast.error(err.response?.data?.error || "Cannot join this meeting.")
    }
  }

  async function handleDeleteConfirm() {
    try {
      await axiosInstance.delete(`chatvideo/meet/detail/${deleteTarget.id}/`)
      setMeetings(prev =>
        prev.map(m => m.id === deleteTarget.id ? { ...m, status: "cancelled" } : m)
      )
      toast.success("Meeting cancelled.")
    } catch {
      toast.error("Failed to cancel meeting.")
    } finally {
      setDeleteTarget(null)
    }
  }

  // ── Split meetings by type for the two tabs ──
  const classMeetings = meetings.filter(m => m.meeting_type === "class_meeting")
  const staffMeetings = meetings.filter(m => m.meeting_type === "staff_meeting")

  const shownMeetings = activeTab === "class" ? classMeetings : staffMeetings

  // Sub-split by status for sections
  const live = shownMeetings.filter(m => m.status === "live")
  const upcoming = shownMeetings.filter(m => m.status === "scheduled")
  const past = shownMeetings.filter(
    m => m.status === "ended" || m.status === "cancelled"
  )

  if (activeMeeting) {
    return (
      <MeetingRoom
        meeting={activeMeeting}
        onLeave={() => setActiveMeeting(null)}
      />
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Meetings</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Manage your class meetings and view staff meetings
          </p>
        </div>
        {/* Only show create button on the class tab */}
        {activeTab === "class" && (
          <button
            onClick={() => setShowCreate(true)}
            disabled={loadingClasses || classOptions.length === 0}
            title={classOptions.length === 0 ? "No classes assigned to you yet" : ""}
            className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            + New Meeting
          </button>
        )}
      </div>

      {/* ── Tabs: Class Meetings | Staff Meetings ── */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {[
          { key: "class", label: "📚 Class Meetings", count: classMeetings.length },
          { key: "staff", label: "👔 Staff Meetings",  count: staffMeetings.length },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all
              ${activeTab === tab.key
                ? "bg-white text-violet-700 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
              }`}
          >
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold
              ${activeTab === tab.key ? "bg-violet-100 text-violet-600" : "bg-gray-200 text-gray-400"}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* ── Staff tab notice (read-only) ── */}
      {activeTab === "staff" && (
        <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 text-sm px-4 py-2.5 rounded-xl mb-5">
          ℹ️ Staff meetings are created by the admin. You can join live ones below.
        </div>
      )}

      {/* ── Meetings content ── */}
      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 mt-3 text-sm">Loading meetings...</p>
        </div>
      ) : shownMeetings.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-5xl mb-3">📅</div>
          <p className="font-semibold text-gray-600 mb-1">
            {activeTab === "class" ? "No class meetings yet" : "No staff meetings scheduled"}
          </p>
          {activeTab === "class" && (
            <p className="text-gray-400 text-sm mb-5">
              Create a meeting for one of your classes
            </p>
          )}
          {activeTab === "class" && classOptions.length > 0 && (
            <button
              onClick={() => setShowCreate(true)}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm shadow-md"
            >
              + Create Meeting
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">

          {live.length > 0 && (
            <Section title="🔴 Live Now" count={live.length}>
              {live.map(m => (
                <MeetingCard key={m.id} meeting={m}
                  currentUserId={user.id}
                  onStart={handleStart} onEnd={handleEnd}
                  onJoin={handleJoin} onEdit={setEditTarget}
                  onDelete={setDeleteTarget}
                />
              ))}
            </Section>
          )}

          {upcoming.length > 0 && (
            <Section title="⏰ Upcoming" count={upcoming.length}>
              {upcoming.map(m => (
                <MeetingCard key={m.id} meeting={m}
                  currentUserId={user.id}
                  onStart={handleStart} onEnd={handleEnd}
                  onJoin={handleJoin} onEdit={setEditTarget}
                  onDelete={setDeleteTarget}
                />
              ))}
            </Section>
          )}

          {past.length > 0 && (
            <PastSection meetings={past} currentUserId={user.id} />
          )}
        </div>
      )}

      {/* ── Modals ── */}
      {showCreate && (
        <MeetingFormModal
          mode="create"
          meetingType="class_meeting"
          classOptions={classOptions}
          onClose={() => setShowCreate(false)}
          onSaved={handleSaved}
        />
      )}

      {editTarget && (
        <MeetingFormModal
          mode="edit"
          meetingType="class_meeting"
          initialData={editTarget}
          classOptions={classOptions}
          onClose={() => setEditTarget(null)}
          onSaved={handleSaved}
        />
      )}

      {deleteTarget && (
        <ConfirmDeleteDialog
          meeting={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  )
}

function Section({ title, count, children }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <h2 className="font-semibold text-gray-700 text-sm">{title}</h2>
        <span className="bg-gray-100 text-gray-500 text-xs font-semibold px-2 py-0.5 rounded-full">
          {count}
        </span>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function PastSection({ meetings, currentUserId }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 mb-3 text-sm font-semibold text-gray-500 hover:text-gray-700 transition-colors"
      >
        <span className="text-gray-400">{open ? "▾" : "▸"}</span>
        Past Meetings
        <span className="bg-gray-100 text-gray-400 text-xs font-semibold px-2 py-0.5 rounded-full">
          {meetings.length}
        </span>
      </button>
      {open && (
        <div className="space-y-3 opacity-70">
          {meetings.map(m => (
            <MeetingCard key={m.id} meeting={m}
              currentUserId={currentUserId}
              onStart={() => {}} onEnd={() => {}}
              onJoin={() => {}} onEdit={() => {}}
              onDelete={() => {}}
            />
          ))}
        </div>
      )}
    </div>
  )
}