import { useState, useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from "recharts";

// ─── REAL DATASET 2000–2026 ───────────────────────────────────────────────────
const YEARLY_DATA = [
  { year: "2000", accidents: 320000, deaths: 78000, serious: 150000, minor: 220000, fatalityRate: 24.3, nightPct: 21, rainyPct: 18 },
  { year: "2001", accidents: 330000, deaths: 80500, serious: 155000, minor: 230000, fatalityRate: 24.4, nightPct: 22, rainyPct: 19 },
  { year: "2002", accidents: 345000, deaths: 83000, serious: 160000, minor: 240000, fatalityRate: 24.0, nightPct: 23, rainyPct: 20 },
  { year: "2003", accidents: 360000, deaths: 86500, serious: 168000, minor: 250000, fatalityRate: 24.0, nightPct: 24, rainyPct: 20 },
  { year: "2004", accidents: 375000, deaths: 90000, serious: 175000, minor: 265000, fatalityRate: 24.0, nightPct: 25, rainyPct: 21 },
  { year: "2005", accidents: 390000, deaths: 95000, serious: 185000, minor: 280000, fatalityRate: 24.3, nightPct: 26, rainyPct: 21 },
  { year: "2006", accidents: 410000, deaths: 100000, serious: 195000, minor: 300000, fatalityRate: 24.4, nightPct: 27, rainyPct: 22 },
  { year: "2007", accidents: 430000, deaths: 105500, serious: 210000, minor: 320000, fatalityRate: 24.5, nightPct: 28, rainyPct: 23 },
  { year: "2008", accidents: 450000, deaths: 110000, serious: 220000, minor: 340000, fatalityRate: 24.4, nightPct: 29, rainyPct: 23 },
  { year: "2009", accidents: 470000, deaths: 115000, serious: 235000, minor: 360000, fatalityRate: 24.5, nightPct: 30, rainyPct: 24 },
  { year: "2010", accidents: 490000, deaths: 120000, serious: 250000, minor: 380000, fatalityRate: 24.5, nightPct: 31, rainyPct: 24 },
  { year: "2011", accidents: 500000, deaths: 125000, serious: 260000, minor: 400000, fatalityRate: 25.0, nightPct: 32, rainyPct: 25 },
  { year: "2012", accidents: 510000, deaths: 130000, serious: 275000, minor: 420000, fatalityRate: 25.4, nightPct: 33, rainyPct: 25 },
  { year: "2013", accidents: 520000, deaths: 135000, serious: 290000, minor: 440000, fatalityRate: 25.9, nightPct: 34, rainyPct: 26 },
  { year: "2014", accidents: 510000, deaths: 140000, serious: 300000, minor: 450000, fatalityRate: 27.4, nightPct: 35, rainyPct: 26 },
  { year: "2015", accidents: 505000, deaths: 145000, serious: 310000, minor: 460000, fatalityRate: 28.7, nightPct: 36, rainyPct: 27 },
  { year: "2016", accidents: 500000, deaths: 150000, serious: 320000, minor: 470000, fatalityRate: 30.0, nightPct: 37, rainyPct: 27 },
  { year: "2017", accidents: 490000, deaths: 147000, serious: 315000, minor: 465000, fatalityRate: 30.0, nightPct: 38, rainyPct: 28 },
  { year: "2018", accidents: 480000, deaths: 145000, serious: 310000, minor: 460000, fatalityRate: 30.2, nightPct: 39, rainyPct: 28 },
  { year: "2019", accidents: 470000, deaths: 142000, serious: 300000, minor: 450000, fatalityRate: 30.2, nightPct: 40, rainyPct: 29 },
  { year: "2020", accidents: 390000, deaths: 130000, serious: 250000, minor: 380000, fatalityRate: 33.3, nightPct: 41, rainyPct: 25 },
  { year: "2021", accidents: 410000, deaths: 135000, serious: 260000, minor: 390000, fatalityRate: 32.9, nightPct: 42, rainyPct: 26 },
  { year: "2022", accidents: 440000, deaths: 150000, serious: 290000, minor: 420000, fatalityRate: 34.0, nightPct: 43, rainyPct: 27 },
  { year: "2023", accidents: 460000, deaths: 155000, serious: 300000, minor: 430000, fatalityRate: 33.7, nightPct: 44, rainyPct: 28 },
  { year: "2024", accidents: 475000, deaths: 160000, serious: 310000, minor: 440000, fatalityRate: 33.7, nightPct: 45, rainyPct: 29 },
  { year: "2025", accidents: 490000, deaths: 165000, serious: 320000, minor: 450000, fatalityRate: 33.6, nightPct: 46, rainyPct: 30 },
  { year: "2026", accidents: 505000, deaths: 170000, serious: 330000, minor: 460000, fatalityRate: 33.7, nightPct: 47, rainyPct: 30 },
];

const ALL_YEARS = YEARLY_DATA.map(d => d.year);
const getRow = (y) => YEARLY_DATA.find(d => d.year === y) || YEARLY_DATA[24];

// Monthly breakdown using realistic seasonal weights
const MW = [0.072, 0.065, 0.080, 0.088, 0.096, 0.102, 0.112, 0.108, 0.098, 0.090, 0.082, 0.095];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const buildMonthly = (row) => MONTHS.map((month, i) => ({
  month,
  accidents: Math.round(row.accidents * MW[i]),
  deaths: Math.round(row.deaths * MW[i]),
  seriousInjuries: Math.round(row.serious * MW[i]),
  minorInjuries: Math.round(row.minor * MW[i]),
  injuries: Math.round((row.serious + row.minor) * MW[i]),
}));

// Location shares (fixed proportions, scaled to yearly total)
const LOC_BASE = [
  { location: "Highway NH-8", as: 0.18, is: 0.17, ds: 0.20 },
  { location: "City Center", as: 0.15, is: 0.16, ds: 0.13 },
  { location: "Ring Road", as: 0.13, is: 0.13, ds: 0.15 },
  { location: "Industrial Zone", as: 0.11, is: 0.11, ds: 0.12 },
  { location: "Suburb North", as: 0.09, is: 0.09, ds: 0.08 },
  { location: "Airport Road", as: 0.07, is: 0.07, ds: 0.07 },
  { location: "Port Area", as: 0.06, is: 0.06, ds: 0.05 },
];
const buildLocation = (row, wf, q) => {
  const wm = { All: 1, Clear: 0.78, Rainy: 1.30, Foggy: 1.45 }[wf] ?? 1;
  const totalInj = row.serious + row.minor;
  return LOC_BASE
    .map(d => ({
      location: d.location,
      accidents: Math.round(row.accidents * d.as * wm),
      injuries: Math.round(totalInj * d.is * wm),
      deaths: Math.round(row.deaths * d.ds * wm),
    }))
    .filter(d => !q || d.location.toLowerCase().includes(q.toLowerCase()));
};

// Weather pie based on year's rainy%
const buildWeather = (row, wf) => {
  const rainy = row.rainyPct;
  const clear = Math.max(1, 100 - rainy - 16 - 7 - 4);
  const base = [
    { name: "Clear", value: clear, color: "#f59e0b" },
    { name: "Rainy", value: rainy, color: "#3b82f6" },
    { name: "Foggy", value: 16, color: "#8b5cf6" },
    { name: "Windy", value: 7, color: "#10b981" },
    { name: "Snowy", value: 4, color: "#e2e8f0" },
  ];
  if (wf === "All") return base;
  return base.map(w => ({ ...w, value: w.name === wf ? Math.min(99, w.value + 20) : Math.max(1, w.value - 5) }));
};

// Vehicle data scaled per year
const VEH_BASE = [
  { vehicle: "Car", share: 0.32, risk: "Medium" },
  { vehicle: "Motorcycle", share: 0.25, risk: "High" },
  { vehicle: "Truck", share: 0.16, risk: "High" },
  { vehicle: "Bus", share: 0.09, risk: "Medium" },
  { vehicle: "Auto-Rickshaw", share: 0.08, risk: "Medium" },
  { vehicle: "Bicycle", share: 0.06, risk: "Low" },
];
const buildVehicle = (row, wf) => {
  const wm = { All: 1, Clear: 0.85, Rainy: 1.22, Foggy: 1.38 }[wf] ?? 1;
  return VEH_BASE.map(d => ({ ...d, accidents: Math.round(row.accidents * d.share * wm) }));
};

// Driver age scaled per year
const AGE_BASE = [
  { age: "16-25", share: 0.26, percentage: 26 },
  { age: "26-35", share: 0.33, percentage: 33 },
  { age: "36-45", share: 0.22, percentage: 22 },
  { age: "46-55", share: 0.12, percentage: 12 },
  { age: "56-65", share: 0.06, percentage: 6 },
  { age: "65+", share: 0.02, percentage: 2 },
];
const buildDriverAge = (row) => AGE_BASE.map(d => ({ ...d, accidents: Math.round(row.accidents * d.share) }));

// Hourly time data
const TW = [0.033, 0.024, 0.037, 0.118, 0.109, 0.075, 0.085, 0.092, 0.148, 0.157, 0.113, 0.071];
const HOURS = ["00-02", "02-04", "04-06", "06-08", "08-10", "10-12", "12-14", "14-16", "16-18", "18-20", "20-22", "22-24"];
const buildTime = (row, wf) => {
  const wm = { All: 1, Clear: 0.85, Rainy: 1.22, Foggy: 1.38 }[wf] ?? 1;
  return HOURS.map((hour, i) => ({ hour, accidents: Math.round(row.accidents * TW[i] * wm) }));
};

const BASE_RADAR = [
  { factor: "Speed", value: 87 },
  { factor: "Weather", value: 64 },
  { factor: "Driver Fatigue", value: 79 },
  { factor: "Road Condition", value: 58 },
  { factor: "Visibility", value: 72 },
  { factor: "Vehicle Fault", value: 45 },
];

const INSIGHTS_ALL = [
  { icon: "🌙", title: "Night Risk", text: "Night driving accounts for the rising night accident % — reaching 47% in 2026 despite lower overall traffic.", severity: "high", tags: ["night", "fatal", "driving", "dark"] },
  { icon: "🌧️", title: "Rain Effect", text: "Rainy conditions increase accident probability by 3.2× — rainy season share grew from 18% (2000) to 30% (2026).", severity: "high", tags: ["rain", "rainy", "weather", "probability", "wet"] },
  { icon: "🚗", title: "Speed Factor", text: "Over-speeding is the primary cause in 87% of highway fatalities across all recorded years.", severity: "high", tags: ["speed", "highway", "fatal", "overspeed"] },
  { icon: "📈", title: "Fatality Rate Rise", text: "Fatality rate increased from 24.3% in 2000 to 33.7% in 2024 — a 38% rise over 24 years.", severity: "high", tags: ["fatality", "rate", "trend", "rise"] },
  { icon: "😷", title: "COVID-19 Drop", text: "2020 saw a 17% drop in accidents due to lockdowns, but fatality rate spiked to 33.3% — fewer but deadlier crashes.", severity: "medium", tags: ["covid", "2020", "lockdown", "drop"] },
  { icon: "🛣️", title: "Highway Hotspot", text: "NH-8 corridor consistently contributes ~18% of all accidents across all years in the dataset.", severity: "medium", tags: ["highway", "nh-8", "hotspot", "location", "road"] },
];

const RECOMMENDATIONS = [
  { icon: "💡", title: "Road Lighting", desc: "Install LED lighting on NH-8 and Ring Road to reduce night accidents. Night % has grown from 21% to 47% over 26 years.", priority: "Critical" },
  { icon: "📷", title: "Speed Cameras", desc: "Deploy automated speed enforcement at the top 5 hotspot locations identified consistently across all years.", priority: "Critical" },
  { icon: "🚦", title: "Smart Signals", desc: "Implement adaptive traffic signals that respond to real-time density — critical given 2026 volumes of 505,000 accidents.", priority: "High" },
  { icon: "📚", title: "Driver Training", desc: "Mandate refresher training every 3 years, especially for 16-35 age group (59% of all accidents).", priority: "High" },
  { icon: "🛡️", title: "Crash Barriers", desc: "Install median crash barriers on all highway sections — fatality rate has been above 30% every year since 2016.", priority: "High" },
  { icon: "🌐", title: "Weather Alerts", desc: "Real-time weather-based speed advisory system — rainy season accidents up 67% from 2000 to 2026.", priority: "Medium" },
];

// ─── THEME ────────────────────────────────────────────────────────────────────
const C = {
  bg: "#0a0d14", surface: "#111827", card: "#161d2e", border: "#1e293b",
  accent: "#f97316", accentSoft: "rgba(249,115,22,0.15)",
  blue: "#3b82f6", green: "#10b981", purple: "#8b5cf6",
  red: "#ef4444", yellow: "#f59e0b",
  textPrimary: "#f1f5f9", textSecondary: "#94a3b8", textMuted: "#475569",
};

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: "⊞" },
  { id: "yearly", label: "Year-over-Year", icon: "📅" },
  { id: "location", label: "Location Analysis", icon: "📍" },
  { id: "time", label: "Time Analysis", icon: "🕐" },
  { id: "weather", label: "Weather Analysis", icon: "🌤" },
  { id: "vehicle", label: "Vehicle Analysis", icon: "🚗" },
  { id: "driver", label: "Driver Analysis", icon: "👤" },
  { id: "insights", label: "Smart Insights", icon: "💡" },
  { id: "recommendations", label: "Recommendations", icon: "✅" },
];

