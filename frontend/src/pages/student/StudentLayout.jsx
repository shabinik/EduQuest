import React, { useEffect, useState, useRef, useCallback } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import StudentSidebar from "../../components/StudentSidebar";
import { Bell, User, Lock, LogOut, ChevronDown, X } from "lucide-react";

// ─── Notification Hook ────────────────────────────────────────────────────────

function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount]     = useState(0);
  const wsRef        = useRef(null);
  const reconnectRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axiosInstance.get("notifications/");
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.is_read).length);
    } catch {}
  }, []);

  useEffect(() => {
    fetchNotifications();

    const connect = () => {
      // Don't reconnect if already open
      if (wsRef.current?.readyState === WebSocket.OPEN) return;

      const proto  = window.location.protocol === "https:" ? "wss" : "ws";
      const wsHost = import.meta.env.VITE_WS_HOST || "localhost:8000";
      const ws     = new WebSocket(`${proto}://${wsHost}/ws/notifications/`);
      wsRef.current = ws;

      ws.onopen = () => {
        // Re-fetch on connect to catch anything missed during reconnect
        fetchNotifications();
        // Clear any pending reconnect timer
        if (reconnectRef.current) {
          clearTimeout(reconnectRef.current);
          reconnectRef.current = null;
        }
      };

      ws.onmessage = (e) => {
        const notif = JSON.parse(e.data);
        setNotifications(prev => [notif, ...prev].slice(0, 30));
        setUnreadCount(prev => prev + 1);
      };

      ws.onclose = () => {
        // Auto-reconnect after 3 seconds
        reconnectRef.current = setTimeout(() => connect(), 3000);
      };

      ws.onerror = () => ws.close();
    };

    // Small delay to let StrictMode's first mount cleanup before connecting
    const timer = setTimeout(() => connect(), 100);

    return () => {
      clearTimeout(timer);
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
      // Properly close so onclose doesn't trigger reconnect on unmount
      if (wsRef.current) {
        wsRef.current.onclose = null; // remove handler before closing
        wsRef.current.close();
      }
    };
  }, [fetchNotifications]);

  const markAllRead = useCallback(async () => {
    try {
      await axiosInstance.post("notifications/mark-read/");
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch {}
  }, []);

  const markOneRead = useCallback(async (id) => {
    try {
      await axiosInstance.post(`notifications/${id}/read/`);
      setNotifications(prev =>
        prev.map(n => n.id === id ? { ...n, is_read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch {}
  }, []);

  return { notifications, unreadCount, markAllRead, markOneRead };
}
// ─── Helpers ──────────────────────────────────────────────────────────────────

const TYPE_META = {
  assignment:   { icon: "📝", color: "#6366f1", bg: "#eef2ff" },
  exam:         { icon: "📋", color: "#f59e0b", bg: "#fffbeb" },
  fee:          { icon: "💳", color: "#ef4444", bg: "#fef2f2" },
  announcement: { icon: "📢", color: "#3b82f6", bg: "#eff6ff" },
  meeting:      { icon: "🎥", color: "#22c55e", bg: "#f0fdf4" },
};

function timeAgo(dateStr) {
  const diff  = Date.now() - new Date(dateStr).getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days  = Math.floor(hours / 24);
  if (mins < 1)   return "just now";
  if (mins < 60)  return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// ─── Notification Bell ────────────────────────────────────────────────────────

function NotificationBell({ notifications, unreadCount, markAllRead, markOneRead }) {
  const [open, setOpen] = useState(false);
  const ref             = useRef(null);
  const navigate        = useNavigate();

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleClick = (notif) => {
    markOneRead(notif.id);
    if (notif.link) navigate(notif.link);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">

      {/* Bell button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`relative w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-150 cursor-pointer
          ${open
            ? "border-indigo-300 bg-indigo-50 text-indigo-600 shadow-[0_0_0_3px_#e0e7ff]"
            : "border-gray-200 bg-white text-gray-500 hover:border-indigo-300 hover:text-indigo-500"
          }`}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span
            className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-black rounded-full min-w-[18px] h-[18px] flex items-center justify-center border-2 border-white px-0.5"
            style={{ animation: "popIn 0.3s cubic-bezier(0.34,1.56,0.64,1)" }}
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-[370px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
          style={{ animation: "slideDown 0.2s cubic-bezier(0.16,1,0.3,1)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-2">
              <span className="text-[15px] font-extrabold text-gray-900 tracking-tight">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-500 text-[11px] font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-xs font-semibold text-indigo-500 hover:bg-indigo-50 px-2 py-1 rounded-lg transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-12 flex flex-col items-center gap-2">
                <span className="text-4xl">🔔</span>
                <p className="text-sm font-semibold text-gray-400">You're all caught up!</p>
                <p className="text-xs text-gray-300">New notifications will appear here</p>
              </div>
            ) : (
              notifications.map((n, i) => {
                const meta = TYPE_META[n.notif_type] || { icon: "🔔", color: "#6366f1", bg: "#eef2ff" };
                return (
                  <div
                    key={n.id}
                    onClick={() => handleClick(n)}
                    className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors duration-100
                      ${n.is_read ? "bg-white hover:bg-gray-50" : "bg-indigo-50/40 hover:bg-indigo-50/70"}
                      ${i < notifications.length - 1 ? "border-b border-gray-50" : ""}
                    `}
                    style={{ borderLeft: `3px solid ${n.is_read ? "transparent" : meta.color}` }}
                  >
                    {/* Icon */}
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                      style={{ background: meta.bg }}
                    >
                      {meta.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <span className={`text-[13px] leading-snug text-gray-900 ${n.is_read ? "font-medium" : "font-bold"}`}>
                          {n.title}
                        </span>
                        {!n.is_read && (
                          <span
                            className="w-2 h-2 rounded-full shrink-0 mt-1"
                            style={{ background: meta.color }}
                          />
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 truncate leading-relaxed">
                        {n.message}
                      </p>
                      <span className="text-[11px] text-gray-400 font-medium mt-1 flex items-center gap-1">
                        <span
                          className="w-1.5 h-1.5 rounded-full inline-block opacity-50"
                          style={{ background: meta.color }}
                        />
                        {timeAgo(n.created_at)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-50 bg-gray-50/50 text-center">
              <span className="text-[11px] text-gray-400">
                Showing last {notifications.length} notifications
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Profile Dropdown ─────────────────────────────────────────────────────────

function ProfileDropdown({ user }) {
  const [open, setOpen]         = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const ref                     = useRef(null);
  const navigate                = useNavigate();

  const name     = user?.full_name || user?.email || "Student";
  const initials = name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();

  useEffect(() => {
    const h = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const logout = async () => {
    setLoggingOut(true);
    try {
      await axiosInstance.post("accounts/logout/");
      sessionStorage.clear();
      navigate("/student/login");
    } catch {
      navigate("/student/login");
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div ref={ref} className="relative">

      {/* Avatar button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-xl border transition-all duration-150 cursor-pointer
          ${open
            ? "border-indigo-300 bg-indigo-50 shadow-[0_0_0_3px_#e0e7ff]"
            : "border-gray-200 bg-white hover:border-indigo-300"
          }`}
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-xs font-black shrink-0">
          {initials}
        </div>
        <span className="text-[13px] font-semibold text-gray-800 max-w-[100px] truncate">
          {name.split(" ")[0]}
        </span>
        <ChevronDown
          size={13}
          className="text-gray-400 transition-transform duration-200"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden"
          style={{ animation: "slideDown 0.2s cubic-bezier(0.16,1,0.3,1)" }}
        >
          {/* User info */}
          <div className="px-4 py-3 border-b border-gray-50 bg-gradient-to-r from-slate-50 to-white">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white text-sm font-black shrink-0">
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-gray-900 truncate">{name}</p>
                <p className="text-[11px] text-gray-400 truncate">{user?.email || ""}</p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="p-1.5">
            {[
              { icon: User, label: "My Profile",      to: "/student/profile"         },
              { icon: Lock, label: "Change Password", to: "/student/change-password" },
            ].map(item => (
              <button
                key={item.to}
                onClick={() => { navigate(item.to); setOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors text-left"
              >
                <item.icon size={15} className="text-gray-400" />
                {item.label}
              </button>
            ))}
          </div>

          {/* Logout */}
          <div className="p-1.5 border-t border-gray-50">
            <button
              onClick={logout}
              disabled={loggingOut}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-left"
            >
              <LogOut size={15} />
              {loggingOut ? "Logging out..." : "Logout"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

function Topbar({ notifProps, user }) {
  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 shadow-sm sticky top-0 z-40">
      {/* Left accent */}
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-7 rounded-full bg-gradient-to-b from-indigo-500 to-indigo-700" />
        <span className="text-[15px] font-bold text-gray-800 tracking-tight">
          Student Portal
        </span>
      </div>

      {/* Right — bell + avatar */}
      <div className="flex items-center gap-3">
        <NotificationBell {...notifProps} />
        <ProfileDropdown user={user} />
      </div>
    </header>
  );
}

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function StudentLayout() {
  const navigate   = useNavigate();
  const [user, setUser] = useState(null);
  const notifProps = useNotifications();

  // ── your existing auth check — unchanged, just stores user too ──
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await axiosInstance.get("accounts/profile/");
        if (res.data.role !== "student") {
          navigate("/student/login");
        } else {
          setUser(res.data);
        }
      } catch {
        navigate("/student/login");
      }
    };
    checkAuth();
  }, [navigate]);

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes popIn {
          from { transform: scale(0.4); opacity: 0; }
          to   { transform: scale(1);   opacity: 1; }
        }
      `}</style>

      {/* your existing outer wrapper — unchanged */}
      <div className="flex h-screen bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden">

        {/* your existing sidebar — completely unchanged */}
        <StudentSidebar />

        {/* new: wrap main in a column so topbar sits above content */}
        <div className="flex-1 flex flex-col overflow-hidden">

          {/* new topbar */}
          <Topbar notifProps={notifProps} user={user} />

          {/* your existing main — unchanged */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-8">
              <div className="max-w-7xl mx-auto">
                <Outlet />
              </div>
            </div>
          </main>

        </div>
      </div>
    </>
  );
}