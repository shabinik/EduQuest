import React, { useEffect, useState } from "react"
import axiosInstance from "../../api/axiosInstance"
import toast from "react-hot-toast"
import MeetingRoom from "../../components/MeetingRoom"
import {
  MeetingCard,
  MeetingFormModal,
  ConfirmDeleteDialog,
  formatDateTime,
} from "../../components/MeetingShared"

export default function AdminMeetings() {
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)

  const [showCreate, setShowCreate] = useState(false)
  const [editTarget, setEditTarget] = useState(null)  
  const [deleteTarget, setDeleteTarget] = useState(null) 

  const [activeMeeting, setActiveMeeting] = useState(null)

  const user = JSON.parse(sessionStorage.getItem("user") || "{}")

  useEffect(() => {
    fetchMeetings()
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

  function handleSaved(savedMeeting) {
    setMeetings(prev => {
      const exists = prev.find(m => m.id === savedMeeting.id)
      if (exists) {
    
        return prev.map(m => m.id === savedMeeting.id ? savedMeeting : m)
      }
      return [savedMeeting, ...prev]
    })
    setShowCreate(false)
    setEditTarget(null)
    toast.success(savedMeeting.id ? "Meeting updated!" : "Meeting created!")
  }

  // ── Start meeting
  async function handleStart(meeting) {
    try {
      const res = await axiosInstance.post(`chatvideo/meet/start/${meeting.id}/`)
      // Update status in local state
      setMeetings(prev => 
        prev.map(m => m.id === meeting.id ? { ...m, status: "live" } : m)
      )
      toast.success("Meeting is now live!")
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to start meeting.")
    }
  }

  // ── End meeting
  async function handleEnd(meeting) {
    try {
      await axiosInstance.post(`chatvideo/meet/end/${meeting.id}/`)
      setMeetings(prev =>
        prev.map(m => m.id === meeting.id ? { ...m, status: "ended" } : m)
      )
      // Close the video room if admin ended it from inside
      if (activeMeeting?.id === meeting.id) setActiveMeeting(null)
      toast.success("Meeting ended.")
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to end meeting.")
    }
  }

  // ── Join meeting
  async function handleJoin(meeting) {
    try {
      const res = await axiosInstance.post(`chatvideo/meet/join/${meeting.id}/`)
      // MeetingRoom takes meeting object — attach the returned jitsi_url
      setActiveMeeting({ ...meeting, jitsi_url: res.data.jitsi_url })
    } catch (err) {
      toast.error(err.response?.data?.error || "Cannot join this meeting.")
    }
  }

  // ── Cancel meeting
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

  // ── If a meeting room is open, show it full screen ──
  if (activeMeeting) {
    return (
      <MeetingRoom
        meeting={activeMeeting}
        onLeave={() => setActiveMeeting(null)}
      />
    )
  }

  // ── Separate meetings by status for better readability ──
  const liveMeetings = meetings.filter(m => m.status === "live")
  const upcomingMeetings = meetings.filter(m => m.status === "scheduled")
  const pastMeetings = meetings.filter(
    m => m.status === "ended" || m.status === "cancelled"
  )

  return (
    <div className="p-6 max-w-5xl mx-auto">

      {/* ── Page Header ── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Staff Meetings</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            Schedule and manage meetings for your staff
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5 text-sm"
        >
          + New Meeting
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 mt-3 text-sm">Loading meetings...</p>
        </div>
      ) : meetings.length === 0 ? (
        <EmptyState onCreate={() => setShowCreate(true)} />
      ) : (
        <div className="space-y-8">

          {liveMeetings.length > 0 && (
            <Section title="🔴 Live Now" count={liveMeetings.length}>
              {liveMeetings.map(m => (
                <MeetingCard
                  key={m.id} meeting={m}
                  currentUserId={user.id}
                  onStart={handleStart} onEnd={handleEnd}
                  onJoin={handleJoin} onEdit={setEditTarget}
                  onDelete={setDeleteTarget}
                />
              ))}
            </Section>
          )}

          {/* Upcoming / scheduled */}
          {upcomingMeetings.length > 0 && (
            <Section title="⏰ Upcoming" count={upcomingMeetings.length}>
              {upcomingMeetings.map(m => (
                <MeetingCard
                  key={m.id} meeting={m}
                  currentUserId={user.id}
                  onStart={handleStart} onEnd={handleEnd}
                  onJoin={handleJoin} onEdit={setEditTarget}
                  onDelete={setDeleteTarget}
                />
              ))}
            </Section>
          )}

          {/* Past meetings — collapsed by default */}
          {pastMeetings.length > 0 && (
            <PastSection meetings={pastMeetings} currentUserId={user.id} />
          )}
        </div>
      )}

      {/* ── Create Modal ── */}
      {showCreate && (
        <MeetingFormModal
          mode="create"
          meetingType="staff_meeting"
          onClose={() => setShowCreate(false)}
          onSaved={handleSaved}
        />
      )}

      {/* ── Edit Modal ── */}
      {editTarget && (
        <MeetingFormModal
          mode="edit"
          meetingType="staff_meeting"
          initialData={editTarget}
          onClose={() => setEditTarget(null)}
          onSaved={handleSaved}
        />
      )}

      {/* ── Confirm Cancel Dialog ── */}
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

// ─── Section wrapper ──────────────────────────────────────────────────────────
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

// ─── Past meetings collapsible section ───────────────────────────────────────
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
            <MeetingCard
              key={m.id} meeting={m}
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

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ onCreate }) {
  return (
    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="text-5xl mb-4">📅</div>
      <p className="font-semibold text-gray-600 mb-1">No meetings yet</p>
      <p className="text-gray-400 text-sm mb-6">
        Schedule your first staff meeting to get started
      </p>
      <button
        onClick={onCreate}
        className="bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-semibold px-6 py-2.5 rounded-xl text-sm shadow-md hover:shadow-lg transition-all"
      >
        + Create Meeting
      </button>
    </div>
  )
}