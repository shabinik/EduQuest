// src/pages/student/StudentDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import {
  RadialBarChart, RadialBar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";

/* ─── Design tokens — warm rose/amber, youthful but professional ─────────── */
const T = {
  primary:     "#E11D48",   // rose-600  — bold, energetic
  primaryMid:  "#FB7185",   // rose-400
  primarySoft: "#FFE4E6",   // rose-100
  primaryPale: "#FFF1F2",   // rose-50

  accent:      "#F59E0B",   // amber-500 — warm pop
  accentBg:    "#FEF3C7",

  bg:          "#FAFAFA",
  white:       "#FFFFFF",
  border:      "#F1F5F9",
  borderMid:   "#E2E8F0",

  ink:         "#0F172A",
  sub:         "#475569",
  muted:       "#94A3B8",

  green:       "#059669",
  greenBg:     "#D1FAE5",
  red:         "#DC2626",
  redBg:       "#FEE2E2",
  blue:        "#2563EB",
  blueBg:      "#DBEAFE",
  purple:      "#7C3AED",
  purpleBg:    "#EDE9FE",
  teal:        "#0D9488",
  tealBg:      "#CCFBF1",
};

/* ─── Grade colours ──────────────────────────────────────────────────────── */
const gradeStyle = (g) => ({
  "A+": { color: T.green,  bg: T.greenBg  },
  "A":  { color: T.teal,   bg: T.tealBg   },
  "B":  { color: T.blue,   bg: T.blueBg   },
  "C":  { color: T.accent, bg: T.accentBg },
  "D":  { color: "#EA580C", bg: "#FFEDD5" },
  "F":  { color: T.red,    bg: T.redBg    },
}[g] || { color: T.muted, bg: T.border });

/* ─── Reusable bits ──────────────────────────────────────────────────────── */
const Chip = ({ color, bg, children, size = "xs" }) => (
  <span
    className={`inline-flex items-center font-semibold px-2 py-0.5 rounded-full text-${size}`}
    style={{ color, background: bg }}
  >
    {children}
  </span>
);

const Divider = ({ label }) => (
  <div className="flex items-center gap-3 mb-4">
    <span className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: T.muted }}>
      {label}
    </span>
    <div className="flex-1 h-px" style={{ background: T.borderMid }} />
  </div>
);

