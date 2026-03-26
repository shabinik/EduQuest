import React, { useEffect, useState } from "react"
import axiosInstance from "../../api/axiosInstance"
import toast from "react-hot-toast"
import MeetingRoom from "../../components/MeetingRoom"
import { StatusBadge, formatDateTime } from "../../components/MeetingShared"

export default function StudentMeetings() {
  const [meetings, setMeetings] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeMeeting, setActiveMeeting] = useState(null)

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

  // Join: call /join/ API to record attendance, then open video room
  async function handleJoin(meeting) {
    try {
      const res = await axiosInstance.post(`chatvideo/meet/join/${meeting.id}/`)
      setActiveMeeting({ ...meeting, jitsi_url: res.data.jitsi_url })
    } catch (err) {
      toast.error(err.response?.data?.error || "Cannot join this meeting right now.")
    }
  }

  if (activeMeeting) {
    return (
      <MeetingRoom
        meeting={activeMeeting}
        onLeave={() => setActiveMeeting(null)}
      />
    )
  }

  const liveMeetings = meetings.filter(m => m.status === "live")
  const upcomingMeetings = meetings.filter(m => m.status === "scheduled")
  const pastMeetings = meetings.filter(
    m => m.status === "ended" || m.status === "cancelled"
  )

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">My Meetings</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Video meetings scheduled for your class
        </p>
      </div>

      {loading ? (
        <div className="text-center py-20">
          <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-gray-400 mt-3 text-sm">Loading meetings...</p>
        </div>
      ) : meetings.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-5xl mb-4">📅</div>
          <p className="font-semibold text-gray-600">No meetings scheduled</p>
          <p className="text-gray-400 text-sm mt-1">
            Your teacher will schedule meetings here
          </p>
        </div>
      ) : (
        <div className="space-y-8">

          {/* Live meetings — most prominent */}
          {liveMeetings.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                🔴 Live Now
                <span className="bg-green-100 text-green-600 text-xs font-bold px-2 py-0.5 rounded-full">
                  {liveMeetings.length}
                </span>
              </h2>
              <div className="space-y-3">
                {liveMeetings.map(m => (
                  <StudentMeetingCard
                    key={m.id}
                    meeting={m}
                    onJoin={() => handleJoin(m)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Upcoming */}
          {upcomingMeetings.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                ⏰ Upcoming
                <span className="bg-gray-100 text-gray-500 text-xs font-bold px-2 py-0.5 rounded-full">
                  {upcomingMeetings.length}
                </span>
              </h2>
              <div className="space-y-3">
                {upcomingMeetings.map(m => (
                  <StudentMeetingCard key={m.id} meeting={m} />
                ))}
              </div>
            </div>
          )}

          {/* Past — collapsible */}
          {pastMeetings.length > 0 && (
            <CollapsiblePast meetings={pastMeetings} />
          )}
        </div>
      )}
    </div>
  )
}

// ─── Student Meeting Card ─────────────────────────────────────────────────────
function StudentMeetingCard({ meeting, onJoin }) {
  const isLive = meeting.status === "live"

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 transition-all
      ${isLive ? "border-green-300 ring-2 ring-green-100 hover:shadow-md" : "border-gray-100"}`}
    >
      <div className="flex items-start justify-between gap-4">

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap mb-1">
            <h3 className="font-bold text-gray-800 text-base">{meeting.title}</h3>
            <StatusBadge status={meeting.status} />
          </div>

          {meeting.description && (
            <p className="text-gray-500 text-sm mb-2 line-clamp-2">
              {meeting.description}
            </p>
          )}

          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
            <span>📅 {formatDateTime(meeting.scheduled_at)}</span>
            <span>⏱ {meeting.duration_minutes} min</span>
            <span>👤 {meeting.created_by_name}</span>
          </div>
        </div>

        {/* Action: only Join when live */}
        <div className="flex-shrink-0">
          {isLive ? (
            <button
              onClick={onJoin}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md text-sm transition-all hover:shadow-lg"
            >
              📹 Join Now
            </button>
          ) : meeting.status === "scheduled" ? (
            <span className="text-xs text-gray-400 bg-gray-50 border border-gray-200 px-3 py-2 rounded-xl">
              Not started yet
            </span>
          ) : null}
        </div>
      </div>
    </div>
  )
}

// ─── Collapsible past meetings ────────────────────────────────────────────────
function CollapsiblePast({ meetings }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-gray-700 mb-3 transition-colors"
      >
        <span>{open ? "▾" : "▸"}</span>
        Past Meetings
        <span className="bg-gray-100 text-gray-400 text-xs px-2 py-0.5 rounded-full">
          {meetings.length}
        </span>
      </button>
      {open && (
        <div className="space-y-3 opacity-60">
          {meetings.map(m => (
            <StudentMeetingCard key={m.id} meeting={m} />
          ))}
        </div>
      )}
    </div>
  )
}