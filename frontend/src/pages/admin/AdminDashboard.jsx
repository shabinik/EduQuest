import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

// ── Design tokens ─────────────────────────────────────────────────────────────
const T = {
  // Brand — indigo to match the sidebar
  primary:     "#6C35DE",
  primarySoft: "#EDE9FC",
  primaryMid:  "#9B72F0",

  // Surface
  bg:          "#F5F6FA",
  white:       "#FFFFFF",
  border:      "#E8EAF2",
  borderDark:  "#D5D8E8",

  // Text
  ink:         "#16192C",
  sub:         "#4A5578",
  muted:       "#9CA3AF",

  // Status
  green:       "#10B981",
  greenBg:     "#D1FAE5",
  red:         "#EF4444",
  redBg:       "#FEE2E2",
  amber:       "#F59E0B",
  amberBg:     "#FEF3C7",
  blue:        "#3B82F6",
  blueBg:      "#DBEAFE",
};

const CHART_COLORS = [T.primary, T.green, T.amber, T.red, T.blue, T.primaryMid];

// ── Formatters ────────────────────────────────────────────────────────────────
const inr = (n) =>
  n >= 100_000
    ? `₹${(n / 100_000).toFixed(1)}L`
    : n >= 1_000
    ? `₹${(n / 1_000).toFixed(1)}K`
    : `₹${Number(n).toLocaleString("en-IN")}`;

const pct = (a, b) => {
  if (!b || b === 0) return null;
  const p = Math.round(((a - b) / b) * 100);
  return p;
};

// ── Tiny helpers ──────────────────────────────────────────────────────────────
const Pill = ({ color, bg, children }) => (
  <span
    className="text-xs font-semibold px-2.5 py-0.5 rounded-full"
    style={{ color, background: bg }}
  >
    {children}
  </span>
);

const Trend = ({ value }) => {
  if (value === null || value === undefined) return null;
  const up = value >= 0;
  return (
    <span
      className="inline-flex items-center gap-0.5 text-xs font-bold px-1.5 py-0.5 rounded-md"
      style={{ color: up ? T.green : T.red, background: up ? T.greenBg : T.redBg }}
    >
      {up ? "↑" : "↓"} {Math.abs(value)}%
    </span>
  );
};

const SectionLabel = ({ children }) => (
  <div className="flex items-center gap-3 mb-5">
    <span
      className="text-xs font-bold uppercase tracking-[0.18em]"
      style={{ color: T.sub }}
    >
      {children}
    </span>
    <div className="flex-1 h-px" style={{ background: T.border }} />
  </div>
);

