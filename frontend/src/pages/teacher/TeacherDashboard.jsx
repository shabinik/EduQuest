// src/pages/teacher/TeacherDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, LineChart, Line,
} from "recharts";

/* ─── Design tokens ──────────────────────────────────────────────────────── */
const T = {
  // Warm teal-slate — distinct from admin's indigo
  primary:     "#0D9488",   // teal-600
  primaryDark: "#0F766E",   // teal-700
  primarySoft: "#CCFBF1",   // teal-100
  primaryPale: "#F0FDFA",   // teal-50

  bg:          "#F8FAFC",
  white:       "#FFFFFF",
  border:      "#E2E8F0",

  ink:         "#0F172A",
  sub:         "#475569",
  muted:       "#94A3B8",

  green:       "#059669",
  greenBg:     "#D1FAE5",
  red:         "#DC2626",
  redBg:       "#FEE2E2",
  amber:       "#D97706",
  amberBg:     "#FEF3C7",
  blue:        "#2563EB",
  blueBg:      "#DBEAFE",
  purple:      "#7C3AED",
  purpleBg:    "#EDE9FE",
};

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const statusMeta = {
  scheduled: { label: "Scheduled", color: T.blue,   bg: T.blueBg   },
  ongoing:   { label: "Ongoing",   color: T.green,  bg: T.greenBg  },
  completed: { label: "Completed", color: T.muted,  bg: "#F1F5F9"  },
  cancelled: { label: "Cancelled", color: T.red,    bg: T.redBg    },
};

const audienceMeta = {
  all:      { label: "Everyone",  color: T.blue,   bg: T.blueBg  },
  teachers: { label: "Teachers",  color: T.primary, bg: T.primarySoft },
  students: { label: "Students",  color: T.purple, bg: T.purpleBg },
};

const Chip = ({ color, bg, children }) => (
  <span
    className="inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full"
    style={{ color, background: bg }}
  >
    {children}
  </span>
);

const SectionLabel = ({ icon, children }) => (
  <div className="flex items-center gap-2 mb-4">
    <span className="text-base">{icon}</span>
    <h2 className="text-sm font-bold uppercase tracking-widest" style={{ color: T.sub }}>
      {children}
    </h2>
    <div className="flex-1 h-px" style={{ background: T.border }} />
  </div>
);

const Card = ({ children, className = "", style = {} }) => (
  <div
    className={`rounded-2xl bg-white border ${className}`}
    style={{ borderColor: T.border, ...style }}
  >
    {children}
  </div>
);