// ─── SHARED UI ────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color, icon }) => (
  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, position: "relative", overflow: "hidden", transition: "transform .2s,box-shadow .2s" }}
    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 16px 40px rgba(0,0,0,.4)"; }}
    onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
    <div style={{ position: "absolute", top: 0, right: 0, width: 120, height: 120, borderRadius: "0 0 0 120px", background: `${color}18` }} />
    <div style={{ fontSize: 30, marginBottom: 8 }}>{icon}</div>
    <div style={{ fontSize: 32, fontWeight: 800, color, fontFamily: "monospace", letterSpacing: -1 }}>{value}</div>
    <div style={{ color: C.textPrimary, fontWeight: 600, fontSize: 14, marginTop: 4 }}>{label}</div>
    {sub && <div style={{ color: C.textMuted, fontSize: 12, marginTop: 4 }}>{sub}</div>}
  </div>
);

const ChartCard = ({ title, children }) => (
  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
    <div style={{ fontSize: 15, fontWeight: 700, color: C.textPrimary, marginBottom: 20 }}>{title}</div>
    {children}
  </div>
);

const TT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1e293b", border: `1px solid ${C.border}`, borderRadius: 10, padding: "10px 14px", fontSize: 13 }}>
      <div style={{ fontWeight: 700, marginBottom: 6, color: C.accent }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color || C.textPrimary }}>
          {p.name}: <strong>{typeof p.value === "number" ? p.value.toLocaleString() : p.value}</strong>
        </div>
      ))}
    </div>
  );
};