const Card = ({ children, className = "", style = {} }) => (
  <div
    className={`rounded-2xl border bg-white ${className}`}
    style={{ borderColor: T.border, ...style }}
  >
    {children}
  </div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl shadow-xl px-4 py-3 text-sm"
      style={{
        background: T.white,
        border: `1px solid ${T.border}`,
        color: T.ink,
      }}
    >
      <p className="font-bold mb-1.5" style={{ color: T.primary }}>{label}</p>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: p.color }} />
          <span style={{ color: T.sub }}>{p.name}:</span>
          <span className="font-semibold">
            {["Revenue", "Expense", "Amount"].includes(p.name)
              ? `₹${Number(p.value).toLocaleString("en-IN")}`
              : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

// ── KPI Card ──────────────────────────────────────────────────────────────────
const KpiCard = ({ icon, label, value, sub, accent, accentBg, trend, border }) => (
  <Card
    className="p-5 flex flex-col gap-4 hover:shadow-md transition-all duration-200"
    style={{ borderColor: border || T.border, borderLeftWidth: 4, borderLeftColor: accent }}
  >
    <div className="flex items-center justify-between">
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
        style={{ background: accentBg || T.primarySoft }}
      >
        {icon}
      </div>
      {trend !== undefined && <Trend value={trend} />}
    </div>
    <div>
      <p className="text-2xl font-bold tracking-tight" style={{ color: T.ink }}>
        {value}
      </p>
      <p className="text-sm font-medium mt-0.5" style={{ color: T.sub }}>{label}</p>
      {sub && <p className="text-xs mt-1" style={{ color: T.muted }}>{sub}</p>}
    </div>
  </Card>
);

// ── Main Dashboard ────────────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [user, setUser]     = useState(null);
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        const [profileRes, dashRes] = await Promise.all([
          axiosInstance.get("accounts/profile/"),
          axiosInstance.get("accounts/admin/dashboard/"),
        ]);
        setUser(profileRes.data);
        setData(dashRes.data);
      } catch {
        navigate("/admin/login");
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
        style={{ background: T.bg }}
      >
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

  const { kpis, subscription, revenue_chart, expense_cat_chart,
          bill_status, overdue_list, recent_payments } = data;

  const revTrend = pct(kpis.month_revenue, kpis.last_month_revenue);
  const now = new Date();

  return (
    <div
      className="min-h-screen"
      style={{ background: T.bg, fontFamily: "'Plus Jakarta Sans', 'Segoe UI', sans-serif" }}
    >
      {/* Google Font */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&display=swap');`}</style>

      <div className="max-w-[1380px] mx-auto px-6 py-8 space-y-8">

        {/* ── Page Header ─────────────────────────────────────────────── */}
        <div
          className="rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${T.primary} 0%, #9B4DE0 100%)` }}
        >
          {/* decorative circles */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white opacity-5" />
          <div className="absolute bottom-0 right-32 w-24 h-24 rounded-full bg-white opacity-5" />

          <div className="relative z-10">
            <p className="text-purple-200 text-xs font-semibold uppercase tracking-widest mb-1">
              School Admin · EduQuest
            </p>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Welcome back, {user?.full_name?.split(" ")[0] || "Admin"} 👋
            </h1>
            <p className="text-purple-200 text-sm mt-1">
              {user?.tenant_name} &nbsp;·&nbsp;{" "}
              {now.toLocaleDateString("en-IN", {
                weekday: "long", day: "numeric", month: "long", year: "numeric",
              })}
            </p>
          </div>

          {/* Subscription badge */}
          {subscription && (
            <div
              className="relative z-10 rounded-xl px-4 py-3 flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.2)" }}
            >
              <p className="text-purple-100 text-xs font-semibold uppercase mb-1">Active Plan</p>
              <p className="text-white font-bold text-lg leading-tight">{subscription.plan_name}</p>
              <p className="text-purple-200 text-xs mt-0.5">
                Expires {subscription.expiry_date} &nbsp;
                <span
                  className="font-bold"
                  style={{ color: subscription.days_left < 30 ? "#FCA5A5" : "#A7F3D0" }}
                >
                  ({subscription.days_left}d left)
                </span>
              </p>
            </div>
          )}
        </div>

        {/* ── KPI Row 1 — People ───────────────────────────────────────── */}
        <section>
          <SectionLabel>People & Classes</SectionLabel>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard
              icon="🎓" label="Total Students" value={kpis.total_students.toLocaleString()}
              sub={`+${kpis.new_students_month} this month`}
              accent={T.primary} accentBg={T.primarySoft}
            />
            <KpiCard
              icon="👨‍🏫" label="Total Teachers" value={kpis.total_teachers}
              sub="Active staff"
              accent={T.blue} accentBg={T.blueBg}
            />
            <KpiCard
              icon="🏫" label="Active Classes" value={kpis.total_classes}
              sub="Current academic year"
              accent={T.amber} accentBg={T.amberBg}
            />
            <KpiCard
              icon="📢" label="Announcements" value={kpis.active_announcements}
              sub="Currently active"
              accent="#8B5CF6" accentBg="#EDE9FE"
            />
          </div>
        </section>

        {/* ── KPI Row 2 — Finance ──────────────────────────────────────── */}
        <section>
          <SectionLabel>Financial Summary</SectionLabel>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiCard
              icon="💰" label="This Month's Revenue" value={inr(kpis.month_revenue)}
              sub={`Last month: ${inr(kpis.last_month_revenue)}`}
              accent={T.green} accentBg={T.greenBg}
              trend={revTrend}
            />
            <KpiCard
              icon="📉" label="Monthly Expenses" value={inr(kpis.month_expense)}
              sub={`Year total: ${inr(kpis.total_expense_year)}`}
              accent={T.red} accentBg={T.redBg}
            />
            <KpiCard
              icon="📊" label="Net This Month"
              value={inr(Math.abs(kpis.net_month))}
              sub={kpis.net_month >= 0 ? "Surplus" : "Deficit"}
              accent={kpis.net_month >= 0 ? T.green : T.red}
              accentBg={kpis.net_month >= 0 ? T.greenBg : T.redBg}
            />
            <KpiCard
              icon="⏰" label="Overdue Bills" value={kpis.overdue_bills}
              sub={`${inr(kpis.overdue_amount)} pending recovery`}
              accent={T.amber} accentBg={T.amberBg}
            />
          </div>
        </section>

        {/* ── Charts Row ───────────────────────────────────────────────── */}
        <section>
          <SectionLabel>Revenue vs Expense</SectionLabel>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Revenue + Expense area chart — spans 2 cols */}
            <Card className="p-5 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-base" style={{ color: T.ink }}>
                  Monthly Revenue vs Expense
                </p>
                <div className="flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ background: T.primary }} />
                    <span style={{ color: T.sub }}>Revenue</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full inline-block" style={{ background: T.red }} />
                    <span style={{ color: T.sub }}>Expense</span>
                  </span>
                </div>
              </div>
              {revenue_chart.length === 0 ? (
                <div className="flex items-center justify-center h-52" style={{ color: T.muted }}>
                  No data yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={revenue_chart} margin={{ top: 5, right: 5, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="gRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={T.primary} stopOpacity={0.15} />
                        <stop offset="95%" stopColor={T.primary} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={T.red} stopOpacity={0.12} />
                        <stop offset="95%" stopColor={T.red} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={T.border} />
                    <XAxis dataKey="month" tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false}
                      tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke={T.primary} strokeWidth={2.5} fill="url(#gRev)" dot={false} activeDot={{ r: 5, fill: T.primary }} />
                    <Area type="monotone" dataKey="expense" name="Expense" stroke={T.red}     strokeWidth={2} fill="url(#gExp)" dot={false} activeDot={{ r: 4, fill: T.red }} strokeDasharray="5 3" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </Card>

            {/* Bill status pie */}
            <Card className="p-5">
              <p className="font-semibold text-base mb-4" style={{ color: T.ink }}>Bill Status</p>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={bill_status} dataKey="count"
                    cx="50%" cy="50%" innerRadius={50} outerRadius={78}
                    paddingAngle={3} startAngle={90} endAngle={-270}
                  >
                    {bill_status.map((e, i) => (
                      <Cell key={i} fill={e.color} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v, n) => [v, n]}
                    contentStyle={{ background: T.white, border: `1px solid ${T.border}`, borderRadius: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {bill_status.map((s, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                      <span className="text-sm" style={{ color: T.sub }}>{s.status}</span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: T.ink }}>{s.count}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        {/* ── Expense by Category ──────────────────────────────────────── */}
        {expense_cat_chart.length > 0 && (
          <section>
            <SectionLabel>Expense Breakdown (This Year)</SectionLabel>
            <Card className="p-5">
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={expense_cat_chart} margin={{ top: 5, right: 10, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={T.border} vertical={false} />
                  <XAxis dataKey="category" tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: T.muted, fontSize: 11 }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="amount" name="Amount" radius={[6, 6, 0, 0]}>
                    {expense_cat_chart.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </section>
        )}

        {/* ── Recent Activity Tables ───────────────────────────────────── */}
        <section>
          <SectionLabel>Recent Activity</SectionLabel>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

            {/* Recent Payments */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-base" style={{ color: T.ink }}>Recent Payments</p>
                <Pill color={T.green} bg={T.greenBg}>Latest 6</Pill>
              </div>
              {recent_payments.length === 0 ? (
                <p className="text-center py-8 text-sm" style={{ color: T.muted }}>No payments yet</p>
              ) : (
                <div className="space-y-2">
                  {recent_payments.map((p, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white"
                          style={{ background: T.primary }}
                        >
                          {p.student.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: T.ink }}>{p.student}</p>
                          <p className="text-xs truncate" style={{ color: T.muted }}>{p.fee_type} · {p.paid_date}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold flex-shrink-0 ml-2" style={{ color: T.green }}>
                        +{inr(p.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Overdue Bills */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="font-semibold text-base" style={{ color: T.ink }}>Overdue Bills</p>
                {kpis.overdue_bills > 0 && (
                  <Pill color={T.red} bg={T.redBg}>{kpis.overdue_bills} overdue</Pill>
                )}
              </div>
              {overdue_list.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <span className="text-3xl">✅</span>
                  <p className="text-sm font-medium" style={{ color: T.green }}>No overdue bills!</p>
                  <p className="text-xs" style={{ color: T.muted }}>All students are up to date</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {overdue_list.map((b, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                      style={{ background: "#FFF8F8" }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                          style={{ background: T.redBg, color: T.red }}
                        >
                          {b.student.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold truncate" style={{ color: T.ink }}>{b.student}</p>
                          <p className="text-xs truncate" style={{ color: T.muted }}>{b.fee_type} · Due {b.due_date}</p>
                        </div>
                      </div>
                      <span className="text-sm font-bold flex-shrink-0 ml-2" style={{ color: T.red }}>
                        {inr(b.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </section>

        {/* Footer */}
        <div className="text-center pb-4">
          <p className="text-xs" style={{ color: T.muted }}>
            EduQuest · School Admin Dashboard · Data refreshes on page load
          </p>
        </div>
      </div>
    </div>
  );
}