const KpiCard = ({ icon, label, value, sub, accentColor, accentBg, ring }) => (
  <Card
    className="p-4 flex flex-col gap-3 hover:shadow-md transition-all duration-200 group"
    style={{ borderLeftWidth: 3, borderLeftColor: accentColor }}
  >
    <div
      className="w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-transform duration-200 group-hover:scale-110"
      style={{ background: accentBg }}
    >
      {icon}
    </div>
    <div>
      <p className="text-2xl font-bold" style={{ color: T.ink }}>{value}</p>
      <p className="text-xs font-semibold mt-0.5" style={{ color: T.sub }}>{label}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: T.muted }}>{sub}</p>}
    </div>
  </Card>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl shadow-lg px-3 py-2.5 text-xs"
      style={{ background: T.white, border: `1px solid ${T.border}` }}
    >
      <p className="font-bold mb-1" style={{ color: T.primary }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span style={{ color: T.sub }}>{p.name}:</span>
          <span className="font-semibold">{p.value}</span>
        </div>
      ))}
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────────────────────── */
export default function TeacherDashboard() {
  const [user, setUser]     = useState(null);
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, dashRes] = await Promise.all([
          axiosInstance.get("accounts/profile/"),
          axiosInstance.get("users/teacher/dashboard/"),
        ]);
        setUser(profileRes.data);
        setData(dashRes.data);
      } catch {
        navigate("/teacher/login");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: T.bg }}>
        <div className="text-center space-y-3">
          <div
            className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin mx-auto"
            style={{ borderColor: T.primary, borderTopColor: "transparent" }}
          />
          <p className="text-sm" style={{ color: T.muted }}>Loading dashboard…</p>
        </div>
      </div>
    );
  }

  const {
    my_class, today_attendance, kpis,
    upcoming_exams, recent_assignments,
    announcements, attendance_trend, subjects,
  } = data;

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div
      className="min-h-screen"
      style={{ background: T.bg, fontFamily: "'Outfit', 'Segoe UI', sans-serif" }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');`}</style>

      <div className="max-w-[1380px] mx-auto px-5 py-7 space-y-7">

        {/* ── Header ──────────────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-6 relative overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${T.primary} 0%, #0891B2 100%)`,
          }}
        >
          {/* decorative */}
          <div className="absolute top-0 right-0 w-56 h-56 rounded-full bg-white opacity-5 -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-48 w-32 h-32 rounded-full bg-white opacity-5 -mb-10" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-teal-100 text-xs font-semibold uppercase tracking-widest mb-1">
                EduQuest · Teacher Portal
              </p>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                {greeting}, {user?.full_name?.split(" ")[0] || "Teacher"} 👋
              </h1>
              <p className="text-teal-100 text-sm mt-1">
                {user?.tenant_name} &nbsp;·&nbsp;{" "}
                {now.toLocaleDateString("en-IN", {
                  weekday: "long", day: "numeric", month: "long", year: "numeric",
                })}
              </p>
              {subjects.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {subjects.map((s, i) => (
                    <span
                      key={i}
                      className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
                      style={{ background: "rgba(255,255,255,0.2)", color: "#fff" }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Today's class attendance bubble */}
            {my_class && today_attendance && (
              <div
                className="flex-shrink-0 rounded-2xl px-5 py-4 min-w-[200px]"
                style={{
                  background: "rgba(255,255,255,0.15)",
                  backdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.25)",
                }}
              >
                <p className="text-teal-100 text-xs font-semibold uppercase tracking-wide mb-2">
                  {my_class.name} · Today
                </p>
                <div className="flex items-end gap-3">
                  <div>
                    <p className="text-white text-3xl font-bold leading-none">
                      {today_attendance.attendance_pct}
                      <span className="text-lg">%</span>
                    </p>
                    <p className="text-teal-100 text-xs mt-0.5">Attendance</p>
                  </div>
                  <div className="text-xs space-y-0.5 pb-0.5">
                    <p style={{ color: "#A7F3D0" }}>✓ {today_attendance.present_count} present</p>
                    <p style={{ color: "#FCA5A5" }}>✗ {today_attendance.absent_count} absent</p>
                  </div>
                </div>
                {!today_attendance.is_completed && (
                  <p
                    className="text-xs mt-2 font-semibold px-2 py-0.5 rounded-full inline-block"
                    style={{ background: T.amberBg, color: T.amber }}
                  >
                    ⚠ Not marked yet
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── KPI Row ──────────────────────────────────────────────────── */}
        <section>
          <SectionLabel icon="📊">Quick Stats</SectionLabel>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <KpiCard
              icon="📝" label="My Exams"
              value={kpis.total_exams}
              sub={`${kpis.exams_this_month} this month`}
              accentColor={T.blue} accentBg={T.blueBg}
            />
            <KpiCard
              icon="⏳" label="Need Grading"
              value={kpis.pending_grading}
              sub="Exams awaiting"
              accentColor={kpis.pending_grading > 0 ? T.amber : T.green}
              accentBg={kpis.pending_grading > 0 ? T.amberBg : T.greenBg}
            />
            <KpiCard
              icon="📋" label="Assignments"
              value={kpis.active_assignments}
              sub="Active / ongoing"
              accentColor={T.primary} accentBg={T.primarySoft}
            />
            <KpiCard
              icon="📥" label="Pending Review"
              value={kpis.pending_review}
              sub="Submissions"
              accentColor={kpis.pending_review > 0 ? T.amber : T.green}
              accentBg={kpis.pending_review > 0 ? T.amberBg : T.greenBg}
            />
            <KpiCard
              icon="📚" label="Subjects"
              value={kpis.subjects_count}
              sub="I teach"
              accentColor={T.purple} accentBg={T.purpleBg}
            />
            <KpiCard
              icon="📢" label="Announcements"
              value={kpis.announcements_count}
              sub="Active for you"
              accentColor={T.red} accentBg={T.redBg}
            />
          </div>
        </section>

        {/* ── Attendance trend + Upcoming exams ───────────────────────── */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Attendance trend chart */}
            <Card className="p-5">
              <SectionLabel icon="📅">Attendance Trend (Last 7 Days)</SectionLabel>
              {!my_class ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <span className="text-3xl">🏫</span>
                  <p className="text-sm font-medium" style={{ color: T.muted }}>
                    No class assigned as class teacher
                  </p>
                </div>
              ) : attendance_trend.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <span className="text-3xl">📊</span>
                  <p className="text-sm" style={{ color: T.muted }}>No attendance data yet</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={210}>
                  <BarChart data={attendance_trend} margin={{ top: 5, right: 5, bottom: 0, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="present" name="Present" fill={T.primary} radius={[4, 4, 0, 0]} />
                    <Bar dataKey="absent"  name="Absent"  fill={T.redBg}   radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>

            {/* Upcoming exams */}
            <Card className="p-5">
              <SectionLabel icon="🎓">Upcoming Exams</SectionLabel>
              {upcoming_exams.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <span className="text-3xl">🎉</span>
                  <p className="text-sm font-medium" style={{ color: T.green }}>No upcoming exams</p>
                  <p className="text-xs" style={{ color: T.muted }}>Enjoy the calm!</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {upcoming_exams.map((e) => {
                    const meta = statusMeta[e.status] || statusMeta.scheduled;
                    return (
                      <div
                        key={e.id}
                        className="flex items-start justify-between p-3 rounded-xl hover:shadow-sm transition-all"
                        style={{ background: T.bg, border: `1px solid ${T.border}` }}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold truncate" style={{ color: T.ink }}>
                              {e.title}
                            </p>
                            <Chip color={meta.color} bg={meta.bg}>{meta.label}</Chip>
                          </div>
                          <p className="text-xs mt-0.5" style={{ color: T.muted }}>
                            {e.subject} · {e.classes.join(", ")}
                          </p>
                          <p className="text-xs mt-0.5 font-medium" style={{ color: T.sub }}>
                            {e.exam_date} · {e.start_time} · Max {e.max_marks} marks
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </section>

        {/* ── Assignments + Announcements ──────────────────────────────── */}
        <section>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Recent Assignments */}
            <Card className="p-5">
              <SectionLabel icon="📋">Recent Assignments</SectionLabel>
              {recent_assignments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <span className="text-3xl">📭</span>
                  <p className="text-sm" style={{ color: T.muted }}>No assignments yet</p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {recent_assignments.map((a) => (
                    <div
                      key={a.id}
                      className="p-3 rounded-xl"
                      style={{
                        background: a.is_overdue ? "#FFF8F8" : T.bg,
                        border: `1px solid ${a.is_overdue ? "#FEE2E2" : T.border}`,
                      }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="text-sm font-semibold truncate" style={{ color: T.ink }}>
                              {a.title}
                            </p>
                            {a.is_overdue && (
                              <Chip color={T.red} bg={T.redBg}>Overdue</Chip>
                            )}
                          </div>
                          <p className="text-xs mt-0.5" style={{ color: T.muted }}>
                            {a.subject} · {a.classes.join(", ")}
                          </p>
                          <p className="text-xs mt-0.5 font-medium" style={{ color: T.sub }}>
                            Due: {a.due_date} · {a.total_marks} marks
                          </p>
                        </div>
                        <div className="flex-shrink-0 text-center">
                          <p
                            className="text-lg font-bold"
                            style={{ color: a.submissions > 0 ? T.primary : T.muted }}
                          >
                            {a.submissions}
                          </p>
                          <p className="text-xs" style={{ color: T.muted }}>submitted</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Announcements */}
            <Card className="p-5">
              <SectionLabel icon="📢">Announcements</SectionLabel>
              {announcements.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 gap-2">
                  <span className="text-3xl">🔔</span>
                  <p className="text-sm font-medium" style={{ color: T.muted }}>
                    No active announcements
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {announcements.map((a) => {
                    const aud = audienceMeta[a.audience] || audienceMeta.all;
                    return (
                      <div
                        key={a.id}
                        className="p-3.5 rounded-xl"
                        style={{
                          background: T.primaryPale,
                          border: `1px solid ${T.primarySoft}`,
                        }}
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-semibold" style={{ color: T.ink }}>
                            {a.title}
                          </p>
                          <Chip color={aud.color} bg={aud.bg}>{aud.label}</Chip>
                        </div>
                        <p
                          className="text-xs leading-relaxed line-clamp-2"
                          style={{ color: T.sub }}
                        >
                          {a.description}
                        </p>
                        <p className="text-xs mt-1.5" style={{ color: T.muted }}>
                          Posted {a.created_at} · Expires {a.expiry_date}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          </div>
        </section>

        {/* ── Pending grading alert ────────────────────────────────────── */}
        {kpis.pending_grading > 0 && (
          <div
            className="rounded-2xl p-4 flex items-center gap-4"
            style={{
              background: T.amberBg,
              border: `1px solid #FCD34D`,
            }}
          >
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="font-bold text-sm" style={{ color: T.amber }}>
                {kpis.pending_grading} exam{kpis.pending_grading > 1 ? "s" : ""} need grading
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#92400E" }}>
                Students are waiting for their results. Head to the Exams section to submit grades.
              </p>
            </div>
          </div>
        )}

        {kpis.pending_review > 0 && (
          <div
            className="rounded-2xl p-4 flex items-center gap-4"
            style={{
              background: T.blueBg,
              border: `1px solid #93C5FD`,
            }}
          >
            <span className="text-2xl">📥</span>
            <div>
              <p className="font-bold text-sm" style={{ color: T.blue }}>
                {kpis.pending_review} assignment submission{kpis.pending_review > 1 ? "s" : ""} awaiting review
              </p>
              <p className="text-xs mt-0.5" style={{ color: "#1E40AF" }}>
                Go to Assignments to review and grade student submissions.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center pb-4">
          <p className="text-xs" style={{ color: T.muted }}>
            EduQuest · Teacher Dashboard · {user?.tenant_name}
          </p>
        </div>
      </div>
    </div>
  );
}