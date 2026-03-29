import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";

// ── Palette ───────────────────────────────────────────────────────────────────
const C = {
  gold:    "#D4A843",
  goldSoft:"#E8C97A",
  bg:      "#0A0C10",
  surface: "#0F1218",
  card:    "#141820",
  border:  "#1E2530",
  text:    "#E8EAF0",
  muted:   "#6B7585",
  green:   "#10B981",
  red:     "#EF4444",
  amber:   "#F59E0B",
  blue:    "#3B82F6",
  purple:  "#8B5CF6",
};

const PIE_COLORS = [C.green, C.muted, C.red, C.amber];

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n) =>
  n >= 1_000_000
    ? `₹${(n / 1_000_000).toFixed(1)}M`
    : n >= 1_000
    ? `₹${(n / 1_000).toFixed(1)}K`
    : `₹${n}`;

const statusColor = (s) =>
  ({ active: C.green, inactive: C.muted, suspended: C.red, trial: C.amber }[s] || C.muted);

const statusBg = (s) =>
  ({
    active:    "bg-emerald-900/40 text-emerald-400 border-emerald-800",
    inactive:  "bg-gray-800/60 text-gray-400 border-gray-700",
    suspended: "bg-red-900/40 text-red-400 border-red-800",
    trial:     "bg-amber-900/40 text-amber-400 border-amber-800",
  }[s] || "bg-gray-800 text-gray-400");

// ── Sub-components ────────────────────────────────────────────────────────────

