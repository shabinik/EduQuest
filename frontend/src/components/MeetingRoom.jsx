import React, { useEffect, useRef, useState } from "react"

const JITSI_DOMAIN = "meet.jit.si"

export default function MeetingRoom({ meeting, onLeave }) {
  const containerRef = useRef(null)
  const apiRef = useRef(null)
  const spinnerTimerRef = useRef(null)
  const [connecting, setConnecting] = useState(true)
  const [loadError, setLoadError] = useState(false)

  const user = JSON.parse(sessionStorage.getItem("user") || "{}")
  const displayName = user.full_name || user.name || user.email || "User"

  useEffect(() => {
    if (window.JitsiMeetExternalAPI) {
      initJitsi()
    } else {
      const script = document.createElement("script")
      script.src = "https://meet.jit.si/external_api.js"
      script.async = true
      script.onload = initJitsi
      script.onerror = () => setLoadError(true)
      document.body.appendChild(script)
    }

    return () => {
      if (spinnerTimerRef.current) clearTimeout(spinnerTimerRef.current)
      destroyJitsi()
    }
  }, [])

  function hideSpinner() {
    if (spinnerTimerRef.current) {
      clearTimeout(spinnerTimerRef.current)
      spinnerTimerRef.current = null
    }
    setConnecting(false)
  }

  function initJitsi() {
    if (!containerRef.current) return

    try {
      apiRef.current = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
        roomName: meeting.room_name,

        width: "100%",
        height: "100%",

        parentNode: containerRef.current,

        userInfo: {
          displayName: displayName,
          email: user.email || "",
        },

        configOverwrite: {
          startWithAudioMuted: true,
          startWithVideoMuted: false,
          prejoinPageEnabled: false,
          disableDeepLinking: true,
          // Disable the lobby/waiting room
          enableLobbyChat: false,
          hideLobbyButton: true,
        },

        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          TOOLBAR_BUTTONS: [
            "microphone", "camera", "desktop",
            "chat", "raisehand", "tileview",
            "fullscreen", "hangup",
          ],
        },
      })

      // ── Primary: hide spinner when the conference is joined ──
      apiRef.current.addEventListener("videoConferenceJoined", () => {
        hideSpinner()
      })

      // ── Backup signal: if another participant is seen, we're definitely in ──
      apiRef.current.addEventListener("participantJoined", () => {
        hideSpinner()
      })

      // ── Fallback: if neither event fires in 5s, just hide the spinner anyway ──
      // This handles the case where prejoin is skipped and events don't fire
      spinnerTimerRef.current = setTimeout(() => {
        hideSpinner()
      }, 5000)

      // ── When user clicks the red hangup/leave button inside Jitsi ──
      apiRef.current.addEventListener("readyToClose", () => {
        destroyJitsi()
        onLeave()
      })

    } catch (err) {
      console.error("Jitsi init error:", err)
      setLoadError(true)
      setConnecting(false)
    }
  }

  function destroyJitsi() {
    if (apiRef.current) {
      try {
        apiRef.current.dispose()
      } catch (_) {}
      apiRef.current = null
    }
  }

  if (loadError) {
    return (
      <div className="fixed inset-0 bg-gray-900 flex flex-col items-center justify-center z-50">
        <div className="text-5xl mb-4">📹</div>
        <p className="text-white text-xl font-bold mb-2">Could not load video call</p>
        <p className="text-gray-400 text-sm mb-6 text-center max-w-sm">
          Check your internet connection and try again.
        </p>
        <button
          onClick={onLeave}
          className="bg-violet-600 hover:bg-violet-700 text-white px-6 py-2.5 rounded-xl font-semibold"
        >
          ← Back to Meetings
        </button>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">

      {/* Top bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-5 py-3 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
            <span className="text-red-400 text-xs font-bold uppercase tracking-widest">Live</span>
          </span>
          <span className="text-gray-500">|</span>
          <span className="text-white font-semibold text-sm">{meeting.title}</span>
        </div>
        <button
          onClick={() => { destroyJitsi(); onLeave() }}
          className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          ← Leave
        </button>
      </div>

      <div className="relative flex-1" style={{ height: "calc(100vh - 57px)" }}>

        {/* Connecting overlay */}
        {connecting && (
          <div className="absolute inset-0 bg-gray-900 flex flex-col items-center justify-center z-10">
            <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-white font-semibold">Connecting to meeting room...</p>
            <p className="text-gray-500 text-xs mt-1">{meeting.room_name}</p>
            <p className="text-gray-600 text-xs mt-3">
              Allow camera & microphone access if prompted
            </p>
          </div>
        )}

        <div
          ref={containerRef}
          style={{ width: "100%", height: "100%" }}
        />
      </div>
    </div>
  )
}