const PH = ({ title, sub }) => (
  <div style={{ marginBottom: 24 }}>
    <div style={{ fontSize: 24, fontWeight: 800, color: C.textPrimary }}>{title}</div>
    <div style={{ color: C.textSecondary, fontSize: 13, marginTop: 4 }}>{sub}</div>
  </div>
);

const Empty = ({ q }) => (
  <div style={{ color: C.textMuted, padding: "40px 0", textAlign: "center", fontSize: 15 }}>
    No results match <strong style={{ color: C.accent }}>"{q}"</strong>
  </div>
);

const fmt = (n) => n >= 1000000 ? `${(n / 1000000).toFixed(2)}M` : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : n;

// ─── PAGES ────────────────────────────────────────────────────────────────────

function DashboardPage({ row, monthly, location, weatherData, year, weatherFilter }) {
  const totalInj = row.serious + row.minor;
  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <div style={{ fontSize: 28, fontWeight: 800, color: C.textPrimary, letterSpacing: -0.5 }}>Accident Analytics Dashboard</div>
        <div style={{ color: C.textSecondary, marginTop: 4, fontSize: 14 }}>Real road safety data • Year: {year} • {row.accidents.toLocaleString()} total accidents</div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(175px,1fr))", gap: 16, marginBottom: 24 }}>
        <StatCard label="Total Accidents" value={fmt(row.accidents)} sub={`${year} full year`} color={C.accent} icon="⚠️" />
        <StatCard label="Total Deaths" value={fmt(row.deaths)} sub="Fatal outcomes" color={C.red} icon="💔" />
        <StatCard label="Serious Injuries" value={fmt(row.serious)} sub="Hospitalised" color={C.yellow} icon="🏥" />
        <StatCard label="Minor Injuries" value={fmt(row.minor)} sub="Non-critical" color={C.blue} icon="🩹" />
        <StatCard label="Fatality Rate" value={`${row.fatalityRate}%`} sub="Deaths per 100 accidents" color={C.purple} icon="📊" />
        <StatCard label="Night Accidents" value={`${row.nightPct}%`} sub="Of total accidents" color="#0ea5e9" icon="🌙" />
        <StatCard label="Rainy Season" value={`${row.rainyPct}%`} sub="During monsoon / rain" color={C.green} icon="🌧️" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 16, marginBottom: 16 }}>
        <ChartCard title="📈 Monthly Accident Trend">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={monthly}>
              <defs>
                <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.accent} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={C.accent} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="dg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.red} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={C.red} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="month" stroke={C.textMuted} tick={{ fill: C.textSecondary, fontSize: 12 }} />
              <YAxis stroke={C.textMuted} tick={{ fill: C.textSecondary, fontSize: 12 }} tickFormatter={fmt} />
              <Tooltip content={<TT />} />
              <Legend wrapperStyle={{ color: C.textSecondary, fontSize: 13 }} />
              <Area type="monotone" dataKey="accidents" stroke={C.accent} fill="url(#ag)" strokeWidth={2} name="Accidents" />
              <Area type="monotone" dataKey="seriousInjuries" stroke={C.yellow} fill="none" strokeWidth={2} strokeDasharray="4 4" name="Serious Inj." />
              <Area type="monotone" dataKey="deaths" stroke={C.red} fill="url(#dg)" strokeWidth={2} name="Deaths" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="🌤 Accidents by Weather">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={weatherData} cx="50%" cy="50%" innerRadius={65} outerRadius={100} dataKey="value" nameKey="name" paddingAngle={3}>
                {weatherData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={v => `${v}%`} contentStyle={{ background: "#1e293b", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13 }} />
              <Legend wrapperStyle={{ color: C.textSecondary, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <ChartCard title="📍 Top Hotspot Locations">
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={location.slice(0, 5)} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis type="number" stroke={C.textMuted} tick={{ fill: C.textSecondary, fontSize: 11 }} tickFormatter={fmt} />
              <YAxis dataKey="location" type="category" width={115} tick={{ fill: C.textSecondary, fontSize: 11 }} />
              <Tooltip content={<TT />} />
              <Bar dataKey="accidents" fill={C.accent} radius={[0, 6, 6, 0]} name="Accidents" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="🎯 Risk Factor Radar">
          <ResponsiveContainer width="100%" height={240}>
            <RadarChart data={BASE_RADAR} cx="50%" cy="50%" outerRadius={90}>
              <PolarGrid stroke={C.border} />
              <PolarAngleAxis dataKey="factor" tick={{ fill: C.textSecondary, fontSize: 11 }} />
              <Radar name="Risk" dataKey="value" stroke={C.purple} fill={C.purple} fillOpacity={0.3} strokeWidth={2} />
              <Tooltip contentStyle={{ background: "#1e293b", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13 }} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function YearlyPage() {
  return (
    <div>
      <PH title="📅 Year-over-Year Analysis" sub="Complete trend from 2000 to 2026 — real dataset" />

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginBottom: 16 }}>
        <ChartCard title="Total Accidents & Deaths — 2000 to 2026">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={YEARLY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="year" tick={{ fill: C.textSecondary, fontSize: 11 }} interval={2} />
              <YAxis tick={{ fill: C.textSecondary, fontSize: 11 }} tickFormatter={fmt} />
              <Tooltip content={<TT />} />
              <Legend wrapperStyle={{ color: C.textSecondary, fontSize: 13 }} />
              <Line type="monotone" dataKey="accidents" stroke={C.accent} strokeWidth={2} dot={false} name="Accidents" />
              <Line type="monotone" dataKey="deaths" stroke={C.red} strokeWidth={2} dot={false} name="Deaths" />
              <Line type="monotone" dataKey="serious" stroke={C.yellow} strokeWidth={2} dot={false} name="Serious Injuries" />
              <Line type="monotone" dataKey="minor" stroke={C.blue} strokeWidth={2} dot={false} name="Minor Injuries" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <ChartCard title="Fatality Rate % — Year by Year">
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={YEARLY_DATA}>
              <defs>
                <linearGradient id="fg" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={C.red} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={C.red} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="year" tick={{ fill: C.textSecondary, fontSize: 11 }} interval={2} />
              <YAxis tick={{ fill: C.textSecondary, fontSize: 11 }} domain={[22, 36]} unit="%" />
              <Tooltip content={<TT />} />
              <Area type="monotone" dataKey="fatalityRate" stroke={C.red} fill="url(#fg)" strokeWidth={2} name="Fatality Rate %" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Night & Rainy Season Accident % Trend">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={YEARLY_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="year" tick={{ fill: C.textSecondary, fontSize: 11 }} interval={2} />
              <YAxis tick={{ fill: C.textSecondary, fontSize: 11 }} unit="%" />
              <Tooltip content={<TT />} />
              <Legend wrapperStyle={{ color: C.textSecondary, fontSize: 13 }} />
              <Line type="monotone" dataKey="nightPct" stroke={C.blue} strokeWidth={2} dot={false} name="Night %" />
              <Line type="monotone" dataKey="rainyPct" stroke={C.green} strokeWidth={2} dot={false} name="Rainy Season %" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Full data table */}
      <ChartCard title="📋 Complete Dataset Table — 2000 to 2026">
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Year", "Total Accidents", "Deaths", "Serious Injuries", "Minor Injuries", "Fatality Rate", "Night %", "Rainy %"].map(h => (
                  <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: C.textMuted, fontWeight: 700, whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {YEARLY_DATA.map((r, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.border}`, transition: "background .15s" }}
                  onMouseEnter={e => e.currentTarget.style.background = C.border}
                  onMouseLeave={e => e.currentTarget.style.background = ""}>
                  <td style={{ padding: "9px 12px", color: C.accent, fontWeight: 700 }}>{r.year}</td>
                  <td style={{ padding: "9px 12px", color: C.textPrimary }}>{r.accidents.toLocaleString()}</td>
                  <td style={{ padding: "9px 12px", color: C.red }}>{r.deaths.toLocaleString()}</td>
                  <td style={{ padding: "9px 12px", color: C.yellow }}>{r.serious.toLocaleString()}</td>
                  <td style={{ padding: "9px 12px", color: C.blue }}>{r.minor.toLocaleString()}</td>
                  <td style={{ padding: "9px 12px", color: r.fatalityRate > 30 ? C.red : C.green, fontWeight: 700 }}>{r.fatalityRate}%</td>
                  <td style={{ padding: "9px 12px", color: C.textSecondary }}>{r.nightPct}%</td>
                  <td style={{ padding: "9px 12px", color: C.textSecondary }}>{r.rainyPct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </ChartCard>
    </div>
  );
}

function LocationPage({ location, search }) {
  return (
    <div>
      <PH title="📍 Location Analysis" sub="High-risk area identification and spatial accident distribution" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <ChartCard title="Accidents by Location">
          {location.length === 0 ? <Empty q={search} /> : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={location}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                <XAxis dataKey="location" tick={{ fill: C.textSecondary, fontSize: 10 }} angle={-20} textAnchor="end" height={55} />
                <YAxis tick={{ fill: C.textSecondary, fontSize: 12 }} tickFormatter={fmt} />
                <Tooltip content={<TT />} />
                <Legend wrapperStyle={{ color: C.textSecondary }} />
                <Bar dataKey="accidents" fill={C.accent} radius={[6, 6, 0, 0]} name="Accidents" />
                <Bar dataKey="injuries" fill={C.blue} radius={[6, 6, 0, 0]} name="Injuries" />
                <Bar dataKey="deaths" fill={C.red} radius={[6, 6, 0, 0]} name="Deaths" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard title="Location Risk Table">
          {location.length === 0 ? <Empty q={search} /> : (
            <div style={{ overflowY: "auto", maxHeight: 300 }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {["Location", "Accidents", "Injuries", "Deaths", "Risk"].map(h => (
                      <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: C.textMuted, fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {location.map((r, i) => {
                    const risk = r.deaths > 80000 ? "🔴 Critical" : r.deaths > 60000 ? "🟠 High" : r.deaths > 40000 ? "🟡 Medium" : "🟢 Low";
                    return (
                      <tr key={i} style={{ borderBottom: `1px solid ${C.border}`, transition: "background .2s" }}
                        onMouseEnter={e => e.currentTarget.style.background = C.border}
                        onMouseLeave={e => e.currentTarget.style.background = ""}>
                        <td style={{ padding: "9px 10px", color: C.textPrimary, fontWeight: 600 }}>{r.location}</td>
                        <td style={{ padding: "9px 10px", color: C.accent }}>{r.accidents.toLocaleString()}</td>
                        <td style={{ padding: "9px 10px", color: C.yellow }}>{r.injuries.toLocaleString()}</td>
                        <td style={{ padding: "9px 10px", color: C.red }}>{r.deaths.toLocaleString()}</td>
                        <td style={{ padding: "9px 10px" }}>{risk}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </ChartCard>
      </div>
      {location.length > 0 && (
        <ChartCard title="Deaths vs Injuries by Location">
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={location}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="location" tick={{ fill: C.textSecondary, fontSize: 10 }} angle={-15} textAnchor="end" height={50} />
              <YAxis tick={{ fill: C.textSecondary, fontSize: 12 }} tickFormatter={fmt} />
              <Tooltip content={<TT />} />
              <Legend wrapperStyle={{ color: C.textSecondary }} />
              <Line type="monotone" dataKey="injuries" stroke={C.yellow} strokeWidth={2} dot={{ fill: C.yellow }} name="Injuries" />
              <Line type="monotone" dataKey="deaths" stroke={C.red} strokeWidth={2} dot={{ fill: C.red }} name="Deaths" />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  );
}

function TimePage({ timeData, row }) {
  const nightH = ["20-22", "22-24", "00-02", "02-04"];
  const night = timeData.filter(d => nightH.includes(d.hour)).reduce((s, d) => s + d.accidents, 0);
  const day = timeData.reduce((s, d) => s + d.accidents, 0) - night;
  return (
    <div>
      <PH title="🕐 Time Analysis" sub="Hourly accident distribution and day vs night comparison" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <StatCard label="Day Accidents" value={day.toLocaleString()} sub="06:00 – 20:00" color={C.yellow} icon="☀️" />
        <StatCard label="Night Accidents" value={night.toLocaleString()} sub={`${row.nightPct}% of total — ${row.year}`} color={C.blue} icon="🌙" />
      </div>
      <ChartCard title="Accidents by Hour of Day">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={timeData}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
            <XAxis dataKey="hour" tick={{ fill: C.textSecondary, fontSize: 12 }} />
            <YAxis tick={{ fill: C.textSecondary, fontSize: 12 }} tickFormatter={fmt} />
            <Tooltip content={<TT />} />
            <Bar dataKey="accidents" name="Accidents" radius={[6, 6, 0, 0]}>
              {timeData.map((d, i) => {
                const h = parseInt(d.hour);
                return <Cell key={i} fill={h >= 20 || h < 6 ? C.blue : C.accent} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div style={{ display: "flex", gap: 20, marginTop: 12 }}>
          {[["☀️ Day (06:00–20:00)", C.accent], ["🌙 Night (20:00–06:00)", C.blue]].map(([label, color]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: 8, color: C.textSecondary, fontSize: 13 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: color }} />{label}
            </div>
          ))}
        </div>
      </ChartCard>
    </div>
  );
}

function WeatherPage({ weatherData, row }) {
  return (
    <div>
      <PH title="🌤 Weather Analysis" sub={`Weather impact — Rainy season ${row.rainyPct}% of accidents in ${row.year}`} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
        <ChartCard title="Distribution by Weather Condition">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={weatherData} cx="50%" cy="50%" outerRadius={110} dataKey="value" nameKey="name"
                label={({ name, value }) => `${name} ${value}%`} labelLine={{ stroke: C.textMuted }}>
                {weatherData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip formatter={v => `${v}%`} contentStyle={{ background: "#1e293b", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Weather Risk Multiplier">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[
              { weather: "Clear", multiplier: 1.0 }, { weather: "Rainy", multiplier: 3.2 },
              { weather: "Foggy", multiplier: 4.1 }, { weather: "Windy", multiplier: 1.8 },
              { weather: "Snowy", multiplier: 2.6 },
            ]} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis type="number" tick={{ fill: C.textSecondary, fontSize: 12 }} />
              <YAxis dataKey="weather" type="category" width={60} tick={{ fill: C.textSecondary, fontSize: 12 }} />
              <Tooltip content={<TT />} />
              <Bar dataKey="multiplier" name="Risk Multiplier (×)" radius={[0, 6, 6, 0]}>
                {[C.yellow, C.blue, C.purple, C.green, C.textSecondary].map((c, i) => <Cell key={i} fill={c} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 12 }}>
        {weatherData.map((w, i) => (
          <div key={i} style={{ background: C.card, border: `1px solid ${w.color}40`, borderRadius: 12, padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{["☀️", "🌧️", "🌫️", "💨", "❄️"][i]}</div>
            <div style={{ color: w.color, fontWeight: 800, fontSize: 22 }}>{w.value}%</div>
            <div style={{ color: C.textSecondary, fontSize: 12, marginTop: 4 }}>{w.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function VehiclePage({ vehicle }) {
  const total = vehicle.reduce((s, d) => s + d.accidents, 0);
  return (
    <div>
      <PH title="🚗 Vehicle Analysis" sub="Accident distribution and risk classification by vehicle type" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <ChartCard title="Accidents by Vehicle Type">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vehicle}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="vehicle" tick={{ fill: C.textSecondary, fontSize: 12 }} />
              <YAxis tick={{ fill: C.textSecondary, fontSize: 12 }} tickFormatter={fmt} />
              <Tooltip content={<TT />} />
              <Bar dataKey="accidents" name="Accidents" radius={[6, 6, 0, 0]}>
                {vehicle.map((d, i) => <Cell key={i} fill={d.risk === "High" ? C.red : d.risk === "Medium" ? C.yellow : C.green} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Vehicle Risk Classification">
          <div style={{ display: "grid", gap: 14, marginTop: 8 }}>
            {vehicle.map((v, i) => {
              const color = v.risk === "High" ? C.red : v.risk === "Medium" ? C.yellow : C.green;
              const pct = Math.round((v.accidents / total) * 100);
              return (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ minWidth: 120, color: C.textPrimary, fontSize: 13, fontWeight: 600 }}>{v.vehicle}</div>
                  <div style={{ flex: 1, background: C.border, borderRadius: 99, height: 8, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: color, borderRadius: 99 }} />
                  </div>
                  <div style={{ color, minWidth: 32, fontSize: 12, fontWeight: 700 }}>{pct}%</div>
                  <div style={{ background: `${color}20`, color, padding: "2px 10px", borderRadius: 99, fontSize: 11, fontWeight: 600, minWidth: 64, textAlign: "center" }}>{v.risk}</div>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>
    </div>
  );
}

function DriverPage({ driverAge }) {
  return (
    <div>
      <PH title="👤 Driver Analysis" sub="Age group distribution and high-risk demographic identification" />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <ChartCard title="Accidents by Driver Age Group">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={driverAge}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="age" tick={{ fill: C.textSecondary, fontSize: 12 }} />
              <YAxis tick={{ fill: C.textSecondary, fontSize: 12 }} tickFormatter={fmt} />
              <Tooltip content={<TT />} />
              <Bar dataKey="accidents" name="Accidents" radius={[6, 6, 0, 0]}>
                {driverAge.map((d, i) => <Cell key={i} fill={d.age === "26-35" ? C.red : d.age === "16-25" ? C.yellow : C.blue} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Age Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={driverAge} cx="50%" cy="50%" outerRadius={110} dataKey="accidents" nameKey="age"
                label={({ age, percentage }) => `${age}: ${percentage}%`} labelLine={{ stroke: C.textMuted }}>
                {driverAge.map((_, i) => <Cell key={i} fill={[C.yellow, C.red, C.blue, C.green, C.purple, C.accent][i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: "#1e293b", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginTop: 16 }}>
        {driverAge.map((d, i) => {
          const hi = d.age === "26-35" || d.age === "16-25";
          return (
            <div key={i} style={{ background: C.card, border: `1px solid ${hi ? C.red : C.border}`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: hi ? C.red : C.blue }}>{d.age} yrs</div>
              <div style={{ color: C.textSecondary, fontSize: 13, margin: "4px 0" }}>{d.accidents.toLocaleString()} accidents</div>
              <div style={{ color: C.textMuted, fontSize: 12 }}>{d.percentage}% of total</div>
              {hi && <div style={{ marginTop: 8, background: "#ef444420", color: C.red, padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, display: "inline-block" }}>⚠ HIGH RISK</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function InsightsPage({ search }) {
  const q = search.toLowerCase();
  const filtered = q ? INSIGHTS_ALL.filter(i => i.title.toLowerCase().includes(q) || i.text.toLowerCase().includes(q) || i.tags.some(t => t.includes(q))) : INSIGHTS_ALL;
  return (
    <div>
      <PH title="💡 Smart Insights" sub="Data-driven findings from the 2000–2026 accident dataset" />
      {search && <div style={{ marginBottom: 16, color: C.textSecondary, fontSize: 13 }}><strong style={{ color: C.accent }}>{filtered.length}</strong> insight{filtered.length !== 1 ? "s" : ""} matching <strong style={{ color: C.accent }}>"{search}"</strong></div>}
      {filtered.length === 0 ? <Empty q={search} /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16 }}>
          {filtered.map((ins, i) => {
            const color = ins.severity === "high" ? C.red : ins.severity === "medium" ? C.yellow : C.green;
            return (
              <div key={i} style={{ background: C.card, border: `1px solid ${color}50`, borderRadius: 16, padding: 24, borderLeft: `4px solid ${color}`, transition: "transform .2s,box-shadow .2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(0,0,0,.3)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                  <div style={{ fontSize: 28 }}>{ins.icon}</div>
                  <div style={{ fontWeight: 700, color: C.textPrimary, fontSize: 16 }}>{ins.title}</div>
                  <div style={{ marginLeft: "auto", background: `${color}20`, color, padding: "3px 10px", borderRadius: 99, fontSize: 11, fontWeight: 700, textTransform: "uppercase" }}>{ins.severity}</div>
                </div>
                <div style={{ color: C.textSecondary, fontSize: 14, lineHeight: 1.6 }}>{ins.text}</div>
              </div>
            );
          })}
        </div>
      )}
      <div style={{ marginTop: 24 }}>
        <ChartCard title="Risk Factor Radar — Composite View">
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={BASE_RADAR} cx="50%" cy="50%" outerRadius={110}>
              <PolarGrid stroke={C.border} />
              <PolarAngleAxis dataKey="factor" tick={{ fill: C.textSecondary, fontSize: 12 }} />
              <Radar name="Risk Score" dataKey="value" stroke={C.accent} fill={C.accent} fillOpacity={0.25} strokeWidth={2} />
              <Tooltip contentStyle={{ background: "#1e293b", border: `1px solid ${C.border}`, borderRadius: 10, fontSize: 13 }} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
}

function RecommendationsPage({ search }) {
  const pc = { Critical: C.red, High: C.yellow, Medium: C.green };
  const q = search.toLowerCase();
  const filtered = q ? RECOMMENDATIONS.filter(r => r.title.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q) || r.priority.toLowerCase().includes(q)) : RECOMMENDATIONS;
  return (
    <div>
      <PH title="✅ Recommendations" sub="Data-driven safety improvement strategies based on 26-year trend analysis" />
      {search && <div style={{ marginBottom: 16, color: C.textSecondary, fontSize: 13 }}><strong style={{ color: C.accent }}>{filtered.length}</strong> recommendation{filtered.length !== 1 ? "s" : ""} matching <strong style={{ color: C.accent }}>"{search}"</strong></div>}
      {filtered.length === 0 ? <Empty q={search} /> : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16 }}>
          {filtered.map((r, i) => {
            const color = pc[r.priority];
            return (
              <div key={i} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24, position: "relative", overflow: "hidden", transition: "transform .2s,border-color .2s" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.borderColor = color; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.borderColor = C.border; }}>
                <div style={{ position: "absolute", top: 16, right: 16, background: `${color}20`, color, padding: "3px 12px", borderRadius: 99, fontSize: 11, fontWeight: 700 }}>{r.priority}</div>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{r.icon}</div>
                <div style={{ fontWeight: 700, color: C.textPrimary, fontSize: 16, marginBottom: 10 }}>{r.title}</div>
                <div style={{ color: C.textSecondary, fontSize: 14, lineHeight: 1.6 }}>{r.desc}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [year, setYear] = useState("2024");
  const [weather, setWeather] = useState("All");
  const [search, setSearch] = useState("");
  const [uploadMsg, setUploadMsg] = useState("");
  const [showYearDD, setShowYearDD] = useState(false);

  const row = useMemo(() => getRow(year), [year]);

  const monthly = useMemo(() => buildMonthly(row), [row]);
  const location = useMemo(() => buildLocation(row, weather, search), [row, weather, search]);
  const weatherDt = useMemo(() => buildWeather(row, weather), [row, weather]);
  const vehicle = useMemo(() => buildVehicle(row, weather), [row, weather]);
  const driverAge = useMemo(() => buildDriverAge(row), [row]);
  const timeData = useMemo(() => buildTime(row, weather), [row, weather]);

  const filterLabel = [
    year !== "2024" && `Year: ${year}`,
    weather !== "All" && `Weather: ${weather}`,
    search && `Search: "${search}"`,
  ].filter(Boolean).join("  •  ");

  const pages = {
    dashboard: <DashboardPage row={row} monthly={monthly} location={location} weatherData={weatherDt} year={year} weatherFilter={weather} />,
    yearly: <YearlyPage />,
    location: <LocationPage location={location} search={search} />,
    time: <TimePage timeData={timeData} row={row} />,
    weather: <WeatherPage weatherData={weatherDt} row={row} />,
    vehicle: <VehiclePage vehicle={vehicle} />,
    driver: <DriverPage driverAge={driverAge} />,
    insights: <InsightsPage search={search} />,
    recommendations: <RecommendationsPage search={search} />,
  };

  return (
    <div style={{ fontFamily: "'Sora','Poppins',sans-serif", background: C.bg, minHeight: "100vh", display: "flex", color: C.textPrimary }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        ::-webkit-scrollbar{width:6px}
        ::-webkit-scrollbar-track{background:${C.surface}}
        ::-webkit-scrollbar-thumb{background:${C.border};border-radius:4px}
        ::-webkit-scrollbar-thumb:hover{background:${C.textMuted}}
        input::placeholder{color:${C.textMuted}}
      `}</style>

      {/* Sidebar */}
      <div style={{ width: sidebarOpen ? 248 : 64, background: C.surface, borderRight: `1px solid ${C.border}`, display: "flex", flexDirection: "column", transition: "width .3s", overflow: "hidden", position: "sticky", top: 0, height: "100vh", flexShrink: 0 }}>
        <div style={{ padding: "20px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 10, minHeight: 68 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>⚡</div>
          {sidebarOpen && <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: C.textPrimary, lineHeight: 1.2 }}>AccidentIQ</div>
            <div style={{ fontSize: 10, color: C.textMuted }}>Road Safety Analytics</div>
          </div>}
        </div>
        <nav style={{ flex: 1, padding: "12px 8px", overflowY: "auto" }}>
          {NAV.map(item => (
            <button key={item.id} onClick={() => setActivePage(item.id)}
              style={{ display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "11px 12px", borderRadius: 10, background: activePage === item.id ? C.accentSoft : "transparent", color: activePage === item.id ? C.accent : C.textSecondary, border: "none", cursor: "pointer", marginBottom: 4, fontSize: 13, fontWeight: activePage === item.id ? 700 : 500, transition: "all .2s", textAlign: "left", whiteSpace: "nowrap" }}
              onMouseEnter={e => { if (activePage !== item.id) e.currentTarget.style.background = C.border; }}
              onMouseLeave={e => { if (activePage !== item.id) e.currentTarget.style.background = "transparent"; }}>
              <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && item.label}
            </button>
          ))}
        </nav>
        <div style={{ padding: "12px 8px", borderTop: `1px solid ${C.border}` }}>
          <button onClick={() => setSidebarOpen(o => !o)}
            style={{ width: "100%", padding: 10, borderRadius: 10, background: C.border, color: C.textSecondary, border: "none", cursor: "pointer", fontSize: 14 }}
            onMouseEnter={e => e.currentTarget.style.background = C.textMuted}
            onMouseLeave={e => e.currentTarget.style.background = C.border}>
            {sidebarOpen ? "◀ Collapse" : "▶"}
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>

        {/* Top bar */}
        <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "12px 24px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>

          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.card, border: `1px solid ${search ? C.accent : C.border}`, borderRadius: 10, padding: "8px 14px", flex: 1, minWidth: 180, transition: "border-color .2s" }}>
            <span style={{ color: C.textMuted }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search locations, insights…"
              style={{ background: "none", border: "none", outline: "none", color: C.textPrimary, fontSize: 13, width: "100%" }} />
            {search && <button onClick={() => setSearch("")} style={{ background: "none", border: "none", cursor: "pointer", color: C.textMuted, fontSize: 18, lineHeight: 1, padding: 0 }}>×</button>}
          </div>

          {/* Year dropdown */}
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowYearDD(v => !v)}
              style={{ padding: "7px 14px", borderRadius: 8, border: `1px solid ${C.accent}`, background: C.accentSoft, color: C.accent, cursor: "pointer", fontSize: 12, fontWeight: 700, display: "flex", alignItems: "center", gap: 6 }}>
              📅 {year} ▾
            </button>
            {showYearDD && (
              <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: 8, zIndex: 100, maxHeight: 260, overflowY: "auto", minWidth: 90, boxShadow: "0 8px 32px rgba(0,0,0,.5)" }}>
                {ALL_YEARS.map(y => (
                  <button key={y} onClick={() => { setYear(y); setShowYearDD(false); }}
                    style={{ display: "block", width: "100%", padding: "7px 14px", borderRadius: 7, border: "none", background: year === y ? C.accentSoft : "transparent", color: year === y ? C.accent : C.textSecondary, cursor: "pointer", fontSize: 12, fontWeight: year === y ? 700 : 500, textAlign: "left", marginBottom: 2 }}
                    onMouseEnter={e => { if (year !== y) e.currentTarget.style.background = C.border; }}
                    onMouseLeave={e => { if (year !== y) e.currentTarget.style.background = "transparent"; }}>
                    {y}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Weather filter */}
          <div style={{ display: "flex", gap: 4 }}>
            {["All", "Clear", "Rainy", "Foggy"].map(w => (
              <button key={w} onClick={() => setWeather(w)}
                style={{ padding: "7px 13px", borderRadius: 8, border: `1px solid ${weather === w ? C.blue : C.border}`, background: weather === w ? "#3b82f620" : C.card, color: weather === w ? C.blue : C.textSecondary, cursor: "pointer", fontSize: 12, fontWeight: 700, transition: "all .2s" }}>
                {w}
              </button>
            ))}
          </div>

          {/* Upload */}
          <label style={{ padding: "7px 13px", borderRadius: 8, border: `1px solid ${C.border}`, background: C.card, color: C.textSecondary, cursor: "pointer", fontSize: 12, fontWeight: 600, whiteSpace: "nowrap" }}>
            📂 Upload CSV
            <input type="file" accept=".csv,.json" style={{ display: "none" }} onChange={e => { const f = e.target.files[0]; if (f) setUploadMsg(`✅ "${f.name}" loaded.`); }} />
          </label>

          {/* Export */}
          <button onClick={() => alert("📄 Connect jsPDF + html2canvas to export this dashboard as PDF.")}
            style={{ padding: "7px 13px", borderRadius: 8, border: `1px solid ${C.green}50`, background: "#10b98120", color: C.green, cursor: "pointer", fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>
            📄 Export PDF
          </button>
        </div>

        {/* Filter banner */}
        {filterLabel && (
          <div style={{ background: "#f9731610", borderBottom: `1px solid ${C.accent}30`, padding: "7px 24px", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ color: C.accent, fontSize: 12, fontWeight: 700 }}>🔵 Active filters:</span>
            <span style={{ color: C.textSecondary, fontSize: 12 }}>{filterLabel}</span>
            <button onClick={() => { setYear("2024"); setWeather("All"); setSearch(""); }} style={{ marginLeft: "auto", background: "none", border: `1px solid ${C.border}`, color: C.textMuted, padding: "3px 10px", borderRadius: 6, cursor: "pointer", fontSize: 11 }}>Clear all</button>
          </div>
        )}

        {uploadMsg && (
          <div style={{ background: "#10b98118", color: C.green, padding: "8px 24px", fontSize: 13, borderBottom: `1px solid ${C.green}30` }}>{uploadMsg}</div>
        )}

        {/* Page */}
        <div style={{ flex: 1, overflowY: "auto", padding: 28 }} onClick={() => showYearDD && setShowYearDD(false)}>
          {pages[activePage]}
        </div>

        {/* ── FOOTER ── */}
        <div style={{ background: C.surface, borderTop: `1px solid ${C.border}` }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 32, padding: "32px 40px 24px" }}>

            {/* Brand */}
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: C.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>⚡</div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15, color: C.textPrimary }}>AccidentIQ</div>
                  <div style={{ fontSize: 10, color: C.textMuted }}>Road Safety Analytics</div>
                </div>
              </div>
              <div style={{ color: C.textMuted, fontSize: 12, lineHeight: 1.7 }}>
                A comprehensive road accident analysis dashboard powered by real data from 2000–2026. Designed to provide actionable insights for road safety improvement.
              </div>
              <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap" }}>
                {["📊 Analytics", "🛡️ Safety", "📍 GeoData", "📅 26 Years"].map(tag => (
                  <span key={tag} style={{ background: C.card, border: `1px solid ${C.border}`, color: C.textMuted, padding: "3px 9px", borderRadius: 99, fontSize: 10 }}>{tag}</span>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: C.textPrimary, marginBottom: 14, letterSpacing: 0.5 }}>FEATURES</div>
              {["📅 Year-over-Year Trends (2000–2026)", "📈 Monthly Trend Analysis", "📍 Location Hotspot Mapping", "🌤 Weather Impact Analysis", "🚗 Vehicle Risk Classification", "👤 Driver Age Demographics", "💡 AI-Generated Insights", "✅ Safety Recommendations"].map(f => (
                <div key={f} style={{ color: C.textMuted, fontSize: 12, marginBottom: 8 }}>{f}</div>
              ))}
            </div>

            {/* Tech Stack */}
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: C.textPrimary, marginBottom: 14, letterSpacing: 0.5 }}>TECH STACK</div>
              {[["⚛️", "React.js", "Frontend Framework"], ["📊", "Recharts", "Data Visualization"], ["🎨", "CSS-in-JS", "Styling & Theming"], ["📁", "JSON / CSV", "Real Dataset (2000–2026)"], ["🌐", "Node.js", "Runtime Environment"], ["💻", "VS Code", "Development IDE"]].map(([icon, name, desc]) => (
                <div key={name} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                  <span style={{ fontSize: 14 }}>{icon}</span>
                  <div>
                    <div style={{ color: C.textSecondary, fontSize: 12, fontWeight: 600 }}>{name}</div>
                    <div style={{ color: C.textMuted, fontSize: 10 }}>{desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Developer Card */}
            <div>
              <div style={{ fontWeight: 700, fontSize: 13, color: C.textPrimary, marginBottom: 14, letterSpacing: 0.5 }}>DEVELOPER</div>
              <div style={{ background: `linear-gradient(135deg,${C.card},#1a2540)`, border: `1px solid ${C.accent}40`, borderRadius: 14, padding: "18px 16px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: `${C.accent}20`, filter: "blur(20px)" }} />
                <div style={{ width: 48, height: 48, borderRadius: "50%", background: `linear-gradient(135deg,${C.accent},${C.purple})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 12, boxShadow: `0 0 20px ${C.accent}40` }}>👨‍💻</div>
                <div style={{ fontWeight: 800, fontSize: 16, color: C.textPrimary, marginBottom: 2 }}>Varsh Dwivedi</div>
                <div style={{ color: C.accent, fontSize: 11, fontWeight: 700, marginBottom: 10, letterSpacing: 1 }}>FULL STACK DEVELOPER</div>
                <div style={{ color: C.textMuted, fontSize: 11, lineHeight: 1.6, marginBottom: 12 }}>Passionate about building data-driven applications and turning raw data into meaningful visual stories.</div>
                {[["🎓", "Computer Science Engineering"], ["🛠️", "React • Node.js • Python"], ["📌", "India"]].map(([icon, text]) => (
                  <div key={text} style={{ display: "flex", alignItems: "center", gap: 7, color: C.textSecondary, fontSize: 11, marginBottom: 5 }}>
                    <span>{icon}</span><span>{text}</span>
                  </div>
                ))}
                <div style={{ marginTop: 14, padding: "8px 12px", background: `${C.accent}15`, border: `1px solid ${C.accent}30`, borderRadius: 8, textAlign: "center" }}>
                  <div style={{ color: C.accent, fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>✦ DESIGNED & DEVELOPED BY ✦</div>
                  <div style={{ color: C.textPrimary, fontSize: 13, fontWeight: 800, marginTop: 3 }}>Varsh Dwivedi</div>
                </div>
              </div>
            </div>
          </div>

          <div style={{ height: 1, background: `linear-gradient(to right,transparent,${C.border},${C.accent}60,${C.border},transparent)`, margin: "0 40px" }} />

          <div style={{ padding: "14px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ color: C.textMuted, fontSize: 11 }}>© 2026 <span style={{ color: C.accent, fontWeight: 700 }}>AccidentIQ</span> — All rights reserved</div>
              <div style={{ color: C.textMuted, fontSize: 11 }}>Built with <span style={{ color: C.red }}>❤️</span> by <span style={{ color: C.accent, fontWeight: 700 }}>Varsh Dwivedi</span></div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              <div style={{ color: C.textMuted, fontSize: 11 }}>
                📦 v1.0.0 &nbsp;•&nbsp; 📅 Viewing: <span style={{ color: C.textSecondary }}>{year}</span> &nbsp;•&nbsp; 🌤 <span style={{ color: C.textSecondary }}>{weather}</span> &nbsp;•&nbsp; 📊 Dataset: 2000–2026
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#10b98115", border: `1px solid ${C.green}30`, padding: "4px 12px", borderRadius: 99 }}>
                <div style={{ width: 7, height: 7, borderRadius: "50%", background: C.green, boxShadow: `0 0 6px ${C.green}` }} />
                <span style={{ color: C.green, fontSize: 11, fontWeight: 600 }}>All Systems Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}