const Card = ({ children, className = "", style = {} }) => (
  <div
    className={`rounded-2xl bg-white border ${className}`}
    style={{ borderColor: T.border, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", ...style }}
  >
    {children}
  </div>
);

/* Attendance ring using a simple SVG circle */
const AttRing = ({ pct }) => {
  const r = 44, circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const color = pct >= 75 ? T.green : pct >= 50 ? T.accent : T.red;
  return (
    <div className="relative inline-flex items-center justify-center w-28 h-28">
      <svg width="112" height="112" viewBox="0 0 112 112" className="-rotate-90">
        <circle cx="56" cy="56" r={r} fill="none" stroke={T.border} strokeWidth="10" />
        <circle
          cx="56" cy="56" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="text-xl font-bold leading-none" style={{ color }}>{pct}%</p>
        <p className="text-xs mt-0.5" style={{ color: T.muted }}>present</p>
      </div>
    </div>
  );
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl shadow-lg px-3 py-2.5 text-xs bg-white"
      style={{ border: `1px solid ${T.border}` }}>
      <p className="font-bold mb-1" style={{ color: T.primary }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span style={{ color: T.sub }}>{p.name}:</span>
          <span className="font-semibold">{p.value}{p.name === "Attendance" ? "%" : ""}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── Main ───────────────────────────────────────────────────────────────── */
export default function StudentDashboard() {
  const [user, setUser]   = useState(null);
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
      axiosInstance.get("accounts/profile/"),
      axiosInstance.get("users/student/dashboard/"),
    ])
      .then(([p, d]) => { setUser(p.data); setData(d.data); })
      .catch(() => navigate("/student/login"))
      .finally(() => setLoading(false));
  }, [navigate]);

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: T.bg }}>
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mx-auto"
            style={{ borderColor: T.primary, borderTopColor: "transparent" }} />
          <p className="text-sm" style={{ color: T.muted }}>Loading your dashboard…</p>
        </div>
      </div>
    );
  }

  const {
    student, attendance, today_status, att_trend,
    upcoming_exams, recent_results, avg_percentage, total_results,
    pending_assignments, graded_submissions, pending_submit_count,
    fee_dues, pending_fee_amount, overdue_fee_amount,
    today_schedule, announcements,
  } = data;

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const todayStatusMeta = {
    present: { label: "Present Today ✓", color: T.green,  bg: T.greenBg },
    absent:  { label: "Absent Today",     color: T.red,   bg: T.redBg   },
    leave:   { label: "On Leave Today",   color: T.accent,bg: T.accentBg},
    null:    { label: "Not Marked Yet",   color: T.muted, bg: T.border  },
  }[today_status] || { label: "Not Marked Yet", color: T.muted, bg: T.border };

  const hasFeeAlert = overdue_fee_amount > 0 || pending_fee_amount > 0;

  return (
    <div className="min-h-screen" style={{ background: T.bg, fontFamily: "'Nunito', 'Segoe UI', sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700;800;900&display=swap');`}</style>

      <div className="max-w-[1380px] mx-auto px-5 py-7 space-y-6">

        {/* ── Hero Header ──────────────────────────────────────────────── */}
        <div
          className="rounded-3xl overflow-hidden relative"
          style={{ background: "linear-gradient(135deg, #E11D48 0%, #F43F5E 45%, #FB923C 100%)" }}
        >
          {/* decorative blobs */}
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full opacity-10 bg-white -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-1/3 w-40 h-40 rounded-full opacity-10 bg-white -mb-14" />
          <div className="absolute top-8 right-64 w-16 h-16 rounded-full opacity-10 bg-white" />

          <div className="relative z-10 p-6 flex flex-col md:flex-row md:items-center justify-between gap-5">
            <div>
              <p className="text-rose-200 text-xs font-bold uppercase tracking-widest mb-1">
                EduQuest · Student Portal
              </p>
              <h1 className="text-2xl md:text-3xl font-black text-white leading-tight">
                {greeting}, {user?.full_name?.split(" ")[0] || "Student"} 👋
              </h1>
              <p className="text-rose-100 text-sm mt-1">
                {student.class_name} &nbsp;·&nbsp; Roll #{student.roll_number} &nbsp;·&nbsp;{" "}
                {now.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
              </p>
              {/* today status */}
              <span
                className="inline-block mt-3 text-xs font-bold px-3 py-1 rounded-full"
                style={{ background: todayStatusMeta.bg, color: todayStatusMeta.color }}
              >
                {todayStatusMeta.label}
              </span>
            </div>

            {/* Quick stats bubbles */}
            <div className="flex gap-3 flex-wrap">
              {[
                { label: "Attendance", value: `${attendance.percentage}%`, icon: "📅",
                  color: attendance.percentage >= 75 ? T.greenBg : T.redBg,
                  textColor: attendance.percentage >= 75 ? T.green : T.red },
                { label: "Avg Score",  value: `${avg_percentage}%`, icon: "📊",
                  color: "rgba(255,255,255,0.2)", textColor: "#fff" },
                { label: "Pending Fees", value: pending_fee_amount > 0 ? `₹${(pending_fee_amount/1000).toFixed(1)}K` : "Clear",
                  icon: "💳",
                  color: pending_fee_amount > 0 ? T.redBg : T.greenBg,
                  textColor: pending_fee_amount > 0 ? T.red : T.green },
              ].map((s, i) => (
                <div
                  key={i}
                  className="rounded-2xl px-4 py-3 text-center min-w-[90px]"
                  style={{ background: s.color, backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.3)" }}
                >
                  <p className="text-xl mb-0.5">{s.icon}</p>
                  <p className="text-sm font-black leading-tight" style={{ color: s.textColor }}>{s.value}</p>
                  <p className="text-xs mt-0.5 font-semibold" style={{ color: s.textColor, opacity: 0.8 }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Fee Alert Banner ─────────────────────────────────────────── */}
        {hasFeeAlert && (
          <div
            className="rounded-2xl px-5 py-3.5 flex items-center gap-3"
            style={{
              background: overdue_fee_amount > 0 ? T.redBg : T.accentBg,
              border: `1px solid ${overdue_fee_amount > 0 ? "#FCA5A5" : "#FCD34D"}`,
            }}
          >
            <span className="text-xl">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-bold" style={{ color: overdue_fee_amount > 0 ? T.red : T.accent }}>
                {overdue_fee_amount > 0
                  ? `₹${overdue_fee_amount.toLocaleString("en-IN")} overdue — please pay immediately`
                  : `₹${pending_fee_amount.toLocaleString("en-IN")} pending fee due soon`}
              </p>
            </div>
            <button
              onClick={() => navigate("/student/fees")}
              className="text-xs font-bold px-3 py-1.5 rounded-lg"
              style={{
                background: overdue_fee_amount > 0 ? T.red : T.accent,
                color: "#fff",
              }}
            >
              Pay Now →
            </button>
          </div>
        )}

        {/* ── Attendance + Today's Schedule ────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* Attendance card */}
          <Card className="p-5">
            <Divider label="This Month's Attendance" />
            <div className="flex items-center gap-5">
              <AttRing pct={Math.round(attendance.percentage)} />
              <div className="space-y-2 flex-1">
                {[
                  { label: "Present", value: attendance.present_days, color: T.green, bg: T.greenBg },
                  { label: "Absent",  value: attendance.absent_days,  color: T.red,   bg: T.redBg  },
                  { label: "Total",   value: attendance.total_days,   color: T.blue,  bg: T.blueBg },
                ].map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
                      <span className="text-xs" style={{ color: T.sub }}>{s.label}</span>
                    </div>
                    <Chip color={s.color} bg={s.bg}>{s.value} days</Chip>
                  </div>
                ))}
              </div>
            </div>

            {/* trend sparkline */}
            {att_trend.length > 1 && (
              <div className="mt-4">
                <p className="text-xs mb-2" style={{ color: T.muted }}>6-month trend</p>
                <ResponsiveContainer width="100%" height={60}>
                  <AreaChart data={att_trend} margin={{ top: 2, right: 2, bottom: 0, left: -30 }}>
                    <defs>
                      <linearGradient id="attGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={T.primary} stopOpacity={0.2} />
                        <stop offset="95%" stopColor={T.primary} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="label" tick={{ fill: T.muted, fontSize: 9 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="percentage" name="Attendance"
                      stroke={T.primary} strokeWidth={2} fill="url(#attGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {/* Today's timetable */}
          <Card className="p-5 lg:col-span-2">
            <Divider label={`Today's Schedule — ${now.toLocaleDateString("en-IN", { weekday: "long" })}`} />
            {today_schedule.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <span className="text-4xl">🎉</span>
                <p className="font-semibold text-sm" style={{ color: T.muted }}>No classes today</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {today_schedule.map((s, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{
                      background: s.is_break ? "#F8FAFC" : T.primaryPale,
                      border: `1px solid ${s.is_break ? T.borderMid : T.primarySoft}`,
                      opacity: s.is_break ? 0.7 : 1,
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: s.is_break ? T.border : T.primarySoft }}
                    >
                      {s.is_break ? "☕" : "📖"}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold truncate" style={{ color: s.is_break ? T.muted : T.ink }}>
                        {s.subject}
                      </p>
                      <p className="text-xs" style={{ color: T.muted }}>{s.time}</p>
                      {!s.is_break && (
                        <p className="text-xs font-medium" style={{ color: T.sub }}>{s.teacher}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* ── Exams + Results ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Upcoming exams */}
          <Card className="p-5">
            <Divider label="Upcoming Exams" />
            {upcoming_exams.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <span className="text-3xl">😌</span>
                <p className="text-sm font-semibold" style={{ color: T.green }}>No upcoming exams</p>
                <p className="text-xs" style={{ color: T.muted }}>Enjoy your break!</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {upcoming_exams.map((e) => {
                  const daysLeft = Math.ceil(
                    (new Date(e.exam_date) - new Date()) / (1000 * 60 * 60 * 24)
                  );
                  const urgency = daysLeft <= 2 ? { color: T.red, bg: T.redBg }
                    : daysLeft <= 7 ? { color: T.accent, bg: T.accentBg }
                    : { color: T.green, bg: T.greenBg };
                  return (
                    <div
                      key={e.id}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{ background: T.bg, border: `1px solid ${T.borderMid}` }}
                    >
                      <div
                        className="w-12 h-12 rounded-xl flex flex-col items-center justify-center flex-shrink-0"
                        style={{ background: urgency.bg }}
                      >
                        <p className="text-base font-black leading-none" style={{ color: urgency.color }}>
                          {daysLeft}
                        </p>
                        <p className="text-xs font-semibold" style={{ color: urgency.color }}>days</p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold truncate" style={{ color: T.ink }}>{e.title}</p>
                        <p className="text-xs" style={{ color: T.muted }}>
                          {e.subject} · {e.exam_date}
                        </p>
                        <p className="text-xs font-medium" style={{ color: T.sub }}>
                          {e.start_time}–{e.end_time} · Room: {e.room} · {e.max_marks} marks
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Recent results */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: T.muted }}>
                Recent Results
              </span>
              {total_results > 0 && (
                <div
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                  style={{
                    background: avg_percentage >= 75 ? T.greenBg : avg_percentage >= 50 ? T.accentBg : T.redBg,
                    color: avg_percentage >= 75 ? T.green : avg_percentage >= 50 ? T.accent : T.red,
                  }}
                >
                  Avg {avg_percentage}%
                </div>
              )}
            </div>
            {recent_results.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <span className="text-3xl">📝</span>
                <p className="text-sm" style={{ color: T.muted }}>No results yet</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {recent_results.map((r, i) => {
                  const gs = gradeStyle(r.grade);
                  const barWidth = Math.min(r.percentage, 100);
                  return (
                    <div key={i} className="p-3 rounded-xl" style={{ background: T.bg, border: `1px solid ${T.borderMid}` }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div>
                          <p className="text-xs font-bold" style={{ color: T.ink }}>{r.exam_title}</p>
                          <p className="text-xs" style={{ color: T.muted }}>{r.subject} · {r.graded_at}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold" style={{ color: T.sub }}>
                            {r.marks}/{r.max_marks}
                          </span>
                          <Chip color={gs.color} bg={gs.bg}>{r.grade}</Chip>
                        </div>
                      </div>
                      {/* progress bar */}
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: T.border }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${barWidth}%`, background: gs.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* ── Assignments + Fees ───────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

          {/* Pending assignments */}
          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-[0.18em]" style={{ color: T.muted }}>
                Pending Assignments
              </span>
              {pending_submit_count > 0 && (
                <Chip color={T.red} bg={T.redBg}>{pending_submit_count} not submitted</Chip>
              )}
            </div>
            {pending_assignments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <span className="text-3xl">✅</span>
                <p className="text-sm font-semibold" style={{ color: T.green }}>All caught up!</p>
                <p className="text-xs" style={{ color: T.muted }}>No pending assignments</p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {pending_assignments.map((a, i) => {
                  const due = new Date(a.due_date);
                  const daysLeft = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
                  const isUrgent = daysLeft <= 2;
                  return (
                    <div
                      key={a.id}
                      className="flex items-center gap-3 p-3 rounded-xl"
                      style={{
                        background: isUrgent ? "#FFF8F8" : T.bg,
                        border: `1px solid ${isUrgent ? "#FEE2E2" : T.borderMid}`,
                      }}
                    >
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-base"
                        style={{ background: a.submitted ? T.greenBg : isUrgent ? T.redBg : T.primarySoft }}
                      >
                        {a.submitted ? "✓" : "📄"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold truncate" style={{ color: T.ink }}>{a.title}</p>
                        <p className="text-xs" style={{ color: T.muted }}>{a.subject}</p>
                        <p className="text-xs font-semibold" style={{ color: isUrgent ? T.red : T.sub }}>
                          Due: {a.due_date}
                        </p>
                      </div>
                      <div className="flex-shrink-0">
                        {a.submitted
                          ? <Chip color={T.green} bg={T.greenBg}>Submitted</Chip>
                          : <Chip color={isUrgent ? T.red : T.accent} bg={isUrgent ? T.redBg : T.accentBg}>
                              {daysLeft}d left
                            </Chip>
                        }
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Fee dues + Announcements */}
          <div className="space-y-5">
            {/* Fee dues */}
            <Card className="p-5">
              <Divider label="Fee Dues" />
              {fee_dues.length === 0 ? (
                <div className="flex items-center gap-3 py-3">
                  <span className="text-2xl">💚</span>
                  <p className="text-sm font-semibold" style={{ color: T.green }}>No pending fees</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {fee_dues.map((f, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-2.5 rounded-xl"
                      style={{
                        background: f.status === "overdue" ? "#FFF5F5" : T.accentBg,
                        border: `1px solid ${f.status === "overdue" ? "#FEE2E2" : "#FDE68A"}`,
                      }}
                    >
                      <div>
                        <p className="text-xs font-bold" style={{ color: T.ink }}>{f.fee_type}</p>
                        <p className="text-xs" style={{ color: T.muted }}>Due {f.due_date}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold" style={{ color: f.status === "overdue" ? T.red : T.accent }}>
                          ₹{Number(f.amount).toLocaleString("en-IN")}
                        </span>
                        <Chip
                          color={f.status === "overdue" ? T.red : T.accent}
                          bg={f.status === "overdue" ? T.redBg : T.accentBg}
                        >
                          {f.status}
                        </Chip>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Announcements */}
            <Card className="p-5">
              <Divider label="Announcements" />
              {announcements.length === 0 ? (
                <div className="flex items-center gap-3 py-2">
                  <span className="text-xl">🔕</span>
                  <p className="text-sm" style={{ color: T.muted }}>No active announcements</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {announcements.map((a) => (
                    <div
                      key={a.id}
                      className="p-3 rounded-xl"
                      style={{ background: T.primaryPale, border: `1px solid ${T.primarySoft}` }}
                    >
                      <div className="flex items-start justify-between gap-2 mb-0.5">
                        <p className="text-xs font-bold" style={{ color: T.ink }}>{a.title}</p>
                        <span className="text-xs flex-shrink-0" style={{ color: T.muted }}>{a.created_at}</span>
                      </div>
                      <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: T.sub }}>
                        {a.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center pb-4">
          <p className="text-xs" style={{ color: T.muted }}>
            EduQuest · {student.class_name} · Admission #{student.admission_number}
          </p>
        </div>
      </div>
    </div>
  );
}