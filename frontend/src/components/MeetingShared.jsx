import React, { useState } from "react"
import axiosInstance from "../api/axiosInstance"

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function formatDateTime(dateStr) {
  return new Date(dateStr).toLocaleString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  scheduled: { label: "⏰ Scheduled", cls: "bg-blue-100 text-blue-700" },
  live:      { label: "🔴 Live",      cls: "bg-green-100 text-green-700" },
  ended:     { label: "✅ Ended",     cls: "bg-gray-100 text-gray-500" },
  cancelled: { label: "❌ Cancelled", cls: "bg-red-100 text-red-500" },
}

export function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.scheduled
  return (
    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

// ─── Meeting Card ─────────────────────────────────────────────────────────────

export function MeetingCard({
  meeting,
  currentUserId,
  onStart,
  onEnd,
  onJoin,
  onEdit,
  onDelete,
}) {
  const isCreator = meeting.created_by === currentUserId
  const isLive = meeting.status === "live"
  const isScheduled = meeting.status === "scheduled"
  const isOver = meeting.status === "ended" || meeting.status === "cancelled"

  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 transition-all hover:shadow-md
      ${isLive ? "border-green-300 ring-2 ring-green-100" : "border-gray-100"}`}
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap mb-1">
            <h3 className="font-bold text-gray-800 text-base truncate">{meeting.title}</h3>
            <StatusBadge status={meeting.status} />
          </div>
          {meeting.description && (
            <p className="text-gray-500 text-sm mb-2 line-clamp-1">{meeting.description}</p>
          )}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400">
            <span>📅 {formatDateTime(meeting.scheduled_at)}</span>
            <span>⏱ {meeting.duration_minutes} min</span>
            {meeting.school_class_name && <span>🏫 {meeting.school_class_name}</span>}
            <span>👤 {meeting.created_by_name}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap flex-shrink-0">

          {isCreator && isScheduled && (
            <button onClick={() => onStart(meeting)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors">
              ▶ Start
            </button>
          )}

          {isLive && (
            <button onClick={() => onJoin(meeting)}
              className="bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-sm transition-all">
              📹 Join Now
            </button>
          )}

          {isCreator && isLive && (
            <button onClick={() => onEnd(meeting)}
              className="bg-red-500 hover:bg-red-600 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors">
              ■ End
            </button>
          )}

          {isCreator && isScheduled && (
            <button onClick={() => onEdit(meeting)}
              className="border border-gray-200 hover:border-violet-400 hover:text-violet-600 text-gray-500 text-xs font-semibold px-3 py-2 rounded-xl transition-colors">
              ✏️ Edit
            </button>
          )}

          {isCreator && !isOver && (
            <button onClick={() => onDelete(meeting)}
              className="border border-gray-200 hover:border-red-400 hover:text-red-500 text-gray-400 text-xs font-semibold px-3 py-2 rounded-xl transition-colors">
              🗑 Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function MeetingFormModal({
  mode = "create",
  meetingType,
  initialData = null,
  onClose,
  onSaved,
  classOptions = [],
}) {
  const isEdit = mode === "edit"
  const isClassMeeting = meetingType === "class_meeting"

  const minDT = new Date(Date.now() + 5 * 60 * 1000).toISOString().slice(0, 16)

  function toLocalDT(isoStr) {
    if (!isoStr) return ""
    const d = new Date(isoStr)
    const offset = d.getTimezoneOffset() * 60000
    return new Date(d - offset).toISOString().slice(0, 16)
  }

  const [form, setForm] = useState({
    title:            initialData?.title || "",
    description:      initialData?.description || "",
    scheduled_at:     toLocalDT(initialData?.scheduled_at) || "",
    duration_minutes: initialData?.duration_minutes || 60,
    school_class:     initialData?.school_class || "",
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }))
  }

  async function handleSubmit(e) {
    e.preventDefault()

    const errs = {}
    if (!form.title.trim()) errs.title = "Title is required."
    if (!form.scheduled_at) errs.scheduled_at = "Please pick a date and time."
    if (isClassMeeting && !form.school_class) errs.school_class = "Please select a class."
    if (Object.keys(errs).length) { setErrors(errs); return }

    setLoading(true)
    try {
      const payload = {
        title: form.title,
        description: form.description,
        scheduled_at: new Date(form.scheduled_at).toISOString(),
        duration_minutes: parseInt(form.duration_minutes),
        ...(isClassMeeting && { school_class: form.school_class }),
      }

      const res = isEdit
        ? await axiosInstance.patch(`chatvideo/meet/detail/${initialData.id}/`, payload)
        : await axiosInstance.post("chatvideo/meet/", payload)

      onSaved(res.data)
    } catch (err) {
      if (err.response?.data) {
        const apiErrors = {}
        for (const [key, val] of Object.entries(err.response.data)) {
          apiErrors[key] = Array.isArray(val) ? val[0] : val
        }
        setErrors(apiErrors)
      } else {
        setErrors({ non_field: "Something went wrong. Please try again." })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              {isEdit ? "✏️ Edit Meeting" : "📅 New Meeting"}
            </h2>
            <p className="text-gray-400 text-xs mt-0.5">
              {isClassMeeting ? "Class Meeting" : "Staff Meeting"}
            </p>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 text-gray-400">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {errors.non_field && (
            <p className="text-red-500 text-sm bg-red-50 rounded-xl px-4 py-2">
              {errors.non_field}
            </p>
          )}

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Title <span className="text-red-400">*</span>
            </label>
            <input type="text" name="title" value={form.title} onChange={handleChange}
              placeholder={isClassMeeting ? "e.g. Math - Chapter 5 Revision" : "e.g. Monthly Staff Review"}
              className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors
                focus:border-violet-400 focus:ring-2 focus:ring-violet-100
                ${errors.title ? "border-red-400 bg-red-50" : "border-gray-200"}`} />
            {errors.title && <p className="text-red-400 text-xs mt-1">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
              Description <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea name="description" value={form.description} onChange={handleChange}
              rows={2} placeholder="Agenda or notes for this meeting..."
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none resize-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-colors" />
          </div>

          {isClassMeeting && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Class <span className="text-red-400">*</span>
              </label>
              <select name="school_class" value={form.school_class} onChange={handleChange}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors
                  focus:border-violet-400 focus:ring-2 focus:ring-violet-100
                  ${errors.school_class ? "border-red-400 bg-red-50" : "border-gray-200"}`}>
                <option value="">— Select a class —</option>
                {classOptions.map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
              {errors.school_class && (
                <p className="text-red-400 text-xs mt-1">{errors.school_class}</p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Date & Time <span className="text-red-400">*</span>
              </label>
              <input type="datetime-local" name="scheduled_at"
                value={form.scheduled_at} onChange={handleChange} min={minDT}
                className={`w-full border rounded-xl px-4 py-2.5 text-sm outline-none transition-colors
                  focus:border-violet-400 focus:ring-2 focus:ring-violet-100
                  ${errors.scheduled_at ? "border-red-400 bg-red-50" : "border-gray-200"}`} />
              {errors.scheduled_at && (
                <p className="text-red-400 text-xs mt-1">{errors.scheduled_at}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Duration</label>
              <select name="duration_minutes" value={form.duration_minutes} onChange={handleChange}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100 transition-colors">
                {[15, 30, 45, 60, 90, 120].map(d => (
                  <option key={d} value={d}>{d} min</option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-semibold py-2.5 rounded-xl shadow-sm text-sm disabled:opacity-60">
              {loading
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Saving...
                  </span>
                : isEdit ? "Save Changes" : "Create Meeting"
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Confirm Delete Dialog ────────────────────────────────────────────────────

export function ConfirmDeleteDialog({ meeting, onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6"
        onClick={e => e.stopPropagation()}>
        <div className="text-center mb-5">
          <div className="text-4xl mb-3">🗑️</div>
          <h3 className="font-bold text-gray-800 text-lg">Cancel Meeting?</h3>
          <p className="text-gray-500 text-sm mt-2">
            "<span className="font-medium">{meeting.title}</span>" will be marked as cancelled.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onCancel}
            className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 text-sm">
            Keep It
          </button>
          <button onClick={onConfirm}
            className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors">
            Yes, Cancel
          </button>
        </div>
      </div>
    </div>
  )
}