const KpiCard = ({ label, value, sub, icon, accent, trend }) => (
  <div
    style={{ borderColor: C.border, background: C.card }}
    className="rounded-2xl border p-5 flex flex-col gap-3 hover:border-yellow-700/50 transition-all duration-300 group relative overflow-hidden"
  >
    {/* subtle glow */}
    <div
      className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-0 group-hover:opacity-10 transition-opacity duration-500 blur-2xl"
      style={{ background: accent || C.gold }}
    />
    <div className="flex items-start justify-between">
      <span className="text-2xl">{icon}</span>
      {trend !== undefined && (
        <span
          className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            trend >= 0
              ? "bg-emerald-900/50 text-emerald-400"
              : "bg-red-900/50 text-red-400"
          }`}
        >
          {trend >= 0 ? "↑" : "↓"} {Math.abs(trend)}
        </span>
      )}
    </div>
    <div>
      <p className="text-3xl font-bold tracking-tight" style={{ color: accent || C.gold }}>
        {value}
      </p>
      <p className="text-sm font-semibold mt-0.5" style={{ color: C.text }}>{label}</p>
      {sub && <p className="text-xs mt-1" style={{ color: C.muted }}>{sub}</p>}
    </div>
  </div>
);

const SectionTitle = ({ children }) => (
  <h2
    className="text-xs font-bold uppercase tracking-[0.2em] mb-4 flex items-center gap-3"
    style={{ color: C.muted }}
  >
    <span className="w-5 h-px" style={{ background: C.gold }} />
    {children}
    <span className="flex-1 h-px" style={{ background: C.border }} />
  </h2>
);

const CardWrap = ({ children, className = "" }) => (
  <div
    style={{ background: C.card, borderColor: C.border }}
    className={`rounded-2xl border p-5 ${className}`}
  >
    {children}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      style={{ background: "#1A2030", border: `1px solid ${C.border}`, color: C.text }}
      className="rounded-xl px-4 py-3 text-sm shadow-2xl"
    >
      <p className="font-bold mb-1" style={{ color: C.gold }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: {p.name?.toLowerCase().includes("revenue") || p.name === "Revenue" ? `₹${Number(p.value).toLocaleString()}` : p.value}
        </p>
      ))}
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
export default function SuperAdminDash() {
  const [user, setUser]   = useState(null);
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, dashRes] = await Promise.all([
          axiosInstance.get("accounts/profile/"),
          axiosInstance.get("superadmin/dashboard/"),
        ]);
        setUser(profileRes.data);
        setData(dashRes.data);
      } catch {
        navigate("/superadmin/login");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [navigate]);

  if (loading || !data) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: C.bg }}
      >
        <div className="text-center space-y-4">
          <div
            className="w-12 h-12 rounded-full border-2 border-t-transparent animate-spin mx-auto"
            style={{ borderColor: C.gold, borderTopColor: "transparent" }}
          />
          <p className="text-sm tracking-widest uppercase" style={{ color: C.muted }}>
            Loading
          </p>
        </div>
      </div>
    );
  }

  const { kpis, revenue_chart, tenant_chart, plan_chart, status_chart,
          recent_tenants, recent_payments } = data;

  const now = new Date();
  const timeStr = now.toLocaleDateString("en-IN", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  return (
    <div className="min-h-screen" style={{ background: C.bg, color: C.text, fontFamily: "'DM Sans', sans-serif" }}>
      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');`}</style>

      <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-8">

        {/* ── Top Bar ─────────────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold"
                style={{ background: C.gold, color: "#000" }}
              >
                SA
              </div>
              <span className="text-xs uppercase tracking-widest" style={{ color: C.muted }}>
                EduQuest · Super Admin
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight" style={{ color: C.text }}>
              Command Center
            </h1>
            <p className="text-sm mt-0.5" style={{ color: C.muted }}>{timeStr}</p>
          </div>
          <div
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl border"
            style={{ borderColor: C.border, background: C.card }}
          >
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
              style={{ background: `${C.gold}22`, color: C.gold, border: `1px solid ${C.gold}44` }}
            >
              {user?.full_name?.charAt(0) || "S"}
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight" style={{ color: C.text }}>
                {user?.full_name || user?.username}
              </p>
              <p className="text-xs" style={{ color: C.gold }}>Super Administrator</p>
            </div>
          </div>
        </div>

        {/* ── KPI Grid ────────────────────────────────────────────────── */}
        <section>
          <SectionTitle>Platform Overview</SectionTitle>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard icon="🏫" label="Total Schools"    value={kpis.tenant_total}               sub={`${kpis.tenant_new_month} joined this month`} accent={C.gold} />
            <KpiCard icon="✅" label="Active Schools"   value={kpis.tenant_active}              sub={`${kpis.expired_subs} expired subs`}           accent={C.green} />
            <KpiCard icon="💰" label="Total Revenue"    value={fmt(kpis.total_revenue)}          sub={`${fmt(kpis.month_revenue)} this month`}       accent={C.goldSoft} />
            <KpiCard icon="📋" label="Active Subs"      value={kpis.active_subs}                sub="Live subscriptions"                             accent={C.blue} />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <KpiCard icon="👥" label="Total Users"      value={kpis.total_users.toLocaleString()} sub="Across all schools"                           accent={C.purple} />
            <KpiCard icon="🎓" label="School Admins"    value={kpis.total_admins}               sub="Admin accounts"                                 accent={C.amber} />
            <KpiCard icon="📚" label="Teachers"         value={kpis.total_teachers}             sub="Teaching staff"                                 accent={C.blue} />
            <KpiCard icon="🧑‍🎓" label="Students"        value={kpis.total_students.toLocaleString()} sub="Enrolled students"                        accent={C.green} />
          </div>
        </section>

        {/* ── Revenue + Tenant Trend ───────────────────────────────────── */}
        <section>
          <SectionTitle>Growth Trends</SectionTitle>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Revenue chart */}
            <CardWrap>
              <p className="text-sm font-semibold mb-4" style={{ color: C.text }}>
                Revenue (Last 12 Months)
              </p>
              {revenue_chart.length === 0 ? (
                <p className="text-center py-12 text-sm" style={{ color: C.muted }}>No revenue data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={revenue_chart} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={C.gold}  stopOpacity={0.3} />
                        <stop offset="95%" stopColor={C.gold}  stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                    <XAxis dataKey="month" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}K`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke={C.gold} strokeWidth={2} fill="url(#rev)" dot={{ fill: C.gold, r: 3 }} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardWrap>

            {/* New tenants chart */}
            <CardWrap>
              <p className="text-sm font-semibold mb-4" style={{ color: C.text }}>
                New Schools (Last 12 Months)
              </p>
              {tenant_chart.length === 0 ? (
                <p className="text-center py-12 text-sm" style={{ color: C.muted }}>No signup data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={tenant_chart} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                    <XAxis dataKey="month" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="New Schools" fill={C.blue} radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardWrap>
          </div>
        </section>

        {/* ── Pie charts ───────────────────────────────────────────────── */}
        <section>
          <SectionTitle>Distribution</SectionTitle>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Tenant status pie */}
            <CardWrap className="flex flex-col">
              <p className="text-sm font-semibold mb-4" style={{ color: C.text }}>School Status Breakdown</p>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={180} height={180}>
                  <PieChart>
                    <Pie data={status_chart} dataKey="count" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                      {status_chart.map((entry, i) => (
                        <Cell key={i} fill={PIE_COLORS[i]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v, n) => [v, n]} contentStyle={{ background: "#1A2030", border: `1px solid ${C.border}`, borderRadius: 8 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3 flex-1">
                  {status_chart.map((s, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i] }} />
                        <span className="text-sm" style={{ color: C.muted }}>{s.status}</span>
                      </div>
                      <span className="text-sm font-bold" style={{ color: C.text }}>{s.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardWrap>

            {/* Plan popularity */}
            <CardWrap>
              <p className="text-sm font-semibold mb-4" style={{ color: C.text }}>Plan Popularity</p>
              {plan_chart.length === 0 ? (
                <p className="text-center py-12 text-sm" style={{ color: C.muted }}>No subscription data yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={plan_chart} layout="vertical" margin={{ left: 10, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={C.border} horizontal={false} />
                    <XAxis type="number" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="plan" tick={{ fill: C.muted, fontSize: 11 }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="Subscriptions" fill={C.purple} radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardWrap>
          </div>
        </section>

        {/* ── Recent Tables ────────────────────────────────────────────── */}
        <section>
          <SectionTitle>Recent Activity</SectionTitle>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Recent Tenants */}
            <CardWrap>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold" style={{ color: C.text }}>Latest Schools</p>
                <span className="text-xs" style={{ color: C.muted }}>Most recent 8</span>
              </div>
              <div className="space-y-2">
                {recent_tenants.length === 0 ? (
                  <p className="text-center py-8 text-sm" style={{ color: C.muted }}>No schools yet</p>
                ) : (
                  recent_tenants.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors"
                      style={{ background: "#0F1420" }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: `${C.gold}18`, color: C.gold, border: `1px solid ${C.gold}30` }}
                        >
                          {t.institute_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: C.text }}>{t.institute_name}</p>
                          <p className="text-xs truncate" style={{ color: C.muted }}>{t.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0 ml-2">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusBg(t.status)}`}
                        >
                          {t.status}
                        </span>
                        <span className="text-xs" style={{ color: C.muted }}>{t.created_at}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardWrap>

            {/* Recent Payments */}
            <CardWrap>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold" style={{ color: C.text }}>Recent Payments</p>
                <span className="text-xs" style={{ color: C.muted }}>Most recent 8</span>
              </div>
              <div className="space-y-2">
                {recent_payments.length === 0 ? (
                  <p className="text-center py-8 text-sm" style={{ color: C.muted }}>No payments yet</p>
                ) : (
                  recent_payments.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                      style={{ background: "#0F1420" }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                          style={{ background: `${C.green}18`, color: C.green, border: `1px solid ${C.green}30` }}
                        >
                          ₹
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: C.text }}>{p.institute}</p>
                          <p className="text-xs" style={{ color: C.muted }}>{p.created_at}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold flex-shrink-0 ml-2" style={{ color: C.green }}>
                        ₹{Number(p.amount).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </CardWrap>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center pb-6">
          <p className="text-xs" style={{ color: C.muted, fontFamily: "'DM Mono', monospace" }}>
            EduQuest · Super Admin Console · All data is live
          </p>
        </div>
      </div>
    </div>
  );
}