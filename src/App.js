import { useState, useMemo, useEffect, useCallback } from "react";
import api, { token as tokenStore } from "./api";

// ─── Styles ────────────────────────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg-app:    #0d1117;
    --bg-side:   #161b22;
    --bg-card:   #161b22;
    --bg-input:  #0d1117;
    --bg-info:   #1c2333;
    --border:    #21262d;
    --text-1:    #e6edf3;
    --text-2:    #8b949e;
    --text-3:    #484f58;
    --accent:    #e84c4c;
    --accent2:   #4fc3ea;
    --green:     #3fb950;
    --amber:     #d29922;
    --font-main: 'DM Sans', sans-serif;
    --font-mono: 'DM Mono', monospace;
    --radius-sm: 6px;
    --radius-md: 8px;
    --radius-lg: 10px;
  }

  body { font-family: var(--font-main); background: var(--bg-app); color: var(--text-1); }

  .crm-root { display: flex; height: 100vh; overflow: hidden; }

  /* ── Sidebar ── */
  .sidebar {
    width: 220px; min-width: 220px;
    background: var(--bg-side);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
  }
  .sidebar-logo {
    padding: 22px 18px 18px;
    border-bottom: 1px solid var(--border);
  }
  .logo-wordmark { font-size: 22px; font-weight: 700; color: var(--accent2); font-style: italic; letter-spacing: -0.5px; line-height: 1; }
  .logo-wordmark span { color: var(--text-1); }
  .logo-tagline { font-size: 10px; color: var(--text-3); text-transform: uppercase; letter-spacing: 1.2px; margin-top: 3px; }

  .sidebar-nav { padding: 14px 0; flex: 1; overflow-y: auto; }
  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 18px; cursor: pointer;
    font-size: 13px; color: var(--text-2);
    border-left: 2px solid transparent;
    transition: background 0.12s, color 0.12s, border-color 0.12s;
    user-select: none;
  }
  .nav-item:hover { background: rgba(255,255,255,0.04); color: var(--text-1); }
  .nav-item.active { color: var(--text-1); background: rgba(255,255,255,0.06); border-left-color: var(--accent); }
  .nav-dot { width: 8px; height: 8px; border-radius: 50%; border: 1.5px solid var(--text-3); flex-shrink: 0; transition: background 0.12s, border-color 0.12s; }
  .nav-item.active .nav-dot { background: var(--accent); border-color: var(--accent); }

  .sidebar-section { padding: 14px 18px; border-top: 1px solid var(--border); }
  .sidebar-label { font-size: 10px; color: var(--text-3); text-transform: uppercase; letter-spacing: 1px; margin-bottom: 7px; }
  .sidebar-input {
    width: 100%; background: var(--bg-input); border: 1px solid var(--border);
    border-radius: var(--radius-sm); padding: 7px 10px; font-size: 12px;
    color: var(--text-2); outline: none; font-family: var(--font-main);
    transition: border-color 0.15s;
  }
  .sidebar-input:focus { border-color: var(--accent2); color: var(--text-1); }

  .quick-stats-row { display: flex; gap: 20px; margin-top: 8px; }
  .qs-item label { font-size: 11px; color: var(--text-3); display: block; }
  .qs-item .qs-val { font-size: 22px; font-weight: 700; color: var(--text-1); line-height: 1.2; }

  .sidebar-footer { padding: 10px 18px; border-top: 1px solid var(--border); font-size: 11px; color: var(--text-3); }

  /* ── Main ── */
  .main { flex: 1; overflow-y: auto; background: var(--bg-app); }
  .main::-webkit-scrollbar { width: 4px; }
  .main::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

  .page { padding: 32px 36px; animation: fadeIn 0.18s ease; }
  @keyframes fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }

  .page-title { font-size: 30px; font-weight: 700; color: var(--text-1); margin-bottom: 26px; }

  /* ── Stat cards ── */
  .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 24px; }
  .stat-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 16px; }
  .stat-card .sc-label { font-size: 12px; color: var(--text-2); margin-bottom: 6px; display: flex; align-items: center; gap: 5px; }
  .stat-card .sc-value { font-size: 30px; font-weight: 700; color: var(--text-1); font-family: var(--font-mono); }

  /* ── Section card / accordion ── */
  .section-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-lg); margin-bottom: 16px; overflow: hidden; }
  .section-hdr { display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; cursor: pointer; }
  .section-hdr-title { font-size: 14px; color: var(--text-1); font-weight: 500; }
  .section-body { padding: 16px 18px; border-top: 1px solid var(--border); }

  /* ── Info box (empty state) ── */
  .info-box { background: var(--bg-info); border-radius: var(--radius-md); padding: 14px 18px; font-size: 13px; color: var(--text-2); }

  /* ── Tabs ── */
  .tabs { display: flex; border-bottom: 1px solid var(--border); margin-bottom: 22px; gap: 2px; }
  .tab { padding: 10px 16px; font-size: 13px; color: var(--text-2); cursor: pointer; border-bottom: 2px solid transparent; transition: color 0.12s, border-color 0.12s; user-select: none; }
  .tab:hover { color: var(--text-1); }
  .tab.active { color: var(--accent); border-bottom-color: var(--accent); }

  /* ── Filters row ── */
  .filters-row { display: grid; gap: 16px; margin-bottom: 14px; }
  .filter-group label { font-size: 11px; color: var(--text-2); display: block; margin-bottom: 5px; }

  /* ── Form elements ── */
  .crm-select, .crm-input {
    width: 100%; background: var(--bg-input); border: 1px solid var(--border);
    border-radius: var(--radius-sm); padding: 8px 10px; font-size: 13px;
    color: var(--text-1); outline: none; font-family: var(--font-main);
    transition: border-color 0.15s;
  }
  .crm-select:focus, .crm-input:focus { border-color: var(--accent2); }
  .crm-select option { background: #1c2333; }
  input[type="range"].crm-range { accent-color: var(--accent); width: 100%; }
  .slider-labels { display: flex; justify-content: space-between; font-size: 11px; color: var(--text-3); margin-top: 2px; }

  .num-input-wrap { display: flex; align-items: center; gap: 4px; }
  .num-btn { background: var(--border); border: none; color: var(--text-2); width: 28px; height: 28px; border-radius: 4px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center; transition: background 0.12s; }
  .num-btn:hover { background: #30363d; color: var(--text-1); }

  .form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
  .form-group label { font-size: 11px; color: var(--text-2); display: block; margin-bottom: 5px; }
  .form-group.full { grid-column: 1 / -1; }

  .btn { padding: 9px 20px; border-radius: var(--radius-sm); font-size: 13px; font-weight: 500; cursor: pointer; border: none; font-family: var(--font-main); transition: background 0.15s, transform 0.1s; }
  .btn:active { transform: scale(0.98); }
  .btn-primary { background: var(--accent); color: #fff; }
  .btn-primary:hover { background: #c73a3a; }
  .btn-danger { background: #7d1f1f; color: #fca5a5; }
  .btn-danger:hover { background: #991f1f; }
  .btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text-2); }
  .btn-outline:hover { background: rgba(255,255,255,0.04); color: var(--text-1); }

  /* ── Table ── */
  .table-wrap { overflow-x: auto; }
  table.crm-table { width: 100%; border-collapse: collapse; font-size: 13px; }
  .crm-table th { text-align: left; color: var(--text-3); font-weight: 500; padding: 8px 12px; border-bottom: 1px solid var(--border); font-size: 11px; text-transform: uppercase; letter-spacing: 0.5px; }
  .crm-table td { padding: 10px 12px; border-bottom: 1px solid #1a1f26; color: var(--text-2); }
  .crm-table tr:last-child td { border-bottom: none; }
  .crm-table tr:hover td { background: rgba(255,255,255,0.025); }

  /* ── Badges ── */
  .badge { display: inline-block; padding: 2px 9px; border-radius: 4px; font-size: 11px; font-weight: 600; letter-spacing: 0.2px; }
  .badge-open { background: #112240; color: #4fc3ea; }
  .badge-won  { background: #0f2d18; color: #3fb950; }
  .badge-lost { background: #2d0f0f; color: #e84c4c; }
  .badge-call     { background: #2d2500; color: #d29922; }
  .badge-email    { background: #1c2333; color: #8b949e; }
  .badge-meeting  { background: #1a1a3a; color: #a78bfa; }
  .badge-note     { background: #1f2d1f; color: #3fb950; }

  /* ── Pipeline stats ── */
  .pipeline-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0; margin-bottom: 22px; border: 1px solid var(--border); border-radius: var(--radius-lg); overflow: hidden; }
  .p-stat { padding: 18px 20px; border-right: 1px solid var(--border); }
  .p-stat:last-child { border-right: none; }
  .p-stat label { font-size: 11px; color: var(--text-2); display: block; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 0.5px; }
  .p-stat .p-val { font-size: 28px; font-weight: 700; color: var(--text-1); font-family: var(--font-mono); }

  .showing { font-size: 12px; color: var(--text-3); margin-bottom: 10px; }
  .section-title { font-size: 16px; font-weight: 600; color: var(--text-1); margin-bottom: 14px; }
  .alerts-row { display: grid; grid-template-columns: 1fr 2fr; gap: 12px; margin-bottom: 14px; }
  .alert-green { background: #0f2d18; border-radius: var(--radius-md); padding: 14px 16px; font-size: 13px; color: var(--green); }
  .alert-blue  { background: var(--bg-info); border-radius: var(--radius-md); padding: 14px 16px; font-size: 13px; color: var(--text-2); }
  .follow-stat { margin-bottom: 10px; }
  .follow-stat label { font-size: 12px; color: var(--text-3); display: block; margin-bottom: 3px; }
  .follow-stat .f-val { font-size: 22px; font-weight: 700; color: var(--text-1); font-family: var(--font-mono); }

  .del-row { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; padding: 10px 14px; background: var(--bg-info); border-radius: var(--radius-md); }
  .del-row span { flex: 1; font-size: 13px; color: var(--text-2); }
  .del-row button { font-size: 12px; }
  .count-row { font-size: 13px; color: var(--text-3); margin-top: 10px; }
  .role-item { font-size: 13px; color: var(--text-2); padding: 3px 0; }

  .chevron { display: inline-block; transition: transform 0.2s; font-size: 14px; color: var(--text-3); }
  .chevron.open { transform: rotate(180deg); }

  /* ── Auth / Login ── */
  .auth-root {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: var(--bg-app);
    background-image: radial-gradient(ellipse at 20% 50%, rgba(79,195,234,0.06) 0%, transparent 60%),
                      radial-gradient(ellipse at 80% 20%, rgba(232,76,76,0.06) 0%, transparent 50%);
  }
  .auth-card {
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: 14px; padding: 44px 40px; width: 100%; max-width: 400px;
    box-shadow: 0 24px 64px rgba(0,0,0,0.5);
  }
  .auth-logo { text-align: center; margin-bottom: 32px; }
  .auth-logo .logo-wordmark { font-size: 28px; }
  .auth-logo .logo-tagline { margin-top: 4px; }
  .auth-title { font-size: 18px; font-weight: 600; color: var(--text-1); margin-bottom: 6px; text-align: center; }
  .auth-sub { font-size: 13px; color: var(--text-3); text-align: center; margin-bottom: 28px; }
  .auth-field { margin-bottom: 16px; }
  .auth-field label { font-size: 11px; color: var(--text-2); display: block; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
  .auth-field input {
    width: 100%; background: var(--bg-input); border: 1px solid var(--border);
    border-radius: var(--radius-sm); padding: 10px 12px; font-size: 14px;
    color: var(--text-1); outline: none; font-family: var(--font-main);
    transition: border-color 0.15s;
  }
  .auth-field input:focus { border-color: var(--accent2); }
  .auth-error { background: #2d0f0f; border: 1px solid #7d1f1f; border-radius: var(--radius-sm); padding: 10px 14px; font-size: 13px; color: #fca5a5; margin-bottom: 16px; }
  .auth-btn {
    width: 100%; padding: 11px; border-radius: var(--radius-sm); font-size: 14px;
    font-weight: 600; cursor: pointer; border: none; font-family: var(--font-main);
    background: var(--accent); color: #fff; transition: background 0.15s, transform 0.1s;
    margin-top: 4px;
  }
  .auth-btn:hover { background: #c73a3a; }
  .auth-btn:active { transform: scale(0.98); }
  .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .auth-switch { text-align: center; margin-top: 20px; font-size: 13px; color: var(--text-3); }
  .auth-switch a { color: var(--accent2); cursor: pointer; text-decoration: none; }
  .auth-switch a:hover { text-decoration: underline; }
  .auth-divider { border: none; border-top: 1px solid var(--border); margin: 20px 0; }

  /* ── Loading / toast ── */
  .loading-overlay {
    position: fixed; inset: 0; background: rgba(13,17,23,0.7);
    display: flex; align-items: center; justify-content: center; z-index: 999;
  }
  .spinner {
    width: 36px; height: 36px; border: 3px solid var(--border);
    border-top-color: var(--accent2); border-radius: 50%;
    animation: spin 0.7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .toast {
    position: fixed; bottom: 24px; right: 24px; z-index: 1000;
    background: var(--bg-card); border: 1px solid var(--border);
    border-radius: var(--radius-md); padding: 12px 18px;
    font-size: 13px; color: var(--text-1);
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    animation: slideUp 0.2s ease;
  }
  .toast.error { border-color: var(--accent); color: #fca5a5; }
  .toast.success { border-color: var(--green); color: #3fb950; }
  @keyframes slideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }

  /* ── Logout button in sidebar ── */
  .sidebar-user { padding: 12px 18px; border-top: 1px solid var(--border); }
  .user-name { font-size: 12px; color: var(--text-2); margin-bottom: 6px; font-weight: 500; }
  .user-role { font-size: 11px; color: var(--text-3); margin-bottom: 8px; }
  .btn-logout {
    width: 100%; padding: 7px; border-radius: var(--radius-sm); font-size: 12px;
    font-weight: 500; cursor: pointer; border: 1px solid var(--border);
    background: transparent; color: var(--text-3); font-family: var(--font-main);
    transition: all 0.15s;
  }
  .btn-logout:hover { border-color: var(--accent); color: var(--accent); }
`;

// ─── Toast helper ──────────────────────────────────────────────────────────────
function Toast({ msg, type, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 3000); return () => clearTimeout(t); }, [onDone]);
  return <div className={`toast ${type}`}>{msg}</div>;
}

// ─── Login / Register Page ─────────────────────────────────────────────────────
function AuthPage({ onAuth }) {
  const [mode, setMode]     = useState("login");   // "login" | "register"
  const [form, setForm]     = useState({ name: "", email: "", password: "", role: "Sales Rep" });
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const field = (key, label, type = "text", placeholder = "") => (
    <div className="auth-field">
      <label>{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={form[key]}
        onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
        onKeyDown={e => e.key === "Enter" && submit()}
      />
    </div>
  );

  const submit = async () => {
    setError("");
    if (!form.email || !form.password) return setError("Email and password are required.");
    if (mode === "register" && !form.name.trim()) return setError("Name is required.");
    setLoading(true);
    try {
      if (mode === "register") {
        await api.auth.register({ name: form.name, email: form.email, password: form.password, role: form.role });
      }
      await api.auth.login({ email: form.email, password: form.password });
      const me = await api.auth.me();
      onAuth(me);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-wordmark">inno<span>lead</span></div>
          <div className="logo-tagline">Sales CRM</div>
        </div>

        <div className="auth-title">{mode === "login" ? "Welcome back" : "Create your account"}</div>
        <div className="auth-sub">{mode === "login" ? "Sign in to your workspace" : "Get started with Innolead"}</div>

        {error && <div className="auth-error">{error}</div>}

        {mode === "register" && (
          <>
            {field("name", "Full Name", "text", "Your full name")}
            <div className="auth-field">
              <label>Role</label>
              <select className="crm-select" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                {["Admin", "Sales Rep", "Manager", "Viewer"].map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </>
        )}
        {field("email", "Email", "email", "you@company.com")}
        {field("password", "Password", "password", "••••••••")}

        <button className="auth-btn" onClick={submit} disabled={loading}>
          {loading ? "Please wait…" : mode === "login" ? "Sign In" : "Create Account"}
        </button>

        <hr className="auth-divider" />
        <div className="auth-switch">
          {mode === "login"
            ? <>Don't have an account? <a onClick={() => { setMode("register"); setError(""); }}>Register</a></>
            : <>Already have an account? <a onClick={() => { setMode("login"); setError(""); }}>Sign In</a></>
          }
        </div>
      </div>
    </div>
  );
}

// ─── Helpers ───────────────────────────────────────────────────────────────
const today = () => new Date().toISOString().split("T")[0];
const uid = () => Math.random().toString(36).slice(2, 9);

const stageBadge = (s) => {
  if (s === "Closed Won") return <span className="badge badge-won">Won</span>;
  if (s === "Closed Lost") return <span className="badge badge-lost">Lost</span>;
  return <span className="badge badge-open">{s}</span>;
};

const typeBadge = (t) => {
  const cls = { Call: "badge-call", Email: "badge-email", Meeting: "badge-meeting", Note: "badge-note" };
  return <span className={`badge ${cls[t] || "badge-email"}`}>{t}</span>;
};

// ─── Sub-components ────────────────────────────────────────────────────────

function Accordion({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="section-card">
      <div className="section-hdr" onClick={() => setOpen(!open)}>
        <span className="section-hdr-title">{title}</span>
        <span className={`chevron ${open ? "open" : ""}`}>▾</span>
      </div>
      {open && <div className="section-body">{children}</div>}
    </div>
  );
}

function EmptyState({ msg }) {
  return <div className="info-box">{msg}</div>;
}

// ─── Pages ─────────────────────────────────────────────────────────────────

function Dashboard({ accounts, opportunities, activities }) {
  const activeOpps = opportunities.filter(o => o.stage !== "Closed Won" && o.stage !== "Closed Lost");
  const pipelineVal = opportunities.reduce((s, o) => s + (parseFloat(o.value) || 0), 0);
  const pDisplay = pipelineVal >= 1000 ? `P${Math.round(pipelineVal / 1000)}K` : `P${pipelineVal}`;

  const [health, setHealth] = useState("All");
  const [minVal, setMinVal] = useState(0);
  const [minProb, setMinProb] = useState(0);
  const [followSection, setFollowSection] = useState(true);
  const [healthSection, setHealthSection] = useState(true);

  const filteredOpps = opportunities.filter(o => {
    if (health !== "All") {
      const p = parseFloat(o.prob) || 0;
      const h = p >= 70 ? "Healthy" : p >= 40 ? "At Risk" : "Critical";
      if (h !== health) return false;
    }
    if ((parseFloat(o.value) || 0) < minVal) return false;
    if ((parseFloat(o.prob) || 0) < minProb) return false;
    return true;
  });

  const now = new Date();
  const in7 = activities.filter(a => {
    if (!a.followup) return false;
    const d = new Date(a.followup);
    const diff = (d - now) / 86400000;
    return diff >= 0 && diff <= 7;
  });
  const in714 = activities.filter(a => {
    if (!a.followup) return false;
    const d = new Date(a.followup);
    const diff = (d - now) / 86400000;
    return diff > 7 && diff <= 14;
  });

  return (
    <div className="page">
      <div className="page-title">Dashboard Overview</div>
      <div className="stat-grid">
        <div className="stat-card"><div className="sc-label">Total Accounts ⓘ</div><div className="sc-value">{accounts.length}</div></div>
        <div className="stat-card"><div className="sc-label">Active Opportunities ⓘ</div><div className="sc-value">{activeOpps.length}</div></div>
        <div className="stat-card"><div className="sc-label">Activities ⓘ</div><div className="sc-value">{activities.length}</div></div>
        <div className="stat-card"><div className="sc-label">Pipeline Value ⓘ</div><div className="sc-value">{pDisplay}</div></div>
      </div>

      <div className="section-card">
        <div className="section-hdr" onClick={() => setHealthSection(!healthSection)}>
          <span className="section-hdr-title">Opportunity Health Dashboard</span>
          <span className={`chevron ${healthSection ? "open" : ""}`}>▾</span>
        </div>
        {healthSection && (
          <div className="section-body">
            <div className="filters-row" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
              <div className="filter-group">
                <label>Filter by Health</label>
                <select className="crm-select" value={health} onChange={e => setHealth(e.target.value)}>
                  <option>All</option><option>Healthy</option><option>At Risk</option><option>Critical</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Min Value (BWP)</label>
                <div className="num-input-wrap">
                  <button className="num-btn" onClick={() => setMinVal(v => Math.max(0, v - 1000))}>−</button>
                  <input className="crm-input" style={{ width: 90, textAlign: "center" }} value={minVal} onChange={e => setMinVal(Number(e.target.value) || 0)} />
                  <button className="num-btn" onClick={() => setMinVal(v => v + 1000)}>+</button>
                </div>
              </div>
              <div className="filter-group">
                <label>Min Probability (%) — {minProb}</label>
                <input type="range" className="crm-range" min={0} max={100} step={1} value={minProb} onChange={e => setMinProb(Number(e.target.value))} />
                <div className="slider-labels"><span>0</span><span>100</span></div>
              </div>
            </div>
            {filteredOpps.length === 0
              ? <EmptyState msg="No opportunities match the filters" />
              : (
                <div className="table-wrap">
                  <table className="crm-table">
                    <thead><tr><th>Name</th><th>Account</th><th>Stage</th><th>Value</th><th>Prob%</th></tr></thead>
                    <tbody>
                      {filteredOpps.map(o => (
                        <tr key={o.id}><td>{o.name}</td><td>{o.account}</td><td>{stageBadge(o.stage)}</td><td>P{Number(o.value || 0).toLocaleString()}</td><td>{o.prob}%</td></tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            }
          </div>
        )}
      </div>

      <div className="section-card">
        <div className="section-hdr" onClick={() => setFollowSection(!followSection)}>
          <span className="section-hdr-title">Follow-up Reminders &amp; Alerts</span>
          <span className={`chevron ${followSection ? "open" : ""}`}>▾</span>
        </div>
        {followSection && (
          <div className="section-body">
            <div className="alerts-row">
              <div className="alert-green">{in7.length > 0 ? `${in7.length} urgent alert(s)` : "No urgent alerts"}</div>
              <div className="alert-blue">{in7.length > 0 ? `${in7.length} upcoming follow-up(s)` : "No upcoming follow-ups"}</div>
            </div>
            <div className="follow-stat"><label>Next 7 Days</label><div className="f-val">{in7.length}</div></div>
            <div className="follow-stat"><label>Next 7–14 Days</label><div className="f-val">{in714.length}</div></div>
          </div>
        )}
      </div>
    </div>
  );
}

function Analytics({ opportunities, activities }) {
  const won = opportunities.filter(o => o.stage === "Closed Won");
  const closed = opportunities.filter(o => o.stage === "Closed Won" || o.stage === "Closed Lost");
  const winRate = closed.length ? Math.round((won.length / closed.length) * 100) : 0;
  const avgDeal = won.length ? Math.round(won.reduce((s, o) => s + (parseFloat(o.value) || 0), 0) / won.length) : 0;
  const pipeline = opportunities.reduce((s, o) => s + (parseFloat(o.value) || 0), 0);

  const stages = ["Prospecting", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];
  const stageCounts = stages.map(s => ({ stage: s, count: opportunities.filter(o => o.stage === s).length }));
  const actTypes = ["Call", "Email", "Meeting", "Note"];
  const actCounts = actTypes.map(t => ({ type: t, count: activities.filter(a => a.type === t).length }));

  return (
    <div className="page">
      <div className="page-title">Analytics</div>
      <div className="stat-grid">
        <div className="stat-card"><div className="sc-label">Win Rate</div><div className="sc-value">{winRate}%</div></div>
        <div className="stat-card"><div className="sc-label">Avg Deal Size</div><div className="sc-value">P{avgDeal.toLocaleString()}</div></div>
        <div className="stat-card"><div className="sc-label">Deals Closed (Won)</div><div className="sc-value">{won.length}</div></div>
        <div className="stat-card"><div className="sc-label">Total Pipeline</div><div className="sc-value">P{Math.round(pipeline / 1000) || 0}K</div></div>
      </div>

      <Accordion title="Opportunities by Stage" defaultOpen>
        {opportunities.length === 0
          ? <EmptyState msg="No opportunities yet." />
          : stageCounts.filter(s => s.count > 0).map(s => (
            <div key={s.stage} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
              <span style={{ color: "var(--text-2)" }}>{s.stage}</span>
              <span style={{ color: "var(--text-1)", fontWeight: 600, fontFamily: "var(--font-mono)" }}>{s.count}</span>
            </div>
          ))
        }
      </Accordion>

      <Accordion title="Activity Breakdown" defaultOpen>
        {activities.length === 0
          ? <EmptyState msg="No activities logged yet." />
          : actCounts.filter(a => a.count > 0).map(a => (
            <div key={a.type} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
              <span>{typeBadge(a.type)}</span>
              <span style={{ color: "var(--text-1)", fontWeight: 600, fontFamily: "var(--font-mono)" }}>{a.count}</span>
            </div>
          ))
        }
      </Accordion>
    </div>
  );
}

function Accounts({ accounts, setAccounts, toast }) {
  const [tab, setTab] = useState("list");
  const [form, setForm] = useState({ name: "", industry: "", phone: "", email: "", owner: "", website: "" });
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.name.trim()) return alert("Account name is required");
    setSaving(true);
    try {
      const created = await api.accounts.create(form);
      setAccounts(prev => [...prev, created]);
      setForm({ name: "", industry: "", phone: "", email: "", owner: "", website: "" });
      setTab("list");
      toast("Account created!", "success");
    } catch (e) { toast(e.message, "error"); }
    finally { setSaving(false); }
  };

  return (
    <div className="page">
      <div className="page-title">Accounts</div>
      <div className="tabs">
        {["list", "add"].map(t => (
          <div key={t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
            {t === "list" ? "List View" : "Add New Account"}
          </div>
        ))}
      </div>

      {tab === "list" && (
        accounts.length === 0
          ? <EmptyState msg="No accounts found. Use 'Add New Account' to get started." />
          : (
            <div className="table-wrap">
              <table className="crm-table">
                <thead><tr><th>Name</th><th>Industry</th><th>Owner</th><th>Phone</th><th>Email</th><th>Created</th></tr></thead>
                <tbody>
                  {accounts.map(a => (
                    <tr key={a.id}><td style={{ color: "var(--text-1)" }}>{a.name}</td><td>{a.industry || "—"}</td><td>{a.owner || "—"}</td><td>{a.phone || "—"}</td><td>{a.email || "—"}</td><td>{a.created}</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
      )}

      {tab === "add" && (
        <Accordion title="New Account" defaultOpen>
          <div className="form-grid">
            {[
              { key: "name", label: "Account Name *", placeholder: "e.g. Acme Corp" },
              { key: "owner", label: "Owner", placeholder: "Account owner" },
              { key: "phone", label: "Phone", placeholder: "+267 7X XXX XXXX" },
              { key: "email", label: "Email", placeholder: "contact@company.com" },
              { key: "website", label: "Website", placeholder: "https://..." },
            ].map(f => (
              <div className="form-group" key={f.key}>
                <label>{f.label}</label>
                <input className="crm-input" placeholder={f.placeholder} value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
              </div>
            ))}
            <div className="form-group">
              <label>Industry</label>
              <select className="crm-select" value={form.industry} onChange={e => setForm(p => ({ ...p, industry: e.target.value }))}>
                <option value="">Select...</option>
                {["Technology", "Finance", "Healthcare", "Retail", "Manufacturing", "Other"].map(i => <option key={i}>{i}</option>)}
              </select>
            </div>
          </div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={submit} disabled={saving}>{saving ? "Saving…" : "Add Account"}</button>
        </Accordion>
      )}
    </div>
  );
}

function Opportunities({ opportunities, setOpportunities, accounts, toast }) {
  const [tab, setTab] = useState("pipeline");
  const [form, setForm] = useState({ name: "", account: "", stage: "Prospecting", value: "", prob: "", owner: "", close: "" });
  const [editIdx, setEditIdx] = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [delIdx, setDelIdx] = useState("");
  const [saving, setSaving] = useState(false);

  const total = opportunities.length;
  const open = opportunities.filter(o => o.stage !== "Closed Won" && o.stage !== "Closed Lost").length;
  const won = opportunities.filter(o => o.stage === "Closed Won").length;
  const lost = opportunities.filter(o => o.stage === "Closed Lost").length;

  const submit = async () => {
    if (!form.name.trim()) return alert("Opportunity name required");
    setSaving(true);
    try {
      const created = await api.opportunities.create({ ...form, value: parseFloat(form.value) || 0, prob: parseInt(form.prob) || 0 });
      setOpportunities(prev => [...prev, created]);
      setForm({ name: "", account: "", stage: "Prospecting", value: "", prob: "", owner: "", close: "" });
      setTab("pipeline");
      toast("Opportunity created!", "success");
    } catch (e) { toast(e.message, "error"); }
    finally { setSaving(false); }
  };

  const updateOwner = async () => {
    if (editIdx === "" || !newOwner.trim()) return alert("Select an opportunity and enter a new owner");
    const opp = opportunities[Number(editIdx)];
    try {
      const updated = await api.opportunities.update(opp.id, { owner: newOwner });
      setOpportunities(prev => prev.map(o => o.id === opp.id ? updated : o));
      setNewOwner(""); setEditIdx("");
      toast("Owner updated!", "success");
    } catch (e) { toast(e.message, "error"); }
  };

  const deleteOpp = async () => {
    if (delIdx === "") return alert("Select an opportunity");
    if (!window.confirm("Delete this opportunity?")) return;
    const opp = opportunities[Number(delIdx)];
    try {
      await api.opportunities.delete(opp.id);
      setOpportunities(prev => prev.filter(o => o.id !== opp.id));
      setDelIdx("");
      toast("Opportunity deleted.", "success");
    } catch (e) { toast(e.message, "error"); }
  };

  const stages = ["Prospecting", "Qualification", "Proposal", "Negotiation", "Closed Won", "Closed Lost"];

  return (
    <div className="page">
      <div className="page-title">Opportunities</div>
      <div className="tabs">
        {[
          { id: "pipeline", label: "Pipeline Overview" },
          { id: "new", label: "New Opportunity" },
          { id: "edit", label: "Edit Owner" },
          { id: "delete", label: "Delete Opportunity" },
        ].map(t => (
          <div key={t.id} className={`tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>{t.label}</div>
        ))}
      </div>

      {tab === "pipeline" && (
        <>
          <div className="pipeline-stats">
            {[["Total", total], ["Open", open], ["Won", won], ["Lost", lost]].map(([l, v]) => (
              <div className="p-stat" key={l}><label>{l}</label><div className="p-val">{v}</div></div>
            ))}
          </div>
          {opportunities.length === 0
            ? <EmptyState msg="No opportunities yet. Create your first deal." />
            : (
              <div className="table-wrap">
                <table className="crm-table">
                  <thead><tr><th>Name</th><th>Account</th><th>Stage</th><th>Value (BWP)</th><th>Prob%</th><th>Owner</th><th>Close Date</th></tr></thead>
                  <tbody>
                    {opportunities.map(o => (
                      <tr key={o.id}>
                        <td style={{ color: "var(--text-1)" }}>{o.name}</td>
                        <td>{o.account || "—"}</td>
                        <td>{stageBadge(o.stage)}</td>
                        <td>P{Number(o.value || 0).toLocaleString()}</td>
                        <td>{o.prob || 0}%</td>
                        <td>{o.owner || "—"}</td>
                        <td>{o.close || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        </>
      )}

      {tab === "new" && (
        <Accordion title="New Opportunity" defaultOpen>
          <div className="form-grid">
            <div className="form-group">
              <label>Name *</label>
              <input className="crm-input" placeholder="e.g. Q3 Enterprise Deal" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Account</label>
              <select className="crm-select" value={form.account} onChange={e => setForm(p => ({ ...p, account: e.target.value }))}>
                <option value="">Select account...</option>
                {accounts.map(a => <option key={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Stage</label>
              <select className="crm-select" value={form.stage} onChange={e => setForm(p => ({ ...p, stage: e.target.value }))}>
                {stages.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Value (BWP)</label>
              <input className="crm-input" type="number" placeholder="0" value={form.value} onChange={e => setForm(p => ({ ...p, value: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Probability (%)</label>
              <input className="crm-input" type="number" placeholder="0" min={0} max={100} value={form.prob} onChange={e => setForm(p => ({ ...p, prob: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Owner</label>
              <input className="crm-input" placeholder="Owner name" value={form.owner} onChange={e => setForm(p => ({ ...p, owner: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Close Date</label>
              <input className="crm-input" type="date" value={form.close} onChange={e => setForm(p => ({ ...p, close: e.target.value }))} />
            </div>
          </div>
          <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={submit} disabled={saving}>{saving ? "Saving…" : "Create Opportunity"}</button>
        </Accordion>
      )}

      {tab === "edit" && (
        <div>
          <div className="section-title">Edit Opportunity Owner</div>
          <div className="form-grid" style={{ maxWidth: 440 }}>
            <div className="form-group">
              <label>Select Opportunity</label>
              <select className="crm-select" value={editIdx} onChange={e => setEditIdx(e.target.value)}>
                <option value="">Choose...</option>
                {opportunities.map((o, i) => <option key={o.id} value={i}>{o.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>New Owner</label>
              <input className="crm-input" placeholder="New owner name" value={newOwner} onChange={e => setNewOwner(e.target.value)} />
            </div>
          </div>
          <button className="btn btn-primary" style={{ marginTop: 14 }} onClick={updateOwner}>Update Owner</button>
        </div>
      )}

      {tab === "delete" && (
        <div>
          <div className="section-title">Delete Opportunity</div>
          <div className="form-group" style={{ maxWidth: 320, marginBottom: 14 }}>
            <label>Select Opportunity</label>
            <select className="crm-select" value={delIdx} onChange={e => setDelIdx(e.target.value)}>
              <option value="">Choose...</option>
              {opportunities.map((o, i) => <option key={o.id} value={i}>{o.name}</option>)}
            </select>
          </div>
          <button className="btn btn-danger" onClick={deleteOpp}>Delete</button>
        </div>
      )}
    </div>
  );
}

function Activities({ activities, setActivities, accounts, toast }) {
  const [tab, setTab] = useState("all");
  const [typeF, setTypeF] = useState("All");
  const [ownerF, setOwnerF] = useState("All");
  const [accountF, setAccountF] = useState("All");
  const [delIdx, setDelIdx] = useState("");
  const [form, setForm] = useState({ type: "Call", account: "", owner: "", date: today(), followup: "", notes: "" });
  const [saving, setSaving] = useState(false);

  const owners = useMemo(() => ["All", ...[...new Set(activities.map(a => a.owner).filter(Boolean))]], [activities]);

  const filtered = activities.filter(a =>
    (typeF === "All" || a.type === typeF) &&
    (ownerF === "All" || a.owner === ownerF) &&
    (accountF === "All" || a.account === accountF)
  );

  const upcoming = activities.filter(a => a.followup);

  const submit = async () => {
    setSaving(true);
    try {
      const created = await api.activities.create(form);
      setActivities(prev => [...prev, created]);
      setForm({ type: "Call", account: "", owner: "", date: today(), followup: "", notes: "" });
      toast("Activity logged!", "success");
    } catch (e) { toast(e.message, "error"); }
    finally { setSaving(false); }
  };

  const deleteAct = async () => {
    if (delIdx === "") return alert("Select an activity");
    if (!window.confirm("Delete this activity?")) return;
    const act = activities[Number(delIdx)];
    try {
      await api.activities.delete(act.id);
      setActivities(prev => prev.filter(a => a.id !== act.id));
      setDelIdx("");
      toast("Activity deleted.", "success");
    } catch (e) { toast(e.message, "error"); }
  };

  const NewActivityForm = () => (
    <Accordion title="Log New Activity">
      <div className="form-grid">
        <div className="form-group">
          <label>Activity Type</label>
          <select className="crm-select" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
            {["Call", "Email", "Meeting", "Note"].map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Account</label>
          <select className="crm-select" value={form.account} onChange={e => setForm(p => ({ ...p, account: e.target.value }))}>
            <option value="">Select account...</option>
            {accounts.map(a => <option key={a.id}>{a.name}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Owner</label>
          <input className="crm-input" placeholder="Your name" value={form.owner} onChange={e => setForm(p => ({ ...p, owner: e.target.value }))} />
        </div>
        <div className="form-group">
          <label>Date</label>
          <input className="crm-input" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
        </div>
        <div className="form-group">
          <label>Follow-up Date</label>
          <input className="crm-input" type="date" value={form.followup} onChange={e => setForm(p => ({ ...p, followup: e.target.value }))} />
        </div>
        <div className="form-group">
          <label>Notes</label>
          <input className="crm-input" placeholder="Activity notes..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
        </div>
      </div>
      <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={submit} disabled={saving}>{saving ? "Saving…" : "Log Activity"}</button>
    </Accordion>
  );

  return (
    <div className="page">
      <div className="page-title">Activities Log</div>
      <div className="tabs">
        {[
          { id: "all", label: "All Activities" },
          { id: "followup", label: "Follow-up Reminders" },
          { id: "delete", label: "Delete Activity" },
        ].map(t => (
          <div key={t.id} className={`tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>{t.label}</div>
        ))}
      </div>

      {tab === "all" && (
        <>
          <div className="filters-row" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
            <div className="filter-group">
              <label>Filter by Type</label>
              <select className="crm-select" value={typeF} onChange={e => setTypeF(e.target.value)}>
                {["All", "Call", "Email", "Meeting", "Note"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Filter by Owner</label>
              <select className="crm-select" value={ownerF} onChange={e => setOwnerF(e.target.value)}>
                {owners.map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div className="filter-group">
              <label>Filter by Account</label>
              <select className="crm-select" value={accountF} onChange={e => setAccountF(e.target.value)}>
                <option value="All">All</option>
                {accounts.map(a => <option key={a.id}>{a.name}</option>)}
              </select>
            </div>
          </div>
          <div className="showing">Showing {filtered.length} of {activities.length} activities</div>
          {filtered.length === 0
            ? <EmptyState msg="No activities match the filters." />
            : (
              <div className="table-wrap" style={{ marginBottom: 20 }}>
                <table className="crm-table">
                  <thead><tr><th>Type</th><th>Account</th><th>Owner</th><th>Date</th><th>Follow-up</th><th>Notes</th></tr></thead>
                  <tbody>
                    {filtered.map(a => (
                      <tr key={a.id}>
                        <td>{typeBadge(a.type)}</td>
                        <td>{a.account || "—"}</td>
                        <td>{a.owner || "—"}</td>
                        <td>{a.date || "—"}</td>
                        <td>{a.followup || "—"}</td>
                        <td>{a.notes || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
          <NewActivityForm />
        </>
      )}

      {tab === "followup" && (
        <>
          <div className="section-title">Follow-up Reminders</div>
          {upcoming.length === 0
            ? <EmptyState msg="No upcoming follow-ups" />
            : upcoming.map(a => (
              <div key={a.id} className="info-box" style={{ marginBottom: 8, color: "var(--text-1)" }}>
                {typeBadge(a.type)} <strong style={{ marginLeft: 8 }}>{a.account || "—"}</strong>
                <span style={{ color: "var(--text-3)", fontSize: 12, marginLeft: 8 }}>Follow-up: {a.followup}</span>
                {a.notes && <div style={{ color: "var(--text-2)", fontSize: 12, marginTop: 4 }}>{a.notes}</div>}
              </div>
            ))
          }
          <div style={{ marginTop: 16 }}>
            <NewActivityForm />
          </div>
        </>
      )}

      {tab === "delete" && (
        <>
          <div className="section-title">Delete Activity</div>
          <div className="form-group" style={{ maxWidth: 360, marginBottom: 14 }}>
            <label>Select Activity</label>
            <select className="crm-select" value={delIdx} onChange={e => setDelIdx(e.target.value)}>
              <option value="">Choose...</option>
              {activities.map((a, i) => <option key={a.id} value={i}>{a.type} — {a.account || "no account"} ({a.date})</option>)}
            </select>
          </div>
          <button className="btn btn-danger" onClick={deleteAct}>Delete</button>
        </>
      )}
    </div>
  );
}

function Users({ users, setUsers, toast }) {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "Sales Rep" });
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const submit = async () => {
    if (!form.name.trim() || !form.email.trim()) return alert("Name and email required");
    if (!form.password || form.password.length < 6) return alert("Password must be at least 6 characters");
    setSaving(true);
    try {
      const created = await api.auth.register({ name: form.name, email: form.email, password: form.password, role: form.role });
      setUsers(prev => [...prev, created]);
      setForm({ name: "", email: "", password: "", role: "Sales Rep" });
      setOpen(false);
      toast("User added!", "success");
    } catch (e) { toast(e.message, "error"); }
    finally { setSaving(false); }
  };

  const roleMap = users.reduce((acc, u) => { acc[u.role] = (acc[u.role] || 0) + 1; return acc; }, {});

  return (
    <div className="page">
      <div className="page-title">Users</div>
      <div className="section-title">User List</div>
      {users.length === 0
        ? <EmptyState msg="No users yet." />
        : (
          <div className="table-wrap" style={{ marginBottom: 24 }}>
            <table className="crm-table">
              <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Created</th></tr></thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}><td style={{ color: "var(--text-1)" }}>{u.name}</td><td>{u.email}</td><td><span className="badge badge-open">{u.role}</span></td><td>{u.created}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }

      <div style={{ marginBottom: 24 }}>
        <div className="section-title">Users by Role</div>
        {Object.keys(roleMap).length === 0
          ? <div style={{ fontSize: 13, color: "var(--text-3)" }}>No users found</div>
          : Object.entries(roleMap).map(([r, c]) => <div className="role-item" key={r}>• {r}: {c}</div>)
        }
        <div className="count-row">Total Users: {users.length}</div>
      </div>

      <div className="section-card">
        <div className="section-hdr" onClick={() => setOpen(!open)}>
          <span className="section-hdr-title">Add New User</span>
          <span className={`chevron ${open ? "open" : ""}`}>▾</span>
        </div>
        {open && (
          <div className="section-body">
            <div className="form-grid">
              <div className="form-group">
                <label>Name *</label>
                <input className="crm-input" placeholder="Full name" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Email *</label>
                <input className="crm-input" placeholder="user@company.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Password *</label>
                <input className="crm-input" type="password" placeholder="Min 6 characters" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select className="crm-select" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                  {["Admin", "Sales Rep", "Manager", "Viewer"].map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
            </div>
            <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={submit} disabled={saving}>{saving ? "Saving…" : "Add User"}</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── App Root ──────────────────────────────────────────────────────────────
export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [page, setPage]               = useState("dashboard");
  const [accounts, setAccounts]       = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [activities, setActivities]   = useState([]);
  const [users, setUsers]             = useState([]);
  const [search, setSearch]           = useState("");
  const [loading, setLoading]         = useState(false);
  const [toastMsg, setToastMsg]       = useState(null); // { msg, type }

  const toast = useCallback((msg, type = "success") => setToastMsg({ msg, type }), []);

  // ── On mount: restore session ──────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      if (tokenStore.get()) {
        try {
          const me = await api.auth.me();
          setCurrentUser(me);
        } catch { tokenStore.clear(); }
      }
      setAuthChecked(true);
    })();
  }, []);

  // ── Load all data when authenticated ──────────────────────────────────────
  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    Promise.all([
      api.accounts.list(),
      api.opportunities.list(),
      api.activities.list(),
      api.users.list(),
    ]).then(([accs, opps, acts, usrs]) => {
      setAccounts(accs);
      setOpportunities(opps);
      setActivities(acts);
      setUsers(usrs);
    }).catch(e => toast(e.message, "error"))
      .finally(() => setLoading(false));
  }, [currentUser, toast]);

  const handleLogout = () => {
    api.auth.logout();
    setCurrentUser(null);
    setAccounts([]); setOpportunities([]); setActivities([]); setUsers([]);
    setPage("dashboard");
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "analytics", label: "Analytics" },
    { id: "accounts", label: "Accounts" },
    { id: "opportunities", label: "Opportunities" },
    { id: "activities", label: "Activities" },
    { id: "users", label: "Users" },
  ];

  const openDeals = opportunities.filter(o => o.stage !== "Closed Won" && o.stage !== "Closed Lost").length;

  const renderPage = () => {
    switch (page) {
      case "dashboard":      return <Dashboard accounts={accounts} opportunities={opportunities} activities={activities} />;
      case "analytics":      return <Analytics opportunities={opportunities} activities={activities} />;
      case "accounts":       return <Accounts accounts={accounts} setAccounts={setAccounts} toast={toast} />;
      case "opportunities":  return <Opportunities opportunities={opportunities} setOpportunities={setOpportunities} accounts={accounts} toast={toast} />;
      case "activities":     return <Activities activities={activities} setActivities={setActivities} accounts={accounts} toast={toast} />;
      case "users":          return <Users users={users} setUsers={setUsers} toast={toast} />;
      default:               return null;
    }
  };

  // ── Not yet checked token ──────────────────────────────────────────────────
  if (!authChecked) return (
    <>
      <style>{css}</style>
      <div className="loading-overlay"><div className="spinner" /></div>
    </>
  );

  // ── Not logged in → show auth page ────────────────────────────────────────
  if (!currentUser) return (
    <>
      <style>{css}</style>
      <AuthPage onAuth={setCurrentUser} />
    </>
  );

  // ── Logged in → show CRM ──────────────────────────────────────────────────
  return (
    <>
      <style>{css}</style>
      {loading && <div className="loading-overlay"><div className="spinner" /></div>}
      {toastMsg && <Toast msg={toastMsg.msg} type={toastMsg.type} onDone={() => setToastMsg(null)} />}
      <div className="crm-root">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="logo-wordmark">inno<span>lead</span></div>
            <div className="logo-tagline">Sales CRM</div>
          </div>

          <nav className="sidebar-nav">
            {navItems.map(n => (
              <div
                key={n.id}
                className={`nav-item ${page === n.id ? "active" : ""}`}
                onClick={() => setPage(n.id)}
              >
                <span className="nav-dot" />
                {n.label}
              </div>
            ))}
          </nav>

          <div className="sidebar-section">
            <div className="sidebar-label">Search</div>
            <input
              className="sidebar-input"
              placeholder="Search accounts, opportunities..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="sidebar-section">
            <div className="sidebar-label">Quick Stats</div>
            <div className="quick-stats-row">
              <div className="qs-item"><label>Open Deals</label><div className="qs-val">{openDeals}</div></div>
              <div className="qs-item"><label>Activities</label><div className="qs-val">{activities.length}</div></div>
            </div>
          </div>

          <div className="sidebar-user">
            <div className="user-name">{currentUser.name}</div>
            <div className="user-role">{currentUser.role}</div>
            <button className="btn-logout" onClick={handleLogout}>Sign Out</button>
          </div>
        </aside>

        <main className="main">
          {renderPage()}
        </main>
      </div>
    </>
  );
}
